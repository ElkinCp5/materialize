import type { FloatingActionButtonOptions, IComponent } from "../types";

export class FloatingActionButton implements IComponent {
  private element: HTMLElement;
  private options: Required<FloatingActionButtonOptions>;
  private isOpen: boolean = false;
  private anchor: HTMLElement | null = null;
  private menu: HTMLElement | null = null;
  private floatingBtns: HTMLElement[] = [];
  private floatingBtnsReverse: HTMLElement[] = [];
  private offsetY: number = 0;
  private offsetX: number = 0;

  // Toolbar transition properties
  private btnBottom: number = 0;
  private btnLeft: number = 0;
  private btnWidth: number = 0;

  // Bound handlers
  private _handleFABClickBound: (e: Event) => void;
  private _handleOpenBound: () => void;
  private _handleCloseBound: () => void;
  private _handleDocumentClickBound: (e: MouseEvent) => void;

  constructor(element: HTMLElement, options?: FloatingActionButtonOptions) {
    this.element = element;
    this.options = {
      direction: options?.direction ?? "top",
      hoverEnabled: options?.hoverEnabled ?? true,
      toolbarEnabled: options?.toolbarEnabled ?? false,
    };

    // Store instance on the DOM element for legacy compatibility
    (this.element as any).M_FloatingActionButton = this;

    this._handleFABClickBound = this._handleFABClick.bind(this);
    this._handleOpenBound = this.open.bind(this);
    this._handleCloseBound = this.close.bind(this);
    this._handleDocumentClickBound = this._handleDocumentClick.bind(this);

    this.init();
  }

  public static init(elements: HTMLElement | NodeListOf<HTMLElement>, options?: FloatingActionButtonOptions): FloatingActionButton | FloatingActionButton[] {
    if (elements instanceof HTMLElement) {
      return new FloatingActionButton(elements, options);
    }
    const instances: FloatingActionButton[] = [];
    elements.forEach((el) => {
      instances.push(new FloatingActionButton(el, options));
    });
    return instances;
  }

  public static getInstance(element: HTMLElement): FloatingActionButton | undefined {
    return (element as any).M_FloatingActionButton;
  }

  public init(): void {
    this.anchor = this.element.querySelector("a");
    this.menu = this.element.querySelector("ul");
    
    if (this.menu) {
      this.floatingBtns = Array.from(this.menu.querySelectorAll(".btn-floating"));
      this.floatingBtnsReverse = [...this.floatingBtns].reverse();
    }

    this.element.classList.add(`direction-${this.options.direction}`);

    if (this.options.direction === "top") {
      this.offsetY = 40;
    } else if (this.options.direction === "right") {
      this.offsetX = -40;
    } else if (this.options.direction === "bottom") {
      this.offsetY = -40;
    } else {
      this.offsetX = 40;
    }

    this._setupEventHandlers();
  }

  public destroy(): void {
    this._removeEventHandlers();
    (this.element as any).M_FloatingActionButton = undefined;
  }

  private _setupEventHandlers(): void {
    if (this.options.hoverEnabled && !this.options.toolbarEnabled) {
      this.element.addEventListener("mouseenter", this._handleOpenBound);
      this.element.addEventListener("mouseleave", this._handleCloseBound);
    } else {
      this.element.addEventListener("click", this._handleFABClickBound);
    }
  }

  private _removeEventHandlers(): void {
    if (this.options.hoverEnabled && !this.options.toolbarEnabled) {
      this.element.removeEventListener("mouseenter", this._handleOpenBound);
      this.element.removeEventListener("mouseleave", this._handleCloseBound);
    } else {
      this.element.removeEventListener("click", this._handleFABClickBound);
    }
  }

  private _handleFABClick(e: Event): void {
    const target = e.target as HTMLElement;
    if (this.options.toolbarEnabled && target.closest("ul")) {
      return; // Do not close if clicking inside menu items in toolbar mode
    }

    if (this.isOpen) {
      this.close();
    } else {
      this.open();
    }
  }

  private _handleDocumentClick(e: MouseEvent): void {
    const target = e.target as HTMLElement;
    if (this.menu && !this.menu.contains(target) && !this.element.contains(target)) {
      this.close();
    }
  }

  public open(): void {
    if (this.isOpen) return;

    if (this.options.toolbarEnabled) {
      this._animateInToolbar();
    } else {
      this._animateInFAB();
    }
    this.isOpen = true;
  }

  public close(): void {
    if (!this.isOpen) return;

    if (this.options.toolbarEnabled) {
      window.removeEventListener("scroll", this._handleCloseBound, true);
      document.body.removeEventListener("click", this._handleDocumentClickBound, true);
      this._animateOutToolbar();
    } else {
      this._animateOutFAB();
    }
    this.isOpen = false;
  }

  private _animateInFAB(): void {
    this.element.classList.add("active");

    let delay = 0;
    this.floatingBtnsReverse.forEach((btn) => {
      btn.style.transition = `opacity 275ms ease-in-out, transform 275ms cubic-bezier(0.4, 0, 0.2, 1)`;
      btn.style.transitionDelay = `${delay}ms`;
      btn.style.opacity = "1";
      btn.style.transform = "scale(1) translate(0, 0)";
      delay += 40;
    });
  }

  private _animateOutFAB(): void {
    this.floatingBtnsReverse.forEach((btn) => {
      btn.style.transitionDelay = "0ms";
      btn.style.opacity = "0";
      btn.style.transform = `scale(0.4) translate(${this.offsetX}px, ${this.offsetY}px)`;
    });

    // Remove active class from container
    setTimeout(() => {
      if (!this.isOpen) {
        this.element.classList.remove("active");
      }
    }, 175);
  }

  private _animateInToolbar(): void {
    if (!this.anchor) return;
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;
    const btnRect = this.element.getBoundingClientRect();
    
    const backdrop = document.createElement("div");
    backdrop.className = "fab-backdrop";
    const fabColor = window.getComputedStyle(this.anchor).backgroundColor;
    this.anchor.appendChild(backdrop);

    this.offsetX = btnRect.left - windowWidth / 2 + btnRect.width / 2;
    this.offsetY = windowHeight - btnRect.bottom;
    
    // Width of backdrop initially is small (e.g. clientWidth is around 40px)
    const scaleFactor = windowWidth / (backdrop.clientWidth || 40);
    this.btnBottom = btnRect.bottom;
    this.btnLeft = btnRect.left;
    this.btnWidth = btnRect.width;

    this.element.classList.add("active");
    this.element.style.textAlign = "center";
    this.element.style.width = "100%";
    this.element.style.bottom = "0";
    this.element.style.left = "0";
    this.element.style.transform = `translateX(${this.offsetX}px)`;
    this.element.style.transition = "none";

    this.anchor.style.transform = `translateY(${-this.offsetY}px)`;
    this.anchor.style.transition = "none";
    backdrop.style.backgroundColor = fabColor;

    requestAnimationFrame(() => {
      this.element.style.transform = "";
      this.element.style.transition = "transform .2s cubic-bezier(0.550, 0.085, 0.680, 0.530), background-color 0s linear .2s";

      this.anchor!.style.overflow = "visible";
      this.anchor!.style.transform = "";
      this.anchor!.style.transition = "transform .2s";

      setTimeout(() => {
        this.element.style.overflow = "hidden";
        this.element.style.backgroundColor = fabColor;
        backdrop.style.transform = `scale(${scaleFactor})`;
        backdrop.style.transition = "transform .2s cubic-bezier(0.550, 0.055, 0.675, 0.190)";

        if (this.menu) {
          const menuLinks = this.menu.querySelectorAll("li a");
          menuLinks.forEach((link) => {
            (link as HTMLElement).style.opacity = "1";
          });
        }

        window.addEventListener("scroll", this._handleCloseBound, true);
        document.body.addEventListener("click", this._handleDocumentClickBound, true);
      }, 100);
    });
  }

  private _animateOutToolbar(): void {
    if (!this.anchor) return;
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;
    const backdrop = this.element.querySelector(".fab-backdrop") as HTMLElement;
    const fabColor = window.getComputedStyle(this.anchor).backgroundColor;

    this.offsetX = this.btnLeft - windowWidth / 2 + this.btnWidth / 2;
    this.offsetY = windowHeight - this.btnBottom;

    this.element.classList.remove("active");
    this.element.style.backgroundColor = "transparent";
    this.element.style.transition = "none";
    this.anchor.style.transition = "none";

    if (backdrop) {
      backdrop.style.transform = "scale(0)";
      backdrop.style.backgroundColor = fabColor;
    }

    if (this.menu) {
      const menuLinks = this.menu.querySelectorAll("li a");
      menuLinks.forEach((link) => {
        (link as HTMLElement).style.opacity = "";
      });
    }

    setTimeout(() => {
      if (backdrop) {
        backdrop.remove();
      }

      this.element.style.textAlign = "";
      this.element.style.width = "";
      this.element.style.bottom = "";
      this.element.style.left = "";
      this.element.style.overflow = "";
      this.element.style.backgroundColor = "";
      this.element.style.transform = `translate3d(${-this.offsetX}px, 0, 0)`;

      this.anchor!.style.overflow = "";
      this.anchor!.style.transform = `translate3d(0, ${this.offsetY}px, 0)`;

      setTimeout(() => {
        this.element.style.transform = "translate3d(0, 0, 0)";
        this.element.style.transition = "transform .2s";
        this.anchor!.style.transform = "translate3d(0, 0, 0)";
        this.anchor!.style.transition = "transform .2s cubic-bezier(0.550, 0.055, 0.675, 0.190)";
      }, 20);
    }, 200);
  }
}
