import type { TapTargetOptions, IComponent } from "../types";

export class TapTarget implements IComponent {
  private element: HTMLElement;
  private options: Required<TapTargetOptions>;
  private isOpen: boolean = false;

  private origin: HTMLElement | null = null;
  private wrapper: HTMLDivElement | null = null;
  private waveEl: HTMLDivElement | null = null;
  private originEl: HTMLElement | null = null;
  private contentEl: HTMLDivElement | null = null;

  // Event handler bounds
  private _handleDocumentClickBound: (e: MouseEvent) => void;
  private _handleTargetClickBound: (e: MouseEvent) => void;
  private _handleOriginClickBound: (e: MouseEvent) => void;
  private _handleResizeBound: () => void;

  constructor(element: HTMLElement, options?: TapTargetOptions) {
    this.element = element;
    this.options = {
      onOpen: options?.onOpen ?? (() => {}),
      onClose: options?.onClose ?? (() => {}),
    };

    (this.element as any).M_TapTarget = this;

    const dataTarget = this.element.getAttribute("data-target");
    if (dataTarget) {
      this.origin = document.getElementById(dataTarget);
    }

    this._handleDocumentClickBound = this._handleDocumentClick.bind(this);
    this._handleTargetClickBound = this._handleTargetClick.bind(this);
    this._handleOriginClickBound = this._handleOriginClick.bind(this);
    this._handleResizeBound = this._handleResize.bind(this);

    this.init();
  }

  public static init(elements: HTMLElement | NodeListOf<HTMLElement>, options?: TapTargetOptions): TapTarget | TapTarget[] {
    if (elements instanceof HTMLElement) {
      return new TapTarget(elements, options);
    }
    const instances: TapTarget[] = [];
    elements.forEach((el) => {
      instances.push(new TapTarget(el, options));
    });
    return instances;
  }

  public static getInstance(element: HTMLElement): TapTarget | undefined {
    return (element as any).M_TapTarget;
  }

  public init(): void {
    this._setup();
    this._calculatePositioning();
    this._setupEventHandlers();
  }

  public destroy(): void {
    this._removeEventHandlers();
    (this.element as any).M_TapTarget = undefined;
  }

  private _setupEventHandlers(): void {
    this.element.addEventListener("click", this._handleTargetClickBound);
    this.originEl?.addEventListener("click", this._handleOriginClickBound);
    window.addEventListener("resize", this._handleResizeBound);
  }

  private _removeEventHandlers(): void {
    this.element.removeEventListener("click", this._handleTargetClickBound);
    this.originEl?.removeEventListener("click", this._handleOriginClickBound);
    window.removeEventListener("resize", this._handleResizeBound);
  }

  private _handleTargetClick(e: MouseEvent): void {
    this.open();
  }

  private _handleOriginClick(e: MouseEvent): void {
    this.close();
  }

  private _handleResize(): void {
    this._calculatePositioning();
  }

  private _handleDocumentClick(e: MouseEvent): void {
    const target = e.target as HTMLElement;
    if (!target.closest(".tap-target-wrapper")) {
      this.close();
      e.preventDefault();
      e.stopPropagation();
    }
  }

  private _setup(): void {
    const parent = this.element.parentElement;
    if (parent && parent.classList.contains("tap-target-wrapper")) {
      this.wrapper = parent as HTMLDivElement;
      this.waveEl = this.wrapper.querySelector(".tap-target-wave");
      this.originEl = this.wrapper.querySelector(".tap-target-origin");
    }

    if (!this.wrapper) {
      this.wrapper = document.createElement("div");
      this.wrapper.className = "tap-target-wrapper";
      this.element.parentNode?.insertBefore(this.wrapper, this.element);
      this.wrapper.appendChild(this.element);
    }

    this.contentEl = this.element.querySelector(".tap-target-content");
    if (!this.contentEl) {
      this.contentEl = document.createElement("div");
      this.contentEl.className = "tap-target-content";
      this.element.appendChild(this.contentEl);
    }

    if (!this.waveEl && this.origin) {
      this.waveEl = document.createElement("div");
      this.waveEl.className = "tap-target-wave";

      this.originEl = this.origin.cloneNode(true) as HTMLElement;
      this.originEl.classList.add("tap-target-origin");
      this.originEl.removeAttribute("id");
      this.originEl.removeAttribute("style");
      
      this.waveEl.appendChild(this.originEl);
      this.wrapper.appendChild(this.waveEl);
    }
  }

  private _calculatePositioning(): void {
    if (!this.origin || !this.wrapper || !this.contentEl || !this.waveEl) return;

    let isFixed = window.getComputedStyle(this.origin).position === "fixed";
    if (!isFixed) {
      let ancestor = this.origin.parentElement;
      while (ancestor !== null && ancestor !== document.body) {
        if (window.getComputedStyle(ancestor).position === "fixed") {
          isFixed = true;
          break;
        }
        ancestor = ancestor.parentElement;
      }
    }

    const rect = this.origin.getBoundingClientRect();
    const originWidth = this.origin.offsetWidth;
    const originHeight = this.origin.offsetHeight;

    const scrollY = window.pageYOffset || document.documentElement.scrollTop;
    const scrollX = window.pageXOffset || document.documentElement.scrollLeft;

    const originTop = isFixed ? rect.top : rect.top + scrollY;
    const originLeft = isFixed ? rect.left : rect.left + scrollX;

    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;
    const centerX = windowWidth / 2;
    const centerY = windowHeight / 2;

    const isLeft = originLeft <= centerX;
    const isRight = originLeft > centerX;
    const isTop = originTop <= centerY;
    const isBottom = originTop > centerY;
    const isCenterX = originLeft >= windowWidth * 0.25 && originLeft <= windowWidth * 0.75;

    const tapTargetWidth = this.element.offsetWidth || 300;
    const tapTargetHeight = this.element.offsetHeight || 300;
    const tapTargetTop = originTop + originHeight / 2 - tapTargetHeight / 2;
    const tapTargetLeft = originLeft + originWidth / 2 - tapTargetWidth / 2;
    const tapTargetPosition = isFixed ? "fixed" : "absolute";

    const tapTargetTextWidth = isCenterX ? tapTargetWidth : tapTargetWidth / 2 + originWidth;
    const tapTargetTextHeight = tapTargetHeight / 2;
    const tapTargetTextTop = isTop ? tapTargetHeight / 2 : 0;
    const tapTargetTextLeft = isLeft && !isCenterX ? tapTargetWidth / 2 - originWidth : 0;
    const tapTargetTextPadding = originWidth;
    const tapTargetTextAlign = isBottom ? "bottom" : "top";

    const tapTargetWaveWidth = originWidth * 2;
    const tapTargetWaveHeight = tapTargetWaveWidth;
    const tapTargetWaveTop = tapTargetHeight / 2 - tapTargetWaveHeight / 2;
    const tapTargetWaveLeft = tapTargetWidth / 2 - tapTargetWaveWidth / 2;

    this.wrapper.style.top = isTop ? `${tapTargetTop}px` : "";
    this.wrapper.style.right = isRight ? `${windowWidth - tapTargetLeft - tapTargetWidth}px` : "";
    this.wrapper.style.bottom = isBottom ? `${windowHeight - tapTargetTop - tapTargetHeight}px` : "";
    this.wrapper.style.left = isLeft ? `${tapTargetLeft}px` : "";
    this.wrapper.style.position = tapTargetPosition;

    this.contentEl.style.width = `${tapTargetTextWidth}px`;
    this.contentEl.style.height = `${tapTargetTextHeight}px`;
    this.contentEl.style.top = `${tapTargetTextTop}px`;
    this.contentEl.style.left = `${tapTargetTextLeft}px`;
    this.contentEl.style.padding = `${tapTargetTextPadding}px`;
    this.contentEl.style.verticalAlign = tapTargetTextAlign;

    this.waveEl.style.top = `${tapTargetWaveTop}px`;
    this.waveEl.style.left = `${tapTargetWaveLeft}px`;
    this.waveEl.style.width = `${tapTargetWaveWidth}px`;
    this.waveEl.style.height = `${tapTargetWaveHeight}px`;
  }

  public open(): void {
    if (this.isOpen || !this.wrapper || !this.origin) return;

    this.options.onOpen(this.origin);
    this.isOpen = true;
    this.wrapper.classList.add("open");

    document.body.addEventListener("click", this._handleDocumentClickBound, true);
    document.body.addEventListener("touchend", this._handleDocumentClickBound);
  }

  public close(): void {
    if (!this.isOpen || !this.wrapper || !this.origin) return;

    this.options.onClose(this.origin);
    this.isOpen = false;
    this.wrapper.classList.remove("open");

    document.body.removeEventListener("click", this._handleDocumentClickBound, true);
    document.body.removeEventListener("touchend", this._handleDocumentClickBound);
  }
}
