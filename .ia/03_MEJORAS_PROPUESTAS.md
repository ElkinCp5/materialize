# 03. MEJORAS PROPUESTAS PARA MATERIALIZE

## Visión: Materialize v2 - Framework CSS moderno, accesible y completo

---

## 1. Mejoras Críticas (P0 - Implementar Primero)

### 1.1 Sistema de Variables CSS

**Problema**: Colores y estilos hardcodeados, no personalizables en runtime.

**Solución Propuesta**:
```css
/* New: sass/components/_css-variables.scss */

:root {
  /* Color System */
  --mz-primary: #ee6e73;
  --mz-primary-light: #f3989b;
  --mz-primary-dark: #d0181e;
  
  --mz-secondary: #26a69a;
  --mz-secondary-light: #4db6ac;
  --mz-secondary-dark: #00897b;
  
  --mz-success: #4caf50;
  --mz-warning: #ff9800;
  --mz-danger: #f44336;
  --mz-info: #2196f3;
  
  /* Grayscale */
  --mz-gray-50: #fafafa;
  --mz-gray-100: #f5f5f5;
  --mz-gray-200: #eeeeee;
  --mz-gray-300: #e0e0e0;
  --mz-gray-400: #bdbdbd;
  --mz-gray-500: #9e9e9e;
  --mz-gray-600: #757575;
  --mz-gray-700: #616161;
  --mz-gray-800: #424242;
  --mz-gray-900: #212121;
  
  /* Typography */
  --mz-font-family-base: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  --mz-font-size-base: 14px;
  --mz-font-size-sm: 12px;
  --mz-font-size-lg: 16px;
  --mz-font-size-xl: 18px;
  
  --mz-font-weight-light: 300;
  --mz-font-weight-normal: 400;
  --mz-font-weight-medium: 500;
  --mz-font-weight-bold: 700;
  
  --mz-line-height-base: 1.5;
  --mz-line-height-compact: 1.25;
  
  /* Spacing */
  --mz-spacing-xs: 4px;
  --mz-spacing-sm: 8px;
  --mz-spacing-md: 16px;
  --mz-spacing-lg: 24px;
  --mz-spacing-xl: 32px;
  --mz-spacing-2xl: 48px;
  
  /* Border Radius */
  --mz-border-radius-sm: 2px;
  --mz-border-radius-md: 4px;
  --mz-border-radius-lg: 8px;
  --mz-border-radius-full: 50%;
  
  /* Shadows (Elevation) */
  --mz-shadow-sm: 0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.24);
  --mz-shadow-md: 0 3px 6px rgba(0, 0, 0, 0.15), 0 2px 4px rgba(0, 0, 0, 0.12);
  --mz-shadow-lg: 0 10px 20px rgba(0, 0, 0, 0.15), 0 3px 6px rgba(0, 0, 0, 0.10);
  
  /* Breakpoints */
  --mz-breakpoint-sm: 600px;
  --mz-breakpoint-md: 992px;
  --mz-breakpoint-lg: 1200px;
  
  /* Z-Index */
  --mz-z-dropdown: 1000;
  --mz-z-sticky: 1020;
  --mz-z-fixed: 1030;
  --mz-z-modal: 1040;
  --mz-z-popover: 1050;
  --mz-z-tooltip: 1060;
  
  /* Transitions */
  --mz-transition-base: all 0.3s ease;
  --mz-transition-fade: opacity 0.3s ease;
}

/* Dark Mode */
[data-theme="dark"] {
  --mz-primary: #f3989b;
  --mz-secondary: #4db6ac;
  --mz-body-bg: #121212;
  --mz-body-color: #ffffff;
  --mz-text-muted: #b3b3b3;
}
```

**Impacto**: Permite cambiar tema sin recompilar. Soporte para dark mode automático.

---

### 1.2 Modernizar Build System

**Problema**: Grunt (2017), Babel ES5, sin TypeScript.

**Solución Propuesta**:
```json
{
  "buildTool": "Vite",
  "language": "TypeScript 5",
  "bundler": "esbuild",
  "linter": "Biome",
  "testing": "Vitest + Playwright",
  "nodeVersion": "18+"
}
```

**Cambios en package.json**:
```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "lint": "biome check src/",
    "format": "biome format src/ --write",
    "test": "vitest",
    "test:e2e": "playwright test"
  },
  "devDependencies": {
    "vite": "^5.0.0",
    "typescript": "^5.3.0",
    "sass": "^1.69.0",
    "@biomejs/biome": "^2.4.16",
    "vitest": "^1.0.0",
    "@playwright/test": "^1.40.0"
  }
}
```

**Beneficios**:
- Build 10-100x más rápido
- Hot module replacement (HMR)
- Tree-shaking automático
- TypeScript support
- Mejor testing

---

### 1.3 Agregar Accesibilidad WCAG 2.1 AA

**Problema**: Falta de ARIA, contraste insuficiente, navegación por teclado.

**Solución por componente**:

```html
<!-- Buttons - BEFORE -->
<button class="btn">Click me</button>

<!-- Buttons - AFTER -->
<button class="btn" aria-label="Submit form" data-testid="btn-submit">
  <i class="icon-send" aria-hidden="true"></i>
  Click me
</button>
```

```html
<!-- Modals - BEFORE -->
<div id="modal" class="modal">
  <div class="modal-content">Content</div>
</div>

<!-- Modals - AFTER -->
<div 
  id="modal" 
  class="modal" 
  role="dialog" 
  aria-labelledby="modal-title"
  aria-hidden="true">
  <div class="modal-header">
    <h2 id="modal-title">Modal Title</h2>
    <button aria-label="Close modal" data-dismiss="modal">×</button>
  </div>
  <div class="modal-content">Content</div>
</div>
```

**Verificaciones a agregar**:
- [ ] Contraste mínimo 4.5:1 para texto
- [ ] Contraste 3:1 para gráficos
- [ ] Focus visible en todos los elementos interactivos
- [ ] Navegación solo teclado funcional
- [ ] ARIA labels completos
- [ ] Semantic HTML (button, nav, etc.)
- [ ] Soporte para screen readers

---

### 1.4 Agregar Dark Mode

**Solución**:

```html
<!-- HTML: Selector de tema -->
<button id="theme-toggle" aria-label="Toggle dark mode">
  <i class="icon-moon"></i>
</button>

<script>
// Auto-detect o usar preferencia guardada
const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
const theme = localStorage.getItem('theme') || (prefersDark ? 'dark' : 'light');
document.documentElement.setAttribute('data-theme', theme);
</script>
```

```scss
// SCSS: variables para dark mode
@media (prefers-color-scheme: dark) {
  :root {
    --mz-primary: #f3989b;
    --mz-body-bg: #121212;
    --mz-body-color: #ffffff;
  }
}

/* O manual */
[data-theme="dark"] {
  @import "dark-mode-variables";
}
```

---

## 2. Mejoras Altas (P1 - Segundo Sprint)

### 2.1 Agregar Componentes Faltantes

#### 2.1.1 Alerts
```scss
// New: sass/components/_alert.scss
.alert {
  padding: var(--mz-spacing-md);
  margin-bottom: var(--mz-spacing-md);
  border: 1px solid transparent;
  border-radius: var(--mz-border-radius-md);
  
  &.alert-success { }
  &.alert-warning { }
  &.alert-danger { }
  &.alert-info { }
}
```

#### 2.1.2 Popovers
```scss
// New: sass/components/_popover.scss
.popover {
  position: absolute;
  z-index: var(--mz-z-popover);
  max-width: 276px;
  padding: var(--mz-spacing-md);
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: var(--mz-border-radius-md);
  box-shadow: var(--mz-shadow-lg);
}
```

#### 2.1.3 Offcanvas (Sidebar)
```scss
// New: sass/components/_offcanvas.scss
.offcanvas {
  position: fixed;
  bottom: 0;
  z-index: var(--mz-z-fixed) - 1;
  display: flex;
  flex-direction: column;
  width: 100%;
  max-width: 100%;
  background-color: white;
  visibility: hidden;
}

@media (min-width: 576px) {
  .offcanvas-start { width: 400px; }
  .offcanvas-end { width: 400px; }
}
```

#### 2.1.4 Pagination
```scss
// New: sass/components/_pagination.scss
.pagination {
  display: flex;
  list-style: none;
  padding: 0;
  margin: var(--mz-spacing-md) 0;
  
  .page-link {
    padding: var(--mz-spacing-sm) var(--mz-spacing-md);
    color: var(--mz-primary);
    background: white;
    border: 1px solid #ddd;
    
    &.active {
      background: var(--mz-primary);
      color: white;
      border-color: var(--mz-primary);
    }
  }
}
```

#### 2.1.5 Progress Bars
```scss
// New: sass/components/_progress.scss
.progress {
  height: 4px;
  background: #e0e0e0;
  border-radius: var(--mz-border-radius-sm);
  overflow: hidden;
  
  .progress-bar {
    height: 100%;
    background: var(--mz-primary);
    transition: width 0.6s ease;
  }
}
```

---

### 2.2 Sistema Completo de Utilidades CSS

```scss
// New: sass/utilities/

// _display.scss
.d-none { display: none; }
.d-inline { display: inline; }
.d-inline-block { display: inline-block; }
.d-block { display: block; }
.d-flex { display: flex; }
.d-grid { display: grid; }

// _flexbox.scss
.flex-row { flex-direction: row; }
.flex-column { flex-direction: column; }
.justify-content-start { justify-content: flex-start; }
.justify-content-center { justify-content: center; }
.justify-content-between { justify-content: space-between; }
.align-items-center { align-items: center; }

// ====================================================================
// _spacing.scss (Padding & Margin - COMPLETO)
// ====================================================================
@for $i from 0 through 5 {
  $size: $i * var(--mz-spacing-md);
  
  // Margin - All sides
  .m#{$i} { margin: $size; }
  
  // Margin - Individual sides
  .mt#{$i} { margin-top: $size; }
  .mb#{$i} { margin-bottom: $size; }
  .ml#{$i} { margin-left: $size; }
  .mr#{$i} { margin-right: $size; }
  
  // Margin - Combinations
  .mx#{$i} { margin-left: $size; margin-right: $size; }
  .my#{$i} { margin-top: $size; margin-bottom: $size; }
  
  // Padding - All sides
  .p#{$i} { padding: $size; }
  
  // Padding - Individual sides
  .pt#{$i} { padding-top: $size; }
  .pb#{$i} { padding-bottom: $size; }
  .pl#{$i} { padding-left: $size; }
  .pr#{$i} { padding-right: $size; }
  
  // Padding - Combinations
  .px#{$i} { padding-left: $size; padding-right: $size; }
  .py#{$i} { padding-top: $size; padding-bottom: $size; }
}

// ====================================================================
// _border.scss
// ====================================================================
.border { border: var(--mz-border-width) solid var(--mz-border-primary); }
.border-top { border-top: var(--mz-border-width) solid var(--mz-border-primary); }
.border-right { border-right: var(--mz-border-width) solid var(--mz-border-primary); }
.border-bottom { border-bottom: var(--mz-border-width) solid var(--mz-border-primary); }
.border-left { border-left: var(--mz-border-width) solid var(--mz-border-primary); }

.rounded { border-radius: var(--mz-border-radius-md); }
.rounded-sm { border-radius: var(--mz-border-radius-sm); }
.rounded-lg { border-radius: var(--mz-border-radius-lg); }
.rounded-top { border-radius: var(--mz-border-radius-md) var(--mz-border-radius-md) 0 0; }
.rounded-circle { border-radius: 50%; }

// ====================================================================
// _shadow.scss (CON HOVER EFFECTS)
// ====================================================================
.shadow-none { box-shadow: none; }
.shadow-sm { box-shadow: var(--mz-shadow-sm); }
.shadow-md { box-shadow: var(--mz-shadow-md); }
.shadow-lg { box-shadow: var(--mz-shadow-lg); }
.shadow-xl { box-shadow: var(--mz-shadow-xl); }

// Shadow Hover Effects
.shadow-sm-hover {
  transition: box-shadow var(--mz-transition-duration-base) var(--mz-transition-timing-ease);
  
  &:hover {
    box-shadow: var(--mz-shadow-md);
  }
}

.shadow-lg-hover {
  transition: box-shadow var(--mz-transition-duration-base) var(--mz-transition-timing-ease);
  
  &:hover {
    box-shadow: var(--mz-shadow-lg);
  }
}

// ====================================================================
// _color.scss (Background Colors as Utilities)
// ====================================================================
.bg-primary { background-color: var(--mz-primary); }
.bg-primary:hover { background-color: var(--mz-primary-dark); }

.bg-secondary { background-color: var(--mz-secondary); }
.bg-secondary:hover { background-color: var(--mz-secondary-dark); }

.bg-success { background-color: var(--mz-success); }
.bg-success:hover { background-color: darken(var(--mz-success), 10%); }

.bg-warning { background-color: var(--mz-warning); }
.bg-warning:hover { background-color: darken(var(--mz-warning), 10%); }

.bg-danger { background-color: var(--mz-danger); }
.bg-danger:hover { background-color: var(--mz-danger-dark); }

.bg-info { background-color: var(--mz-info); }
.bg-info:hover { background-color: var(--mz-info-dark); }

.bg-light { background-color: var(--mz-gray-100); }
.bg-light:hover { background-color: var(--mz-gray-200); }

.bg-dark { background-color: var(--mz-gray-900); }
.bg-dark:hover { background-color: var(--mz-gray-800); }

// ====================================================================
// _text.scss (COMPLETO)
// ====================================================================
.text-primary { color: var(--mz-primary); }
.text-secondary { color: var(--mz-secondary); }
.text-success { color: var(--mz-success); }
.text-warning { color: var(--mz-warning); }
.text-danger { color: var(--mz-danger); }
.text-info { color: var(--mz-info); }
.text-muted { color: var(--mz-text-tertiary); }

.text-center { text-align: center; }
.text-left { text-align: left; }
.text-right { text-align: right; }
.text-justify { text-align: justify; }

.fw-light { font-weight: var(--mz-font-weight-light); }
.fw-normal { font-weight: var(--mz-font-weight-normal); }
.fw-medium { font-weight: var(--mz-font-weight-medium); }
.fw-bold { font-weight: var(--mz-font-weight-bold); }

.text-truncate { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.text-break { word-break: break-word; }
.text-uppercase { text-transform: uppercase; }
.text-lowercase { text-transform: lowercase; }
.text-capitalize { text-transform: capitalize; }

// ====================================================================
// _opacity.scss (COMPLETO)
// ====================================================================
.opacity-0 { opacity: 0; }
.opacity-10 { opacity: 0.1; }
.opacity-20 { opacity: 0.2; }
.opacity-25 { opacity: 0.25; }
.opacity-30 { opacity: 0.3; }
.opacity-40 { opacity: 0.4; }
.opacity-50 { opacity: 0.5; }
.opacity-60 { opacity: 0.6; }
.opacity-70 { opacity: 0.7; }
.opacity-75 { opacity: 0.75; }
.opacity-80 { opacity: 0.8; }
.opacity-90 { opacity: 0.9; }
.opacity-100 { opacity: 1; }

// Opacity Hover Effects
.opacity-hover {
  transition: opacity var(--mz-transition-duration-base) var(--mz-transition-timing-ease);
  
  &:hover {
    opacity: 0.8;
  }
}

// ====================================================================
// _animations.scss (NUEVO - KEYFRAMES + CLASES)
// ====================================================================
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideIn {
  from {
    transform: translateY(20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

@keyframes slideInLeft {
  from {
    transform: translateX(-20px);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

@keyframes slideInRight {
  from {
    transform: translateX(20px);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

// Animation Classes
.animate-fade-in {
  animation: fadeIn var(--mz-transition-duration-base) var(--mz-transition-timing-ease);
}

.animate-slide-in {
  animation: slideIn var(--mz-transition-duration-base) var(--mz-transition-timing-ease);
}

.animate-slide-in-left {
  animation: slideInLeft var(--mz-transition-duration-base) var(--mz-transition-timing-ease);
}

.animate-slide-in-right {
  animation: slideInRight var(--mz-transition-duration-base) var(--mz-transition-timing-ease);
}

.animate-bounce {
  animation: bounce 1s var(--mz-transition-timing-ease) infinite;
}

.animate-pulse {
  animation: pulse 2s var(--mz-transition-timing-ease) infinite;
}

// Hover Animation Classes
.animate-scale-hover {
  transition: transform var(--mz-transition-duration-base) var(--mz-transition-timing-ease);
  
  &:hover {
    transform: scale(1.05);
  }
}

.animate-shadow-hover {
  transition: box-shadow var(--mz-transition-duration-base) var(--mz-transition-timing-ease),
              transform var(--mz-transition-duration-base) var(--mz-transition-timing-ease);
  
  &:hover {
    box-shadow: var(--mz-shadow-lg);
    transform: translateY(-2px);
  }
}

.animate-color-hover {
  transition: background-color var(--mz-transition-duration-base) var(--mz-transition-timing-ease),
              color var(--mz-transition-duration-base) var(--mz-transition-timing-ease);
  
  &:hover {
    background-color: var(--mz-primary-dark);
    color: white;
  }
}

// ====================================================================
// _transitions.scss (UTILIDADES DE TRANSICIÓN)
// ====================================================================
.transition-all {
  transition: all var(--mz-transition-duration-base) var(--mz-transition-timing-ease);
}

.transition-fade {
  transition: opacity var(--mz-transition-duration-base) var(--mz-transition-timing-ease);
}

.transition-transform {
  transition: transform var(--mz-transition-duration-base) var(--mz-transition-timing-ease);
}

.transition-colors {
  transition: background-color var(--mz-transition-duration-base) var(--mz-transition-timing-ease),
              color var(--mz-transition-duration-base) var(--mz-transition-timing-ease),
              border-color var(--mz-transition-duration-base) var(--mz-transition-timing-ease);
}

.transition-fast {
  transition: all var(--mz-transition-duration-fast) var(--mz-transition-timing-ease);
}

.transition-slow {
  transition: all var(--mz-transition-duration-slow) var(--mz-transition-timing-ease);
}
```

---

### 2.3 Remover Dependencia de jQuery

**Cambio**: Convertir plugins jQuery a ES6 modules.

```javascript
// Before: jQuery
$(document).ready(function() {
  $('.modal').modal();
  $('.sidenav').sidenav();
});

// After: ES6 modules
import { Modal } from './components/Modal.js';
import { Sidenav } from './components/Sidenav.js';

document.querySelectorAll('.modal').forEach(el => {
  new Modal(el).init();
});
```

---

## 3. Mejoras Medias (P2 - Tercera iteración)

### 3.1 Agregar TypeScript
```typescript
// src/components/Modal.ts
export interface ModalOptions {
  opacity?: number;
  duration?: number;
  startingTop?: string;
  endingTop?: string;
  preventScroll?: boolean;
  onOpen?: () => void;
  onClose?: () => void;
}

export class Modal {
  private el: HTMLElement;
  private options: ModalOptions;
  
  constructor(element: HTMLElement, options?: ModalOptions) {
    this.el = element;
    this.options = { ...this.defaults, ...options };
  }
  
  open(): void {
    // Implementation
  }
  
  close(): void {
    // Implementation
  }
}
```

---

### 3.2 Soporte RTL (Right-to-Left)

```scss
[dir="rtl"] {
  .navbar {
    direction: rtl;
    
    .nav-wrapper {
      justify-content: flex-end;
    }
  }
  
  .card {
    direction: rtl;
    text-align: right;
  }
}
```

---

### 3.3 Componentes Responsive

```html
<!-- Embeds Responsivos -->
<div class="ratio ratio-16x9">
  <iframe src="..." title="..."></iframe>
</div>

<div class="ratio ratio-4x3">
  <img src="..." alt="...">
</div>
```

---

## 4. Mejoras de Seguridad

### 4.1 Sanitizar Entrada
```javascript
// Safe DOM manipulation
const sanitize = (str) => {
  const div = document.createElement('div');
  div.textContent = str; // Previene XSS
  return div.innerHTML;
};

// Usage
element.innerHTML = sanitize(userInput);
```

### 4.2 CSRF Protection
```html
<form method="POST">
  <input type="hidden" name="csrf_token" value="{{ csrf_token() }}">
</form>
```

### 4.3 Content Security Policy
```html
<meta http-equiv="Content-Security-Policy" 
      content="default-src 'self'; script-src 'self' 'unsafe-inline';">
```

---

## 5. Mejoras de Performance

### 5.1 Code Splitting
```javascript
// Import lazy
const Modal = lazy(() => import('./components/Modal'));
const Sidenav = lazy(() => import('./components/Sidenav'));
```

### 5.2 Optimizar CSS
```
Antes: 150KB (50KB minified)
Después: 80KB (25KB minified)

- Remover duplicados
- Usar CSS variables en lugar de SCSS repetition
- Purgecss para utilidades no usadas
```

---

## 6. Mejoras de Testing

### 6.1 Unit Testing
```bash
vitest run          # Run all tests
vitest watch        # Watch mode
vitest --coverage   # Generate coverage report
```

### 6.2 E2E Testing
```bash
playwright test
playwright codegen  # Record tests
```

---

## 7. Priorización Recomendada

| Mejora                | Impacto  | Esfuerzo | Prioridad |
| --------------------- | -------- | -------- | --------- |
| CSS Variables         | 🔴 Alto   | 60h      | 1         |
| Build System          | 🔴 Alto   | 40h      | 2         |
| Accesibilidad         | 🔴 Alto   | 100h     | 3         |
| Remover jQuery        | 🔴 Alto   | 80h      | 4         |
| Dark Mode             | 🟡 Medio  | 20h      | 5         |
| Componentes faltantes | 🟡 Medio  | 120h     | 6         |
| Utilidades CSS        | 🟡 Medio  | 40h      | 7         |
| TypeScript            | 🟠 Normal | 80h      | 8         |
| RTL Support           | 🟠 Normal | 30h      | 9         |
| Seguridad             | 🔴 Alto   | 50h      | 10        |

**Total estimado**: ~640 horas

