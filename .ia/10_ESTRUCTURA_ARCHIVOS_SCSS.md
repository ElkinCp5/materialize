# ESTRUCTURA DE ARCHIVOS SCSS - UTILIDADES CSS

## Cómo organizar y crear los archivos SCSS para Materialize v2

---

## Paso 1: Estructura de Carpetas

```
materialize/
├── sass/
│   ├── materialize.scss        (Archivo principal que importa todo)
│   ├── components/
│   │   ├── _css-variables.scss
│   │   ├── _color-variables.scss
│   │   ├── _color-classes.scss
│   │   ├── _buttons.scss
│   │   ├── _cards.scss
│   │   └── ... (componentes existentes)
│   └── utilities/               ← NUEVA CARPETA
│       ├── _display.scss
│       ├── _flexbox.scss
│       ├── _spacing.scss
│       ├── _border.scss
│       ├── _shadow.scss
│       ├── _color.scss
│       ├── _text.scss
│       ├── _opacity.scss
│       ├── _animations.scss
│       ├── _transitions.scss
│       └── _index.scss          (Importa todas las utilidades)
```

---

## Paso 2: Archivo Principal (materialize.scss)

```scss
@charset "UTF-8";

// ====================================================================
// VARIABLES Y CONFIGURACIÓN
// ====================================================================
@import "components/css-variables";
@import "components/color-variables";
@import "components/variables";

// ====================================================================
// RESET Y NORMALIZE
// ====================================================================
@import "components/normalize";

// ====================================================================
// COMPONENTES CORE
// ====================================================================
@import "components/global";
@import "components/color-classes";
@import "components/icons-material-design";
@import "components/grid";

// ====================================================================
// COMPONENTES DE INTERFAZ
// ====================================================================
@import "components/navbar";
@import "components/buttons";
@import "components/cards";
@import "components/badges";
@import "components/chips";

// ... más componentes ...

// ====================================================================
// UTILIDADES CSS (NUEVO)
// ====================================================================
@import "utilities/index";
```

---

## Paso 3: Archivo Índice de Utilidades (utilities/_index.scss)

```scss
// ====================================================================
// UTILITIES INDEX - Import All Utilities
// ====================================================================

@import "display";
@import "flexbox";
@import "spacing";
@import "border";
@import "shadow";
@import "color";
@import "text";
@import "opacity";
@import "animations";
@import "transitions";
```

---

## Paso 4: Crear Cada Archivo de Utilidad

### utilities/_display.scss

```scss
// ====================================================================
// Display Utilities
// ====================================================================

.d-none { display: none; }
.d-inline { display: inline; }
.d-inline-block { display: inline-block; }
.d-block { display: block; }
.d-flex { display: flex; }
.d-grid { display: grid; }
.d-table { display: table; }
.d-table-row { display: table-row; }
.d-table-cell { display: table-cell; }

// Responsive Display
@media (min-width: 600px) {
  .d-sm-none { display: none; }
  .d-sm-inline { display: inline; }
  .d-sm-inline-block { display: inline-block; }
  .d-sm-block { display: block; }
  .d-sm-flex { display: flex; }
  .d-sm-grid { display: grid; }
}

@media (min-width: 992px) {
  .d-md-none { display: none; }
  .d-md-inline { display: inline; }
  .d-md-block { display: block; }
  .d-md-flex { display: flex; }
}

@media (min-width: 1200px) {
  .d-lg-none { display: none; }
  .d-lg-block { display: block; }
  .d-lg-flex { display: flex; }
}
```

### utilities/_flexbox.scss

```scss
// ====================================================================
// Flexbox Utilities
// ====================================================================

.flex-row { flex-direction: row; }
.flex-row-reverse { flex-direction: row-reverse; }
.flex-column { flex-direction: column; }
.flex-column-reverse { flex-direction: column-reverse; }
.flex-wrap { flex-wrap: wrap; }
.flex-nowrap { flex-wrap: nowrap; }
.flex-wrap-reverse { flex-wrap: wrap-reverse; }

// Justify Content
.justify-content-start { justify-content: flex-start; }
.justify-content-end { justify-content: flex-end; }
.justify-content-center { justify-content: center; }
.justify-content-between { justify-content: space-between; }
.justify-content-around { justify-content: space-around; }
.justify-content-evenly { justify-content: space-evenly; }

// Align Items
.align-items-start { align-items: flex-start; }
.align-items-end { align-items: flex-end; }
.align-items-center { align-items: center; }
.align-items-baseline { align-items: baseline; }
.align-items-stretch { align-items: stretch; }

// Align Content
.align-content-start { align-content: flex-start; }
.align-content-end { align-content: flex-end; }
.align-content-center { align-content: center; }
.align-content-between { align-content: space-between; }

// Gap
.gap-1 { gap: var(--mz-spacing-sm); }
.gap-2 { gap: var(--mz-spacing-md); }
.gap-3 { gap: var(--mz-spacing-lg); }
.gap-4 { gap: var(--mz-spacing-xl); }

// Flex Grow/Shrink
.flex-grow { flex-grow: 1; }
.flex-shrink { flex-shrink: 1; }
```

### utilities/_spacing.scss

```scss
// ====================================================================
// Spacing Utilities (Padding & Margin)
// ====================================================================

// Base spacing scale: 0, 1 (4px), 2 (8px), 3 (16px), 4 (24px), 5 (32px)

@for $i from 0 through 5 {
  $size: $i * var(--mz-spacing-md);
  
  // ====== MARGIN ======
  
  // All sides
  .m#{$i} { margin: $size; }
  
  // Individual sides
  .mt#{$i} { margin-top: $size; }
  .mb#{$i} { margin-bottom: $size; }
  .ml#{$i} { margin-left: $size; }
  .mr#{$i} { margin-right: $size; }
  
  // Combinations
  .mx#{$i} { margin-left: $size; margin-right: $size; }
  .my#{$i} { margin-top: $size; margin-bottom: $size; }
  
  // ====== PADDING ======
  
  // All sides
  .p#{$i} { padding: $size; }
  
  // Individual sides
  .pt#{$i} { padding-top: $size; }
  .pb#{$i} { padding-bottom: $size; }
  .pl#{$i} { padding-left: $size; }
  .pr#{$i} { padding-right: $size; }
  
  // Combinations
  .px#{$i} { padding-left: $size; padding-right: $size; }
  .py#{$i} { padding-top: $size; padding-bottom: $size; }
}

// Margin auto (for centering)
.m-auto { margin: auto; }
.mt-auto { margin-top: auto; }
.mb-auto { margin-bottom: auto; }
.ml-auto { margin-left: auto; }
.mr-auto { margin-right: auto; }
.mx-auto { margin-left: auto; margin-right: auto; }
.my-auto { margin-top: auto; margin-bottom: auto; }
```

### utilities/_opacity.scss

```scss
// ====================================================================
// Opacity Utilities
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
  cursor: pointer;
  
  &:hover {
    opacity: 0.75;
  }
}

.opacity-50-hover {
  transition: opacity var(--mz-transition-duration-base) var(--mz-transition-timing-ease);
  
  &:hover {
    opacity: 0.5;
  }
}
```

### utilities/_shadow.scss

```scss
// ====================================================================
// Shadow Utilities (con Hover Effects)
// ====================================================================

.shadow-none { box-shadow: none; }
.shadow-sm { box-shadow: var(--mz-shadow-sm); }
.shadow-md { box-shadow: var(--mz-shadow-md); }
.shadow-lg { box-shadow: var(--mz-shadow-lg); }
.shadow-xl { box-shadow: var(--mz-shadow-xl); }

// Shadow with Hover Effects
.shadow-sm-hover {
  box-shadow: var(--mz-shadow-sm);
  transition: box-shadow var(--mz-transition-duration-base) var(--mz-transition-timing-ease);
  
  &:hover {
    box-shadow: var(--mz-shadow-md);
  }
}

.shadow-md-hover {
  box-shadow: var(--mz-shadow-md);
  transition: box-shadow var(--mz-transition-duration-base) var(--mz-transition-timing-ease);
  
  &:hover {
    box-shadow: var(--mz-shadow-lg);
  }
}

.shadow-lg-hover {
  box-shadow: var(--mz-shadow-lg);
  transition: box-shadow var(--mz-transition-duration-base) var(--mz-transition-timing-ease);
  
  &:hover {
    box-shadow: var(--mz-shadow-xl);
  }
}

// Inset Shadow
.shadow-inner { box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.06); }
```

### utilities/_color.scss

```scss
// ====================================================================
// Background Color Utilities (con Hover)
// ====================================================================

.bg-primary {
  background-color: var(--mz-primary);
  transition: background-color var(--mz-transition-duration-base) ease;
  
  &:hover {
    background-color: var(--mz-primary-dark);
  }
}

.bg-secondary {
  background-color: var(--mz-secondary);
  
  &:hover {
    background-color: var(--mz-secondary-dark);
  }
}

.bg-success {
  background-color: var(--mz-success);
  transition: background-color var(--mz-transition-duration-base) ease;
  
  &:hover {
    background-color: darken(var(--mz-success), 15%);
  }
}

.bg-warning {
  background-color: var(--mz-warning);
  transition: background-color var(--mz-transition-duration-base) ease;
  
  &:hover {
    background-color: darken(var(--mz-warning), 15%);
  }
}

.bg-danger {
  background-color: var(--mz-danger);
  transition: background-color var(--mz-transition-duration-base) ease;
  
  &:hover {
    background-color: var(--mz-danger-dark);
  }
}

.bg-info {
  background-color: var(--mz-info);
  transition: background-color var(--mz-transition-duration-base) ease;
  
  &:hover {
    background-color: var(--mz-info-dark);
  }
}

.bg-light {
  background-color: var(--mz-gray-100);
  transition: background-color var(--mz-transition-duration-base) ease;
  
  &:hover {
    background-color: var(--mz-gray-200);
  }
}

.bg-dark {
  background-color: var(--mz-gray-900);
  transition: background-color var(--mz-transition-duration-base) ease;
  
  &:hover {
    background-color: var(--mz-gray-800);
  }
}

.bg-white {
  background-color: white;
}

.bg-transparent {
  background-color: transparent;
}
```

### utilities/_text.scss

```scss
// ====================================================================
// Text Utilities
// ====================================================================

// Text Colors
.text-primary { color: var(--mz-primary); }
.text-secondary { color: var(--mz-secondary); }
.text-success { color: var(--mz-success); }
.text-warning { color: var(--mz-warning); }
.text-danger { color: var(--mz-danger); }
.text-info { color: var(--mz-info); }
.text-muted { color: var(--mz-text-tertiary); }
.text-white { color: white; }
.text-black { color: black; }

// Text Alignment
.text-start { text-align: start; }
.text-left { text-align: left; }
.text-center { text-align: center; }
.text-right { text-align: right; }
.text-end { text-align: end; }
.text-justify { text-align: justify; }

// Font Weight
.fw-light { font-weight: var(--mz-font-weight-light); }
.fw-normal { font-weight: var(--mz-font-weight-normal); }
.fw-medium { font-weight: var(--mz-font-weight-medium); }
.fw-semibold { font-weight: 600; }
.fw-bold { font-weight: var(--mz-font-weight-bold); }
.fw-bolder { font-weight: bolder; }

// Font Size
.fs-sm { font-size: var(--mz-font-size-sm); }
.fs-base { font-size: var(--mz-font-size-base); }
.fs-lg { font-size: var(--mz-font-size-lg); }
.fs-xl { font-size: var(--mz-font-size-xl); }

// Text Transformation
.text-lowercase { text-transform: lowercase; }
.text-uppercase { text-transform: uppercase; }
.text-capitalize { text-transform: capitalize; }

// Text Decoration
.text-decoration-none { text-decoration: none; }
.text-decoration-underline { text-decoration: underline; }

// Text Utilities
.text-truncate {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.text-break { word-break: break-word; }
.text-wrap { word-wrap: break-word; }
.text-nowrap { white-space: nowrap; }

// Line Height
.lh-1 { line-height: 1; }
.lh-sm { line-height: 1.25; }
.lh-base { line-height: 1.5; }
.lh-lg { line-height: 1.75; }
```

### utilities/_animations.scss

```scss
// ====================================================================
// Animation Utilities
// ====================================================================

// ====== KEYFRAMES ======

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes fadeOut {
  from { opacity: 1; }
  to { opacity: 0; }
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

@keyframes slideDown {
  from {
    transform: translateY(-20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
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

@keyframes rotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

@keyframes scale {
  from { transform: scale(0.9); }
  to { transform: scale(1); }
}

// ====== ANIMATION CLASSES ======

.animate-fade-in {
  animation: fadeIn var(--mz-transition-duration-base) var(--mz-transition-timing-ease);
}

.animate-fade-out {
  animation: fadeOut var(--mz-transition-duration-base) var(--mz-transition-timing-ease);
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

.animate-slide-down {
  animation: slideDown var(--mz-transition-duration-base) var(--mz-transition-timing-ease);
}

.animate-bounce {
  animation: bounce 1s var(--mz-transition-timing-ease) infinite;
}

.animate-pulse {
  animation: pulse 2s var(--mz-transition-timing-ease) infinite;
}

.animate-rotate {
  animation: rotate 2s linear infinite;
}

.animate-scale {
  animation: scale var(--mz-transition-duration-base) var(--mz-transition-timing-ease);
}

// ====== HOVER ANIMATIONS ======

.animate-scale-hover {
  transition: transform var(--mz-transition-duration-base) ease;
  
  &:hover {
    transform: scale(1.05);
  }
}

.animate-shadow-hover {
  transition: box-shadow var(--mz-transition-duration-base) ease,
              transform var(--mz-transition-duration-base) ease;
  
  &:hover {
    box-shadow: var(--mz-shadow-lg);
    transform: translateY(-2px);
  }
}

.animate-color-hover {
  transition: background-color var(--mz-transition-duration-base) ease,
              color var(--mz-transition-duration-base) ease;
  
  &:hover {
    background-color: var(--mz-primary-dark);
    color: white;
  }
}

.animate-fade-hover {
  transition: opacity var(--mz-transition-duration-base) ease;
  
  &:hover {
    opacity: 0.75;
  }
}
```

### utilities/_transitions.scss

```scss
// ====================================================================
// Transition Utilities
// ====================================================================

.transition-none { transition: none; }

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

.transition-shadow {
  transition: box-shadow var(--mz-transition-duration-base) var(--mz-transition-timing-ease);
}

// Duration Variants
.transition-fast {
  transition: all var(--mz-transition-duration-fast) var(--mz-transition-timing-ease);
}

.transition-normal {
  transition: all var(--mz-transition-duration-base) var(--mz-transition-timing-ease);
}

.transition-slow {
  transition: all var(--mz-transition-duration-slow) var(--mz-transition-timing-ease);
}

// Timing Function Variants
.transition-ease-in {
  transition: all var(--mz-transition-duration-base) ease-in;
}

.transition-ease-out {
  transition: all var(--mz-transition-duration-base) ease-out;
}

.transition-ease-in-out {
  transition: all var(--mz-transition-duration-base) ease-in-out;
}

.transition-linear {
  transition: all var(--mz-transition-duration-base) linear;
}
```

---

## Paso 5: Compilar y Verificar

```bash
# Compilar SCSS
sass sass/materialize.scss dist/css/materialize.css

# Minificar
sass sass/materialize.scss dist/css/materialize.min.css --style compressed

# Verificar que las utilidades estén presentes
grep -c "\.p[0-5]" dist/css/materialize.css      # Debe mostrar count
grep -c "\.m[0-5]" dist/css/materialize.css      # Debe mostrar count
grep -c "\.opacity" dist/css/materialize.css     # Debe mostrar count
grep -c "\.animate" dist/css/materialize.css     # Debe mostrar count
grep -c "\.bg-" dist/css/materialize.css         # Debe mostrar count
```

---

## Paso 6: Ejemplo de Uso en HTML

```html
<!DOCTYPE html>
<html>
<head>
  <link rel="stylesheet" href="dist/css/materialize.css">
</head>
<body>
  <!-- Usando utilidades CSS -->
  <div class="p3 m2 bg-primary text-white rounded shadow-lg animate-fade-in">
    <h2 class="fw-bold mb2">Título</h2>
    <p class="opacity-75">Texto con opacidad</p>
    <button class="bg-secondary p2 mt2 animate-scale-hover">
      Click me
    </button>
  </div>
</body>
</html>
```

---

**Listo para implementar en Materialize v2! 🚀**

