/**
 * Sidenav Component - Materialize v2.0
 *
 * Replacement for jQuery sidenav plugin
 * Uses Vanilla JavaScript + TypeScript
 */

import type { IComponent, SidenavOptions } from "../types";

export class Sidenav implements IComponent {
	private element: HTMLElement;
	private options: Required<SidenavOptions>;
	private overlay: HTMLElement | null = null;
	private dragTarget: HTMLElement | null = null;
	private isOpen: boolean = false;
	private isDragged: boolean = false;
	private isFixed: boolean = false;

	// Dragging interaction state
	private startingXpos: number = 0;
	private xPos: number = 0;
	private width: number = 0;
	private percentOpen: number = 0;
	private verticallyScrolling: boolean = false;
	private initialScrollTop: number = 0;

	// Event handler bounds
	private _handleTriggerClickBound: (e: MouseEvent) => void;
	private _handleDragTargetDragBound: (e: TouchEvent) => void;
	private _handleDragTargetReleaseBound: () => void;
	private _handleCloseDragBound: (e: TouchEvent) => void;
	private _handleCloseReleaseBound: () => void;
	private _handleCloseTriggerClickBound: (e: MouseEvent) => void;
	private _handleWindowResizeBound: () => void;
	private _handleKeyDownBound: (e: KeyboardEvent) => void;

	constructor(element: HTMLElement, options?: SidenavOptions) {
		this.element = element;
		this.options = {
			edge: options?.edge ?? "left",
			draggable: options?.draggable ?? true,
			inDuration: options?.inDuration ?? 250,
			outDuration: options?.outDuration ?? 200,
			onOpen: options?.onOpen ?? (() => {}),
			onClose: options?.onClose ?? (() => {}),
			preventScrolling: options?.preventScrolling ?? true,
		};

		this.isFixed = this.element.classList.contains("sidenav-fixed");

		// Bind event handlers
		this._handleTriggerClickBound = this._handleTriggerClick.bind(this);
		this._handleDragTargetDragBound = this._handleDragTargetDrag.bind(this);
		this._handleDragTargetReleaseBound =
			this._handleDragTargetRelease.bind(this);
		this._handleCloseDragBound = this._handleCloseDrag.bind(this);
		this._handleCloseReleaseBound = this._handleCloseRelease.bind(this);
		this._handleCloseTriggerClickBound =
			this._handleCloseTriggerClick.bind(this);
		this._handleWindowResizeBound = this._handleWindowResize.bind(this);
		this._handleKeyDownBound = this._handleKeyDown.bind(this);

		this.init();
	}

	init(): void {
		this.setupClasses();
		this.createOverlay();
		this.createDragTarget();
		this.setupEventHandlers();
		this.setupFixed();
	}

	private setupClasses(): void {
		if (this.options.edge === "right") {
			this.element.classList.add("right-aligned");
		} else {
			this.element.classList.remove("right-aligned");
		}
	}

	private createOverlay(): void {
		this.overlay = document.createElement("div");
		this.overlay.className = "sidenav-overlay";
		this.overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      opacity: 0;
      height: 120vh;
      background-color: rgba(0, 0, 0, 0.5);
      z-index: 997;
      display: none;
      transition: opacity ${this.options.inDuration}ms ease-out;
    `;
		this.overlay.addEventListener("click", () => this.close());
		document.body.appendChild(this.overlay);
	}

	private createDragTarget(): void {
		if (!this.options.draggable) return;

		this.dragTarget = document.createElement("div");
		this.dragTarget.className = "drag-target";
		if (this.options.edge === "right") {
			this.dragTarget.classList.add("right-aligned");
		}

		// Default styling for drag target
		this.dragTarget.style.cssText = `
      height: 100%;
      width: 10px;
      position: fixed;
      top: 0;
      z-index: 998;
      ${this.options.edge === "right" ? "right: 0; left: auto;" : "left: 0; right: auto;"}
    `;
		document.body.appendChild(this.dragTarget);
	}

	private setupEventHandlers(): void {
		// Triggers click event delegation
		document.addEventListener("click", this._handleTriggerClickBound);

		if (this.dragTarget) {
			this.dragTarget.addEventListener(
				"touchmove",
				this._handleDragTargetDragBound,
				{ passive: true },
			);
			this.dragTarget.addEventListener(
				"touchend",
				this._handleDragTargetReleaseBound,
			);
		}

		if (this.overlay) {
			this.overlay.addEventListener("touchmove", this._handleCloseDragBound, {
				passive: true,
			});
			this.overlay.addEventListener("touchend", this._handleCloseReleaseBound);
		}

		this.element.addEventListener("touchmove", this._handleCloseDragBound, {
			passive: true,
		});
		this.element.addEventListener("touchend", this._handleCloseReleaseBound);
		this.element.addEventListener("click", this._handleCloseTriggerClickBound);

		window.addEventListener("resize", this._handleWindowResizeBound);
		window.addEventListener("keydown", this._handleKeyDownBound);
	}

	private removeEventHandlers(): void {
		document.removeEventListener("click", this._handleTriggerClickBound);

		if (this.dragTarget) {
			this.dragTarget.removeEventListener(
				"touchmove",
				this._handleDragTargetDragBound,
			);
			this.dragTarget.removeEventListener(
				"touchend",
				this._handleDragTargetReleaseBound,
			);
		}

		if (this.overlay) {
			this.overlay.removeEventListener("touchmove", this._handleCloseDragBound);
			this.overlay.removeEventListener(
				"touchend",
				this._handleCloseReleaseBound,
			);
		}

		this.element.removeEventListener("touchmove", this._handleCloseDragBound);
		this.element.removeEventListener("touchend", this._handleCloseReleaseBound);
		this.element.removeEventListener(
			"click",
			this._handleCloseTriggerClickBound,
		);

		window.removeEventListener("resize", this._handleWindowResizeBound);
		window.removeEventListener("keydown", this._handleKeyDownBound);
	}

	private setupFixed(): void {
		if (this.isCurrentlyFixed()) {
			this.open();
		}
	}

	private isCurrentlyFixed(): boolean {
		return this.isFixed && window.innerWidth > 992;
	}

	private _handleTriggerClick(e: MouseEvent): void {
		const target = e.target as HTMLElement;
		const trigger = target.closest(".sidenav-trigger") as HTMLElement;
		if (trigger) {
			const targetId = trigger.getAttribute("data-target");
			if (targetId && targetId === this.element.id) {
				e.preventDefault();
				this.open();
			}
		}
	}

	private _handleCloseTriggerClick(e: MouseEvent): void {
		const target = e.target as HTMLElement;
		const closeTrigger = target.closest(".sidenav-close");
		if (closeTrigger && !this.isCurrentlyFixed()) {
			this.close();
		}
	}

	private _handleKeyDown(e: KeyboardEvent): void {
		if (e.key === "Escape" && this.isOpen && !this.isCurrentlyFixed()) {
			this.close();
		}
	}

	private _handleWindowResize(): void {
		if (this.isFixed) {
			if (window.innerWidth > 992) {
				this.open();
			} else {
				this.close();
			}
		}
	}

	// Touch/Drag Implementation
	private startDrag(e: TouchEvent): void {
		const touch = e.targetTouches[0];
		if (!touch) return;
		const clientX = touch.clientX;
		this.isDragged = true;
		this.startingXpos = clientX;
		this.xPos = this.startingXpos;
		this.width = this.element.getBoundingClientRect().width;

		if (this.overlay) {
			this.overlay.style.display = "block";
		}

		this.initialScrollTop = this.isOpen
			? this.element.scrollTop
			: window.scrollY;
		this.verticallyScrolling = false;
	}

	private dragMoveUpdate(e: TouchEvent): void {
		const touch = e.targetTouches[0];
		if (!touch) return;
		const clientX = touch.clientX;
		const currentScrollTop = this.isOpen
			? this.element.scrollTop
			: window.scrollY;
		this.xPos = clientX;
		if (this.initialScrollTop !== currentScrollTop) {
			this.verticallyScrolling = true;
		}
	}

	private _handleDragTargetDrag(e: TouchEvent): void {
		if (
			!this.options.draggable ||
			this.isCurrentlyFixed() ||
			this.verticallyScrolling
		)
			return;

		if (!this.isDragged) {
			this.startDrag(e);
		}

		this.dragMoveUpdate(e);

		const totalDeltaX = this.xPos - this.startingXpos;
		const dragDirection = totalDeltaX > 0 ? "right" : "left";

		let dragAmount = Math.min(this.width, Math.abs(totalDeltaX));
		if (this.options.edge === dragDirection) {
			dragAmount = 0;
		}

		let transformX = dragAmount;
		let transformPrefix = "translateX(-100%)";
		if (this.options.edge === "right") {
			transformPrefix = "translateX(100%)";
			transformX = -transformX;
		}

		this.percentOpen = Math.min(1, dragAmount / this.width);

		this.element.style.transform = `${transformPrefix} translateX(${transformX}px)`;
		if (this.overlay) {
			this.overlay.style.opacity = String(this.percentOpen);
		}
	}

	private _handleDragTargetRelease(): void {
		if (this.isDragged) {
			if (this.percentOpen > 0.2) {
				this.open();
			} else {
				this.animateOut();
			}
			this.isDragged = false;
			this.verticallyScrolling = false;
		}
	}

	private _handleCloseDrag(e: TouchEvent): void {
		if (
			!this.isOpen ||
			!this.options.draggable ||
			this.isCurrentlyFixed() ||
			this.verticallyScrolling
		)
			return;

		if (!this.isDragged) {
			this.startDrag(e);
		}

		this.dragMoveUpdate(e);

		const totalDeltaX = this.xPos - this.startingXpos;
		const dragDirection = totalDeltaX > 0 ? "right" : "left";

		let dragAmount = Math.min(this.width, Math.abs(totalDeltaX));
		if (this.options.edge !== dragDirection) {
			dragAmount = 0;
		}

		let transformX = -dragAmount;
		if (this.options.edge === "right") {
			transformX = -transformX;
		}

		this.percentOpen = Math.min(1, 1 - dragAmount / this.width);

		this.element.style.transform = `translateX(${transformX}px)`;
		if (this.overlay) {
			this.overlay.style.opacity = String(this.percentOpen);
		}
	}

	private _handleCloseRelease(): void {
		if (this.isOpen && this.isDragged) {
			if (this.percentOpen > 0.8) {
				this.animateIn();
			} else {
				this.close();
			}
			this.isDragged = false;
			this.verticallyScrolling = false;
		}
	}

	open(): void {
		if (this.isOpen && !this.isDragged) return;

		this.isOpen = true;

		if (this.isCurrentlyFixed()) {
			this.element.style.transform = "translateX(0)";
			this.enableBodyScrolling();
			if (this.overlay) {
				this.overlay.style.display = "none";
			}
		} else {
			if (this.options.preventScrolling) {
				this.preventBodyScrolling();
			}

			this.animateIn();
		}
	}

	close(): void {
		if (!this.isOpen && !this.isDragged) return;

		this.isOpen = false;

		if (this.isCurrentlyFixed()) {
			const transformX = this.options.edge === "left" ? "-105%" : "105%";
			this.element.style.transform = `translateX(${transformX})`;
		} else {
			this.enableBodyScrolling();
			this.animateOut();
		}
	}

	private animateIn(): void {
		this.element.style.transition = `transform ${this.options.inDuration}ms cubic-bezier(0.25, 0.46, 0.45, 0.94)`;
		this.element.style.transform = "translateX(0)";

		if (this.overlay) {
			this.overlay.style.display = "block";
			// Trigger reflow
			this.overlay.offsetHeight;
			this.overlay.style.opacity = "1";
		}

		setTimeout(() => {
			this.element.style.transition = "";
			this.options.onOpen();
		}, this.options.inDuration);
	}

	private animateOut(): void {
		this.element.style.transition = `transform ${this.options.outDuration}ms cubic-bezier(0.25, 0.46, 0.45, 0.94)`;

		const transformX = this.options.edge === "left" ? "-105%" : "105%";
		this.element.style.transform = `translateX(${transformX})`;

		if (this.overlay) {
			this.overlay.style.opacity = "0";
		}

		setTimeout(() => {
			this.element.style.transition = "";
			if (this.overlay) {
				this.overlay.style.display = "none";
			}
			this.options.onClose();
		}, this.options.outDuration);
	}

	private preventBodyScrolling(): void {
		document.body.style.overflow = "hidden";
	}

	private enableBodyScrolling(): void {
		document.body.style.overflow = "";
	}

	destroy(): void {
		this.removeEventHandlers();
		this.enableBodyScrolling();

		if (this.overlay) {
			this.overlay.remove();
			this.overlay = null;
		}

		if (this.dragTarget) {
			this.dragTarget.remove();
			this.dragTarget = null;
		}

		this.element.style.transform = "";
	}
}

// Convenience function
export function createSidenav(
	selector: string,
	options?: SidenavOptions,
): Sidenav {
	const element = document.querySelector(selector) as HTMLElement;
	if (!element) {
		throw new Error(`Sidenav element not found: ${selector}`);
	}
	return new Sidenav(element, options);
}
