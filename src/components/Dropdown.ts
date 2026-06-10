/**
 * Dropdown Component - Materialize v2.0
 *
 * Replacement for jQuery dropdown plugin
 * Uses Vanilla JavaScript + TypeScript
 */

import type { DropdownOptions, IComponent } from "../types";

export class Dropdown implements IComponent {
	private element: HTMLElement; // Trigger element
	private dropdownEl: HTMLElement; // Dropdown content element
	private options: Required<DropdownOptions>;
	private isOpen: boolean = false;
	private focusedIndex: number = -1;

	// Event handler bounds
	private _handleTriggerClickBound: (e: MouseEvent) => void;
	private _handleDropdownClickBound: (e: MouseEvent) => void;
	private _handleMouseEnterBound: () => void;
	private _handleMouseLeaveBound: (e: MouseEvent) => void;
	private _handleDocumentClickBound: (e: MouseEvent) => void;
	private _handleDropdownKeydownBound: (e: KeyboardEvent) => void;
	private _handleTriggerKeydownBound: (e: KeyboardEvent) => void;

	constructor(element: HTMLElement, options?: DropdownOptions) {
		this.element = element;

		// Get target dropdown element from data-target attribute
		const targetId = element.getAttribute("data-target");
		if (!targetId) {
			throw new Error(
				"Dropdown trigger must have a data-target attribute specifying the dropdown content ID.",
			);
		}
		const targetEl = document.getElementById(targetId);
		if (!targetEl) {
			throw new Error(
				`Dropdown content element with ID "${targetId}" not found.`,
			);
		}
		this.dropdownEl = targetEl;

		this.options = {
			alignment: options?.alignment ?? "left",
			autoTrigger: options?.autoTrigger ?? true,
			closeOnClick: options?.closeOnClick ?? true,
			constrainWidth: options?.constrainWidth ?? true,
			container: options?.container ?? document.body,
			coverTrigger: options?.coverTrigger ?? true,
			hover: options?.hover ?? false,
			inDuration: options?.inDuration ?? 150,
			outDuration: options?.outDuration ?? 250,
			onOpen: options?.onOpen ?? (() => {}),
			onClose: options?.onClose ?? (() => {}),
			offset: options?.offset ?? 0,
		};

		// Bind event handlers
		this._handleTriggerClickBound = this._handleTriggerClick.bind(this);
		this._handleDropdownClickBound = this._handleDropdownClick.bind(this);
		this._handleMouseEnterBound = this._handleMouseEnter.bind(this);
		this._handleMouseLeaveBound = this._handleMouseLeave.bind(this);
		this._handleDocumentClickBound = this._handleDocumentClick.bind(this);
		this._handleDropdownKeydownBound = this._handleDropdownKeydown.bind(this);
		this._handleTriggerKeydownBound = this._handleTriggerKeydown.bind(this);

		this.init();
	}

	init(): void {
		this.moveDropdown();
		this.makeDropdownFocusable();
		this.setupEventHandlers();
	}

	private moveDropdown(): void {
		if (
			this.options.container &&
			this.dropdownEl.parentElement !== this.options.container
		) {
			this.options.container.appendChild(this.dropdownEl);
		}
	}

	private makeDropdownFocusable(): void {
		this.dropdownEl.tabIndex = 0;
		const children = this.dropdownEl.children;
		for (let i = 0; i < children.length; i++) {
			const child = children[i] as HTMLElement;
			if (!child.getAttribute("tabindex")) {
				child.setAttribute("tabindex", "0");
			}
		}
	}

	private setupEventHandlers(): void {
		this.element.addEventListener("keydown", this._handleTriggerKeydownBound);
		this.dropdownEl.addEventListener("click", this._handleDropdownClickBound);

		if (this.options.hover) {
			this.element.addEventListener("mouseenter", this._handleMouseEnterBound);
			this.element.addEventListener("mouseleave", this._handleMouseLeaveBound);
			this.dropdownEl.addEventListener(
				"mouseleave",
				this._handleMouseLeaveBound,
			);
		} else {
			this.element.addEventListener("click", this._handleTriggerClickBound);
		}
	}

	private removeEventHandlers(): void {
		this.element.removeEventListener(
			"keydown",
			this._handleTriggerKeydownBound,
		);
		this.dropdownEl.removeEventListener(
			"click",
			this._handleDropdownClickBound,
		);

		if (this.options.hover) {
			this.element.removeEventListener(
				"mouseenter",
				this._handleMouseEnterBound,
			);
			this.element.removeEventListener(
				"mouseleave",
				this._handleMouseLeaveBound,
			);
			this.dropdownEl.removeEventListener(
				"mouseleave",
				this._handleMouseLeaveBound,
			);
		} else {
			this.element.removeEventListener("click", this._handleTriggerClickBound);
		}
	}

	private setupTemporaryEventHandlers(): void {
		document.addEventListener("click", this._handleDocumentClickBound, true);
		this.dropdownEl.addEventListener(
			"keydown",
			this._handleDropdownKeydownBound,
		);
	}

	private removeTemporaryEventHandlers(): void {
		document.removeEventListener("click", this._handleDocumentClickBound, true);
		this.dropdownEl.removeEventListener(
			"keydown",
			this._handleDropdownKeydownBound,
		);
	}

	private _handleTriggerClick(e: MouseEvent): void {
		e.preventDefault();
		this.open();
	}

	private _handleMouseEnter(): void {
		this.open();
	}

	private _handleMouseLeave(e: MouseEvent): void {
		const toEl = e.relatedTarget as HTMLElement;
		if (
			toEl &&
			(toEl.closest(".dropdown-content") === this.dropdownEl ||
				toEl === this.element)
		) {
			return;
		}
		this.close();
	}

	private _handleDocumentClick(e: MouseEvent): void {
		const target = e.target as HTMLElement;
		if (
			this.options.closeOnClick &&
			target.closest(".dropdown-content") === this.dropdownEl
		) {
			setTimeout(() => this.close(), 0);
		} else if (
			target.closest(".dropdown-trigger") !== this.element &&
			target.closest(".dropdown-content") !== this.dropdownEl
		) {
			setTimeout(() => this.close(), 0);
		}
	}

	private _handleTriggerKeydown(e: KeyboardEvent): void {
		if ((e.key === "ArrowDown" || e.key === "Enter") && !this.isOpen) {
			e.preventDefault();
			this.open();
		}
	}

	private _handleDropdownClick(e: MouseEvent): void {
		const target = e.target as HTMLElement;
		const li = target.closest("li");
		if (li && this.options.closeOnClick) {
			this.close();
		}
	}

	private _handleDropdownKeydown(e: KeyboardEvent): void {
		if (e.key === "Tab") {
			e.preventDefault();
			this.close();
		} else if ((e.key === "ArrowDown" || e.key === "ArrowUp") && this.isOpen) {
			e.preventDefault();
			const direction = e.key === "ArrowDown" ? 1 : -1;
			const length = this.dropdownEl.children.length;
			let newIndex = this.focusedIndex;

			do {
				newIndex = (newIndex + direction + length) % length;
			} while (
				(this.dropdownEl.children[newIndex] as HTMLElement).tabIndex === -1 &&
				newIndex !== this.focusedIndex
			);

			this.focusedIndex = newIndex;
			this.focusFocusedItem();
		} else if (e.key === "Enter" && this.isOpen) {
			const focusedEl = this.dropdownEl.children[
				this.focusedIndex
			] as HTMLElement;
			if (focusedEl) {
				const interactive = focusedEl.querySelector("a, button") as HTMLElement;
				if (interactive) {
					interactive.click();
				} else {
					focusedEl.click();
				}
			}
		} else if (e.key === "Escape" && this.isOpen) {
			e.preventDefault();
			this.close();
		}
	}

	private focusFocusedItem(): void {
		if (
			this.focusedIndex >= 0 &&
			this.focusedIndex < this.dropdownEl.children.length
		) {
			const child = this.dropdownEl.children[this.focusedIndex] as HTMLElement;
			child.focus();
		}
	}

	private placeDropdown(): void {
		const triggerRect = this.element.getBoundingClientRect();

		// Width constraint
		let idealWidth = this.options.constrainWidth
			? triggerRect.width
			: this.dropdownEl.getBoundingClientRect().width;
		this.dropdownEl.style.width = `${idealWidth}px`;

		const dropdownRect = this.dropdownEl.getBoundingClientRect();

		// Position calculation
		let left = triggerRect.left;
		if (this.options.alignment === "right") {
			left = triggerRect.right - dropdownRect.width;
		}

		let top = triggerRect.top;
		if (!this.options.coverTrigger) {
			top = triggerRect.bottom;
		}

		// Apply offset
		top += this.options.offset;

		this.dropdownEl.style.left = `${left}px`;
		this.dropdownEl.style.top = `${top}px`;
		this.dropdownEl.style.position = "absolute";
		this.dropdownEl.style.zIndex = "999";
	}

	open(): void {
		if (this.isOpen) return;
		this.isOpen = true;
		this.options.onOpen();

		this.dropdownEl.style.display = "block";
		this.placeDropdown();

		// Animate In (Vite/Vanilla CSS replacement for anime.js)
		this.dropdownEl.style.transition = `opacity ${this.options.inDuration}ms ease-out, transform ${this.options.inDuration}ms ease-out`;
		this.dropdownEl.style.opacity = "0";
		this.dropdownEl.style.transform = "scale(0.9)";

		// Trigger reflow
		this.dropdownEl.offsetHeight;

		this.dropdownEl.style.opacity = "1";
		this.dropdownEl.style.transform = "scale(1)";

		this.setupTemporaryEventHandlers();
	}

	close(): void {
		if (!this.isOpen) return;
		this.isOpen = false;
		this.focusedIndex = -1;
		this.options.onClose();

		this.dropdownEl.style.transition = `opacity ${this.options.outDuration}ms ease-in, transform ${this.options.outDuration}ms ease-in`;
		this.dropdownEl.style.opacity = "0";
		this.dropdownEl.style.transform = "scale(0.9)";

		setTimeout(() => {
			this.dropdownEl.style.display = "none";
			this.dropdownEl.style.transition = "";
			this.dropdownEl.style.transform = "";
			this.dropdownEl.style.opacity = "";
		}, this.options.outDuration);

		this.removeTemporaryEventHandlers();
	}

	destroy(): void {
		this.removeEventHandlers();
		this.removeTemporaryEventHandlers();
		this.dropdownEl.style.cssText = "";
	}
}

// Convenience function
export function createDropdown(
	selector: string,
	options?: DropdownOptions,
): Dropdown {
	const element = document.querySelector(selector) as HTMLElement;
	if (!element) {
		throw new Error(`Dropdown trigger not found: ${selector}`);
	}
	return new Dropdown(element, options);
}
