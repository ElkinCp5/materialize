import type { ParallaxOptions, IComponent } from "../types";
import { observe, unobserve } from "../utilities/intersection-observer";

export class Parallax implements IComponent {
  private element: HTMLElement;
  private options: Required<ParallaxOptions>;
  private enabled: boolean = false;
  private img: HTMLImageElement | null = null;

  private static _parallaxes: Parallax[] = [];

  // Bound event handlers
  private _handleImageLoadBound: () => void;
  private _handleVisibilityChangeBound: (isIntersecting: boolean) => void;
  private _handleWindowResizeBound: () => void;

  constructor(element: HTMLElement, options?: ParallaxOptions) {
    this.element = element;
    this.options = {
      responsiveThreshold: options?.responsiveThreshold ?? 0,
    };

    (this.element as any).M_Parallax = this;

    this.enabled = window.innerWidth > this.options.responsiveThreshold;
    this.img = this.element.querySelector("img");

    this._handleImageLoadBound = this._handleImageLoad.bind(this);
    this._handleVisibilityChangeBound = this._handleVisibilityChange.bind(this);
    this._handleWindowResizeBound = this._handleWindowResize.bind(this);

    this.init();
  }

  public static init(elements: HTMLElement | NodeListOf<HTMLElement>, options?: ParallaxOptions): Parallax | Parallax[] {
    if (elements instanceof HTMLElement) {
      return new Parallax(elements, options);
    }
    const instances: Parallax[] = [];
    elements.forEach((el) => {
      instances.push(new Parallax(el, options));
    });
    return instances;
  }

  public static getInstance(element: HTMLElement): Parallax | undefined {
    return (element as any).M_Parallax;
  }

  public init(): void {
    if (this.img) {
      if (this.img.complete) {
        this._updateParallax();
      }
      this.img.addEventListener("load", this._handleImageLoadBound);
      this.img.style.opacity = "1";
    }

    window.addEventListener("resize", this._handleWindowResizeBound);
    Parallax._parallaxes.push(this);

    // Optimize visibility rendering: only perform scroll translation when visible
    observe(this.element, this._handleVisibilityChangeBound);
  }

  public destroy(): void {
    unobserve(this.element);
    window.removeEventListener("resize", this._handleWindowResizeBound);

    if (this.img) {
      this.img.removeEventListener("load", this._handleImageLoadBound);
      this.img.style.transform = "";
    }

    const idx = Parallax._parallaxes.indexOf(this);
    if (idx !== -1) Parallax._parallaxes.splice(idx, 1);

    (this.element as any).M_Parallax = undefined;
  }

  private _handleImageLoad(): void {
    this._updateParallax();
  }

  private _handleWindowResize(): void {
    this.enabled = window.innerWidth > this.options.responsiveThreshold;
    this._updateParallax();
  }

  private _handleVisibilityChange(isIntersecting: boolean): void {
    if (isIntersecting && this.enabled) {
      // Register scroll handler dynamically when element is in view to avoid waste of CPU cycles
      window.addEventListener("scroll", this._handleScrollBound);
      this._updateParallax();
    } else {
      window.removeEventListener("scroll", this._handleScrollBound);
    }
  }

  // Scroll handler bound dynamically to preserve performance
  private _handleScrollBound = () => {
    this._updateParallax();
  };

  private _updateParallax(): void {
    if (!this.img) return;

    const parent = this.element.parentElement || this.element;
    const containerHeight = this.element.offsetHeight > 0 ? parent.offsetHeight : 500;
    const imgHeight = this.img.offsetHeight || 500;
    const parallaxDist = imgHeight - containerHeight;

    const rect = this.element.getBoundingClientRect();
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const top = rect.top + scrollTop;
    const bottom = top + containerHeight;

    const windowHeight = window.innerHeight;
    const windowBottom = scrollTop + windowHeight;

    const percentScrolled = (windowBottom - top) / (containerHeight + windowHeight);
    const parallax = parallaxDist * percentScrolled;

    if (!this.enabled) {
      this.img.style.transform = "";
    } else if (bottom > scrollTop && top < scrollTop + windowHeight) {
      this.img.style.transform = `translate3D(-50%, ${Math.round(parallax)}px, 0)`;
    }
  }
}
