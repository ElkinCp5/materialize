import type { CharacterCounterOptions, IComponent } from "../types";

export class CharacterCounter implements IComponent {
  private element: HTMLInputElement | HTMLTextAreaElement;
  private options: Required<CharacterCounterOptions>;
  private counterEl: HTMLSpanElement | null = null;
  private isInvalid: boolean = false;
  private isValidLength: boolean = false;

  private _handleUpdateCounterBound: () => void;

  constructor(element: HTMLInputElement | HTMLTextAreaElement, options?: CharacterCounterOptions) {
    if (!(element instanceof HTMLInputElement) && !(element instanceof HTMLTextAreaElement)) {
      throw new Error("CharacterCounter can only be initialized on an Input or TextArea element");
    }

    this.element = element;
    this.options = {}; // No custom options currently defined in v1/v2 defaults

    (this.element as any).M_CharacterCounter = this;

    this._handleUpdateCounterBound = this.updateCounter.bind(this);

    this.init();
  }

  public static init(
    elements: HTMLInputElement | HTMLTextAreaElement | NodeListOf<HTMLInputElement | HTMLTextAreaElement>,
    options?: CharacterCounterOptions
  ): CharacterCounter | CharacterCounter[] {
    if (elements instanceof HTMLInputElement || elements instanceof HTMLTextAreaElement) {
      return new CharacterCounter(elements, options);
    }
    const instances: CharacterCounter[] = [];
    elements.forEach((el) => {
      instances.push(new CharacterCounter(el, options));
    });
    return instances;
  }

  public static getInstance(element: HTMLElement): CharacterCounter | undefined {
    return (element as any).M_CharacterCounter;
  }

  public init(): void {
    this._setupCounter();
    this._setupEventHandlers();
    this.updateCounter();
  }

  public destroy(): void {
    this._removeEventHandlers();
    this._removeCounter();
    (this.element as any).M_CharacterCounter = undefined;
  }

  private _setupEventHandlers(): void {
    this.element.addEventListener("focus", this._handleUpdateCounterBound, true);
    this.element.addEventListener("input", this._handleUpdateCounterBound, true);
  }

  private _removeEventHandlers(): void {
    this.element.removeEventListener("focus", this._handleUpdateCounterBound, true);
    this.element.removeEventListener("input", this._handleUpdateCounterBound, true);
  }

  private _setupCounter(): void {
    this.counterEl = document.createElement("span");
    this.counterEl.className = "character-counter";
    this.counterEl.style.float = "right";
    this.counterEl.style.fontSize = "12px";
    this.counterEl.style.height = "1px";

    const parent = this.element.parentElement;
    if (parent) {
      parent.appendChild(this.counterEl);
    }
  }

  private _removeCounter(): void {
    if (this.counterEl) {
      this.counterEl.remove();
      this.counterEl = null;
    }
  }

  public updateCounter(): void {
    const dataLength = this.element.getAttribute("data-length");
    const maxLength = dataLength ? parseInt(dataLength, 10) : 0;
    const actualLength = this.element.value.length;
    this.isValidLength = actualLength <= maxLength;
    let counterString = actualLength.toString();

    if (maxLength > 0) {
      counterString = `${actualLength}/${maxLength}`;
      this._validateInput();
    }

    if (this.counterEl) {
      this.counterEl.textContent = counterString;
    }
  }

  private _validateInput(): void {
    if (this.isValidLength && this.isInvalid) {
      this.isInvalid = false;
      this.element.classList.remove("invalid");
    } else if (!this.isValidLength && !this.isInvalid) {
      this.isInvalid = true;
      this.element.classList.remove("valid");
      this.element.classList.add("invalid");
    }
  }
}
