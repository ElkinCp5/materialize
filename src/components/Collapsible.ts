import type { CollapsibleOptions, IComponent } from "../types";

export class Collapsible implements IComponent {
  private element: HTMLElement;
  private options: Required<CollapsibleOptions>;
  private headers: HTMLElement[] = [];

  private _handleCollapsibleClickBound: (e: MouseEvent) => void;
  private _handleCollapsibleKeydownBound: (e: KeyboardEvent) => void;

  constructor(element: HTMLElement, options?: CollapsibleOptions) {
    this.element = element;
    this.options = {
      accordion: options?.accordion ?? true,
      onOpen: options?.onOpen ?? (() => {}),
      onClose: options?.onClose ?? (() => {}),
      inDuration: options?.inDuration ?? 300,
      outDuration: options?.outDuration ?? 300,
    };

    (this.element as any).M_Collapsible = this;

    this._handleCollapsibleClickBound = this._handleCollapsibleClick.bind(this);
    this._handleCollapsibleKeydownBound = this._handleCollapsibleKeydown.bind(this);

    this.init();
  }

  public static init(elements: HTMLElement | NodeListOf<HTMLElement>, options?: CollapsibleOptions): Collapsible | Collapsible[] {
    if (elements instanceof HTMLElement) {
      return new Collapsible(elements, options);
    }
    const instances: Collapsible[] = [];
    elements.forEach((el) => {
      instances.push(new Collapsible(el, options));
    });
    return instances;
  }

  public static getInstance(element: HTMLElement): Collapsible | undefined {
    return (element as any).M_Collapsible;
  }

  public init(): void {
    const listItems = Array.from(this.element.children);
    listItems.forEach((li) => {
      const header = li.querySelector(".collapsible-header") as HTMLElement;
      if (header) {
        header.setAttribute("tabindex", "0");
        this.headers.push(header);
      }
    });

    this._setupEventHandlers();

    // Open pre-active items
    listItems.forEach((li, index) => {
      if (li.classList.contains("active")) {
        const body = li.querySelector(".collapsible-body") as HTMLElement;
        if (body) {
          body.style.display = "block";
        }
      }
    });
  }

  public destroy(): void {
    this._removeEventHandlers();
    (this.element as any).M_Collapsible = undefined;
  }

  private _setupEventHandlers(): void {
    this.element.addEventListener("click", this._handleCollapsibleClickBound);
    this.headers.forEach((header) => {
      header.addEventListener("keydown", this._handleCollapsibleKeydownBound);
    });
  }

  private _removeEventHandlers(): void {
    this.element.removeEventListener("click", this._handleCollapsibleClickBound);
    this.headers.forEach((header) => {
      header.removeEventListener("keydown", this._handleCollapsibleKeydownBound);
    });
  }

  private _handleCollapsibleClick(e: MouseEvent): void {
    const target = e.target as HTMLElement;
    const header = target.closest(".collapsible-header") as HTMLElement;
    if (header && this.element.contains(header)) {
      const li = header.closest("li") as HTMLElement;
      const listItems = Array.from(this.element.children) as HTMLElement[];
      const index = listItems.indexOf(li);

      if (li.classList.contains("active")) {
        this.close(index);
      } else {
        this.open(index);
      }
    }
  }

  private _handleCollapsibleKeydown(e: KeyboardEvent): void {
    if (e.key === "Enter" || e.keyCode === 13) {
      this._handleCollapsibleClick(e as any);
    }
  }

  public open(index: number): void {
    const listItems = Array.from(this.element.children) as HTMLElement[];
    const li = listItems[index];
    if (li && !li.classList.contains("active")) {
      this.options.onOpen(li);

      if (this.options.accordion) {
        listItems.forEach((item, idx) => {
          if (item.classList.contains("active") && idx !== index) {
            this.close(idx);
          }
        });
      }

      li.classList.add("active");
      this._animateIn(index);
    }
  }

  public close(index: number): void {
    const listItems = Array.from(this.element.children) as HTMLElement[];
    const li = listItems[index];
    if (li && li.classList.contains("active")) {
      this.options.onClose(li);
      li.classList.remove("active");
      this._animateOut(index);
    }
  }

  private _animateIn(index: number): void {
    const listItems = Array.from(this.element.children) as HTMLElement[];
    const li = listItems[index];
    const body = li?.querySelector(".collapsible-body") as HTMLElement;
    if (!body) return;

    body.style.display = "block";
    body.style.overflow = "hidden";
    body.style.height = "0px";
    body.style.paddingTop = "0px";
    body.style.paddingBottom = "0px";

    // Obtain final heights & paddings by temporarily setting standard styles
    body.style.height = "";
    body.style.paddingTop = "";
    body.style.paddingBottom = "";
    const finalHeight = body.scrollHeight;
    const computedStyle = window.getComputedStyle(body);
    const pTop = computedStyle.paddingTop;
    const pBottom = computedStyle.paddingBottom;

    body.style.height = "0px";
    body.style.paddingTop = "0px";
    body.style.paddingBottom = "0px";

    requestAnimationFrame(() => {
      body.style.transition = `height ${this.options.inDuration}ms cubic-bezier(0.4, 0, 0.2, 1), padding ${this.options.inDuration}ms cubic-bezier(0.4, 0, 0.2, 1)`;
      body.style.height = `${finalHeight}px`;
      body.style.paddingTop = pTop;
      body.style.paddingBottom = pBottom;

      setTimeout(() => {
        body.style.transition = "";
        body.style.overflow = "";
        body.style.height = "";
        body.style.paddingTop = "";
        body.style.paddingBottom = "";
      }, this.options.inDuration);
    });
  }

  private _animateOut(index: number): void {
    const listItems = Array.from(this.element.children) as HTMLElement[];
    const li = listItems[index];
    const body = li?.querySelector(".collapsible-body") as HTMLElement;
    if (!body) return;

    body.style.overflow = "hidden";
    const computedStyle = window.getComputedStyle(body);
    const initialHeight = body.offsetHeight;
    const pTop = computedStyle.paddingTop;
    const pBottom = computedStyle.paddingBottom;

    body.style.height = `${initialHeight}px`;
    body.style.paddingTop = pTop;
    body.style.paddingBottom = pBottom;

    requestAnimationFrame(() => {
      body.style.transition = `height ${this.options.outDuration}ms cubic-bezier(0.4, 0, 0.2, 1), padding ${this.options.outDuration}ms cubic-bezier(0.4, 0, 0.2, 1)`;
      body.style.height = "0px";
      body.style.paddingTop = "0px";
      body.style.paddingBottom = "0px";

      setTimeout(() => {
        body.style.transition = "";
        body.style.overflow = "";
        body.style.height = "";
        body.style.paddingTop = "";
        body.style.paddingBottom = "";
        body.style.display = "none";
      }, this.options.outDuration);
    });
  }
}
