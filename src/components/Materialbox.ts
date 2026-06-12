import type { MaterialboxOptions, IComponent } from "../types";
import { observe, unobserve } from "../utilities/intersection-observer";

export class Materialbox implements IComponent {
  private element: HTMLImageElement;
  private options: Required<MaterialboxOptions>;
  private overlayActive: boolean = false;
  private doneAnimating: boolean = true;
  private placeholder: HTMLDivElement | null = null;
  private overlay: HTMLDivElement | null = null;
  private photoCaption: HTMLDivElement | null = null;

  private originalWidth: number = 0;
  private originalHeight: number = 0;
  private originInlineStyles: string | null = null;
  private caption: string = "";

  private windowWidth: number = 0;
  private windowHeight: number = 0;
  private newWidth: number = 0;
  private newHeight: number = 0;

  private attrWidth: string | null = null;
  private attrHeight: string | null = null;

  private ancestorsChanged: HTMLElement[] = [];

  // Exit trigger handlers
  private _handleMaterialboxClickBound: (e: MouseEvent) => void;
  private _handleWindowScrollBound: () => void;
  private _handleWindowResizeBound: () => void;
  private _handleWindowEscapeBound: (e: KeyboardEvent) => void;
  private _handleVisibilityChangeBound: (isIntersecting: boolean) => void;

  constructor(element: HTMLImageElement, options?: MaterialboxOptions) {
    if (!(element instanceof HTMLImageElement)) {
      throw new Error("Materialbox must be initialized on an HTMLImageElement");
    }

    this.element = element;
    this.options = {
      inDuration: options?.inDuration ?? 275,
      outDuration: options?.outDuration ?? 200,
      onOpenStart: options?.onOpenStart ?? (() => {}),
      onOpenEnd: options?.onOpenEnd ?? (() => {}),
      onCloseStart: options?.onCloseStart ?? (() => {}),
      onCloseEnd: options?.onCloseEnd ?? (() => {}),
    };

    (this.element as any).M_Materialbox = this;

    this.originInlineStyles = this.element.getAttribute("style");
    this.caption = this.element.getAttribute("data-caption") || "";

    this._handleMaterialboxClickBound = this._handleMaterialboxClick.bind(this);
    this._handleWindowScrollBound = this._handleWindowScroll.bind(this);
    this._handleWindowResizeBound = this._handleWindowResize.bind(this);
    this._handleWindowEscapeBound = this._handleWindowEscape.bind(this);
    this._handleVisibilityChangeBound = this._handleVisibilityChange.bind(this);

    this.init();
  }

  public static init(
    elements: HTMLImageElement | NodeListOf<HTMLImageElement>,
    options?: MaterialboxOptions
  ): Materialbox | Materialbox[] {
    if (elements instanceof HTMLImageElement) {
      return new Materialbox(elements, options);
    }
    const instances: Materialbox[] = [];
    elements.forEach((el) => {
      instances.push(new Materialbox(el, options));
    });
    return instances;
  }

  public static getInstance(element: HTMLElement): Materialbox | undefined {
    return (element as any).M_Materialbox;
  }

  public init(): void {
    // Create and wrap placeholder
    this.placeholder = document.createElement("div");
    this.placeholder.className = "material-placeholder";
    
    if (this.element.parentNode) {
      this.element.parentNode.insertBefore(this.placeholder, this.element);
      this.placeholder.appendChild(this.element);
    }

    this._setupEventHandlers();

    // Use IntersectionObserver helper to handle lazy loading actions or check visibility status
    observe(this.element, this._handleVisibilityChangeBound);
  }

  public destroy(): void {
    unobserve(this.element);
    this._removeEventHandlers();
    (this.element as any).M_Materialbox = undefined;

    if (this.placeholder && this.placeholder.parentNode) {
      this.placeholder.parentNode.insertBefore(this.element, this.placeholder);
      this.placeholder.remove();
    }
    this.element.removeAttribute("style");
    if (this.originInlineStyles) {
      this.element.setAttribute("style", this.originInlineStyles);
    }
  }

  private _setupEventHandlers(): void {
    this.element.addEventListener("click", this._handleMaterialboxClickBound);
  }

  private _removeEventHandlers(): void {
    this.element.removeEventListener("click", this._handleMaterialboxClickBound);
  }

  private _handleMaterialboxClick(e: MouseEvent): void {
    if (!this.doneAnimating || (this.overlayActive && this.doneAnimating)) {
      this.close();
    } else {
      this.open();
    }
  }

  private _handleWindowScroll(): void {
    if (this.overlayActive) {
      this.close();
    }
  }

  private _handleWindowResize(): void {
    if (this.overlayActive) {
      this.close();
    }
  }

  private _handleWindowEscape(e: KeyboardEvent): void {
    if (e.key === "Escape" || e.keyCode === 27) {
      if (this.doneAnimating && this.overlayActive) {
        this.close();
      }
    }
  }

  private _handleVisibilityChange(isIntersecting: boolean): void {
    // If the image scrolls out of viewport while open, auto-close it
    if (!isIntersecting && this.overlayActive && this.doneAnimating) {
      this.close();
    }
  }

  private _makeAncestorsOverflowVisible(): void {
    this.ancestorsChanged = [];
    if (!this.placeholder) return;

    let ancestor = this.placeholder.parentNode as HTMLElement | null;
    while (ancestor !== null && ancestor !== document.body && ancestor.nodeType === 1) {
      const overflow = window.getComputedStyle(ancestor).overflow;
      if (overflow !== "visible") {
        ancestor.style.overflow = "visible";
        this.ancestorsChanged.push(ancestor);
      }
      ancestor = ancestor.parentNode as HTMLElement | null;
    }
  }

  public open(): void {
    this._updateVars();
    this.originalWidth = this.element.getBoundingClientRect().width;
    this.originalHeight = this.element.getBoundingClientRect().height;

    this.doneAnimating = false;
    this.element.classList.add("active");
    this.overlayActive = true;

    this.options.onOpenStart(this.element);

    if (this.placeholder) {
      this.placeholder.style.width = `${this.placeholder.getBoundingClientRect().width}px`;
      this.placeholder.style.height = `${this.placeholder.getBoundingClientRect().height}px`;
      this.placeholder.style.position = "relative";
      this.placeholder.style.top = "0";
      this.placeholder.style.left = "0";
    }

    this._makeAncestorsOverflowVisible();

    this.element.style.position = "absolute";
    this.element.style.zIndex = "1000";
    this.element.style.willChange = "left, top, width, height";

    this.attrWidth = this.element.getAttribute("width");
    this.attrHeight = this.element.getAttribute("height");
    if (this.attrWidth) {
      this.element.style.width = `${this.attrWidth}px`;
      this.element.removeAttribute("width");
    }
    if (this.attrHeight) {
      this.element.style.height = `${this.attrHeight}px`;
      this.element.removeAttribute("height");
    }

    // Create and insert Overlay
    this.overlay = document.createElement("div");
    this.overlay.id = "materialbox-overlay";
    this.overlay.style.opacity = "0";
    this.overlay.style.transition = `opacity ${this.options.inDuration}ms cubic-bezier(0.4, 0, 0.2, 1)`;
    this.overlay.addEventListener("click", () => {
      if (this.doneAnimating) this.close();
    });

    this.element.parentNode?.insertBefore(this.overlay, this.element);

    const overlayOffset = this.overlay.getBoundingClientRect();
    this.overlay.style.width = `${this.windowWidth}px`;
    this.overlay.style.height = `${this.windowHeight}px`;
    this.overlay.style.left = `${-1 * overlayOffset.left}px`;
    this.overlay.style.top = `${-1 * overlayOffset.top}px`;

    // Trigger transition
    requestAnimationFrame(() => {
      if (this.overlay) {
        this.overlay.style.opacity = "1";
      }
    });

    // Caption logic
    if (this.caption !== "") {
      if (this.photoCaption) this.photoCaption.remove();
      this.photoCaption = document.createElement("div");
      this.photoCaption.className = "materialbox-caption";
      this.photoCaption.textContent = this.caption;
      this.photoCaption.style.display = "inline";
      this.photoCaption.style.opacity = "0";
      this.photoCaption.style.transition = `opacity ${this.options.inDuration}ms cubic-bezier(0.4, 0, 0.2, 1)`;
      document.body.appendChild(this.photoCaption);

      requestAnimationFrame(() => {
        if (this.photoCaption) this.photoCaption.style.opacity = "1";
      });
    }

    // Calculations for sizing
    const widthPercent = this.originalWidth / this.windowWidth;
    const heightPercent = this.originalHeight / this.windowHeight;

    if (widthPercent > heightPercent) {
      const ratio = this.originalHeight / this.originalWidth;
      this.newWidth = this.windowWidth * 0.9;
      this.newHeight = this.windowWidth * 0.9 * ratio;
    } else {
      const ratio = this.originalWidth / this.originalHeight;
      this.newWidth = this.windowHeight * 0.9 * ratio;
      this.newHeight = this.windowHeight * 0.9;
    }

    this._animateImageIn();

    window.addEventListener("scroll", this._handleWindowScrollBound);
    window.addEventListener("resize", this._handleWindowResizeBound);
    window.addEventListener("keyup", this._handleWindowEscapeBound);
  }

  public close(): void {
    this._updateVars();
    this.doneAnimating = false;

    this.options.onCloseStart(this.element);

    window.removeEventListener("scroll", this._handleWindowScrollBound);
    window.removeEventListener("resize", this._handleWindowResizeBound);
    window.removeEventListener("keyup", this._handleWindowEscapeBound);

    if (this.overlay) {
      this.overlay.style.transition = `opacity ${this.options.outDuration}ms cubic-bezier(0.4, 0, 0.2, 1)`;
      this.overlay.style.opacity = "0";
    }

    if (this.photoCaption) {
      this.photoCaption.style.transition = `opacity ${this.options.outDuration}ms cubic-bezier(0.4, 0, 0.2, 1)`;
      this.photoCaption.style.opacity = "0";
    }

    this._animateImageOut();

    setTimeout(() => {
      this.overlayActive = false;
      if (this.overlay) {
        this.overlay.remove();
        this.overlay = null;
      }
      if (this.photoCaption) {
        this.photoCaption.remove();
        this.photoCaption = null;
      }
    }, this.options.outDuration);
  }

  private _animateImageIn(): void {
    if (!this.placeholder) return;

    this.element.style.transition = `
      width ${this.options.inDuration}ms cubic-bezier(0.4, 0, 0.2, 1),
      height ${this.options.inDuration}ms cubic-bezier(0.4, 0, 0.2, 1),
      left ${this.options.inDuration}ms cubic-bezier(0.4, 0, 0.2, 1),
      top ${this.options.inDuration}ms cubic-bezier(0.4, 0, 0.2, 1)
    `;

    const placeholderOffset = this.placeholder.getBoundingClientRect();
    const scrollY = window.pageYOffset || document.documentElement.scrollTop;
    const scrollX = window.pageXOffset || document.documentElement.scrollLeft;

    const targetLeft = scrollX + this.windowWidth / 2 - placeholderOffset.left - this.newWidth / 2;
    const targetTop = scrollY + this.windowHeight / 2 - placeholderOffset.top - this.newHeight / 2;

    requestAnimationFrame(() => {
      this.element.style.width = `${this.newWidth}px`;
      this.element.style.height = `${this.newHeight}px`;
      this.element.style.left = `${targetLeft}px`;
      this.element.style.top = `${targetTop}px`;

      setTimeout(() => {
        this.doneAnimating = true;
        this.options.onOpenEnd(this.element);
      }, this.options.inDuration);
    });
  }

  private _animateImageOut(): void {
    this.element.style.transition = `
      width ${this.options.outDuration}ms cubic-bezier(0.4, 0, 0.2, 1),
      height ${this.options.outDuration}ms cubic-bezier(0.4, 0, 0.2, 1),
      left ${this.options.outDuration}ms cubic-bezier(0.4, 0, 0.2, 1),
      top ${this.options.outDuration}ms cubic-bezier(0.4, 0, 0.2, 1)
    `;

    requestAnimationFrame(() => {
      this.element.style.width = `${this.originalWidth}px`;
      this.element.style.height = `${this.originalHeight}px`;
      this.element.style.left = "0px";
      this.element.style.top = "0px";

      setTimeout(() => {
        if (this.placeholder) {
          this.placeholder.style.width = "";
          this.placeholder.style.height = "";
          this.placeholder.style.position = "";
          this.placeholder.style.top = "";
          this.placeholder.style.left = "";
        }

        if (this.attrWidth) this.element.setAttribute("width", this.attrWidth);
        if (this.attrHeight) this.element.setAttribute("height", this.attrHeight);

        this.element.removeAttribute("style");
        if (this.originInlineStyles) {
          this.element.setAttribute("style", this.originInlineStyles);
        }

        this.element.classList.remove("active");
        this.doneAnimating = true;

        this.ancestorsChanged.forEach((ancestor) => {
          ancestor.style.overflow = "";
        });

        this.options.onCloseEnd(this.element);
      }, this.options.outDuration);
    });
  }

  private _updateVars(): void {
    this.windowWidth = window.innerWidth;
    this.windowHeight = window.innerHeight;
    this.caption = this.element.getAttribute("data-caption") || "";
  }
}
