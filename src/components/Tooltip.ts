import type { TooltipOptions, IComponent } from "../types";
import { observe, unobserve } from "../utilities/intersection-observer";

export class Tooltip implements IComponent {
  private element: HTMLElement;
  private options: Required<TooltipOptions>;
  private tooltipEl: HTMLDivElement | null = null;
  private isOpen: boolean = false;
  private isHovered: boolean = false;
  private isFocused: boolean = false;
  private xMovement: number = 0;
  private yMovement: number = 0;

  private _exitDelayTimeout: any = null;
  private _enterDelayTimeout: any = null;

  // Event handler bounds
  private _handleMouseEnterBound: () => void;
  private _handleMouseLeaveBound: () => void;
  private _handleFocusBound: () => void;
  private _handleBlurBound: () => void;
  private _handleVisibilityChangeBound: (isIntersecting: boolean) => void;

  constructor(element: HTMLElement, options?: TooltipOptions) {
    this.element = element;
    
    // Obtain defaults and merge attribute values
    this.options = {
      exitDelay: options?.exitDelay ?? 200,
      enterDelay: options?.enterDelay ?? 0,
      html: options?.html ?? element.getAttribute("data-tooltip") ?? "",
      margin: options?.margin ?? 5,
      inDuration: options?.inDuration ?? 250,
      outDuration: options?.outDuration ?? 200,
      position: (options?.position ?? element.getAttribute("data-position") ?? "bottom") as any,
      transitionMovement: options?.transitionMovement ?? 10,
    };

    (this.element as any).M_Tooltip = this;

    this._handleMouseEnterBound = this._handleMouseEnter.bind(this);
    this._handleMouseLeaveBound = this._handleMouseLeave.bind(this);
    this._handleFocusBound = this._handleFocus.bind(this);
    this._handleBlurBound = this._handleBlur.bind(this);
    this._handleVisibilityChangeBound = this._handleVisibilityChange.bind(this);

    this.init();
  }

  public static init(elements: HTMLElement | NodeListOf<HTMLElement>, options?: TooltipOptions): Tooltip | Tooltip[] {
    if (elements instanceof HTMLElement) {
      return new Tooltip(elements, options);
    }
    const instances: Tooltip[] = [];
    elements.forEach((el) => {
      instances.push(new Tooltip(el, options));
    });
    return instances;
  }

  public static getInstance(element: HTMLElement): Tooltip | undefined {
    return (element as any).M_Tooltip;
  }

  public init(): void {
    this._appendTooltipEl();
    this._setupEventHandlers();

    // Use shared IntersectionObserver utility to close tooltip if host leaves viewport
    observe(this.element, this._handleVisibilityChangeBound);
  }

  public destroy(): void {
    unobserve(this.element);
    
    if (this.tooltipEl) {
      this.tooltipEl.remove();
      this.tooltipEl = null;
    }
    this._removeEventHandlers();
    (this.element as any).M_Tooltip = undefined;
  }

  private _appendTooltipEl(): void {
    this.tooltipEl = document.createElement("div");
    this.tooltipEl.classList.add("material-tooltip");

    const contentEl = document.createElement("div");
    contentEl.classList.add("tooltip-content");
    contentEl.innerHTML = this.options.html;
    this.tooltipEl.appendChild(contentEl);
    document.body.appendChild(this.tooltipEl);
  }

  private _updateTooltipContent(): void {
    if (this.tooltipEl) {
      const contentEl = this.tooltipEl.querySelector(".tooltip-content");
      if (contentEl) {
        contentEl.innerHTML = this.options.html;
      }
    }
  }

  private _setupEventHandlers(): void {
    this.element.addEventListener("mouseenter", this._handleMouseEnterBound);
    this.element.addEventListener("mouseleave", this._handleMouseLeaveBound);
    this.element.addEventListener("focus", this._handleFocusBound, true);
    this.element.addEventListener("blur", this._handleBlurBound, true);
  }

  private _removeEventHandlers(): void {
    this.element.removeEventListener("mouseenter", this._handleMouseEnterBound);
    this.element.removeEventListener("mouseleave", this._handleMouseLeaveBound);
    this.element.removeEventListener("focus", this._handleFocusBound, true);
    this.element.removeEventListener("blur", this._handleBlurBound, true);
  }

  private _handleVisibilityChange(isIntersecting: boolean): void {
    if (!isIntersecting && this.isOpen) {
      this.close();
    }
  }

  public open(isManual: boolean = true): void {
    if (this.isOpen) return;

    this.isOpen = true;
    
    // Refresh text and properties from target attributes on open
    const htmlAttr = this.element.getAttribute("data-tooltip");
    const posAttr = this.element.getAttribute("data-position");
    if (htmlAttr) this.options.html = htmlAttr;
    if (posAttr) this.options.position = posAttr as any;

    this._updateTooltipContent();
    this._setEnterDelayTimeout(isManual);
  }

  public close(): void {
    if (!this.isOpen) return;

    this.isHovered = false;
    this.isFocused = false;
    this.isOpen = false;
    this._setExitDelayTimeout();
  }

  private _setExitDelayTimeout(): void {
    clearTimeout(this._exitDelayTimeout);
    this._exitDelayTimeout = setTimeout(() => {
      if (this.isHovered || this.isFocused) return;
      this._animateOut();
    }, this.options.exitDelay);
  }

  private _setEnterDelayTimeout(isManual: boolean): void {
    clearTimeout(this._enterDelayTimeout);
    this._enterDelayTimeout = setTimeout(() => {
      if (!this.isHovered && !this.isFocused && !isManual) return;
      this._animateIn();
    }, this.options.enterDelay);
  }

  private _positionTooltip(): void {
    if (!this.tooltipEl) return;

    const origin = this.element;
    const tooltip = this.tooltipEl;
    const originHeight = origin.offsetHeight;
    const originWidth = origin.offsetWidth;
    const tooltipHeight = tooltip.offsetHeight;
    const tooltipWidth = tooltip.offsetWidth;
    const margin = this.options.margin;

    this.xMovement = 0;
    this.yMovement = 0;

    const scrollY = window.pageYOffset || document.documentElement.scrollTop;
    const scrollX = window.pageXOffset || document.documentElement.scrollLeft;

    let targetTop = origin.getBoundingClientRect().top + scrollY;
    let targetLeft = origin.getBoundingClientRect().left + scrollX;

    if (this.options.position === "top") {
      targetTop += -tooltipHeight - margin;
      targetLeft += originWidth / 2 - tooltipWidth / 2;
      this.yMovement = -this.options.transitionMovement;
    } else if (this.options.position === "right") {
      targetTop += originHeight / 2 - tooltipHeight / 2;
      targetLeft += originWidth + margin;
      this.xMovement = this.options.transitionMovement;
    } else if (this.options.position === "left") {
      targetTop += originHeight / 2 - tooltipHeight / 2;
      targetLeft += -tooltipWidth - margin;
      this.xMovement = -this.options.transitionMovement;
    } else {
      targetTop += originHeight + margin;
      targetLeft += originWidth / 2 - tooltipWidth / 2;
      this.yMovement = this.options.transitionMovement;
    }

    const newCoordinates = this._repositionWithinScreen(
      targetLeft,
      targetTop,
      tooltipWidth,
      tooltipHeight
    );

    tooltip.style.top = `${newCoordinates.y}px`;
    tooltip.style.left = `${newCoordinates.x}px`;
  }

  private _repositionWithinScreen(x: number, y: number, width: number, height: number): { x: number; y: number } {
    const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    let newX = x - scrollLeft;
    let newY = y - scrollTop;

    const offset = this.options.margin + this.options.transitionMovement;

    // Viewport collisions
    if (newX < offset) {
      newX = offset;
    } else if (newX + width > window.innerWidth - offset) {
      newX = window.innerWidth - width - offset;
    }

    if (newY < offset) {
      newY = offset;
    } else if (newY + height > window.innerHeight - offset) {
      newY = window.innerHeight - height - offset;
    }

    return {
      x: newX + scrollLeft,
      y: newY + scrollTop,
    };
  }

  private _animateIn(): void {
    if (!this.tooltipEl) return;
    this._positionTooltip();

    this.tooltipEl.style.visibility = "visible";
    this.tooltipEl.style.transition = `opacity ${this.options.inDuration}ms cubic-bezier(0.4, 0, 0.2, 1), transform ${this.options.inDuration}ms cubic-bezier(0.4, 0, 0.2, 1)`;
    
    // Trigger layout reflow
    this.tooltipEl.offsetHeight;

    this.tooltipEl.style.opacity = "1";
    this.tooltipEl.style.transform = `translate(${this.xMovement}px, ${this.yMovement}px)`;
  }

  private _animateOut(): void {
    if (!this.tooltipEl) return;

    this.tooltipEl.style.transition = `opacity ${this.options.outDuration}ms cubic-bezier(0.4, 0, 0.2, 1), transform ${this.options.outDuration}ms cubic-bezier(0.4, 0, 0.2, 1)`;
    this.tooltipEl.style.opacity = "0";
    this.tooltipEl.style.transform = "translate(0px, 0px)";

    setTimeout(() => {
      if (this.tooltipEl && !this.isOpen) {
        this.tooltipEl.style.visibility = "hidden";
      }
    }, this.options.outDuration);
  }

  private _handleMouseEnter(): void {
    this.isHovered = true;
    this.isFocused = false;
    this.open(false);
  }

  private _handleMouseLeave(): void {
    this.isHovered = false;
    this.isFocused = false;
    this.close();
  }

  private _handleFocus(): void {
    this.isFocused = true;
    this.open(false);
  }

  private _handleBlur(): void {
    this.isFocused = false;
    this.close();
  }
}
