/**
 * IntersectionObserver Helper - Materialize v2.0
 *
 * Shared observer instance (single per page) with per-element callbacks.
 * Falls back to scroll + getBoundingClientRect when API is unavailable.
 */

export type IntersectionCallback = (isIntersecting: boolean) => void;

export interface ObserveOptions {
  threshold?: number;
  rootMargin?: string;
}

// ====================================================================
// SHARED OBSERVER REGISTRY
// Avoids creating N observers — one instance, many callbacks
// ====================================================================

const registry = new Map<Element, IntersectionCallback>();
let sharedObserver: IntersectionObserver | null = null;

function getSharedObserver(options: ObserveOptions): IntersectionObserver {
  // NOTE: A new observer is created only if options differ.
  // For simplicity, we reuse a single instance with the default threshold.
  if (!sharedObserver) {
    sharedObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const cb = registry.get(entry.target);
          if (cb) cb(entry.isIntersecting);
        });
      },
      {
        threshold: options.threshold ?? 0.1,
        rootMargin: options.rootMargin ?? "0px",
      },
    );
  }
  return sharedObserver;
}

// ====================================================================
// FALLBACK — scroll + getBoundingClientRect
// ====================================================================

interface FallbackEntry {
  element: Element;
  callback: IntersectionCallback;
  threshold: number;
  lastState: boolean | null;
}

const fallbackEntries: FallbackEntry[] = [];
let fallbackListenerAttached = false;

function isElementInViewport(element: Element, threshold: number): boolean {
  const rect = element.getBoundingClientRect();
  const windowHeight =
    window.innerHeight || document.documentElement.clientHeight;
  const windowWidth =
    window.innerWidth || document.documentElement.clientWidth;

  const visibleHeight =
    Math.min(rect.bottom, windowHeight) - Math.max(rect.top, 0);
  const visibleWidth =
    Math.min(rect.right, windowWidth) - Math.max(rect.left, 0);

  if (visibleHeight <= 0 || visibleWidth <= 0) return false;

  const visibleArea = visibleHeight * visibleWidth;
  const totalArea = rect.height * rect.width;

  if (totalArea === 0) return false;

  return visibleArea / totalArea >= threshold;
}

function runFallbackCheck(): void {
  fallbackEntries.forEach((entry) => {
    const isIntersecting = isElementInViewport(
      entry.element,
      entry.threshold,
    );

    if (isIntersecting !== entry.lastState) {
      entry.lastState = isIntersecting;
      entry.callback(isIntersecting);
    }
  });
}

function attachFallbackListener(): void {
  if (fallbackListenerAttached) return;
  fallbackListenerAttached = true;

  window.addEventListener("scroll", runFallbackCheck, { passive: true });
  window.addEventListener("resize", runFallbackCheck, { passive: true });

  // Initial check
  runFallbackCheck();
}

function observeFallback(
  element: Element,
  callback: IntersectionCallback,
  options: ObserveOptions,
): void {
  fallbackEntries.push({
    element,
    callback,
    threshold: options.threshold ?? 0.1,
    lastState: null,
  });

  attachFallbackListener();

  // Initial check for elements already in viewport
  runFallbackCheck();
}

function unobserveFallback(element: Element): void {
  const index = fallbackEntries.findIndex((e) => e.element === element);
  if (index !== -1) fallbackEntries.splice(index, 1);

  if (fallbackEntries.length === 0 && fallbackListenerAttached) {
    window.removeEventListener("scroll", runFallbackCheck);
    window.removeEventListener("resize", runFallbackCheck);
    fallbackListenerAttached = false;
  }
}

// ====================================================================
// PUBLIC API
// ====================================================================

const supportsIntersectionObserver =
  typeof window !== "undefined" && "IntersectionObserver" in window;

/**
 * Observe an element for visibility changes.
 *
 * @param element  - Target DOM element
 * @param callback - Called with `isIntersecting: boolean` on change
 * @param options  - threshold (default: 0.1), rootMargin (default: "0px")
 *
 * @example
 * observe(el, (isIntersecting) => {
 *   if (isIntersecting) el.classList.add('visible');
 * }, { threshold: 0.2 });
 */
export function observe(
  element: Element,
  callback: IntersectionCallback,
  options: ObserveOptions = {},
): void {
  if (supportsIntersectionObserver) {
    registry.set(element, callback);
    getSharedObserver(options).observe(element);
  } else {
    observeFallback(element, callback, options);
  }
}

/**
 * Stop observing an element.
 *
 * @param element - Target DOM element to unobserve
 */
export function unobserve(element: Element): void {
  if (supportsIntersectionObserver) {
    registry.delete(element);
    sharedObserver?.unobserve(element);
  } else {
    unobserveFallback(element);
  }
}

/**
 * Disconnect all observers and clear registry.
 * Use on framework teardown or SPA route changes.
 */
export function disconnectAll(): void {
  if (supportsIntersectionObserver) {
    sharedObserver?.disconnect();
    sharedObserver = null;
    registry.clear();
  } else {
    fallbackEntries.length = 0;
    if (fallbackListenerAttached) {
      window.removeEventListener("scroll", runFallbackCheck);
      window.removeEventListener("resize", runFallbackCheck);
      fallbackListenerAttached = false;
    }
  }
}
