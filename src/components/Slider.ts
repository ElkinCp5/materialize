import type { SliderOptions, IComponent } from "../types";

export class Slider implements IComponent {
  private element: HTMLElement;
  private options: Required<SliderOptions>;
  private activeIndex: number = -1;
  private interval: any = null;

  // DOM Elements
  private slidesList: HTMLUListElement | null = null;
  private slides: HTMLElement[] = [];
  private activeSlide: HTMLElement | null = null;
  private indicators: HTMLElement[] = [];
  private indicatorsContainer: HTMLUListElement | null = null;

  // Bound event handlers
  private _handleIntervalBound: () => void;
  private _handleIndicatorClickBound: (e: MouseEvent) => void;

  constructor(element: HTMLElement, options?: SliderOptions) {
    this.element = element;
    this.options = {
      indicators: options?.indicators ?? true,
      height: options?.height ?? 400,
      duration: options?.duration ?? 500,
      interval: options?.interval ?? 6000,
    };

    (this.element as any).M_Slider = this;

    this._handleIntervalBound = this._handleInterval.bind(this);
    this._handleIndicatorClickBound = this._handleIndicatorClick.bind(this);

    this.init();
  }

  public static init(elements: HTMLElement | NodeListOf<HTMLElement>, options?: SliderOptions): Slider | Slider[] {
    if (elements instanceof HTMLElement) {
      return new Slider(elements, options);
    }
    const instances: Slider[] = [];
    elements.forEach((el) => {
      instances.push(new Slider(el, options));
    });
    return instances;
  }

  public static getInstance(element: HTMLElement): Slider | undefined {
    return (element as any).M_Slider;
  }

  public init(): void {
    this.slidesList = this.element.querySelector(".slides");
    if (this.slidesList) {
      this.slides = Array.from(this.slidesList.children) as HTMLElement[];
    }

    this.activeIndex = this.slides.findIndex((el) => el.classList.contains("active"));
    if (this.activeIndex !== -1) {
      this.activeSlide = this.slides[this.activeIndex];
    }

    this._setSliderHeight();

    // Transform placeholder transparent base64 image inline styling logic
    this.slides.forEach((slide) => {
      const img = slide.querySelector("img") as HTMLImageElement | null;
      if (img) {
        const placeholder = "data:image/gif;base64,R0lGODlhAQABAIABAP///wAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==";
        const src = img.getAttribute("src");
        if (src && src !== placeholder) {
          img.style.backgroundImage = `url("${src}")`;
          img.setAttribute("src", placeholder);
        }
      }
    });

    this._setupIndicators();

    // Trigger initial state active layout rendering
    if (this.activeSlide) {
      this.activeSlide.style.display = "block";
      const caption = this.activeSlide.querySelector(".caption") as HTMLElement | null;
      if (caption) {
        caption.style.opacity = "1";
        caption.style.transform = "translate(0px, 0px)";
      }
    } else if (this.slides.length > 0) {
      this.activeIndex = 0;
      this.activeSlide = this.slides[0];
      this.activeSlide.classList.add("active");
      this.activeSlide.style.display = "block";
      this.activeSlide.style.transition = `opacity ${this.options.duration}ms ease-in-out`;
      this.activeSlide.style.opacity = "1";

      const caption = this.activeSlide.querySelector(".caption") as HTMLElement | null;
      if (caption) {
        caption.style.opacity = "1";
        caption.style.transform = "translate(0px, 0px)";
      }

      if (this.options.indicators && this.indicators[0]) {
        this.indicators[0].classList.add("active");
      }
    }

    this._setupEventHandlers();
    this.start();
  }

  public destroy(): void {
    this.pause();
    this._removeIndicators();
    this._removeEventHandlers();
    (this.element as any).M_Slider = undefined;
  }

  private _setupEventHandlers(): void {
    if (this.options.indicators) {
      this.indicators.forEach((el) => {
        el.addEventListener("click", this._handleIndicatorClickBound);
      });
    }
  }

  private _removeEventHandlers(): void {
    if (this.options.indicators) {
      this.indicators.forEach((el) => {
        el.removeEventListener("click", this._handleIndicatorClickBound);
      });
    }
  }

  private _handleIndicatorClick(e: MouseEvent): void {
    const item = (e.target as HTMLElement).closest(".indicator-item") as HTMLElement | null;
    if (item && this.indicatorsContainer) {
      const list = Array.from(this.indicatorsContainer.querySelectorAll(".indicator-item")) as HTMLElement[];
      const index = list.indexOf(item);
      this.set(index);
    }
  }

  private _handleInterval(): void {
    let newIndex = this.activeIndex + 1;
    if (newIndex >= this.slides.length) {
      newIndex = 0;
    }
    this.set(newIndex);
  }

  private _setSliderHeight(): void {
    if (!this.element.classList.contains("fullscreen")) {
      const hVal = this.options.indicators ? this.options.height + 40 : this.options.height;
      this.element.style.height = `${hVal}px`;
      if (this.slidesList) {
        this.slidesList.style.height = `${this.options.height}px`;
      }
    }
  }

  private _setupIndicators(): void {
    if (this.options.indicators) {
      this.indicatorsContainer = document.createElement("ul");
      this.indicatorsContainer.className = "indicators";

      this.slides.forEach(() => {
        const item = document.createElement("li");
        item.className = "indicator-item";
        this.indicatorsContainer?.appendChild(item);
      });

      this.element.appendChild(this.indicatorsContainer);
      this.indicators = Array.from(this.indicatorsContainer.querySelectorAll(".indicator-item"));
    }
  }

  private _removeIndicators(): void {
    this.indicatorsContainer?.remove();
    this.indicatorsContainer = null;
    this.indicators = [];
  }

  private _animateCaptionIn(caption: HTMLElement, duration: number): void {
    caption.style.transition = `transform ${duration}ms cubic-bezier(0.4, 0, 0.2, 1), opacity ${duration}ms cubic-bezier(0.4, 0, 0.2, 1)`;
    caption.style.opacity = "0";

    if (caption.classList.contains("center-align")) {
      caption.style.transform = "translateY(-100px)";
    } else if (caption.classList.contains("right-align")) {
      caption.style.transform = "translateX(100px)";
    } else if (caption.classList.contains("left-align")) {
      caption.style.transform = "translateX(-100px)";
    }
  }

  public set(index: number): void {
    if (index >= this.slides.length) {
      index = 0;
    } else if (index < 0) {
      index = this.slides.length - 1;
    }

    if (this.activeIndex !== index && this.slides[index]) {
      const oldSlide = this.slides[this.activeIndex];
      const nextSlide = this.slides[index];

      if (oldSlide) {
        oldSlide.style.transition = `opacity ${this.options.duration}ms ease-in-out`;
        oldSlide.style.opacity = "0";
        const oldCaption = oldSlide.querySelector(".caption") as HTMLElement | null;
        if (oldCaption) {
          this._animateCaptionIn(oldCaption, this.options.duration);
        }
        oldSlide.classList.remove("active");
        setTimeout(() => {
          if (!oldSlide.classList.contains("active")) {
            oldSlide.style.display = "none";
          }
        }, this.options.duration);
      }

      nextSlide.style.display = "block";
      nextSlide.style.opacity = "0";
      nextSlide.style.transition = `opacity ${this.options.duration}ms ease-in-out`;

      requestAnimationFrame(() => {
        nextSlide.style.opacity = "1";
        const nextCaption = nextSlide.querySelector(".caption") as HTMLElement | null;
        if (nextCaption) {
          nextCaption.style.transition = `transform ${this.options.duration}ms cubic-bezier(0.4, 0, 0.2, 1) ${this.options.duration}ms, opacity ${this.options.duration}ms cubic-bezier(0.4, 0, 0.2, 1) ${this.options.duration}ms`;
          nextCaption.style.opacity = "1";
          nextCaption.style.transform = "translate(0px, 0px)";
        }
      });

      nextSlide.classList.add("active");

      if (this.options.indicators) {
        this.indicators.forEach((item, idx) => {
          item.classList.toggle("active", idx === index);
        });
      }

      this.activeIndex = index;
      this.activeSlide = nextSlide;

      this.start();
    }
  }

  public pause(): void {
    clearInterval(this.interval);
  }

  public start(): void {
    clearInterval(this.interval);
    this.interval = setInterval(this._handleIntervalBound, this.options.duration + this.options.interval);
  }

  public next(): void {
    this.set(this.activeIndex + 1);
  }

  public prev(): void {
    this.set(this.activeIndex - 1);
  }
}
