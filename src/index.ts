/**
 * Materialize v2.0 - Main Entry Point
 * Modern Material Design CSS Framework
 *
 * No jQuery, TypeScript, Vite, WCAG 2.1 AA Compliant
 */

// ====================================================================
// CORE EXPORTS
// ====================================================================

// Components
export { Modal, Sidenav, Dropdown, FloatingActionButton, Collapsible, CharacterCounter, Tooltip, Toast, Tabs, Materialbox, ScrollSpy, Autocomplete, Chips, FormSelect, Carousel, Parallax, Pushpin, TapTarget, Slider } from "./components";
// Types
export type { DropdownOptions, ModalOptions, ToastOptions, FloatingActionButtonOptions, CollapsibleOptions, CharacterCounterOptions, TooltipOptions, TabsOptions, MaterialboxOptions, ScrollSpyOptions, AutocompleteOptions, ChipsOptions, FormSelectOptions, CarouselOptions, ParallaxOptions, PushpinOptions, TapTargetOptions, SliderOptions } from "./types";
// Utilities
export { bounce, fadeIn, slideIn } from "./utilities/animations";
export { debounce, throttle } from "./utilities/helpers";

// ====================================================================
// VERSION
// ====================================================================

export const VERSION = "2.0.0";

// ====================================================================
// DEFAULT INITIALIZATION
// ====================================================================

/**
 * Initialize all Materialize components on DOM ready
 */
export function init(): void {
	if (typeof document === "undefined") return;

	// Auto-initialize components
	document.addEventListener("DOMContentLoaded", () => {
		// Component initialization will happen here
		console.log("Materialize v2.0.0 initialized");
	});
}

// Auto-init if DOM is already ready
if (typeof document !== "undefined" && document.readyState === "loading") {
	document.addEventListener("DOMContentLoaded", init);
} else if (typeof document !== "undefined") {
	init();
}
