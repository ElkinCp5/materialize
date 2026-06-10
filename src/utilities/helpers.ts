/**
 * Animation Utilities - Materialize v2.0
 */

export function fadeIn(
	element: HTMLElement,
	duration: number = 300,
): Promise<void> {
	return new Promise((resolve) => {
		element.style.animation = `fadeIn ${duration}ms ease-in-out`;
		setTimeout(resolve, duration);
	});
}

export function fadeOut(
	element: HTMLElement,
	duration: number = 300,
): Promise<void> {
	return new Promise((resolve) => {
		element.style.animation = `fadeOut ${duration}ms ease-in-out`;
		setTimeout(resolve, duration);
	});
}

export function slideIn(
	element: HTMLElement,
	duration: number = 300,
): Promise<void> {
	return new Promise((resolve) => {
		element.style.animation = `slideIn ${duration}ms ease-out`;
		setTimeout(resolve, duration);
	});
}

export function bounce(
	element: HTMLElement,
	duration: number = 1000,
): Promise<void> {
	return new Promise((resolve) => {
		element.style.animation = `bounce ${duration}ms ease-in-out`;
		setTimeout(resolve, duration);
	});
}

/**
 * Helper Utilities
 */

export function throttle<T extends (...args: any[]) => any>(
	func: T,
	delay: number,
): (...args: Parameters<T>) => void {
	let lastCall = 0;
	return (...args: Parameters<T>) => {
		const now = Date.now();
		if (now - lastCall >= delay) {
			lastCall = now;
			func(...args);
		}
	};
}

export function debounce<T extends (...args: any[]) => any>(
	func: T,
	delay: number,
): (...args: Parameters<T>) => void {
	let timeoutId: ReturnType<typeof setTimeout>;
	return (...args: Parameters<T>) => {
		clearTimeout(timeoutId);
		timeoutId = setTimeout(() => func(...args), delay);
	};
}

/**
 * DOM Utilities
 */

export function ready(callback: () => void): void {
	if (document.readyState === "loading") {
		document.addEventListener("DOMContentLoaded", callback);
	} else {
		callback();
	}
}

export function addClass(element: HTMLElement, className: string): void {
	element.classList.add(className);
}

export function removeClass(element: HTMLElement, className: string): void {
	element.classList.remove(className);
}

export function hasClass(element: HTMLElement, className: string): boolean {
	return element.classList.contains(className);
}

export function toggleClass(element: HTMLElement, className: string): void {
	element.classList.toggle(className);
}
