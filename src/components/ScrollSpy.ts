import type { ScrollSpyOptions, IComponent } from "../types";
import { observe, unobserve } from "../utilities/intersection-observer";

export class ScrollSpy implements IComponent {
  private element: HTMLElement;
  private options: Required<ScrollSpyOptions>;
  private id: number;

  private static _elements: ScrollSpy[] = [];
  private static _elementsInView: ScrollSpy[] = [];
  private static _visibleElements: HTMLElement[] = [];
  private static _count: number = 0;
  private static _increment: number = 0;

  // Bound handler for link clicks
  private static _handleTriggerClickBound = ScrollSpy._handleTriggerClick.bind(ScrollSpy);

  private _handleVisibilityChangeBound: (isIntersecting: boolean) => void;

  constructor(element: HTMLElement, options?: ScrollSpyOptions) {
    this.element = element;
    this.options = {
      throttle: options?.throttle ?? 100,
      scrollOffset: options?.scrollOffset ?? 200,
      activeClass: options?.activeClass ?? "active",
      getActiveElement: options?.getActiveElement ?? ((id: string) => `a[href="#${id}"]`),
    };

    (this.element as any).M_ScrollSpy = this;

    ScrollSpy._elements.push(this);
    ScrollSpy._count++;
    ScrollSpy._increment++;
    this.id = ScrollSpy._increment;

    this._handleVisibilityChangeBound = this._handleVisibilityChange.bind(this);

    this.init();
  }

  public static init(
    elements: HTMLElement | NodeListOf<HTMLElement>,
    options?: ScrollSpyOptions
  ): ScrollSpy | ScrollSpy[] {
    if (elements instanceof HTMLElement) {
      return new ScrollSpy(elements, options);
    }
    const instances: ScrollSpy[] = [];
    elements.forEach((el) => {
      instances.push(new ScrollSpy(el, options));
    });
    return instances;
  }

  public static getInstance(element: HTMLElement): ScrollSpy | undefined {
    return (element as any).M_ScrollSpy;
  }

  public init(): void {
    this._setupEventHandlers();

    // Use IntersectionObserver with scrollOffset margin configured via rootMargin
    const threshold = 0.1; // Element is considered active when 10% is visible
    const offset = this.options.scrollOffset;
    
    // Config rootMargin so that the detection zone shifts up/down based on scrollOffset
    const options = {
      threshold,
      rootMargin: `-${offset}px 0px -10% 0px` // Shift observer boundary
    };

    observe(this.element, this._handleVisibilityChangeBound, options);
  }

  public destroy(): void {
    unobserve(this.element);
    
    const index = ScrollSpy._elements.indexOf(this);
    if (index !== -1) ScrollSpy._elements.splice(index, 1);

    const inViewIdx = ScrollSpy._elementsInView.indexOf(this);
    if (inViewIdx !== -1) ScrollSpy._elementsInView.splice(inViewIdx, 1);

    const visibleIdx = ScrollSpy._visibleElements.indexOf(this.element);
    if (visibleIdx !== -1) ScrollSpy._visibleElements.splice(visibleIdx, 1);

    ScrollSpy._count--;
    this._removeEventHandlers();

    const activeEl = document.querySelector(this.options.getActiveElement(this.element.id));
    if (activeEl) {
      activeEl.classList.remove(this.options.activeClass);
    }

    (this.element as any).M_ScrollSpy = undefined;
  }

  private _setupEventHandlers(): void {
    if (ScrollSpy._count === 1) {
      document.body.addEventListener("click", ScrollSpy._handleTriggerClickBound);
    }
  }

  private _removeEventHandlers(): void {
    if (ScrollSpy._count === 0) {
      document.body.removeEventListener("click", ScrollSpy._handleTriggerClickBound);
    }
  }

  private static _handleTriggerClick(e: MouseEvent): void {
    const target = e.target as HTMLElement;
    const trigger = target.closest("a") as HTMLAnchorElement | null;
    if (!trigger) return;

    const href = trigger.getAttribute("href");
    if (href && href.startsWith("#")) {
      const targetId = href.replace("#", "");
      const scrollspy = ScrollSpy._elements.find((el) => el.element.id === targetId);

      if (scrollspy) {
        e.preventDefault();
        const targetEl = scrollspy.element;
        const offset = targetEl.getBoundingClientRect().top + (window.pageYOffset || document.documentElement.scrollTop);
        const scrollToY = offset - scrollspy.options.scrollOffset;

        window.scrollTo({
          top: scrollToY,
          behavior: "smooth",
        });
      }
    }
  }

  private _handleVisibilityChange(isIntersecting: boolean): void {
    if (isIntersecting) {
      this._enter();
    } else {
      this._exit();
    }
  }

  private _enter(): void {
    // Filter out destroyed or hidden elements
    ScrollSpy._visibleElements = ScrollSpy._visibleElements.filter(
      (el) => el.offsetHeight > 0
    );

    const activeLink = document.querySelector(this.options.getActiveElement(this.element.id));

    if (ScrollSpy._visibleElements[0]) {
      const currentActiveLink = document.querySelector(
        this.options.getActiveElement(ScrollSpy._visibleElements[0].id)
      );
      if (currentActiveLink) {
        currentActiveLink.classList.remove(this.options.activeClass);
      }

      const otherSpy = (ScrollSpy._visibleElements[0] as any).M_ScrollSpy as ScrollSpy;
      if (otherSpy && this.id < otherSpy.id) {
        ScrollSpy._visibleElements.unshift(this.element);
      } else {
        ScrollSpy._visibleElements.push(this.element);
      }
    } else {
      ScrollSpy._visibleElements.push(this.element);
    }

    const newActiveLink = document.querySelector(
      this.options.getActiveElement(ScrollSpy._visibleElements[0].id)
    );
    if (newActiveLink) {
      newActiveLink.classList.add(this.options.activeClass);
    }
  }

  private _exit(): void {
    ScrollSpy._visibleElements = ScrollSpy._visibleElements.filter(
      (el) => el.offsetHeight > 0
    );

    if (ScrollSpy._visibleElements[0]) {
      const currentActiveLink = document.querySelector(
        this.options.getActiveElement(ScrollSpy._visibleElements[0].id)
      );
      if (currentActiveLink) {
        currentActiveLink.classList.remove(this.options.activeClass);
      }

      ScrollSpy._visibleElements = ScrollSpy._visibleElements.filter(
        (el) => el.id !== this.element.id
      );

      if (ScrollSpy._visibleElements[0]) {
        const nextActiveLink = document.querySelector(
          this.options.getActiveElement(ScrollSpy._visibleElements[0].id)
        );
        if (nextActiveLink) {
          nextActiveLink.classList.add(this.options.activeClass);
        }
      }
    }
  }
}
