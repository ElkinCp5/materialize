/**
 * Modal Component - Materialize v2.0
 *
 * Replacement for jQuery modal plugin
 * Uses Vanilla JavaScript + TypeScript
 */

import type { IComponent, ModalOptions } from "../types";

export class Modal implements IComponent {
	private element: HTMLElement;
	private options: Required<ModalOptions>;
	private backdrop: HTMLElement | null = null;
	private isOpen: boolean = false;
	private isAnimating: boolean = false;

	constructor(element: HTMLElement, options?: ModalOptions) {
		this.element = element;
		this.options = {
			opacity: options?.opacity ?? 0.5,
			duration: options?.duration ?? 300,
			inDuration: options?.inDuration ?? 300,
			outDuration: options?.outDuration ?? 300,
			startingTop: options?.startingTop ?? "4%",
			endingTop: options?.endingTop ?? "10%",
			preventScroll: options?.preventScroll ?? false,
			onOpen: options?.onOpen ?? (() => {}),
			onClose: options?.onClose ?? (() => {}),
		};
	}

	init(): void {
		// Setup event listeners
		this.setupTriggers();
	}

	private setupTriggers(): void {
		const triggers = document.querySelectorAll(
			`[data-target="${this.element.id}"]`,
		);
		triggers.forEach((trigger) => {
			trigger.addEventListener("click", () => this.open());
		});

		// Close on backdrop click
		this.element.addEventListener("click", (e) => {
			if ((e.target as HTMLElement) === this.element) {
				this.close();
			}
		});

		// Close button
		const closeBtn = this.element.querySelector('[data-action="close"]');
		if (closeBtn) {
			closeBtn.addEventListener("click", () => this.close());
		}
	}

	async open(): Promise<void> {
		if (this.isOpen || this.isAnimating) return;

		this.isAnimating = true;

		// Create backdrop
		this.createBackdrop();

		// Show modal
		this.element.classList.add("open");
		this.element.style.display = "block";

		// Animate
		await this.animateIn();

		this.isOpen = true;
		this.isAnimating = false;

		// Callback
		this.options.onOpen();

		if (this.options.preventScroll) {
			document.body.style.overflow = "hidden";
		}
	}

	async close(): Promise<void> {
		if (!this.isOpen || this.isAnimating) return;

		this.isAnimating = true;

		// Animate out
		await this.animateOut();

		// Hide modal
		this.element.classList.remove("open");
		this.element.style.display = "none";

		// Remove backdrop
		if (this.backdrop) {
			this.backdrop.remove();
			this.backdrop = null;
		}

		this.isOpen = false;
		this.isAnimating = false;

		// Callback
		this.options.onClose();

		if (this.options.preventScroll) {
			document.body.style.overflow = "";
		}
	}

	private createBackdrop(): void {
		if (this.backdrop) return;

		this.backdrop = document.createElement("div");
		this.backdrop.className = "modal-overlay";
		this.backdrop.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-color: rgba(0, 0, 0, ${this.options.opacity});
      z-index: 999;
      animation: fadeIn ${this.options.inDuration}ms ease-in-out;
    `;

		this.backdrop.addEventListener("click", () => this.close());
		document.body.appendChild(this.backdrop);
	}

	private animateIn(): Promise<void> {
		return new Promise((resolve) => {
			this.element.style.animation = `slideIn ${this.options.inDuration}ms ease-out`;
			setTimeout(resolve, this.options.inDuration);
		});
	}

	private animateOut(): Promise<void> {
		return new Promise((resolve) => {
			this.element.style.animation = `fadeOut ${this.options.outDuration}ms ease-in`;
			setTimeout(resolve, this.options.outDuration);
		});
	}

	destroy(): void {
		if (this.backdrop) {
			this.backdrop.remove();
		}
		this.element.classList.remove("open");
	}
}

// Convenience function
export function createModal(selector: string, options?: ModalOptions): Modal {
	const element = document.querySelector(selector) as HTMLElement;
	if (!element) {
		throw new Error(`Modal element not found: ${selector}`);
	}
	return new Modal(element, options);
}
