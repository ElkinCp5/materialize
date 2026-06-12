import type { TabsOptions, IComponent } from "../types";

export class Tabs implements IComponent {
  private element: HTMLElement;
  private options: Required<TabsOptions>;
  private tabLinks: HTMLAnchorElement[] = [];
  private activeTabLink: HTMLAnchorElement | null = null;
  private content: HTMLElement | null = null;
  private indicator: HTMLLIElement | null = null;
  private index: number = 0;
  private tabsWidth: number = 0;
  private tabWidth: number = 0;

  private _handleWindowResizeBound: () => void;
  private _handleTabClickBound: (e: MouseEvent) => void;

  constructor(element: HTMLElement, options?: TabsOptions) {
    this.element = element;
    this.options = {
      responsiveThreshold: options?.responsiveThreshold ?? Infinity,
      swipeable: options?.swipeable ?? false,
      onShow: options?.onShow ?? (() => {}),
    };

    (this.element as any).M_Tabs = this;

    this._handleWindowResizeBound = this._handleWindowResize.bind(this);
    this._handleTabClickBound = this._handleTabClick.bind(this);

    this.init();
  }

  public static init(elements: HTMLElement | NodeListOf<HTMLElement>, options?: TabsOptions): Tabs | Tabs[] {
    if (elements instanceof HTMLElement) {
      return new Tabs(elements, options);
    }
    const instances: Tabs[] = [];
    elements.forEach((el) => {
      instances.push(new Tabs(el, options));
    });
    return instances;
  }

  public static getInstance(element: HTMLElement): Tabs | undefined {
    return (element as any).M_Tabs;
  }

  public init(): void {
    const tabItems = Array.from(this.element.querySelectorAll("li.tab"));
    tabItems.forEach((item) => {
      const anchor = item.querySelector("a") as HTMLAnchorElement | null;
      if (anchor) this.tabLinks.push(anchor);
    });

    this._setupActiveTabLink();
    this._setupNormalTabs();
    this._setTabsAndTabWidth();
    this._createIndicator();
    this._setupEventHandlers();
  }

  public destroy(): void {
    this._removeEventHandlers();
    if (this.indicator) {
      this.indicator.remove();
      this.indicator = null;
    }
    this._teardownNormalTabs();
    (this.element as any).M_Tabs = undefined;
  }

  private _setupEventHandlers(): void {
    window.addEventListener("resize", this._handleWindowResizeBound);
    this.element.addEventListener("click", this._handleTabClickBound);
  }

  private _removeEventHandlers(): void {
    window.removeEventListener("resize", this._handleWindowResizeBound);
    this.element.removeEventListener("click", this._handleTabClickBound);
  }

  private _handleWindowResize(): void {
    this._setTabsAndTabWidth();
    if (this.tabWidth !== 0 && this.tabsWidth !== 0 && this.indicator && this.activeTabLink) {
      this.indicator.style.left = `${this._calcLeftPos(this.activeTabLink)}px`;
      this.indicator.style.right = `${this._calcRightPos(this.activeTabLink)}px`;
    }
  }

  private _handleTabClick(e: MouseEvent): void {
    const target = e.target as HTMLElement;
    const tabLink = target.closest("a") as HTMLAnchorElement | null;
    if (!tabLink || !tabLink.parentElement?.classList.contains("tab")) return;

    const tabLi = tabLink.parentElement as HTMLElement;
    if (tabLi.classList.contains("disabled")) {
      e.preventDefault();
      return;
    }

    if (tabLink.getAttribute("target")) return; // Act as standard link

    e.preventDefault();

    if (this.activeTabLink) {
      this.activeTabLink.classList.remove("active");
    }
    const oldContent = this.content;

    this.activeTabLink = tabLink;
    const hash = this._escapeHash(tabLink.hash);
    this.content = document.getElementById(hash);
    
    this.activeTabLink.classList.add("active");
    const prevIndex = this.index;
    this.index = Math.max(this.tabLinks.indexOf(tabLink), 0);

    if (this.content) {
      this.content.style.display = "block";
      this.content.classList.add("active");
      this.options.onShow(this.content);
    }

    if (oldContent && oldContent !== this.content) {
      oldContent.style.display = "none";
      oldContent.classList.remove("active");
    }

    this._setTabsAndTabWidth();
    this._animateIndicator(prevIndex);
  }

  private _createIndicator(): void {
    const indicator = document.createElement("li");
    indicator.classList.add("indicator");
    this.element.appendChild(indicator);
    this.indicator = indicator;

    setTimeout(() => {
      if (this.indicator && this.activeTabLink) {
        this.indicator.style.left = `${this._calcLeftPos(this.activeTabLink)}px`;
        this.indicator.style.right = `${this._calcRightPos(this.activeTabLink)}px`;
      }
    }, 0);
  }

  private _setupActiveTabLink(): void {
    // Check for location hash first
    const hashedLink = this.tabLinks.find((link) => link.hash === window.location.hash);
    if (hashedLink) {
      this.activeTabLink = hashedLink;
    }

    if (!this.activeTabLink) {
      this.activeTabLink = this.element.querySelector("li.tab a.active") as HTMLAnchorElement | null;
    }

    if (!this.activeTabLink) {
      this.activeTabLink = this.element.querySelector("li.tab a") as HTMLAnchorElement | null;
    }

    this.tabLinks.forEach((link) => link.classList.remove("active"));
    if (this.activeTabLink) {
      this.activeTabLink.classList.add("active");
      this.index = Math.max(this.tabLinks.indexOf(this.activeTabLink), 0);
      const hash = this._escapeHash(this.activeTabLink.hash);
      this.content = document.getElementById(hash);
      if (this.content) {
        this.content.classList.add("active");
      }
    }
  }

  private _setupNormalTabs(): void {
    this.tabLinks.forEach((link) => {
      if (link !== this.activeTabLink && link.hash) {
        const hash = this._escapeHash(link.hash);
        const contentEl = document.getElementById(hash);
        if (contentEl) {
          contentEl.style.display = "none";
        }
      }
    });
  }

  private _teardownNormalTabs(): void {
    this.tabLinks.forEach((link) => {
      if (link.hash) {
        const hash = this._escapeHash(link.hash);
        const contentEl = document.getElementById(hash);
        if (contentEl) {
          contentEl.style.display = "";
          contentEl.classList.remove("active");
        }
      }
    });
  }

  private _setTabsAndTabWidth(): void {
    this.tabsWidth = this.element.getBoundingClientRect().width;
    this.tabWidth = Math.max(this.tabsWidth, this.element.scrollWidth) / (this.tabLinks.length || 1);
  }

  private _calcRightPos(el: HTMLAnchorElement): number {
    const leftVal = this._calcLeftPos(el);
    return Math.ceil(this.tabsWidth - leftVal - el.getBoundingClientRect().width);
  }

  private _calcLeftPos(el: HTMLAnchorElement): number {
    return el.offsetLeft;
  }

  public updateTabIndicator(): void {
    this._setTabsAndTabWidth();
    this._animateIndicator(this.index);
  }

  private _animateIndicator(prevIndex: number): void {
    if (!this.indicator || !this.activeTabLink) return;

    let leftDelay = 0;
    let rightDelay = 0;

    if (this.index - prevIndex >= 0) {
      leftDelay = 90;
    } else {
      rightDelay = 90;
    }

    const leftPos = this._calcLeftPos(this.activeTabLink);
    const rightPos = this._calcRightPos(this.activeTabLink);

    this.indicator.style.transition = `left 300ms cubic-bezier(0.4, 0, 0.2, 1) ${leftDelay}ms, right 300ms cubic-bezier(0.4, 0, 0.2, 1) ${rightDelay}ms`;
    
    requestAnimationFrame(() => {
      if (this.indicator) {
        this.indicator.style.left = `${leftPos}px`;
        this.indicator.style.right = `${rightPos}px`;
      }
    });
  }

  public select(tabId: string): void {
    const tabLink = this.tabLinks.find((link) => link.hash === `#${tabId}`);
    if (tabLink) {
      tabLink.click();
    }
  }

  private _escapeHash(hash: string): string {
    return hash.replace("#", "");
  }
}
