import type { CarouselOptions, IComponent } from "../types";

export class Carousel implements IComponent {
  private element: HTMLElement;
  private options: Required<CarouselOptions>;
  private hasMultipleSlides: boolean = false;
  private showIndicators: boolean = false;
  private noWrap: boolean = false;
  private pressed: boolean = false;
  private dragged: boolean = false;
  private verticalDragged: boolean = false;
  private offset: number = 0;
  private target: number = 0;
  private images: HTMLElement[] = [];
  private itemWidth: number = 0;
  private itemHeight: number = 0;
  private dim: number = 0;
  private count: number = 0;
  private activeIndex: number = -1;
  private center: number = 0;

  // Drag coordinates and timing
  private reference: number = 0;
  private referenceY: number = 0;
  private velocity: number = 0;
  private amplitude: number = 0;
  private timestamp: number = 0;
  private frame: number = 0;
  private ticker: any = null;
  private scrollingTimeout: any = null;
  private oneTimeCallback: ((current: HTMLElement, dragged: boolean) => void) | null = null;

  // DOM elements
  private indicatorsEl: HTMLUListElement | null = null;

  // Transform browser string prefix (WebGL/CSS 3D Acceleration check)
  private xform: string = "transform";

  // Event handler bounds
  private _handleCarouselTapBound: (e: MouseEvent | TouchEvent) => void;
  private _handleCarouselDragBound: (e: MouseEvent | TouchEvent) => void;
  private _handleCarouselReleaseBound: (e: MouseEvent | TouchEvent) => void;
  private _handleCarouselClickBound: (e: MouseEvent) => void;
  private _handleIndicatorClickBound: (e: MouseEvent) => void;
  private _handleResizeBound: () => void;
  private _autoScrollBound: () => void;
  private _trackBound: () => void;

  constructor(element: HTMLElement, options?: CarouselOptions) {
    this.element = element;
    this.options = {
      duration: options?.duration ?? 200,
      dist: options?.dist ?? -100,
      shift: options?.shift ?? 0,
      padding: options?.padding ?? 0,
      numVisible: options?.numVisible ?? 5,
      fullWidth: options?.fullWidth ?? false,
      indicators: options?.indicators ?? false,
      noWrap: options?.noWrap ?? false,
      onCycleTo: options?.onCycleTo ?? (() => {}),
    };

    (this.element as any).M_Carousel = this;

    this._handleCarouselTapBound = this._handleCarouselTap.bind(this);
    this._handleCarouselDragBound = this._handleCarouselDrag.bind(this);
    this._handleCarouselReleaseBound = this._handleCarouselRelease.bind(this);
    this._handleCarouselClickBound = this._handleCarouselClick.bind(this);
    this._handleIndicatorClickBound = this._handleIndicatorClick.bind(this);
    this._handleResizeBound = this._handleResize.bind(this);
    this._autoScrollBound = this._autoScroll.bind(this);
    this._trackBound = this._track.bind(this);

    this.init();
  }

  public static init(elements: HTMLElement | NodeListOf<HTMLElement>, options?: CarouselOptions): Carousel | Carousel[] {
    if (elements instanceof HTMLElement) {
      return new Carousel(elements, options);
    }
    const instances: Carousel[] = [];
    elements.forEach((el) => {
      instances.push(new Carousel(el, options));
    });
    return instances;
  }

  public static getInstance(element: HTMLElement): Carousel | undefined {
    return (element as any).M_Carousel;
  }

  public init(): void {
    const slides = Array.from(this.element.querySelectorAll(".carousel-item")) as HTMLElement[];
    this.hasMultipleSlides = slides.length > 1;
    this.showIndicators = this.options.indicators && this.hasMultipleSlides;
    this.noWrap = this.options.noWrap || !this.hasMultipleSlides;

    if (slides.length > 0) {
      const firstSlide = slides[0];
      // Force element display style properties layout values fallback calculation
      this.itemWidth = firstSlide.offsetWidth || 150;
      this.itemHeight = firstSlide.offsetHeight || 150;
    }

    this.dim = this.itemWidth * 2 + this.options.padding || 1;

    if (this.options.fullWidth) {
      this.options.dist = 0;
      this._setCarouselHeight();
      if (this.showIndicators) {
        this.element.querySelector(".carousel-fixed-item")?.classList.add("with-indicators");
      }
    }

    // Indicators building structure
    if (this.showIndicators) {
      this.indicatorsEl = document.createElement("ul");
      this.indicatorsEl.className = "indicators";
    }

    slides.forEach((el, index) => {
      this.images.push(el);
      if (this.showIndicators && this.indicatorsEl) {
        const item = document.createElement("li");
        item.className = "indicator-item";
        if (index === 0) item.classList.add("active");
        this.indicatorsEl.appendChild(item);
      }
    });

    if (this.showIndicators && this.indicatorsEl) {
      this.element.appendChild(this.indicatorsEl);
    }

    this.count = this.images.length;
    this.options.numVisible = Math.min(this.count, this.options.numVisible);

    // Cross-browser prefix transform detection
    const prefixList = ["transform", "webkitTransform", "MozTransform", "OTransform", "msTransform"];
    for (const key of prefixList) {
      if (typeof document.body.style[key as any] !== "undefined") {
        this.xform = key;
        break;
      }
    }

    this._setupEventHandlers();
    this._scroll(this.offset);
  }

  public destroy(): void {
    this._removeEventHandlers();
    this.indicatorsEl?.remove();
    (this.element as any).M_Carousel = undefined;
  }

  private _setupEventHandlers(): void {
    if (typeof window.ontouchstart !== "undefined") {
      this.element.addEventListener("touchstart", this._handleCarouselTapBound, { passive: true });
      this.element.addEventListener("touchmove", this._handleCarouselDragBound, { passive: false });
      this.element.addEventListener("touchend", this._handleCarouselReleaseBound, { passive: true });
    }

    this.element.addEventListener("mousedown", this._handleCarouselTapBound);
    this.element.addEventListener("mousemove", this._handleCarouselDragBound);
    this.element.addEventListener("mouseup", this._handleCarouselReleaseBound);
    this.element.addEventListener("mouseleave", this._handleCarouselReleaseBound);
    this.element.addEventListener("click", this._handleCarouselClickBound);

    if (this.showIndicators && this.indicatorsEl) {
      const indicatorItems = Array.from(this.indicatorsEl.querySelectorAll(".indicator-item"));
      indicatorItems.forEach((el) => {
        el.addEventListener("click", this._handleIndicatorClickBound as any);
      });
    }

    window.addEventListener("resize", this._handleResizeBound);
  }

  private _removeEventHandlers(): void {
    if (typeof window.ontouchstart !== "undefined") {
      this.element.removeEventListener("touchstart", this._handleCarouselTapBound);
      this.element.removeEventListener("touchmove", this._handleCarouselDragBound);
      this.element.removeEventListener("touchend", this._handleCarouselReleaseBound);
    }
    this.element.removeEventListener("mousedown", this._handleCarouselTapBound);
    this.element.removeEventListener("mousemove", this._handleCarouselDragBound);
    this.element.removeEventListener("mouseup", this._handleCarouselReleaseBound);
    this.element.removeEventListener("mouseleave", this._handleCarouselReleaseBound);
    this.element.removeEventListener("click", this._handleCarouselClickBound);

    if (this.showIndicators && this.indicatorsEl) {
      const indicatorItems = Array.from(this.indicatorsEl.querySelectorAll(".indicator-item"));
      indicatorItems.forEach((el) => {
        el.removeEventListener("click", this._handleIndicatorClickBound as any);
      });
    }

    window.removeEventListener("resize", this._handleResizeBound);
  }

  private _handleCarouselTap(e: MouseEvent | TouchEvent): void {
    if (e.type === "mousedown" && (e.target as HTMLElement).tagName === "IMG") {
      e.preventDefault();
    }
    this.pressed = true;
    this.dragged = false;
    this.verticalDragged = false;
    this.reference = this._xpos(e);
    this.referenceY = this._ypos(e);

    this.velocity = 0;
    this.amplitude = 0;
    this.frame = this.offset;
    this.timestamp = Date.now();
    
    clearInterval(this.ticker);
    this.ticker = setInterval(this._trackBound, 100);
  }

  private _handleCarouselDrag(e: MouseEvent | TouchEvent): void {
    if (this.pressed) {
      const x = this._xpos(e);
      const y = this._ypos(e);
      const delta = this.reference - x;
      const deltaY = Math.abs(this.referenceY - y);

      if (deltaY < 30 && !this.verticalDragged) {
        if (delta > 2 || delta < -2) {
          this.dragged = true;
          this.reference = x;
          this._scroll(this.offset + delta);
        }
      } else if (this.dragged) {
        e.preventDefault();
        e.stopPropagation();
      } else {
        this.verticalDragged = true;
      }
    }
  }

  private _handleCarouselRelease(e: MouseEvent | TouchEvent): void {
    if (this.pressed) {
      this.pressed = false;
    } else {
      return;
    }

    clearInterval(this.ticker);
    this.target = this.offset;
    if (this.velocity > 10 || this.velocity < -10) {
      this.amplitude = 0.9 * this.velocity;
      this.target = this.offset + this.amplitude;
    }
    this.target = Math.round(this.target / this.dim) * this.dim;

    if (this.noWrap) {
      if (this.target >= this.dim * (this.count - 1)) {
        this.target = this.dim * (this.count - 1);
      } else if (this.target < 0) {
        this.target = 0;
      }
    }
    this.amplitude = this.target - this.offset;
    this.timestamp = Date.now();
    requestAnimationFrame(this._autoScrollBound);

    if (this.dragged) {
      e.preventDefault();
      e.stopPropagation();
    }
  }

  private _handleCarouselClick(e: MouseEvent): void {
    if (this.dragged) {
      e.preventDefault();
      e.stopPropagation();
    } else if (!this.options.fullWidth) {
      const targetItem = (e.target as HTMLElement).closest(".carousel-item") as HTMLElement | null;
      if (targetItem) {
        const clickedIndex = this.images.indexOf(targetItem);
        const diff = this._wrap(this.center) - clickedIndex;

        if (diff !== 0) {
          e.preventDefault();
          e.stopPropagation();
        }
        this._cycleTo(clickedIndex);
      }
    }
  }

  private _handleIndicatorClick(e: MouseEvent): void {
    e.stopPropagation();
    const item = (e.target as HTMLElement).closest(".indicator-item");
    if (item && this.indicatorsEl) {
      const listItems = Array.from(this.indicatorsEl.querySelectorAll(".indicator-item"));
      const index = listItems.indexOf(item);
      this._cycleTo(index);
    }
  }

  private _handleResize(): void {
    if (this.options.fullWidth) {
      const firstSlide = this.element.querySelector(".carousel-item.active") || this.element.querySelector(".carousel-item");
      this.itemWidth = firstSlide ? (firstSlide as HTMLElement).offsetWidth : this.element.offsetWidth;
      this.dim = this.itemWidth * 2 + this.options.padding;
      this.offset = this.center * 2 * this.itemWidth;
      this.target = this.offset;
      this._setCarouselHeight(true);
    } else {
      this._scroll();
    }
  }

  private _setCarouselHeight(imageOnly: boolean = false): void {
    const activeSlide = this.element.querySelector(".carousel-item.active") || this.element.querySelector(".carousel-item");
    if (!activeSlide) return;

    const img = activeSlide.querySelector("img") as HTMLImageElement | null;
    if (img) {
      if (img.complete) {
        const h = img.offsetHeight || img.naturalHeight;
        this.element.style.height = `${h}px`;
      } else {
        img.addEventListener("load", () => {
          this.element.style.height = `${img.offsetHeight}px`;
        }, { once: true });
      }
    } else if (!imageOnly) {
      this.element.style.height = `${(activeSlide as HTMLElement).offsetHeight}px`;
    }
  }

  private _xpos(e: MouseEvent | TouchEvent): number {
    if ("targetTouches" in e && e.targetTouches && e.targetTouches.length >= 1) {
      return e.targetTouches[0].clientX;
    }
    return (e as MouseEvent).clientX;
  }

  private _ypos(e: MouseEvent | TouchEvent): number {
    if ("targetTouches" in e && e.targetTouches && e.targetTouches.length >= 1) {
      return e.targetTouches[0].clientY;
    }
    return (e as MouseEvent).clientY;
  }

  private _wrap(x: number): number {
    return x >= this.count ? x % this.count : x < 0 ? this._wrap(this.count + (x % this.count)) : x;
  }

  private _track(): void {
    const now = Date.now();
    const elapsed = now - this.timestamp;
    this.timestamp = now;
    const delta = this.offset - this.frame;
    this.frame = this.offset;

    const v = (1000 * delta) / (1 + elapsed);
    this.velocity = 0.8 * v + 0.2 * this.velocity;
  }

  private _autoScroll(): void {
    if (this.amplitude) {
      const elapsed = Date.now() - this.timestamp;
      const delta = this.amplitude * Math.exp(-elapsed / this.options.duration);
      if (delta > 2 || delta < -2) {
        this._scroll(this.target - delta);
        requestAnimationFrame(this._autoScrollBound);
      } else {
        this._scroll(this.target);
      }
    }
  }

  private _scroll(x?: number): void {
    if (!this.element.classList.contains("scrolling")) {
      this.element.classList.add("scrolling");
    }
    clearTimeout(this.scrollingTimeout);
    this.scrollingTimeout = setTimeout(() => {
      this.element.classList.remove("scrolling");
    }, this.options.duration);

    const lastCenter = this.center;
    const numVisibleOffset = 1 / this.options.numVisible;

    this.offset = typeof x === "number" ? x : this.offset;
    this.center = Math.floor((this.offset + this.dim / 2) / this.dim);
    const delta = this.offset - this.center * this.dim;
    const dir = delta < 0 ? 1 : -1;
    const tween = (-dir * delta * 2) / this.dim;
    const half = this.count >> 1;

    let alignment = "";
    let centerTweenedOpacity = 1;

    if (this.options.fullWidth) {
      alignment = "translateX(0)";
      centerTweenedOpacity = 1;
    } else {
      alignment = `translateX(${(this.element.clientWidth - this.itemWidth) / 2}px) translateY(${(this.element.clientHeight - this.itemHeight) / 2}px)`;
      centerTweenedOpacity = 1 - numVisibleOffset * tween;
    }

    // Sincronizar indicadores activos
    if (this.showIndicators && this.indicatorsEl) {
      const diff = this._wrap(this.center);
      const indicatorItems = Array.from(this.indicatorsEl.querySelectorAll(".indicator-item"));
      indicatorItems.forEach((item, idx) => {
        item.classList.toggle("active", idx === diff);
      });
    }

    // Render center slide
    if (!this.noWrap || (this.center >= 0 && this.center < this.count)) {
      const el = this.images[this._wrap(this.center)];
      if (!el.classList.contains("active")) {
        this.images.forEach((img) => img.classList.remove("active"));
        el.classList.add("active");
      }
      const transformString = `${alignment} translateX(${-delta / 2}px) translateZ(${this.options.dist * tween}px)`;
      this._updateItemStyle(el, centerTweenedOpacity, 0, transformString);
    }

    // Render left & right slides perspective mapping
    for (let i = 1; i <= half; ++i) {
      let zTranslation = 0;
      let tweenedOpacity = 0;

      // Right items
      if (this.options.fullWidth) {
        zTranslation = this.options.dist;
        tweenedOpacity = i === half && delta < 0 ? 1 - tween : 1;
      } else {
        zTranslation = this.options.dist * (i * 2 + tween * dir);
        tweenedOpacity = 1 - numVisibleOffset * (i * 2 + tween * dir);
      }
      if (!this.noWrap || this.center + i < this.count) {
        const el = this.images[this._wrap(this.center + i)];
        const transformString = `${alignment} translateX(${this.options.shift + (this.dim * i - delta) / 2}px) translateZ(${zTranslation}px)`;
        this._updateItemStyle(el, tweenedOpacity, -i, transformString);
      }

      // Left items
      if (this.options.fullWidth) {
        zTranslation = this.options.dist;
        tweenedOpacity = i === half && delta > 0 ? 1 - tween : 1;
      } else {
        zTranslation = this.options.dist * (i * 2 - tween * dir);
        tweenedOpacity = 1 - numVisibleOffset * (i * 2 - tween * dir);
      }
      if (!this.noWrap || this.center - i >= 0) {
        const el = this.images[this._wrap(this.center - i)];
        const transformString = `${alignment} translateX(${-this.options.shift + (-this.dim * i - delta) / 2}px) translateZ(${zTranslation}px)`;
        this._updateItemStyle(el, tweenedOpacity, -i, transformString);
      }
    }

    const currentItem = this.images[this._wrap(this.center)];
    if (lastCenter !== this.center) {
      this.options.onCycleTo(currentItem, this.dragged);
    }

    if (this.oneTimeCallback) {
      this.oneTimeCallback(currentItem, this.dragged);
      this.oneTimeCallback = null;
    }
  }

  private _updateItemStyle(el: HTMLElement, opacity: number, zIndex: number, transform: string): void {
    (el.style as any)[this.xform] = transform;
    el.style.zIndex = zIndex.toString();
    el.style.opacity = opacity.toString();
    el.style.visibility = "visible";
  }

  private _cycleTo(n: number, callback?: (current: HTMLElement, dragged: boolean) => void): void {
    let diff = (this.center % this.count) - n;

    if (!this.noWrap) {
      if (diff < 0) {
        if (Math.abs(diff + this.count) < Math.abs(diff)) diff += this.count;
      } else if (diff > 0) {
        if (Math.abs(diff - this.count) < diff) diff -= this.count;
      }
    }

    this.target = this.dim * Math.round(this.offset / this.dim);
    if (diff < 0) {
      this.target += this.dim * Math.abs(diff);
    } else if (diff > 0) {
      this.target -= this.dim * diff;
    }

    if (callback) {
      this.oneTimeCallback = callback;
    }

    if (this.offset !== this.target) {
      this.amplitude = this.target - this.offset;
      this.timestamp = Date.now();
      requestAnimationFrame(this._autoScrollBound);
    }
  }

  public next(n: number = 1): void {
    let index = this.center + n;
    if (index >= this.count || index < 0) {
      if (this.noWrap) return;
      index = this._wrap(index);
    }
    this._cycleTo(index);
  }

  public prev(n: number = 1): void {
    let index = this.center - n;
    if (index >= this.count || index < 0) {
      if (this.noWrap) return;
      index = this._wrap(index);
    }
    this._cycleTo(index);
  }

  public set(n: number = 0, callback?: (current: HTMLElement, dragged: boolean) => void): void {
    let index = n;
    if (index > this.count || index < 0) {
      if (this.noWrap) return;
      index = this._wrap(index);
    }
    this._cycleTo(index, callback);
  }
}
