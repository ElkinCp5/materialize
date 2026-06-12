/**
 * Waves Component - Materialize v2.0
 *
 * Migrated from waves.js (v0.6.4) to TypeScript.
 * Maintains public API: Waves.displayEffect(), Waves.attach()
 * Removes vendor prefixes (-webkit-, -moz-, -ms-, -o-)
 * wrapInput retained with @deprecated notice — remove in v2.1
 */

// ====================================================================
// TYPES
// ====================================================================

export interface WavesOptions {
  duration?: number;
}

interface RipplePosition {
  top: number;
  left: number;
}

// ====================================================================
// TOUCH HANDLER
// Prevents ghost mousedown events after touchend (500ms debounce)
// ====================================================================

const TouchHandler = {
  touches: 0,

  allowEvent(e: Event): boolean {
    let allow = true;

    if (e.type === "touchstart") {
      TouchHandler.touches += 1;
    } else if (e.type === "touchend" || e.type === "touchcancel") {
      setTimeout(() => {
        if (TouchHandler.touches > 0) TouchHandler.touches -= 1;
      }, 500);
    } else if (e.type === "mousedown" && TouchHandler.touches > 0) {
      allow = false;
    }

    return allow;
  },

  touchup(e: Event): void {
    TouchHandler.allowEvent(e);
  },
};

// ====================================================================
// OFFSET HELPER
// ====================================================================

function getOffset(el: HTMLElement): RipplePosition {
  const box = el.getBoundingClientRect();
  return {
    top: box.top + window.pageYOffset - document.documentElement.clientTop,
    left: box.left + window.pageXOffset - document.documentElement.clientLeft,
  };
}

// ====================================================================
// RIPPLE EFFECT
// ====================================================================

const Effect = {
  duration: 750,

  show(e: MouseEvent | TouchEvent, element: HTMLElement): void {
    // Disable right click
    if ((e as MouseEvent).button === 2) return;

    const ripple = document.createElement("div");
    ripple.className = "waves-ripple";
    element.appendChild(ripple);

    const pos = getOffset(element);
    let relativeY: number;
    let relativeX: number;

    if ("touches" in e && e.touches.length > 0) {
      const [touch] = e.touches;
      if (!touch) return;
      relativeY = touch.pageY - pos.top;
      relativeX = touch.pageX - pos.left;
    } else {
      relativeY = (e as MouseEvent).pageY - pos.top;
      relativeX = (e as MouseEvent).pageX - pos.left;
    }

    const scale = `scale(${(element.clientWidth / 100) * 10})`;

    ripple.dataset.hold = String(Date.now());
    ripple.dataset.scale = scale;
    ripple.dataset.x = String(relativeX);
    ripple.dataset.y = String(relativeY);

    // Set initial position without transition
    ripple.classList.add("waves-notransition");
    ripple.style.cssText = `top: ${relativeY}px; left: ${relativeX}px;`;
    ripple.classList.remove("waves-notransition");

    // Animate ripple
    ripple.style.cssText = `
      top: ${relativeY}px;
      left: ${relativeX}px;
      transform: ${scale};
      opacity: 1;
      transition-duration: ${Effect.duration}ms;
      transition-timing-function: cubic-bezier(0.250, 0.460, 0.450, 0.940);
    `;
  },

  hide(e: Event): void {
    TouchHandler.touchup(e);

    const el = e.currentTarget as HTMLElement;
    const ripples = el.getElementsByClassName("waves-ripple");

    if (ripples.length === 0) return;

    const ripple = ripples[ripples.length - 1] as HTMLElement;

    const relativeX = ripple.dataset.x ?? "0";
    const relativeY = ripple.dataset.y ?? "0";
    const scale = ripple.dataset.scale ?? "scale(1)";

    const diff = Date.now() - Number(ripple.dataset.hold ?? 0);
    const delay = Math.max(0, 350 - diff);

    setTimeout(() => {
      ripple.style.cssText = `
        top: ${relativeY}px;
        left: ${relativeX}px;
        opacity: 0;
        transform: ${scale};
        transition-duration: ${Effect.duration}ms;
      `;

      setTimeout(() => {
        ripple.parentNode?.removeChild(ripple);
      }, Effect.duration);
    }, delay);
  },

  /**
   * @deprecated wrapInput will be removed in v2.1.
   * Use a wrapper element with .waves-effect directly instead.
   */
  wrapInput(elements: HTMLCollectionOf<Element> | Element[]): void {
    console.warn(
      "[Materialize] Waves.wrapInput() is deprecated and will be removed in v2.1. " +
        "Wrap <input> elements manually with a .waves-effect parent.",
    );

    Array.from(elements).forEach((el) => {
      const element = el as HTMLElement;
      if (element.tagName.toLowerCase() !== "input") return;

      const parent = element.parentNode as HTMLElement;
      if (
        parent?.tagName.toLowerCase() === "i" &&
        parent.className.includes("waves-effect")
      ) {
        return;
      }

      const wrapper = document.createElement("i");
      wrapper.className = `${element.className} waves-input-wrapper`;

      const elementStyle = element.getAttribute("style") ?? "";
      if (elementStyle) wrapper.setAttribute("style", elementStyle);

      element.className = "waves-button-input";
      element.removeAttribute("style");

      parent.replaceChild(wrapper, element);
      wrapper.appendChild(element);
    });
  },
};

// ====================================================================
// EVENT DELEGATION
// ====================================================================

function getWavesEffectElement(e: Event): HTMLElement | null {
  if (!TouchHandler.allowEvent(e)) return null;

  let target = (e.target || (e as any).srcElement) as HTMLElement | null;

  while (target && target.parentNode !== null) {
    if (
      !(target instanceof SVGElement) &&
      target.classList.contains("waves-effect")
    ) {
      return target;
    }
    target = target.parentNode as HTMLElement;
  }

  return null;
}

function showEffect(e: MouseEvent | TouchEvent): void {
  const element = getWavesEffectElement(e);
  if (!element) return;

  Effect.show(e, element);

  const hideHandler = (evt: Event) => Effect.hide(evt);

  if ("ontouchstart" in window) {
    element.addEventListener("touchend", hideHandler, { once: true });
    element.addEventListener("touchcancel", hideHandler, { once: true });
  }

  element.addEventListener("mouseup", hideHandler, { once: true });
  element.addEventListener("mouseleave", hideHandler, { once: true });
  element.addEventListener("dragend", hideHandler, { once: true });
}

// ====================================================================
// PUBLIC API
// ====================================================================

export const Waves = {
  /**
   * Initialize Waves on all .waves-effect elements.
   * Call once on DOMContentLoaded or framework init.
   */
  displayEffect(options: WavesOptions = {}): void {
    if ("duration" in options && options.duration !== undefined) {
      Effect.duration = options.duration;
    }

    if ("ontouchstart" in window) {
      document.body.addEventListener("touchstart", showEffect as EventListener, {
        passive: true,
      });
    }

    document.body.addEventListener("mousedown", showEffect as EventListener);
  },

  /**
   * Attach Waves directly to a single element.
   * Use for dynamically created elements or inputs.
   */
  attach(element: HTMLElement): void {
    if (element.tagName.toLowerCase() === "input") {
      Effect.wrapInput([element]);
      const parent = element.parentNode as HTMLElement;
      if (parent) {
        Waves.attach(parent);
        return;
      }
    }

    if ("ontouchstart" in window) {
      element.addEventListener("touchstart", showEffect as EventListener, {
        passive: true,
      });
    }

    element.addEventListener("mousedown", showEffect as EventListener);
  },

  /**
   * @deprecated Use manual wrapper instead. Will be removed in v2.1.
   */
  wrapInput(elements: HTMLCollectionOf<Element> | Element[]): void {
    Effect.wrapInput(elements);
  },
};

// ====================================================================
// AUTO-INIT
// ====================================================================

if (typeof document !== "undefined") {
  document.addEventListener("DOMContentLoaded", () => {
    Waves.displayEffect();
  });
}
