import type { ToastOptions } from "../types";

export class Toast {
  private options: Required<ToastOptions>;
  private message: string | HTMLElement;
  private panning: boolean = false;
  private timeRemaining: number;
  private el!: HTMLDivElement;
  private wasSwiped: boolean = false;
  private counterInterval: any = null;

  // Drag state variables
  private startingXPos: number = 0;
  private xPos: number = 0;
  private time: number = 0;
  private deltaX: number = 0;
  private velocityX: number = 0;

  // Static properties for global container management
  private static _toasts: Toast[] = [];
  private static _container: HTMLDivElement | null = null;
  private static _draggedToast: Toast | null = null;

  // Bound static drag events
  private static _onDragStartBound = Toast._onDragStart.bind(Toast);
  private static _onDragMoveBound = Toast._onDragMove.bind(Toast);
  private static _onDragEndBound = Toast._onDragEnd.bind(Toast);

  constructor(options: ToastOptions) {
    this.options = {
      html: options.html ?? "",
      displayLength: options.displayLength ?? 4000,
      inDuration: options.inDuration ?? 300,
      outDuration: options.outDuration ?? 375,
      classes: options.classes ?? "",
      completeCallback: options.completeCallback ?? (() => {}),
      activationPercent: options.activationPercent ?? 0.8,
    };
    this.message = this.options.html;
    this.timeRemaining = this.options.displayLength;

    if (Toast._toasts.length === 0) {
      Toast._createContainer();
    }

    Toast._toasts.push(this);
    const toastElement = this._createToast();
    (toastElement as any).M_Toast = this;
    this.el = toastElement;
    this._animateIn();
    this._setTimer();
  }

  public static get defaults(): ToastOptions {
    return {
      html: "",
      displayLength: 4000,
      inDuration: 300,
      outDuration: 375,
      classes: "",
      completeCallback: () => {},
      activationPercent: 0.8,
    };
  }

  public static getInstance(el: HTMLElement): Toast | undefined {
    return (el as any).M_Toast;
  }

  private static _createContainer(): void {
    const container = document.createElement("div");
    container.setAttribute("id", "toast-container");

    container.addEventListener("touchstart", Toast._onDragStartBound, { passive: true });
    container.addEventListener("touchmove", Toast._onDragMoveBound, { passive: false });
    container.addEventListener("touchend", Toast._onDragEndBound, { passive: true });

    container.addEventListener("mousedown", Toast._onDragStartBound);
    document.addEventListener("mousemove", Toast._onDragMoveBound);
    document.addEventListener("mouseup", Toast._onDragEndBound);

    document.body.appendChild(container);
    Toast._container = container;
  }

  private static _removeContainer(): void {
    document.removeEventListener("mousemove", Toast._onDragMoveBound);
    document.removeEventListener("mouseup", Toast._onDragEndBound);

    if (Toast._container) {
      Toast._container.remove();
      Toast._container = null;
    }
  }

  private static _onDragStart(e: MouseEvent | TouchEvent): void {
    const target = e.target as HTMLElement;
    const toastEl = target.closest(".toast") as HTMLDivElement | null;
    if (toastEl) {
      const toast = (toastEl as any).M_Toast as Toast;
      if (toast) {
        toast.panning = true;
        Toast._draggedToast = toast;
        toast.el.classList.add("panning");
        toast.el.style.transition = "";
        toast.startingXPos = Toast._xPos(e);
        toast.time = Date.now();
        toast.xPos = Toast._xPos(e);
      }
    }
  }

  private static _onDragMove(e: MouseEvent | TouchEvent): void {
    if (Toast._draggedToast) {
      if (e.cancelable) {
        e.preventDefault();
      }
      const toast = Toast._draggedToast;
      toast.deltaX = Math.abs(toast.xPos - Toast._xPos(e));
      toast.xPos = Toast._xPos(e);
      toast.velocityX = toast.deltaX / (Date.now() - toast.time || 1);
      toast.time = Date.now();

      const totalDeltaX = toast.xPos - toast.startingXPos;
      const activationDistance = toast.el.offsetWidth * toast.options.activationPercent;
      toast.el.style.transform = `translateX(${totalDeltaX}px)`;
      toast.el.style.opacity = (1 - Math.abs(totalDeltaX / activationDistance)).toString();
    }
  }

  private static _onDragEnd(): void {
    if (Toast._draggedToast) {
      const toast = Toast._draggedToast;
      toast.panning = false;
      toast.el.classList.remove("panning");

      const totalDeltaX = toast.xPos - toast.startingXPos;
      const activationDistance = toast.el.offsetWidth * toast.options.activationPercent;
      const shouldBeDismissed = Math.abs(totalDeltaX) > activationDistance || toast.velocityX > 1;

      if (shouldBeDismissed) {
        toast.wasSwiped = true;
        toast.dismiss();
      } else {
        toast.el.style.transition = "transform .2s, opacity .2s";
        toast.el.style.transform = "";
        toast.el.style.opacity = "";
      }
      Toast._draggedToast = null;
    }
  }

  private static _xPos(e: MouseEvent | TouchEvent): number {
    if ("targetTouches" in e && e.targetTouches && e.targetTouches.length >= 1) {
      return e.targetTouches[0].clientX;
    }
    return (e as MouseEvent).clientX;
  }

  public static dismissAll(): void {
    const list = [...Toast._toasts];
    list.forEach((toast) => toast.dismiss());
  }

  private _createToast(): HTMLDivElement {
    const toast = document.createElement("div");
    toast.classList.add("toast");

    if (this.options.classes.length > 0) {
      const classList = this.options.classes.split(" ").filter(Boolean);
      classList.forEach((cls) => toast.classList.add(cls));
    }

    if (this.message instanceof HTMLElement) {
      toast.appendChild(this.message);
    } else {
      toast.innerHTML = this.message;
    }

    Toast._container?.appendChild(toast);
    return toast;
  }

  private _animateIn(): void {
    this.el.style.opacity = "0";
    this.el.style.transform = "translateY(35px)";
    this.el.style.transition = `transform ${this.options.inDuration}ms cubic-bezier(0.4, 0, 0.2, 1), opacity ${this.options.inDuration}ms cubic-bezier(0.4, 0, 0.2, 1)`;

    requestAnimationFrame(() => {
      this.el.style.opacity = "1";
      this.el.style.transform = "translateY(0)";
    });
  }

  private _setTimer(): void {
    if (this.timeRemaining !== Infinity) {
      this.counterInterval = setInterval(() => {
        if (!this.panning) {
          this.timeRemaining -= 20;
        }

        if (this.timeRemaining <= 0) {
          this.dismiss();
        }
      }, 20);
    }
  }

  public dismiss(): void {
    window.clearInterval(this.counterInterval);
    const activationDistance = this.el.offsetWidth * this.options.activationPercent;

    if (this.wasSwiped) {
      this.el.style.transition = "transform .05s, opacity .05s";
      this.el.style.transform = `translateX(${activationDistance}px)`;
      this.el.style.opacity = "0";
    }

    this.el.style.transition = `opacity ${this.options.outDuration}ms cubic-bezier(0.4, 0, 0.2, 1), margin-top ${this.options.outDuration}ms cubic-bezier(0.4, 0, 0.2, 1)`;
    this.el.style.opacity = "0";
    this.el.style.marginTop = "-40px";

    setTimeout(() => {
      this.options.completeCallback();
      this.el.remove();
      
      const idx = Toast._toasts.indexOf(this);
      if (idx !== -1) {
        Toast._toasts.splice(idx, 1);
      }

      if (Toast._toasts.length === 0) {
        Toast._removeContainer();
      }
    }, this.options.outDuration);
  }
}
