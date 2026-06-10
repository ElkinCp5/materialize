# 04. SISTEMA DE VARIABLES DE COLORES CSS

## Objetivos
- Permitir personalización de colores sin recompilar SCSS
- Soporte para múltiples temas (light, dark, custom)
- Accesibilidad (WCAG 2.1 AA contrast ratios)
- Performance (uso de CSS Custom Properties)

---

## 1. Estructura de Variables de Color

### 1.1 Paleta Principal

```css
:root {
  /* Primary Colors */
  --mz-primary: #ee6e73;
  --mz-primary-light: #f3989b;
  --mz-primary-lighter: #ffcccc;
  --mz-primary-dark: #d0181e;
  --mz-primary-darker: #8b1014;
  
  /* Secondary Colors */
  --mz-secondary: #26a69a;
  --mz-secondary-light: #4db6ac;
  --mz-secondary-lighter: #80cbc4;
  --mz-secondary-dark: #00897b;
  --mz-secondary-darker: #004d40;
  
  /* Semantic Colors */
  --mz-success: #4caf50;
  --mz-success-light: #81c784;
  --mz-success-dark: #2e7d32;
  
  --mz-warning: #ff9800;
  --mz-warning-light: #ffb74d;
  --mz-warning-dark: #f57c00;
  
  --mz-danger: #f44336;
  --mz-danger-light: #ef5350;
  --mz-danger-dark: #c62828;
  
  --mz-info: #2196f3;
  --mz-info-light: #64b5f6;
  --mz-info-dark: #1565c0;
}
```

### 1.2 Escala de Grises

```css
:root {
  /* Grayscale - Light Mode */
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
  
  /* Aliases */
  --mz-color-white: #ffffff;
  --mz-color-black: #000000;
}
```

---

## 2. Tema Light (Por defecto)

```css
:root,
[data-theme="light"] {
  /* Background Colors */
  --mz-bg-primary: #ffffff;
  --mz-bg-secondary: #fafafa;
  --mz-bg-tertiary: #f5f5f5;
  
  /* Text Colors */
  --mz-text-primary: #212121;
  --mz-text-secondary: #666666;
  --mz-text-tertiary: #999999;
  --mz-text-disabled: #bdbdbd;
  --mz-text-inverse: #ffffff;
  
  /* Border Colors */
  --mz-border-primary: #e0e0e0;
  --mz-border-secondary: #f0f0f0;
  --mz-border-focus: #2196f3;
  
  /* Component Backgrounds */
  --mz-bg-overlay: rgba(0, 0, 0, 0.5);
  --mz-bg-backdrop: rgba(0, 0, 0, 0.3);
}
```

---

## 3. Tema Dark

```css
[data-theme="dark"] {
  /* Primary Colors - Adjusted for dark mode */
  --mz-primary: #f3989b;
  --mz-primary-light: #ffcccc;
  --mz-primary-dark: #c62828;
  
  /* Secondary Colors */
  --mz-secondary: #80cbc4;
  --mz-secondary-light: #b2dfdb;
  --mz-secondary-dark: #004d40;
  
  /* Background Colors */
  --mz-bg-primary: #121212;
  --mz-bg-secondary: #1e1e1e;
  --mz-bg-tertiary: #2c2c2c;
  
  /* Text Colors */
  --mz-text-primary: #ffffff;
  --mz-text-secondary: #b3b3b3;
  --mz-text-tertiary: #808080;
  --mz-text-disabled: #5a5a5a;
  --mz-text-inverse: #212121;
  
  /* Border Colors */
  --mz-border-primary: #3f3f3f;
  --mz-border-secondary: #2c2c2c;
  --mz-border-focus: #64b5f6;
  
  /* Component Backgrounds */
  --mz-bg-overlay: rgba(0, 0, 0, 0.8);
  --mz-bg-backdrop: rgba(0, 0, 0, 0.6);
  
  /* Grayscale - Dark Mode */
  --mz-gray-50: #2a2a2a;
  --mz-gray-100: #383838;
  --mz-gray-200: #424242;
  --mz-gray-300: #4a4a4a;
  --mz-gray-400: #616161;
  --mz-gray-500: #757575;
  --mz-gray-600: #9e9e9e;
  --mz-gray-700: #bdbdbd;
  --mz-gray-800: #e0e0e0;
  --mz-gray-900: #f5f5f5;
}
```

---

## 4. Tema Automático (prefers-color-scheme)

```css
@media (prefers-color-scheme: dark) {
  :root:not([data-theme]) {
    color-scheme: dark;
    
    --mz-primary: #f3989b;
    --mz-bg-primary: #121212;
    --mz-bg-secondary: #1e1e1e;
    --mz-text-primary: #ffffff;
    /* ... más variables */
  }
}

@media (prefers-color-scheme: light) {
  :root:not([data-theme]) {
    color-scheme: light;
    
    --mz-primary: #ee6e73;
    --mz-bg-primary: #ffffff;
    --mz-bg-secondary: #fafafa;
    --mz-text-primary: #212121;
    /* ... más variables */
  }
}
```

---

## 5. Variables de Tipografía

```css
:root {
  /* Font Families */
  --mz-font-family-base: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, 
                         "Helvetica Neue", Arial, sans-serif, "Apple Color Emoji";
  --mz-font-family-monospace: SFMono-Regular, Menlo, Monaco, Consolas, 
                              "Liberation Mono", "Courier New", monospace;
  
  /* Font Sizes */
  --mz-font-size-xs: 12px;
  --mz-font-size-sm: 14px;
  --mz-font-size-base: 14px;
  --mz-font-size-lg: 16px;
  --mz-font-size-xl: 18px;
  --mz-font-size-2xl: 20px;
  --mz-font-size-3xl: 24px;
  --mz-font-size-4xl: 28px;
  --mz-font-size-5xl: 32px;
  
  /* Font Weights */
  --mz-font-weight-light: 300;
  --mz-font-weight-normal: 400;
  --mz-font-weight-medium: 500;
  --mz-font-weight-semibold: 600;
  --mz-font-weight-bold: 700;
  
  /* Line Heights */
  --mz-line-height-tight: 1.25;
  --mz-line-height-normal: 1.5;
  --mz-line-height-relaxed: 1.75;
  --mz-line-height-loose: 2;
}
```

---

## 6. Variables de Espaciado

```css
:root {
  /* Spacing Scale (4px base) */
  --mz-spacing-xs: 4px;
  --mz-spacing-sm: 8px;
  --mz-spacing-md: 16px;
  --mz-spacing-lg: 24px;
  --mz-spacing-xl: 32px;
  --mz-spacing-2xl: 48px;
  --mz-spacing-3xl: 64px;
  
  /* Component-specific spacing */
  --mz-btn-padding-x: var(--mz-spacing-md);
  --mz-btn-padding-y: var(--mz-spacing-sm);
  --mz-btn-font-size: var(--mz-font-size-base);
  --mz-btn-border-radius: var(--mz-border-radius-md);
  
  --mz-input-padding-x: var(--mz-spacing-md);
  --mz-input-padding-y: var(--mz-spacing-sm);
  --mz-input-font-size: var(--mz-font-size-base);
  --mz-input-border-radius: var(--mz-border-radius-sm);
  
  --mz-card-padding: var(--mz-spacing-lg);
  --mz-card-margin-bottom: var(--mz-spacing-lg);
  --mz-card-border-radius: var(--mz-border-radius-md);
}
```

---

## 7. Variables de Bordes y Esquinas

```css
:root {
  /* Border Radius */
  --mz-border-radius-sm: 2px;
  --mz-border-radius-md: 4px;
  --mz-border-radius-lg: 8px;
  --mz-border-radius-xl: 12px;
  --mz-border-radius-full: 50%;
  
  /* Border Widths */
  --mz-border-width: 1px;
  --mz-border-width-thick: 2px;
  --mz-border-width-thicker: 3px;
  
  /* Border Styles */
  --mz-border-style: solid;
}
```

---

## 8. Variables de Sombras

```css
:root {
  /* Elevation/Shadows */
  --mz-shadow-xs: 0 1px 2px rgba(0, 0, 0, 0.05);
  --mz-shadow-sm: 0 1px 3px rgba(0, 0, 0, 0.12), 
                  0 1px 2px rgba(0, 0, 0, 0.24);
  --mz-shadow-md: 0 3px 6px rgba(0, 0, 0, 0.15), 
                  0 2px 4px rgba(0, 0, 0, 0.12);
  --mz-shadow-lg: 0 10px 20px rgba(0, 0, 0, 0.15), 
                  0 3px 6px rgba(0, 0, 0, 0.10);
  --mz-shadow-xl: 0 15px 35px rgba(0, 0, 0, 0.2), 
                  0 5px 15px rgba(0, 0, 0, 0.1);
  --mz-shadow-2xl: 0 20px 40px rgba(0, 0, 0, 0.2);
  
  /* Inset Shadows */
  --mz-shadow-inner: inset 0 1px 2px rgba(0, 0, 0, 0.06);
  
  /* No Shadow */
  --mz-shadow-none: none;
}
```

---

## 9. Variables de Transiciones

```css
:root {
  /* Durations */
  --mz-transition-duration-fast: 150ms;
  --mz-transition-duration-base: 300ms;
  --mz-transition-duration-slow: 500ms;
  --mz-transition-duration-slower: 1000ms;
  
  /* Timing Functions */
  --mz-transition-timing-ease: ease;
  --mz-transition-timing-linear: linear;
  --mz-transition-timing-ease-in: ease-in;
  --mz-transition-timing-ease-out: ease-out;
  --mz-transition-timing-ease-in-out: ease-in-out;
  --mz-transition-timing-cubic: cubic-bezier(0.4, 0, 0.2, 1);
  
  /* Common Transitions */
  --mz-transition-base: all var(--mz-transition-duration-base) 
                            var(--mz-transition-timing-ease);
  --mz-transition-fade: opacity var(--mz-transition-duration-base) 
                                   var(--mz-transition-timing-ease);
  --mz-transition-transform: transform var(--mz-transition-duration-base) 
                                        var(--mz-transition-timing-ease);
}
```

---

## 10. Variables de Z-Index

```css
:root {
  --mz-z-negative: -1;
  --mz-z-base: 0;
  --mz-z-dropdown: 1000;
  --mz-z-sticky: 1020;
  --mz-z-fixed: 1030;
  --mz-z-modal-backdrop: 1040;
  --mz-z-modal: 1050;
  --mz-z-popover: 1060;
  --mz-z-tooltip: 1070;
}
```

---

## 11. Variables de Breakpoints

```css
:root {
  --mz-breakpoint-xs: 0;
  --mz-breakpoint-sm: 600px;
  --mz-breakpoint-md: 992px;
  --mz-breakpoint-lg: 1200px;
  --mz-breakpoint-xl: 1400px;
}
```

---

## 12. Archivo SCSS que Use las Variables

```scss
// sass/components/_buttons.scss
.btn {
  display: inline-block;
  padding: var(--mz-btn-padding-y) var(--mz-btn-padding-x);
  font-size: var(--mz-btn-font-size);
  font-weight: var(--mz-font-weight-medium);
  color: var(--mz-text-primary);
  background-color: var(--mz-bg-secondary);
  border: var(--mz-border-width) solid var(--mz-border-primary);
  border-radius: var(--mz-btn-border-radius);
  cursor: pointer;
  transition: var(--mz-transition-base);
  
  &:hover {
    background-color: var(--mz-primary-light);
    color: white;
  }
  
  &:focus {
    outline: 2px solid var(--mz-primary);
    outline-offset: 2px;
  }
}

.btn-primary {
  background-color: var(--mz-primary);
  color: white;
  
  &:hover {
    background-color: var(--mz-primary-dark);
  }
}

.btn-secondary {
  background-color: var(--mz-secondary);
  color: white;
  
  &:hover {
    background-color: var(--mz-secondary-dark);
  }
}

// ... más componentes
```

---

## 13. Implementación en HTML

```html
<!DOCTYPE html>
<html lang="es" data-theme="light">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Materialize v2</title>
  <link rel="stylesheet" href="dist/css/materialize.css">
</head>
<body>
  <button id="theme-toggle" class="btn btn-primary">
    <i class="icon-moon"></i> Dark Mode
  </button>
  
  <button class="btn btn-primary">Primary Button</button>
  <button class="btn btn-secondary">Secondary Button</button>
  <button class="btn btn-success">Success Button</button>
  
  <script src="dist/js/materialize.js"></script>
  <script>
    // Theme Toggle
    const toggle = document.getElementById('theme-toggle');
    const html = document.documentElement;
    
    const savedTheme = localStorage.getItem('theme') || 'light';
    html.setAttribute('data-theme', savedTheme);
    
    toggle.addEventListener('click', () => {
      const current = html.getAttribute('data-theme');
      const next = current === 'light' ? 'dark' : 'light';
      html.setAttribute('data-theme', next);
      localStorage.setItem('theme', next);
    });
  </script>
</body>
</html>
```

---

## 14. Archivos de Configuración

### Archivo: `sass/_css-variables.scss`
```scss
// Importar desde aquí en materialize.scss
@import 'components/css-variables';
```

### Archivo: `sass/components/_css-variables.scss`
```scss
// Incluir todas las variables CSS del paso 1-11
// Este es un archivo SCSS puro que genera CSS Variables
```

---

## 15. Ventajas del Sistema

✅ **Personalización sin recompilación**
✅ **Soporte para múltiples temas**
✅ **Dark mode automático**
✅ **Consistencia de diseño**
✅ **Mantenimiento centralizado**
✅ **Accesibilidad mejorada**
✅ **Performance óptimo**
✅ **Compatible con herramientas de diseño**

---

## 16. Guía de Uso

### Cambiar colores por defecto
```javascript
// En tiempo de ejecución
document.documentElement.style.setProperty('--mz-primary', '#0066cc');
```

### Crear tema personalizado
```html
<style>
  [data-theme="corporate"] {
    --mz-primary: #003399;
    --mz-secondary: #ff6600;
    --mz-success: #009900;
  }
</style>
```

### Guardar preferencia del usuario
```javascript
const userTheme = {
  primary: '#0066cc',
  secondary: '#ff6600',
};

localStorage.setItem('customTheme', JSON.stringify(userTheme));

// Restaurar
const theme = JSON.parse(localStorage.getItem('customTheme'));
Object.entries(theme).forEach(([key, value]) => {
  document.documentElement.style.setProperty(`--mz-${key}`, value);
});
```

