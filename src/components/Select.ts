import type { FormSelectOptions, IComponent } from "../types";
import { Dropdown } from "./Dropdown";

interface ValueDictEntry {
  el: HTMLOptionElement;
  optionEl: HTMLLIElement;
}

export class FormSelect implements IComponent {
  private element: HTMLSelectElement;
  private options: Required<FormSelectOptions>;
  private isMultiple: boolean = false;

  private wrapper: HTMLDivElement | null = null;
  private input: HTMLInputElement | null = null;
  private dropdownOptions: HTMLUListElement | null = null;
  private dropdown: Dropdown | null = null;

  private keysSelected: Record<string, boolean> = {};
  private valueDict: Record<string, ValueDictEntry> = {};

  // Bound event handlers
  private _handleSelectChangeBound: () => void;
  private _handleOptionClickBound: (e: MouseEvent) => void;
  private _handleInputClickBound: () => void;

  constructor(element: HTMLSelectElement, options?: FormSelectOptions) {
    if (!(element instanceof HTMLSelectElement)) {
      throw new Error("FormSelect must be initialized on an HTMLSelectElement");
    }

    // Don't initialize if select has the class 'browser-default'
    if (element.classList.contains("browser-default")) {
      return;
    }

    this.element = element;
    this.options = {
      classes: options?.classes ?? "",
      dropdownOptions: options?.dropdownOptions ?? {},
    };

    (this.element as any).M_FormSelect = this;

    this.isMultiple = this.element.multiple;

    this._handleSelectChangeBound = this._handleSelectChange.bind(this);
    this._handleOptionClickBound = this._handleOptionClick.bind(this);
    this._handleInputClickBound = this._handleInputClick.bind(this);

    this.init();
  }

  public static init(
    elements: HTMLSelectElement | NodeListOf<HTMLSelectElement>,
    options?: FormSelectOptions
  ): FormSelect | FormSelect[] {
    if (elements instanceof HTMLSelectElement) {
      return new FormSelect(elements, options);
    }
    const instances: FormSelect[] = [];
    elements.forEach((el) => {
      if (!el.classList.contains("browser-default")) {
        instances.push(new FormSelect(el, options));
      }
    });
    return instances;
  }

  public static getInstance(element: HTMLElement): FormSelect | undefined {
    return (element as any).M_FormSelect;
  }

  public init(): void {
    this.element.tabIndex = -1;
    this.keysSelected = {};
    this.valueDict = {};
    this._setupDropdown();
    this._setupEventHandlers();
  }

  public destroy(): void {
    this._removeEventHandlers();
    this._removeDropdown();
    (this.element as any).M_FormSelect = undefined;
  }

  private _setupEventHandlers(): void {
    if (this.dropdownOptions) {
      const listItems = Array.from(this.dropdownOptions.querySelectorAll("li:not(.optgroup)")) as HTMLLIElement[];
      listItems.forEach((li) => {
        li.addEventListener("click", this._handleOptionClickBound);
      });
    }
    this.element.addEventListener("change", this._handleSelectChangeBound);
    this.input?.addEventListener("click", this._handleInputClickBound);
  }

  private _removeEventHandlers(): void {
    if (this.dropdownOptions) {
      const listItems = Array.from(this.dropdownOptions.querySelectorAll("li:not(.optgroup)")) as HTMLLIElement[];
      listItems.forEach((li) => {
        li.removeEventListener("click", this._handleOptionClickBound);
      });
    }
    this.element.removeEventListener("change", this._handleSelectChangeBound);
    this.input?.removeEventListener("click", this._handleInputClickBound);
  }

  private _handleSelectChange(): void {
    this._setValueToInput();
  }

  private _handleOptionClick(e: MouseEvent): void {
    e.preventDefault();
    const li = (e.target as HTMLElement).closest("li") as HTMLLIElement | null;
    if (li) {
      this._selectOption(li);
    }
    e.stopPropagation();
  }

  private _selectOption(optionEl: HTMLLIElement): void {
    const key = optionEl.id;
    if (!optionEl.classList.contains("disabled") && !optionEl.classList.contains("optgroup") && key.length > 0) {
      let selected = true;

      if (this.isMultiple) {
        // Deselect placeholder element if select option has click trigger
        const placeholderOption = this.dropdownOptions?.querySelector("li.disabled.selected") as HTMLLIElement | null;
        if (placeholderOption) {
          placeholderOption.classList.remove("selected");
          const checkbox = placeholderOption.querySelector('input[type="checkbox"]') as HTMLInputElement | null;
          if (checkbox) checkbox.checked = false;
          this._toggleEntryFromArray(placeholderOption.id);
        }
        selected = this._toggleEntryFromArray(key);
      } else {
        if (this.dropdownOptions) {
          const listItems = Array.from(this.dropdownOptions.querySelectorAll("li")) as HTMLLIElement[];
          listItems.forEach((li) => li.classList.remove("selected"));
        }
        optionEl.classList.toggle("selected", selected);
        this.keysSelected = {};
        this.keysSelected[optionEl.id] = true;
      }

      // Synchronize selection back to native option
      const prevSelected = this.valueDict[key].el.selected;
      if (prevSelected !== selected) {
        this.valueDict[key].el.selected = selected;
        this.element.dispatchEvent(new Event("change", { bubbles: true }));
      }
    }

    if (!this.isMultiple) {
      this.dropdown?.close();
    }
  }

  private _handleInputClick(): void {
    if (this.dropdown && this.dropdown.isOpen) {
      this._setValueToInput();
      this._setSelectedStates();
    }
  }

  private _setupDropdown(): void {
    this.wrapper = document.createElement("div");
    this.wrapper.className = `select-wrapper ${this.options.classes}`;
    
    this.element.parentNode?.insertBefore(this.wrapper, this.element);
    
    // Hidden select overflow wrapper
    const hideSelect = document.createElement("div");
    hideSelect.className = "hide-select";
    this.wrapper.appendChild(hideSelect);
    hideSelect.appendChild(this.element);

    if (this.element.disabled) {
      this.wrapper.classList.add("disabled");
    }

    // Initialize list items options structure
    const selectOptions = Array.from(this.element.children) as (HTMLOptionElement | HTMLOptGroupElement)[];
    this.dropdownOptions = document.createElement("ul");
    this.dropdownOptions.id = `select-options-${Math.random().toString(36).substring(2, 9)}`;
    this.dropdownOptions.className = `dropdown-content select-dropdown ${this.isMultiple ? "multiple-select-dropdown" : ""}`;

    selectOptions.forEach((el) => {
      if (el instanceof HTMLOptionElement) {
        const optionEl = this._appendOptionWithIcon(this.element, el, this.isMultiple ? "multiple" : "");
        this._addOptionToValueDict(el, optionEl);
      } else if (el instanceof HTMLOptGroupElement) {
        const optgroupLi = document.createElement("li");
        optgroupLi.className = "optgroup";
        optgroupLi.innerHTML = `<span>${el.getAttribute("label")}</span>`;
        this.dropdownOptions?.appendChild(optgroupLi);

        const subOptions = Array.from(el.children) as HTMLOptionElement[];
        subOptions.forEach((subEl) => {
          const optionEl = this._appendOptionWithIcon(this.element, subEl, "optgroup-option");
          this._addOptionToValueDict(subEl, optionEl);
        });
      }
    });

    this.wrapper.appendChild(this.dropdownOptions);

    // Dynamic Select input dropdown trigger
    this.input = document.createElement("input");
    this.input.className = "select-dropdown dropdown-trigger";
    this.input.type = "text";
    this.input.readOnly = true;
    this.input.setAttribute("data-target", this.dropdownOptions.id);
    if (this.element.disabled) {
      this.input.disabled = true;
    }

    this.wrapper.insertBefore(this.input, this.dropdownOptions);
    this._setValueToInput();

    // Caret SVG indicator icon
    const caretSvg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    caretSvg.setAttribute("class", "caret");
    caretSvg.setAttribute("height", "24");
    caretSvg.setAttribute("viewBox", "0 0 24 24");
    caretSvg.setAttribute("width", "24");
    caretSvg.innerHTML = `<path d="M7 10l5 5 5-5z"/><path d="M0 0h24v24H0z" fill="none"/>`;
    this.wrapper.insertBefore(caretSvg, this.input);

    if (!this.element.disabled) {
      const dropdownConfig = { ...this.options.dropdownOptions };
      const userOnOpen = dropdownConfig.onOpen ?? (() => {});

      dropdownConfig.onOpen = () => {
        const selectedOption = this.dropdownOptions?.querySelector(".selected") as HTMLElement | null;
        if (selectedOption && this.dropdown) {
          (this.dropdown as any).focusedIndex = Array.from(this.dropdownOptions!.children).indexOf(selectedOption);
          (this.dropdown as any)._focusFocusedItem?.();

          // Scroll selected item to center inside dropdown view
          const scrollOffset = selectedOption.offsetTop - this.dropdownOptions!.offsetHeight / 2;
          this.dropdownOptions!.scrollTop = scrollOffset;
        }
        userOnOpen();
      };

      dropdownConfig.closeOnClick = false; // Prevent immediate close
      this.dropdown = new Dropdown(this.input, dropdownConfig);
    }

    this._setSelectedStates();
  }

  private _addOptionToValueDict(el: HTMLOptionElement, optionEl: HTMLLIElement): void {
    if (!this.dropdownOptions) return;
    const index = Object.keys(this.valueDict).length;
    const key = `${this.dropdownOptions.id}${index}`;
    optionEl.id = key;

    this.valueDict[key] = {
      el,
      optionEl,
    };
  }

  private _removeDropdown(): void {
    if (this.wrapper) {
      this.wrapper.querySelector(".caret")?.remove();
      this.input?.remove();
      this.dropdownOptions?.remove();
      this.wrapper.parentNode?.insertBefore(this.element, this.wrapper);
      this.wrapper.remove();
    }
  }

  private _appendOptionWithIcon(
    select: HTMLSelectElement,
    option: HTMLOptionElement,
    type: string
  ): HTMLLIElement {
    const disabledClass = option.disabled ? "disabled " : "";
    const optgroupClass = type === "optgroup-option" ? "optgroup-option " : "";
    const innerHtml = option.innerHTML;

    const liEl = document.createElement("li");
    liEl.className = `${disabledClass}${optgroupClass}`.trim();

    const spanEl = document.createElement("span");
    if (this.isMultiple) {
      spanEl.innerHTML = `<label><input type="checkbox"${option.disabled ? ' disabled="true"' : ""}/><span>${innerHtml}</span></label>`;
    } else {
      spanEl.innerHTML = innerHtml;
    }
    liEl.appendChild(spanEl);

    // Support option data-icon values
    const iconUrl = option.getAttribute("data-icon");
    if (iconUrl) {
      const img = document.createElement("img");
      img.src = iconUrl;
      img.alt = "";
      liEl.insertBefore(img, liEl.firstChild);
    }

    this.dropdownOptions?.appendChild(liEl);
    return liEl;
  }

  private _toggleEntryFromArray(key: string): boolean {
    const notAdded = !Object.prototype.hasOwnProperty.call(this.keysSelected, key);
    const optionLi = this.valueDict[key].optionEl;

    if (notAdded) {
      this.keysSelected[key] = true;
    } else {
      delete this.keysSelected[key];
    }

    optionLi.classList.toggle("selected", notAdded);

    const checkbox = optionLi.querySelector('input[type="checkbox"]') as HTMLInputElement | null;
    if (checkbox) checkbox.checked = notAdded;

    return notAdded;
  }

  private _setValueToInput(): void {
    const values: string[] = [];
    const options = Array.from(this.element.querySelectorAll("option")) as HTMLOptionElement[];

    options.forEach((el) => {
      if (el.selected) {
        values.push(el.textContent || "");
      }
    });

    if (values.length === 0) {
      const firstDisabled = this.element.querySelector("option:disabled") as HTMLOptionElement | null;
      if (firstDisabled && firstDisabled.value === "") {
        values.push(firstDisabled.textContent || "");
      }
    }

    if (this.input) {
      this.input.value = values.join(", ");
    }
  }

  private _setSelectedStates(): void {
    this.keysSelected = {};

    for (const key in this.valueDict) {
      if (Object.prototype.hasOwnProperty.call(this.valueDict, key)) {
        const option = this.valueDict[key];
        const isSelected = option.el.selected;

        const checkbox = option.optionEl.querySelector('input[type="checkbox"]') as HTMLInputElement | null;
        if (checkbox) checkbox.checked = isSelected;

        if (isSelected) {
          option.optionEl.classList.add("selected");
          this.keysSelected[key] = true;
        } else {
          option.optionEl.classList.remove("selected");
        }
      }
    }
  }

  public getSelectedValues(): string[] {
    const selectedValues: string[] = [];
    for (const key in this.keysSelected) {
      if (Object.prototype.hasOwnProperty.call(this.keysSelected, key)) {
        selectedValues.push(this.valueDict[key].el.value);
      }
    }
    return selectedValues;
  }
}
