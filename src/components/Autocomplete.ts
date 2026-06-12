import type { AutocompleteOptions, IComponent } from "../types";
import { Dropdown } from "./Dropdown";
import { debounce } from "../utilities/helpers";

export class Autocomplete implements IComponent {
  private element: HTMLInputElement;
  private options: Required<AutocompleteOptions>;
  private isOpen: boolean = false;
  private count: number = 0;
  private activeIndex: number = -1;
  private oldVal: string = "";
  private inputField: HTMLElement | null = null;
  private container: HTMLUListElement | null = null;
  private dropdown: Dropdown | null = null;
  private activeEl: HTMLElement | null = null;
  private mousedown: boolean = false;

  // Bound events
  private _handleInputBlurBound: () => void;
  private _handleInputKeyupAndFocusBound: (e: KeyboardEvent | FocusEvent) => void;
  private _handleInputKeydownBound: (e: KeyboardEvent) => void;
  private _handleInputClickBound: () => void;
  private _handleContainerMousedownBound: () => void;
  private _handleContainerMouseupBound: () => void;

  constructor(element: HTMLInputElement, options?: AutocompleteOptions) {
    if (!(element instanceof HTMLInputElement)) {
      throw new Error("Autocomplete must be initialized on an HTMLInputElement");
    }

    this.element = element;
    this.options = {
      data: options?.data ?? {},
      limit: options?.limit ?? Infinity,
      minLength: options?.minLength ?? 1,
      onAutocomplete: options?.onAutocomplete ?? (() => {}),
      sortFunction: options?.sortFunction ?? ((a, b, inputString) => a.indexOf(inputString) - b.indexOf(inputString)),
    };

    (this.element as any).M_Autocomplete = this;

    this._handleInputBlurBound = this._handleInputBlur.bind(this);
    // Debounce the keyup and focus actions to optimize DOM render
    this._handleInputKeyupAndFocusBound = debounce(this._handleInputKeyupAndFocus.bind(this), 100) as any;
    this._handleInputKeydownBound = this._handleInputKeydown.bind(this);
    this._handleInputClickBound = this._handleInputClick.bind(this);
    this._handleContainerMousedownBound = this._handleContainerMousedown.bind(this);
    this._handleContainerMouseupBound = this._handleContainerMouseup.bind(this);

    this.init();
  }

  public static init(
    elements: HTMLInputElement | NodeListOf<HTMLInputElement>,
    options?: AutocompleteOptions
  ): Autocomplete | Autocomplete[] {
    if (elements instanceof HTMLInputElement) {
      return new Autocomplete(elements, options);
    }
    const instances: Autocomplete[] = [];
    elements.forEach((el) => {
      instances.push(new Autocomplete(el, options));
    });
    return instances;
  }

  public static getInstance(element: HTMLElement): Autocomplete | undefined {
    return (element as any).M_Autocomplete;
  }

  public init(): void {
    this.inputField = this.element.closest(".input-field");
    this._setupDropdown();
    this._setupEventHandlers();
  }

  public destroy(): void {
    this._removeEventHandlers();
    this._removeDropdown();
    (this.element as any).M_Autocomplete = undefined;
  }

  private _setupEventHandlers(): void {
    this.element.addEventListener("blur", this._handleInputBlurBound);
    this.element.addEventListener("keyup", this._handleInputKeyupAndFocusBound);
    this.element.addEventListener("focus", this._handleInputKeyupAndFocusBound);
    this.element.addEventListener("keydown", this._handleInputKeydownBound);
    this.element.addEventListener("click", this._handleInputClickBound);

    if (this.container) {
      this.container.addEventListener("mousedown", this._handleContainerMousedownBound);
      this.container.addEventListener("mouseup", this._handleContainerMouseupBound);
      this.container.addEventListener("touchstart", this._handleContainerMousedownBound, { passive: true });
      this.container.addEventListener("touchend", this._handleContainerMouseupBound, { passive: true });
    }
  }

  private _removeEventHandlers(): void {
    this.element.removeEventListener("blur", this._handleInputBlurBound);
    this.element.removeEventListener("keyup", this._handleInputKeyupAndFocusBound);
    this.element.removeEventListener("focus", this._handleInputKeyupAndFocusBound);
    this.element.removeEventListener("keydown", this._handleInputKeydownBound);
    this.element.removeEventListener("click", this._handleInputClickBound);

    if (this.container) {
      this.container.removeEventListener("mousedown", this._handleContainerMousedownBound);
      this.container.removeEventListener("mouseup", this._handleContainerMouseupBound);
      this.container.removeEventListener("touchstart", this._handleContainerMousedownBound);
      this.container.removeEventListener("touchend", this._handleContainerMouseupBound);
    }
  }

  private _setupDropdown(): void {
    this.container = document.createElement("ul");
    this.container.id = `autocomplete-options-${Math.random().toString(36).substring(2, 9)}`;
    this.container.className = "autocomplete-content dropdown-content";
    this.inputField?.appendChild(this.container);
    this.element.setAttribute("data-target", this.container.id);

    this.dropdown = new Dropdown(this.element, {
      autoTrigger: false,
      closeOnClick: false,
      coverTrigger: false,
      onOpen: () => {},
      onClose: () => {},
    });
  }

  private _removeDropdown(): void {
    if (this.dropdown) {
      this.dropdown.destroy();
      this.dropdown = null;
    }
    if (this.container) {
      this.container.remove();
      this.container = null;
    }
  }

  private _handleInputBlur(): void {
    if (!this.mousedown) {
      this.close();
      this._resetAutocomplete();
    }
  }

  private _handleInputKeyupAndFocus(e: KeyboardEvent | FocusEvent): void {
    this.count = 0;
    const val = this.element.value.toLowerCase();

    if (e instanceof KeyboardEvent && (e.keyCode === 13 || e.keyCode === 38 || e.keyCode === 40)) {
      return; // Do not capture arrows and enter on keyup
    }

    if (this.oldVal !== val && (e.type !== "focus" || val.length > 0)) {
      this.open();
    }

    this.oldVal = val;
  }

  private _handleInputKeydown(e: KeyboardEvent): void {
    if (!this.container) return;
    const keyCode = e.keyCode;
    const items = Array.from(this.container.children) as HTMLElement[];
    const numItems = items.length;

    // Enter selection
    if (keyCode === 13 && this.activeIndex >= 0) {
      const activeLi = items[this.activeIndex];
      if (activeLi) {
        this.selectOption(activeLi);
        e.preventDefault();
      }
      return;
    }

    // Up and Down keys
    if (keyCode === 38 || keyCode === 40) {
      e.preventDefault();

      if (keyCode === 38 && this.activeIndex > 0) {
        this.activeIndex--;
      }

      if (keyCode === 40 && this.activeIndex < numItems - 1) {
        this.activeIndex++;
      }

      if (this.activeEl) {
        this.activeEl.classList.remove("active");
      }

      if (this.activeIndex >= 0) {
        this.activeEl = items[this.activeIndex];
        this.activeEl?.classList.add("active");
      }
    }
  }

  private _handleInputClick(): void {
    this.open();
  }

  private _handleContainerMousedown(): void {
    this.mousedown = true;
  }

  private _handleContainerMouseup(): void {
    this.mousedown = false;
  }

  private _highlight(string: string, el: HTMLElement): void {
    const textNode = el.querySelector("span");
    if (!textNode) return;

    const originalText = textNode.textContent || "";
    const matchStart = originalText.toLowerCase().indexOf(string.toLowerCase());
    if (matchStart === -1) return;

    const matchEnd = matchStart + string.length - 1;
    const beforeMatch = originalText.slice(0, matchStart);
    const matchText = originalText.slice(matchStart, matchEnd + 1);
    const afterMatch = originalText.slice(matchEnd + 1);

    textNode.innerHTML = `${beforeMatch}<span class='highlight'>${matchText}</span>${afterMatch}`;
  }

  private _resetCurrentElement(): void {
    this.activeIndex = -1;
    if (this.activeEl) {
      this.activeEl.classList.remove("active");
      this.activeEl = null;
    }
  }

  private _resetAutocomplete(): void {
    if (this.container) {
      this.container.innerHTML = "";
    }
    this._resetCurrentElement();
    this.oldVal = "";
    this.isOpen = false;
    this.mousedown = false;
  }

  public selectOption(el: HTMLElement): void {
    const text = (el.querySelector("span")?.textContent || el.textContent || "").trim();
    this.element.value = text;
    
    // Sincronizar eventos de cambio nativos
    this.element.dispatchEvent(new Event("change", { bubbles: true }));
    this._resetAutocomplete();
    this.close();

    this.options.onAutocomplete(text);
  }

  private _renderDropdown(data: Record<string, string | null>, val: string): void {
    this._resetAutocomplete();
    if (!this.container) return;

    let matchingData: { key: string; data: string | null }[] = [];

    for (const key in data) {
      if (Object.prototype.hasOwnProperty.call(data, key) && key.toLowerCase().indexOf(val) !== -1) {
        matchingData.push({
          key,
          data: data[key],
        });
        this.count++;
      }
    }

    // Sort using custom or default sorting
    matchingData.sort((a, b) => {
      return this.options.sortFunction(
        a.key.toLowerCase(),
        b.key.toLowerCase(),
        val.toLowerCase()
      );
    });

    // Limit elements
    matchingData = matchingData.slice(0, this.options.limit);

    // Create and append list elements
    matchingData.forEach((entry) => {
      const li = document.createElement("li");
      
      const span = document.createElement("span");
      span.textContent = entry.key;

      if (entry.data) {
        const img = document.createElement("img");
        img.src = entry.data;
        img.className = "right circle";
        li.appendChild(img);
      }

      li.appendChild(span);
      li.addEventListener("click", () => this.selectOption(li));
      
      this.container?.appendChild(li);
      this._highlight(val, li);
    });
  }

  public open(): void {
    const val = this.element.value.toLowerCase();
    this._resetAutocomplete();

    if (val.length >= this.options.minLength) {
      this.isOpen = true;
      this._renderDropdown(this.options.data, val);
    }

    if (this.dropdown && !this.isOpen && val.length < this.options.minLength) {
      this.dropdown.close();
    } else if (this.dropdown) {
      // open/refresh dropdown visual positioning
      this.dropdown.open();
    }
  }

  public close(): void {
    if (this.dropdown) {
      this.dropdown.close();
    }
    this.isOpen = false;
  }

  public updateData(data: Record<string, string | null>): void {
    const val = this.element.value.toLowerCase();
    this.options.data = data;

    if (this.isOpen) {
      this._renderDropdown(data, val);
    }
  }
}
