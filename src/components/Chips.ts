import type { ChipsOptions, ChipData, IComponent } from "../types";
import { Autocomplete } from "./Autocomplete";

export class Chips implements IComponent {
  private element: HTMLElement;
  private options: Required<ChipsOptions>;
  private chipsData: ChipData[] = [];
  private chipsElements: HTMLElement[] = [];
  private input: HTMLInputElement | null = null;
  private label: HTMLLabelElement | null = null;
  private autocomplete: Autocomplete | null = null;
  private selectedChip: HTMLElement | null = null;
  private hasAutocomplete: boolean = false;

  private static _keydown: boolean = false;

  // Bound event handlers
  private _handleChipClickBound: (e: MouseEvent) => void;
  private _handleInputKeydownBound: (e: KeyboardEvent) => void;
  private _handleInputFocusBound: () => void;
  private _handleInputBlurBound: () => void;

  private static _handleChipsKeydownBound = Chips._handleChipsKeydown.bind(Chips);
  private static _handleChipsKeyupBound = Chips._handleChipsKeyup.bind(Chips);
  private static _handleChipsBlurBound = Chips._handleChipsBlur.bind(Chips);

  constructor(element: HTMLElement, options?: ChipsOptions) {
    this.element = element;
    this.options = {
      data: options?.data ?? [],
      placeholder: options?.placeholder ?? "",
      secondaryPlaceholder: options?.secondaryPlaceholder ?? "",
      autocompleteOptions: options?.autocompleteOptions ?? {},
      limit: options?.limit ?? Infinity,
      onChipAdd: options?.onChipAdd ?? (() => {}),
      onChipSelect: options?.onChipSelect ?? (() => {}),
      onChipDelete: options?.onChipDelete ?? (() => {}),
    };

    (this.element as any).M_Chips = this;

    this.element.classList.add("chips", "input-field");
    this.hasAutocomplete = Object.keys(this.options.autocompleteOptions).length > 0;

    this._handleChipClickBound = this._handleChipClick.bind(this);
    this._handleInputKeydownBound = this._handleInputKeydown.bind(this);
    this._handleInputFocusBound = this._handleInputFocus.bind(this);
    this._handleInputBlurBound = this._handleInputBlur.bind(this);

    this.init();
  }

  public static init(elements: HTMLElement | NodeListOf<HTMLElement>, options?: ChipsOptions): Chips | Chips[] {
    if (elements instanceof HTMLElement) {
      return new Chips(elements, options);
    }
    const instances: Chips[] = [];
    elements.forEach((el) => {
      instances.push(new Chips(el, options));
    });
    return instances;
  }

  public static getInstance(element: HTMLElement): Chips | undefined {
    return (element as any).M_Chips;
  }

  public init(): void {
    this._setupInput();
    
    if (this.options.data.length > 0) {
      this.chipsData = [...this.options.data];
      this._renderChips();
    }

    if (this.hasAutocomplete) {
      this._setupAutocomplete();
    }

    this._setPlaceholder();
    this._setupLabel();
    this._setupEventHandlers();
  }

  public destroy(): void {
    this._removeEventHandlers();
    this.chipsElements.forEach((el) => el.remove());
    this.chipsElements = [];
    (this.element as any).M_Chips = undefined;
  }

  private _setupEventHandlers(): void {
    this.element.addEventListener("click", this._handleChipClickBound);
    document.addEventListener("keydown", Chips._handleChipsKeydownBound);
    document.addEventListener("keyup", Chips._handleChipsKeyupBound);
    this.element.addEventListener("blur", Chips._handleChipsBlurBound, true);

    if (this.input) {
      this.input.addEventListener("focus", this._handleInputFocusBound);
      this.input.addEventListener("blur", this._handleInputBlurBound);
      this.input.addEventListener("keydown", this._handleInputKeydownBound);
    }
  }

  private _removeEventHandlers(): void {
    this.element.removeEventListener("click", this._handleChipClickBound);
    document.removeEventListener("keydown", Chips._handleChipsKeydownBound);
    document.removeEventListener("keyup", Chips._handleChipsKeyupBound);
    this.element.removeEventListener("blur", Chips._handleChipsBlurBound, true);

    if (this.input) {
      this.input.removeEventListener("focus", this._handleInputFocusBound);
      this.input.removeEventListener("blur", this._handleInputBlurBound);
      this.input.removeEventListener("keydown", this._handleInputKeydownBound);
    }
  }

  private _handleChipClick(e: MouseEvent): void {
    const target = e.target as HTMLElement;
    const chipEl = target.closest(".chip") as HTMLElement | null;
    const clickedClose = target.classList.contains("close");

    if (chipEl) {
      const index = this.chipsElements.indexOf(chipEl);
      if (clickedClose) {
        this.deleteChip(index);
        this.input?.focus();
      } else {
        this.selectChip(index);
      }
    } else {
      this.input?.focus();
    }
  }

  private static _handleChipsKeydown(e: KeyboardEvent): void {
    Chips._keydown = true;
    const target = e.target as HTMLElement;
    const chipsContainer = target.closest(".chips") as HTMLElement | null;
    if (!chipsContainer || target.tagName === "INPUT" || target.tagName === "TEXTAREA") return;

    const instance = (chipsContainer as any).M_Chips as Chips;
    if (!instance) return;

    if (e.key === "Backspace" || e.keyCode === 8 || e.key === "Delete" || e.keyCode === 46) {
      e.preventDefault();
      let selectIndex = instance.chipsData.length;
      if (instance.selectedChip) {
        const index = instance.chipsElements.indexOf(instance.selectedChip);
        instance.deleteChip(index);
        instance.selectedChip = null;
        selectIndex = Math.max(index - 1, 0);
      }
      if (instance.chipsData.length > 0) {
        instance.selectChip(selectIndex);
      }
    } else if (e.key === "ArrowLeft" || e.keyCode === 37) {
      if (instance.selectedChip) {
        const selectIndex = instance.chipsElements.indexOf(instance.selectedChip) - 1;
        if (selectIndex >= 0) {
          instance.selectChip(selectIndex);
        }
      }
    } else if (e.key === "ArrowRight" || e.keyCode === 39) {
      if (instance.selectedChip) {
        const selectIndex = instance.chipsElements.indexOf(instance.selectedChip) + 1;
        if (selectIndex >= instance.chipsData.length) {
          instance.input?.focus();
        } else {
          instance.selectChip(selectIndex);
        }
      }
    }
  }

  private static _handleChipsKeyup(): void {
    Chips._keydown = false;
  }

  private static _handleChipsBlur(e: FocusEvent): void {
    if (!Chips._keydown) {
      const target = e.target as HTMLElement;
      const chipsContainer = target.closest(".chips") as HTMLElement | null;
      if (chipsContainer) {
        const instance = (chipsContainer as any).M_Chips as Chips;
        if (instance) instance.selectedChip = null;
      }
    }
  }

  private _handleInputFocus(): void {
    this.element.classList.add("focus");
  }

  private _handleInputBlur(): void {
    this.element.classList.remove("focus");
  }

  private _handleInputKeydown(e: KeyboardEvent): void {
    Chips._keydown = true;
    if (!this.input) return;

    if (e.key === "Enter" || e.keyCode === 13) {
      if (this.hasAutocomplete && this.autocomplete && (this.autocomplete as any).isOpen) {
        return; // Allow autocomplete to handle Enter key first
      }

      e.preventDefault();
      this.addChip({ tag: this.input.value });
      this.input.value = "";
    } else if (
      (e.key === "Backspace" || e.keyCode === 8 || e.key === "ArrowLeft" || e.keyCode === 37) &&
      this.input.value === "" &&
      this.chipsData.length > 0
    ) {
      e.preventDefault();
      this.selectChip(this.chipsData.length - 1);
    }
  }

  private _renderChip(chip: ChipData): HTMLDivElement {
    const renderedChip = document.createElement("div");
    renderedChip.className = "chip";
    renderedChip.textContent = chip.tag;
    renderedChip.setAttribute("tabindex", "0");

    const closeIcon = document.createElement("i");
    closeIcon.className = "material-icons close";
    closeIcon.textContent = "close";

    if (chip.image) {
      const img = document.createElement("img");
      img.src = chip.image;
      renderedChip.insertBefore(img, renderedChip.firstChild);
    }

    renderedChip.appendChild(closeIcon);
    return renderedChip;
  }

  private _renderChips(): void {
    this.chipsElements.forEach((el) => el.remove());
    this.chipsElements = [];

    this.chipsData.forEach((chip) => {
      const chipEl = this._renderChip(chip);
      this.element.appendChild(chipEl);
      this.chipsElements.push(chipEl);
    });

    if (this.input) {
      this.element.appendChild(this.input);
    }
  }

  private _setupAutocomplete(): void {
    if (!this.input) return;
    this.options.autocompleteOptions.onAutocomplete = (val: string) => {
      this.addChip({ tag: val });
      if (this.input) {
        this.input.value = "";
        this.input.focus();
      }
    };

    this.autocomplete = new Autocomplete(this.input, this.options.autocompleteOptions);
  }

  private _setupInput(): void {
    let inputEl = this.element.querySelector("input") as HTMLInputElement | null;
    if (!inputEl) {
      inputEl = document.createElement("input");
      this.element.appendChild(inputEl);
    }
    inputEl.className = "input";
    if (!inputEl.id) {
      inputEl.id = `chips-input-${Math.random().toString(36).substring(2, 9)}`;
    }
    this.input = inputEl;
  }

  private _setupLabel(): void {
    const labelEl = this.element.querySelector("label");
    if (labelEl && this.input) {
      labelEl.setAttribute("for", this.input.id);
    }
  }

  private _setPlaceholder(): void {
    if (!this.input) return;

    if (this.chipsData.length === 0 && this.options.placeholder) {
      this.input.placeholder = this.options.placeholder;
    } else if (this.chipsData.length > 0 && this.options.secondaryPlaceholder) {
      this.input.placeholder = this.options.secondaryPlaceholder;
    } else {
      this.input.placeholder = "";
    }
  }

  private _isValid(chip: ChipData): boolean {
    if (chip.tag && chip.tag.trim() !== "") {
      return !this.chipsData.some((existing) => existing.tag === chip.tag);
    }
    return false;
  }

  public addChip(chip: ChipData): void {
    if (!this._isValid(chip) || this.chipsData.length >= this.options.limit) return;

    const renderedChip = this._renderChip(chip);
    this.chipsData.push(chip);
    this.chipsElements.push(renderedChip);

    if (this.input) {
      this.element.insertBefore(renderedChip, this.input);
    } else {
      this.element.appendChild(renderedChip);
    }

    this._setPlaceholder();
    this.options.onChipAdd(this.element, renderedChip);
  }

  public deleteChip(chipIndex: number): void {
    const chipEl = this.chipsElements[chipIndex];
    if (chipEl) {
      chipEl.remove();
      this.chipsElements.splice(chipIndex, 1);
      this.chipsData.splice(chipIndex, 1);
      this._setPlaceholder();
      this.options.onChipDelete(this.element, chipEl);
    }
  }

  public selectChip(chipIndex: number): void {
    const chipEl = this.chipsElements[chipIndex];
    if (chipEl) {
      this.selectedChip = chipEl;
      chipEl.focus();
      this.options.onChipSelect(this.element, chipEl);
    }
  }

  public getData(): ChipData[] {
    return this.chipsData;
  }
}
