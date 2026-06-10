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
	onCycleTo?: (current: number) => void;
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
