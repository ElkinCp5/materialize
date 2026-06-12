import type { PushpinOptions, IComponent } from "../types";

export class Pushpin implements IComponent {
  private element: HTMLElement;
  private options: Required<PushpinOptions>;
  private originalOffset: number = 0;

  private static _pushpins: Pushpin[] = [];

  // Static event handler for document scroll
  private static _updateElementsBound = Pushpin._updateElements.bind(Pushpin);

  constructor(element: HTMLElement, options?: PushpinOptions) {
    this.element = element;
    this.options = {
      top: options?.top ?? 0,
      bottom: options?.bottom ?? Infinity,
      offset: options?.offset ?? 0,
      onPositionChange: options?.onPositionChange ?? (() => {}),
    };

    (this.element as any).M_Pushpin = this;

    this.originalOffset = this.element.offsetTop;
    Pushpin._pushpins.push(this);

    this.init();
  }

  public static init(elements: HTMLElement | NodeListOf<HTMLElement>, options?: PushpinOptions): Pushpin | Pushpin[] {
    if (elements instanceof HTMLElement) {
      return new Pushpin(elements, options);
    }
    const instances: Pushpin[] = [];
    elements.forEach((el) => {
      instances.push(new Pushpin(el, options));
    });
    return instances;
  }

  public static getInstance(element: HTMLElement): Pushpin | undefined {
    return (element as any).M_Pushpin;
  }

  public init(): void {
    this._setupEventHandlers();
    this._updatePosition();
  }

  public destroy(): void {
    this.element.style.top = "";
    this._removePinClasses();

    const idx = Pushpin._pushpins.indexOf(this);
    if (idx !== -1) {
      Pushpin._pushpins.splice(idx, 1);
    }

    if (Pushpin._pushpins.length === 0) {
      this._removeEventHandlers();
    }
    (this.element as any).M_Pushpin = undefined;
  }

  private static _updateElements(): void {
    Pushpin._pushpins.forEach((pin) => {
      pin._updatePosition();
    });
  }

  private _setupEventHandlers(): void {
    if (Pushpin._pushpins.length === 1) {
      document.addEventListener("scroll", Pushpin._updateElementsBound, { passive: true });
    }
  }

  private _removeEventHandlers(): void {
    document.removeEventListener("scroll", Pushpin._updateElementsBound);
  }

  private _updatePosition(): void {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const scrolled = scrollTop + this.options.offset;

    // Pinned state
    if (
      this.options.top <= scrolled &&
      this.options.bottom >= scrolled &&
      !this.element.classList.contains("pinned")
    ) {
      this._removePinClasses();
      this.element.style.top = `${this.options.offset}px`;
      this.element.classList.add("pinned");
      this.options.onPositionChange("pinned");
    }

    // Pin-top state
    if (scrolled < this.options.top && !this.element.classList.contains("pin-top")) {
      this._removePinClasses();
      this.element.style.top = "0px";
      this.element.classList.add("pin-top");
      this.options.onPositionChange("pin-top");
    }

    // Pin-bottom state
    if (scrolled > this.options.bottom && !this.element.classList.contains("pin-bottom")) {
      this._removePinClasses();
      this.element.classList.add("pin-bottom");
      this.element.style.top = `${this.options.bottom - this.originalOffset}px`;
      this.options.onPositionChange("pin-bottom");
    }
  }

  private _removePinClasses(): void {
    this.element.classList.remove("pin-top", "pinned", "pin-bottom");
  }
}
