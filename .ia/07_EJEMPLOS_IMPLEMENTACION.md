# EJEMPLOS DE IMPLEMENTACIÓN

## Cómo Usar los Documentos de Análisis

---

## 1. Implementar CSS Variables

### Paso 1: Crear archivo SCSS

**Archivo**: `sass/components/_css-variables.scss`

```scss
// Copiar el contenido completo de 04_VARIABLES_COLORES_CSS.md
// Sección 1-11 contiene todas las variables necesarias

:root {
  /* Copy-paste del documento */
  --mz-primary: #ee6e73;
  --mz-secondary: #26a69a;
  /* ... */
}
```

### Paso 2: Importar en materialize.scss

**Archivo**: `sass/materialize.scss`

```scss
@charset "UTF-8";

// Agregar al inicio
@import "components/css-variables";

// Luego los demás imports
@import "components/color-variables";
@import "components/color-classes";
// ... resto de imports
```

### Paso 3: Usar en componentes

**Ejemplo - Buttons**:

```scss
// sass/components/_buttons.scss
.btn {
  padding: var(--mz-btn-padding-y) var(--mz-btn-padding-x);
  font-size: var(--mz-btn-font-size);
  background-color: var(--mz-bg-secondary);
  border-radius: var(--mz-btn-border-radius);
  transition: var(--mz-transition-base);
  
  &:hover {
    background-color: var(--mz-primary-light);
  }
  
  &:focus {
    outline: 2px solid var(--mz-border-focus);
  }
}

.btn-primary {
  background-color: var(--mz-primary);
  color: white;
  
  &:hover {
    background-color: var(--mz-primary-dark);
  }
}
```

### Paso 4: Compilar y verificar

```bash
# Compilar SCSS
sass sass/materialize.scss dist/css/materialize.css

# Verificar que las variables estén en el CSS
grep --color=always "var(--mz" dist/css/materialize.css | head -20
```

---

## 2. Remover jQuery

### Antes (jQuery)

```javascript
// js/modal.js - Versión jQuery
$(document).ready(function() {
  $('.modal').modal({
    opacity: 0.5,
    inDuration: 300,
    outDuration: 200,
    onOpen: function() { console.log('opened'); },
    onClose: function() { console.log('closed'); }
  });
  
  $('.modal-trigger').click(function() {
    $(this).attr('data-target').modal('open');
  });
});
```

### Después (Vanilla JS + TypeScript)

```typescript
// src/components/Modal.ts
export interface ModalOptions {
  opacity?: number;
  inDuration?: number;
  outDuration?: number;
  onOpen?: () => void;
  onClose?: () => void;
}

export class Modal {
  private el: HTMLElement;
  private options: Required<ModalOptions>;
  private backdrop: HTMLElement | null = null;
  
  constructor(element: HTMLElement, options?: ModalOptions) {
    this.el = element;
    this.options = {
      opacity: options?.opacity ?? 0.5,
      inDuration: options?.inDuration ?? 300,
      outDuration: options?.outDuration ?? 200,
      onOpen: options?.onOpen ?? (() => {}),
      onClose: options?.onClose ?? (() => {})
    };
  }
  
  open(): void {
    // Show backdrop
    this.backdrop = document.createElement('div');
    this.backdrop.className = 'modal-backdrop';
    this.backdrop.style.opacity = String(this.options.opacity);
    document.body.appendChild(this.backdrop);
    
    // Show modal with animation
    this.el.style.display = 'block';
    this.el.classList.add('modal-open');
    this.options.onOpen();
  }
  
  close(): void {
    // Hide backdrop
    if (this.backdrop) {
      this.backdrop.remove();
      this.backdrop = null;
    }
    
    // Hide modal with animation
    this.el.classList.remove('modal-open');
    this.el.style.display = 'none';
    this.options.onClose();
  }
}

// Usage
document.querySelectorAll('.modal').forEach(el => {
  const modal = new Modal(el as HTMLElement, {
    opacity: 0.5,
    inDuration: 300,
    onOpen: () => console.log('opened'),
    onClose: () => console.log('closed')
  });
  
  const trigger = document.querySelector(`[data-target="${el.id}"]`);
  if (trigger) {
    trigger.addEventListener('click', () => modal.open());
  }
});
```

---

## 3. Implementar Dark Mode

### Archivo: `src/utils/ThemeManager.ts`

```typescript
export type Theme = 'light' | 'dark';

export interface ThemeManagerOptions {
  storageKey?: string;
  autoDetect?: boolean;
}

export class ThemeManager {
  private storageKey: string;
  private autoDetect: boolean;
  private currentTheme: Theme;
  
  constructor(options?: ThemeManagerOptions) {
    this.storageKey = options?.storageKey ?? 'materialize-theme';
    this.autoDetect = options?.autoDetect ?? true;
    this.currentTheme = this.loadTheme();
    this.applyTheme(this.currentTheme);
  }
  
  private loadTheme(): Theme {
    // 1. Check localStorage
    const saved = localStorage.getItem(this.storageKey) as Theme | null;
    if (saved) return saved;
    
    // 2. Check system preference
    if (this.autoDetect) {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      return prefersDark ? 'dark' : 'light';
    }
    
    // 3. Default
    return 'light';
  }
  
  private applyTheme(theme: Theme): void {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem(this.storageKey, theme);
    this.currentTheme = theme;
    
    // Dispatch custom event
    window.dispatchEvent(new CustomEvent('theme-change', { detail: { theme } }));
  }
  
  toggle(): void {
    const newTheme = this.currentTheme === 'light' ? 'dark' : 'light';
    this.applyTheme(newTheme);
  }
  
  set(theme: Theme): void {
    this.applyTheme(theme);
  }
  
  get(): Theme {
    return this.currentTheme;
  }
}
```

### Uso en HTML

```html
<!DOCTYPE html>
<html lang="es" data-theme="light">
<head>
  <meta charset="UTF-8">
  <title>Materialize v2</title>
  <link rel="stylesheet" href="dist/css/materialize.css">
</head>
<body>
  <header class="navbar">
    <button id="theme-toggle" class="btn btn-icon" aria-label="Toggle theme">
      <i class="icon-moon"></i>
    </button>
  </header>
  
  <script type="module">
    import { ThemeManager } from './dist/utils/ThemeManager.js';
    
    const themeManager = new ThemeManager({
      storageKey: 'materialize-theme',
      autoDetect: true
    });
    
    document.getElementById('theme-toggle').addEventListener('click', () => {
      themeManager.toggle();
    });
    
    // Listen for theme changes
    window.addEventListener('theme-change', (e) => {
      console.log('Theme changed to:', e.detail.theme);
    });
  </script>
</body>
</html>
```

---

## 4. Implementar Accesibilidad

### Antes (Sin accesibilidad)

```html
<button class="btn btn-primary">Enviar</button>
<div id="modal" class="modal">
  <div class="modal-content">
    <p>¿Estás seguro?</p>
    <button class="btn btn-primary">OK</button>
    <button class="btn">Cancelar</button>
  </div>
</div>
```

### Después (WCAG 2.1 AA)

```html
<!-- Button con accesibilidad -->
<button 
  class="btn btn-primary"
  aria-label="Enviar formulario"
  aria-describedby="btn-help"
  type="submit">
  <i class="icon-send" aria-hidden="true"></i>
  Enviar
</button>
<small id="btn-help">Se enviará el formulario completo</small>

<!-- Modal accesible -->
<div 
  id="modal" 
  class="modal" 
  role="dialog"
  aria-labelledby="modal-title"
  aria-describedby="modal-description"
  aria-modal="true"
  aria-hidden="false">
  
  <div class="modal-header">
    <h2 id="modal-title">Confirmación</h2>
    <button 
      class="btn-close"
      aria-label="Cerrar diálogo"
      data-dismiss="modal"
      type="button"></button>
  </div>
  
  <div class="modal-body" id="modal-description">
    <p>¿Estás seguro de que deseas continuar?</p>
  </div>
  
  <div class="modal-footer">
    <button class="btn btn-secondary" data-dismiss="modal" type="button">
      Cancelar
    </button>
    <button class="btn btn-primary" type="button" autofocus>
      Confirmar
    </button>
  </div>
</div>
```

### Form con Floating Labels

```html
<div class="form-floating">
  <input 
    id="email" 
    class="form-control" 
    type="email"
    placeholder="example@example.com"
    required
    aria-required="true"
    aria-describedby="email-help">
  <label for="email">Correo Electrónico</label>
  <small id="email-help" class="form-text">
    Nunca compartiremos tu email con nadie más.
  </small>
</div>
```

---

## 5. Setup de Vite

### Archivo: `vite.config.ts`

```typescript
import { defineConfig } from 'vite'
import { resolve } from 'path'
import sass from 'sass'

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'Materialize',
      formats: ['es', 'umd'],
      fileName: (format) => `materialize.${format === 'umd' ? 'js' : 'mjs'}`
    },
    rollupOptions: {
      output: {
        globals: {
          // Si hay dependencias externas
        }
      }
    },
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true
      }
    }
  },
  css: {
    preprocessorOptions: {
      scss: {
        implementation: sass,
        sourceMap: true
      }
    }
  },
  server: {
    port: 5173,
    open: true
  }
})
```

### Archivo: `package.json` actualizado

```json
{
  "name": "materialize-css",
  "version": "2.0.0-beta.1",
  "description": "A CSS Framework based on Material Design v2",
  "main": "dist/materialize.js",
  "module": "dist/materialize.mjs",
  "types": "dist/index.d.ts",
  "style": "dist/materialize.css",
  "scripts": {
    "dev": "vite",
    "build": "vite build && vite build --mode ssr",
    "preview": "vite preview",
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:e2e": "playwright test",
    "lint": "biome check src/",
    "format": "biome format src/ --write",
    "type-check": "tsc --noEmit",
    "audit": "npm audit --audit-level=moderate"
  },
  "devDependencies": {
    "vite": "^5.0.0",
    "typescript": "^5.3.0",
    "sass": "^1.69.0",
    "terser": "^5.26.0",
    "@biomejs/biome": "^2.4.16",
    "vitest": "^1.0.0",
    "@vitest/ui": "^1.0.0",
    "@testing-library/dom": "^9.3.4",
    "jsdom": "^23.0.0",
    "@playwright/test": "^1.40.0",
    "axe-core": "^4.8.0"
  }
}
```

---

## 6. Testing Setup

### Archivo: `vitest.config.ts`

```typescript
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./tests/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'tests/',
      ]
    }
  }
})
```

### Ejemplo de Test: `tests/unit/Modal.test.ts`

```typescript
import { describe, it, expect, beforeEach } from 'vitest'
import { Modal } from '../../src/components/Modal'

describe('Modal Component', () => {
  let element: HTMLElement
  let modal: Modal
  
  beforeEach(() => {
    element = document.createElement('div')
    element.id = 'test-modal'
    element.className = 'modal'
    document.body.appendChild(element)
    
    modal = new Modal(element, {
      opacity: 0.5,
      inDuration: 300,
      outDuration: 200
    })
  })
  
  it('should open modal', () => {
    modal.open()
    expect(element.style.display).toBe('block')
    expect(element.classList.contains('modal-open')).toBe(true)
  })
  
  it('should close modal', () => {
    modal.open()
    modal.close()
    expect(element.style.display).toBe('none')
    expect(element.classList.contains('modal-open')).toBe(false)
  })
  
  it('should call onOpen callback', () => {
    const onOpen = vi.fn()
    const m = new Modal(element, { onOpen })
    m.open()
    expect(onOpen).toHaveBeenCalled()
  })
  
  it('should have proper ARIA attributes', () => {
    expect(element).toHaveAttribute('role', 'dialog')
    expect(element).toHaveAttribute('aria-modal', 'true')
  })
})
```

---

## 8. Ejemplos Completos de Utilidades CSS

### 8.1 Padding y Margin

```html
<!-- Ejemplos de Padding -->
<div class="p1">Padding pequeño (4px)</div>
<div class="p2">Padding medio (8px)</div>
<div class="p3">Padding grande (16px)</div>

<!-- Padding en lados específicos -->
<div class="pt2">Padding-top 8px</div>
<div class="pr3">Padding-right 16px</div>
<div class="pb2 pl3">Padding bottom 8px + left 16px</div>

<!-- Ejemplos de Margin -->
<div class="m2">Margin en todos los lados (8px)</div>
<div class="mt3 mb3">Margin top/bottom 16px</div>
<div class="mx2">Margin horizontal 8px</div>

<!-- Responsive -->
<div class="p1 p2-md p3-lg">
  4px en móvil, 8px en tablets, 16px en desktop
</div>
```

### 8.2 Opacity con Hover

```html
<!-- Opacity estática -->
<div class="opacity-50">50% opacidad</div>
<div class="opacity-75">75% opacidad</div>

<!-- Opacity con hover -->
<button class="opacity-hover">Botón - hover reduce opacidad</button>
<img src="image.jpg" class="opacity-hover" alt="Imagen interactiva">

<!-- Combinado con sombra -->
<div class="shadow-sm-hover opacity-hover">
  Card interactiva con sombra y opacidad
</div>
```

### 8.3 Animaciones y Hover

```html
<!-- Animaciones básicas -->
<div class="animate-fade-in">Aparece con fade in</div>
<div class="animate-slide-in">Desliza hacia arriba</div>
<div class="animate-bounce">Rebota infinitamente</div>
<div class="animate-pulse">Pulsea infinitamente</div>

<!-- Animaciones de Hover -->
<div class="animate-scale-hover">
  Escala al 1.05 en hover
</div>

<div class="animate-shadow-hover">
  Sombra + traslación en hover
</div>

<button class="animate-color-hover">
  Cambia color en hover
</button>

<!-- Combinado: animación + shadow + padding -->
<div class="p3 animate-shadow-hover">
  Card elegante con padding y animación
</div>
```

### 8.4 Background Colors con Hover

```html
<!-- Background colors básicos -->
<div class="bg-primary p2">Fondo primario</div>
<div class="bg-secondary p2">Fondo secundario</div>
<div class="bg-success p2">Fondo success</div>
<div class="bg-danger p2">Fondo danger</div>

<!-- Con hover automático -->
<button class="bg-primary p2 text-center">
  Click me - hover cambia de color automáticamente
</button>

<!-- Combinado con transición -->
<div class="bg-primary transition-colors p3">
  Fondo con transición suave en hover
</div>
```

### 8.5 Text y Typography

```html
<!-- Colores de texto -->
<p class="text-primary">Texto primario</p>
<p class="text-success">Texto exitoso</p>
<p class="text-danger">Texto de error</p>
<p class="text-muted">Texto apagado</p>

<!-- Font weights -->
<p class="fw-light">Texto light</p>
<p class="fw-normal">Texto normal</p>
<p class="fw-bold">Texto bold</p>

<!-- Transformaciones -->
<p class="text-uppercase">todo en mayúsculas</p>
<p class="text-lowercase">TODO EN MINÚSCULAS</p>
<p class="text-capitalize">Capitaliza Cada Palabra</p>

<!-- Truncate -->
<p class="text-truncate">
  Este texto muy largo se trunca con ellipsis ...
</p>
```

### 8.6 Flexbox y Layout

```html
<!-- Flexbox -->
<div class="d-flex justify-content-center align-items-center p3">
  Contenedor flexbox centrado
</div>

<!-- Gap (espaciado entre items) -->
<div class="d-flex gap-2">
  <div>Item 1</div>
  <div>Item 2</div>
  <div>Item 3</div>
</div>

<!-- Espacio entre items -->
<div class="d-flex justify-content-between p2">
  <div>Izquierda</div>
  <div>Derecha</div>
</div>

<!-- Columnas -->
<div class="d-flex flex-column gap-3">
  <div>Fila 1</div>
  <div>Fila 2</div>
  <div>Fila 3</div>
</div>
```

### 8.7 Sombras y Borders

```html
<!-- Sombras -->
<div class="shadow-sm p3">Shadow pequeño</div>
<div class="shadow-md p3">Shadow medio</div>
<div class="shadow-lg p3">Shadow grande</div>

<!-- Sombra con hover -->
<div class="shadow-sm-hover p3 transition-all">
  Shadow aumenta en hover
</div>

<!-- Borders -->
<div class="border p3">Border en todos los lados</div>
<div class="border-top p3">Solo border-top</div>
<div class="rounded border p3">Border redondeado</div>
<div class="rounded-circle p3">Completamente circular</div>
```

### 8.8 Transiciones Complejas

```html
<!-- Transición simple -->
<div class="transition-colors bg-primary p3 text-white">
  Background cambia suavemente en hover
</div>

<!-- Transición múltiple propiedades -->
<div class="transition-all shadow-sm-hover animate-scale-hover p3">
  Escala + sombra + transición suave
</div>

<!-- Transición lenta -->
<div class="transition-slow bg-info p3">
  Transición lenta (500ms)
</div>

<!-- Transición rápida -->
<div class="transition-fast bg-warning p3">
  Transición rápida (150ms)
</div>

<!-- Transformaciones con transición -->
<div class="transition-transform animate-scale-hover">
  Escala al hover con transición
</div>
```

### 8.9 Combinaciones Avanzadas

```html
<!-- Card completa con todo -->
<div class="
  bg-light
  p3
  m2
  rounded
  shadow-sm-hover
  transition-all
  animate-scale-hover
">
  <h3 class="fw-bold text-primary">Título</h3>
  <p class="text-muted">Descripción</p>
  <button class="bg-primary text-white p2 rounded animate-color-hover">
    Acción
  </button>
</div>

<!-- Hero Section -->
<div class="
  d-flex
  justify-content-center
  align-items-center
  min-h-100
  bg-primary
">
  <div class="text-center p3">
    <h1 class="text-white fw-bold animate-slide-in">Bienvenido</h1>
    <p class="text-white opacity-75">Contenido principal</p>
  </div>
</div>

<!-- Grid de items -->
<div class="d-flex flex-wrap gap-2">
  <div class="w-33 shadow-sm-hover p3 transition-all animate-scale-hover">
    Item 1
  </div>
  <div class="w-33 shadow-sm-hover p3 transition-all animate-scale-hover">
    Item 2
  </div>
  <div class="w-33 shadow-sm-hover p3 transition-all animate-scale-hover">
    Item 3
  </div>
</div>

<!-- Navbar responsivo -->
<nav class="d-flex justify-content-between align-items-center bg-dark p2">
  <h2 class="text-white fw-bold">Logo</h2>
  <div class="d-flex gap-2">
    <a href="#" class="text-white text-capitalize transition-colors">Link 1</a>
    <a href="#" class="text-white text-capitalize transition-colors">Link 2</a>
  </div>
</nav>
```

### 8.10 Patrón de Uso Completo en HTML

```html
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link rel="stylesheet" href="dist/css/materialize.css">
  <title>Utilidades CSS Materialize v2</title>
</head>
<body>
  <!-- Header -->
  <header class="bg-primary p3 text-center shadow-md">
    <h1 class="text-white fw-bold animate-slide-in">
      Materialize v2 - Utilidades CSS
    </h1>
  </header>

  <!-- Main Content -->
  <main class="p3">
    
    <!-- Sección 1: Espaciado -->
    <section class="m3">
      <h2 class="fw-bold text-primary mb2">Espaciado (Padding/Margin)</h2>
      <div class="d-flex gap-2">
        <div class="p1 bg-light rounded shadow-sm">P1</div>
        <div class="p2 bg-light rounded shadow-sm">P2</div>
        <div class="p3 bg-light rounded shadow-sm">P3</div>
      </div>
    </section>

    <!-- Sección 2: Animaciones -->
    <section class="m3">
      <h2 class="fw-bold text-primary mb2">Animaciones</h2>
      <div class="d-flex gap-2">
        <div class="animate-fade-in p2 bg-success text-white rounded">
          Fade In
        </div>
        <div class="animate-bounce p2 bg-warning rounded">
          Bounce
        </div>
        <div class="animate-pulse p2 bg-info text-white rounded">
          Pulse
        </div>
      </div>
    </section>

    <!-- Sección 3: Cards interactivas -->
    <section class="m3">
      <h2 class="fw-bold text-primary mb2">Cards Interactivas</h2>
      <div class="d-flex flex-wrap gap-3">
        <div class="
          p3
          rounded
          shadow-sm-hover
          transition-all
          animate-scale-hover
          bg-light
          flex-column
          d-flex
        " style="flex: 1; min-width: 250px;">
          <h3 class="fw-bold text-primary">Card 1</h3>
          <p class="text-muted flex-grow">Descripción de la card</p>
          <button class="
            bg-primary
            text-white
            p2
            rounded
            transition-colors
            animate-color-hover
          ">Acción</button>
        </div>

        <div class="
          p3
          rounded
          shadow-sm-hover
          transition-all
          animate-scale-hover
          bg-light
          flex-column
          d-flex
        " style="flex: 1; min-width: 250px;">
          <h3 class="fw-bold text-secondary">Card 2</h3>
          <p class="text-muted flex-grow">Descripción de la card</p>
          <button class="
            bg-secondary
            text-white
            p2
            rounded
            transition-colors
          ">Acción</button>
        </div>
      </div>
    </section>

  </main>

  <!-- Footer -->
  <footer class="bg-dark text-white p3 text-center mt3 opacity-75">
    <p>© 2026 Materialize v2 - Con Utilidades CSS Completas</p>
  </footer>

  <script src="dist/js/materialize.js"></script>
</body>
</html>
```

---

