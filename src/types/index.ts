/**
 * Type Definitions for Materialize v2.0
 */

// ====================================================================
// MODAL
// ====================================================================

export interface ModalOptions {
	opacity?: number;
	duration?: number;
	inDuration?: number;
	outDuration?: number;
	startingTop?: string;
	endingTop?: string;
	preventScroll?: boolean;
	onOpen?: () => void;
	onClose?: () => void;
}

// ====================================================================
// DROPDOWN
// ====================================================================

export interface DropdownOptions {
	alignment?: "left" | "right";
	autoTrigger?: boolean;
	closeOnClick?: boolean;
	constrainWidth?: boolean;
	container?: HTMLElement;
	coverTrigger?: boolean;
	hover?: boolean;
	inDuration?: number;
	offset?: number;
	onClose?: () => void;
	onOpen?: () => void;
	outDuration?: number;
}

// ====================================================================
// TOAST
// ====================================================================

export interface ToastOptions {
	html?: string;
	displayLength?: number;
	inDuration?: number;
	outDuration?: number;
	completeCallback?: () => void;
	activationPercent?: number;
	classes?: string;
}

// ====================================================================
// SIDENAV
// ====================================================================

export interface SidenavOptions {
	edge?: "left" | "right";
	draggable?: boolean;
	inDuration?: number;
	outDuration?: number;
	onOpen?: () => void;
	onClose?: () => void;
	preventScrolling?: boolean;
}

// ====================================================================
// TABS
// ====================================================================

export interface TabsOptions {
	responsiveThreshold?: number;
	swipeable?: boolean;
	onShow?: (tab: HTMLElement) => void;
}

// ====================================================================
// COLLAPSIBLE
// ====================================================================

export interface CollapsibleOptions {
	accordion?: boolean;
	onOpen?: (element: HTMLElement) => void;
	onClose?: (element: HTMLElement) => void;
	inDuration?: number;
	outDuration?: number;
}

// ====================================================================
// CAROUSEL
// ====================================================================

export interface CarouselOptions {
	fullWidth?: boolean;
	indicators?: boolean;
	noWrap?: boolean;
	numVisible?: number;
	shift?: number;
	dist?: number;
	duration?: number;
	padding?: number;
	onCycleTo?: (current: HTMLElement, dragged: boolean) => void;
}

// ====================================================================
// DATEPICKER
// ====================================================================

export interface DatepickerOptions {
	autoClose?: boolean;
	format?: string;
	parse?: (date: string) => Date;
	toString?: (date: Date) => string;
	setDefaultDate?: boolean;
	defaultDate?: Date;
	disableDayFn?: (date: Date) => boolean;
	container?: HTMLElement;
	onSelect?: (date: Date) => void;
	onClose?: () => void;
	firstDay?: 0 | 1;
	minDate?: Date;
	maxDate?: Date;
	yearRange?: number | number[];
	isRTL?: boolean;
	showMonthAfterYear?: boolean;
	showDaysInNextAndPreviousMonths?: boolean;
	enableRipple?: boolean;
	confirmText?: string;
	cancelText?: string;
	todayButton?: boolean;
	clearButton?: boolean;
	ok_label?: string;
	cancel_label?: string;
}

// ====================================================================
// FLOATING ACTION BUTTON (FAB)
// ====================================================================

export interface FloatingActionButtonOptions {
	direction?: 'top' | 'right' | 'bottom' | 'left';
	hoverEnabled?: boolean;
	toolbarEnabled?: boolean;
}

// ====================================================================
// CHARACTER COUNTER
// ====================================================================

export interface CharacterCounterOptions {}

// ====================================================================
// TOOLTIP
// ====================================================================

export interface TooltipOptions {
	exitDelay?: number;
	enterDelay?: number;
	html?: string;
	margin?: number;
	inDuration?: number;
	outDuration?: number;
	position?: 'top' | 'right' | 'bottom' | 'left';
	transitionMovement?: number;
}

// ====================================================================
// MATERIALBOX
// ====================================================================

export interface MaterialboxOptions {
	inDuration?: number;
	outDuration?: number;
	onOpenStart?: (el: HTMLElement) => void;
	onOpenEnd?: (el: HTMLElement) => void;
	onCloseStart?: (el: HTMLElement) => void;
	onCloseEnd?: (el: HTMLElement) => void;
}

// ====================================================================
// PARALLAX
// ====================================================================

export interface ParallaxOptions {
	responsiveThreshold?: number;
}

// ====================================================================
// PUSHPIN
// ====================================================================

export interface PushpinOptions {
	top?: number;
	bottom?: number;
	offset?: number;
	onPositionChange?: (position: 'pinned' | 'pin-top' | 'pin-bottom') => void;
}

// ====================================================================
// SLIDER
// ====================================================================

export interface SliderOptions {
	indicators?: boolean;
	height?: number;
	duration?: number;
	interval?: number;
}

// ====================================================================
// TAP TARGET
// ====================================================================

export interface TapTargetOptions {
	onOpen?: (origin: HTMLElement) => void;
	onClose?: (origin: HTMLElement) => void;
}

// ====================================================================
// FORM SELECT
// ====================================================================

export interface FormSelectOptions {
	classes?: string;
	dropdownOptions?: any; // DropdownOptions
}

// ====================================================================
// AUTOCOMPLETE
// ====================================================================

export interface AutocompleteOptions {
	data?: Record<string, string | null>;
	limit?: number;
	minLength?: number;
	onAutocomplete?: (text: string) => void;
	sortFunction?: (a: string, b: string, inputString: string) => number;
}

// ====================================================================
// CHIPS
// ====================================================================

export interface ChipData {
	tag: string;
	image?: string;
}

export interface ChipsOptions {
	data?: ChipData[];
	placeholder?: string;
	secondaryPlaceholder?: string;
	autocompleteOptions?: any; // AutocompleteOptions
	limit?: number;
	onChipAdd?: (element: HTMLElement, chip: HTMLElement) => void;
	onChipSelect?: (element: HTMLElement, chip: HTMLElement) => void;
	onChipDelete?: (element: HTMLElement, chip: HTMLElement) => void;
}

// ====================================================================
// SCROLLSPY
// ====================================================================

export interface ScrollSpyOptions {
	throttle?: number;
	scrollOffset?: number;
	activeClass?: string;
	getActiveElement?: (id: string) => string;
}

// ====================================================================
// COMPONENT BASE
// ====================================================================

export interface IComponent {
	init(): void;
	destroy(): void;
	open?(): void | Promise<void>;
	close?(): void | Promise<void>;
}

export interface ComponentState {
	isOpen?: boolean;
	isActive?: boolean;
	isAnimating?: boolean;
}
