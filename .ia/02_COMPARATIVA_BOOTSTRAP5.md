# 02. COMPARATIVA MATERIALIZE vs BOOTSTRAP 5

## Resumen
Bootstrap 5 es la versión moderna de referencia. Este análisis muestra qué le falta a Materialize.

---

## 1. Componentes Faltantes en Materialize

### Componentes que tiene Bootstrap 5 pero NO Materialize ❌

#### 1.1 Navegación y Layout
```
❌ Navbar advanced (offcanvas integration)
❌ Breadcrumbs
❌ Pagination (solo tabla de contenidos)
❌ Spinners (tiene preloader pero no spinner component)
❌ Progress bars
```

#### 1.2 Contenedores y Espaciado
```
❌ Containers (fluid, breakpoint-specific)
❌ Display utilities system completo
❌ Spacers/Margin utilities
❌ Flexbox utilities
❌ Gap utilities
```

#### 1.3 Formularios Avanzadas
```
❌ Floating labels
❌ Input groups
❌ Form validation estados
❌ Fieldset
❌ Meter/progress (forms)
```

#### 1.4 Componentes Interactivos
```
❌ Alerts (solo toasts)
❌ Popovers
❌ Offcanvas
❌ Spinners animados
❌ Accordion (tiene collapsible similar)
```

#### 1.5 Multimedia
```
❌ Embed responsive container
❌ Aspect ratio utilities
❌ Picture element utilities
```

#### 1.6 Tablas
```
⚠️ Tablas básicas (pero sin responsive wrappers)
❌ Table striped variants
❌ Table hover states completos
❌ Table dark mode
```

#### 1.7 Utilitarios
```
❌ Visibility utilities
❌ Border utilities
❌ Shadow utilities (tiene pulse similar)
❌ Opacity utilities
❌ Text truncation
❌ Link utilities
```

---

## 2. Comparativa Detallada de Componentes

### 2.1 Buttons
```
MATERIALIZE:
✓ Button básico
✓ Raised button
✓ Floating button
✓ Flat button
✓ Disabled state
✓ Icon buttons
❌ Outline variant
❌ Ghost variant
❌ Loading state
❌ Grouped button (button group)

BOOTSTRAP 5:
✓ Todas las variantes de Materialize
✓ Outline buttons
✓ Ghost buttons
✓ Button groups
✓ Dropdown buttons
✓ Más opciones de tamaño
```

### 2.2 Formularios
```
MATERIALIZE:
✓ Input fields
✓ Checkboxes
✓ Radio buttons
✓ Select dropdown
✓ Switches
✓ Textarea
✓ Range slider
❌ Floating labels
❌ Input groups
❌ Form validation states
❌ Meter element

BOOTSTRAP 5:
✓ Todas las variantes de Materialize
✓ Floating labels (feature importante)
✓ Input groups
✓ Validation feedback
✓ File input styling
✓ Fieldset
```

### 2.3 Tablas
```
MATERIALIZE:
✓ Tabla básica
✓ Color classes
❌ Responsive wrapper
❌ Striped rows
❌ Hover effect
❌ Dark variant
❌ Table head colors

BOOTSTRAP 5:
✓ Tabla básica
✓ Striped rows
✓ Hover effect
✓ Bordered tables
✓ Responsive tables
✓ Dark variant
✓ Table head styling
```

### 2.4 Cards
```
MATERIALIZE:
✓ Card básico
✓ Card content
✓ Card image
✓ Card reveal (hover)
✓ Hoverable effect
❌ Card groups
❌ Card decks
❌ Card columns
❌ Border styling

BOOTSTRAP 5:
✓ Todas las variantes de Materialize
✓ Card groups
✓ Card decks
✓ Card columns
✓ Border styling
```

### 2.5 Modales
```
MATERIALIZE:
✓ Modal básico
✓ Modal centered
✓ Modal dismiss
❌ Modal sizes (small, large)
❌ Modal scrolling
❌ Modal animation control
❌ Modal nested

BOOTSTRAP 5:
✓ Todas las variantes de Materialize
✓ Modal sizes
✓ Scrollable modals
✓ Vertically centered
✓ Fullscreen modals
```

---

## 3. Utilitarios CSS - Brecha Mayor

### Materialize - Utilitarios Limitados
```scss
// Solo:
- Color classes
- Display (limited)
- Shadow (pulse, elevation)
- Text alignment
- Margin/padding (limitado)
```

### Bootstrap 5 - Utilidades Extensas
```scss
// Sistema completo:
- Display utilities
- Flexbox utilities
- Margin/Padding system
- Border utilities
- Shadow utilities
- Text utilities
- Position utilities
- Sizing utilities
- Opacity utilities
- Visibility utilities
- Z-index utilities
- Transform utilities
- Transition utilities
```

**Impacto**: Bootstrap 5 permite construir layouts sin CSS custom; Materialize requiere CSS adicional.

---

## 4. Sistema de Diseño

### Materialize Design System
```
- Color: Google Material Design Palette (18 colores)
- Tipografía: Roboto (limitado)
- Spacing: Fixed units (8px, 16px)
- Borderradius: 2px global
- Shadows: Limited elevation system
```

### Bootstrap 5 Design System
```
- Color: 16+ colores base + variants
- Tipografía: Flexible (includes dark mode variants)
- Spacing: Scale system (0-5 + custom)
- Borderradius: Multiple variables
- Shadows: Flexible system
- Soporta CSS variables para todo
```

---

## 5. Accesibilidad

### Materialize - Deficiencias
```
❌ Falta ARIA labels en muchos componentes
❌ Contraste de colores insuficiente (WCAG AA)
❌ Navegación por teclado incompleta
❌ Focus states no obvios
❌ Sin dark mode (problemas de accesibilidad visual)
❌ Sin soporte RTL (Right-to-Left)
```

### Bootstrap 5 - Estándares
```
✓ WCAG 2.1 AA compliance
✓ ARIA labels completos
✓ Navegación por teclado
✓ Focus states visibles
✓ Soporta dark mode
✓ Soporta RTL
✓ Color contrast optimal
```

---

## 6. Responsive Design

### Materialize Breakpoints
```scss
$small-screen-up: 601px;
$medium-screen-up: 993px;
$large-screen-up: 1201px;
$small-screen: 600px;
$medium-screen: 992px;
$large-screen: 1200px;

// Total: 3 breakpoints
// Nombrada: s, m, l
```

### Bootstrap 5 Breakpoints
```scss
// xs: 0
// sm: 576px
// md: 768px
// lg: 992px
// xl: 1200px
// xxl: 1400px

// Total: 6 breakpoints
// Más granular y flexible
```

---

## 7. Variables CSS (CSS Custom Properties)

### Materialize - NINGUNO ❌
```
- Colores hardcodeados
- Tipografía hardcodeada
- Espaciado hardcodeado
- Require recompile para cambiar tema
```

### Bootstrap 5 - Completo ✅
```css
:root {
  --bs-primary: #0d6efd;
  --bs-secondary: #6c757d;
  --bs-success: #198754;
  --bs-info: #0dcaf0;
  --bs-warning: #ffc107;
  --bs-danger: #dc3545;
  --bs-light: #f8f9fa;
  --bs-dark: #212529;
  
  --bs-body-font-family: system-ui, -apple-system, ...;
  --bs-body-font-size: 1rem;
  --bs-body-line-height: 1.5;
  
  --bs-border-radius: 0.375rem;
  --bs-spacing-unit: 1rem;
  
  /* 100+ variables más */
}
```

**Ventaja Bootstrap**: Cambiar tema sin recompilar.

---

## 8. Dark Mode

### Materialize - NO SOPORTA ❌
```
- Colores solo para light mode
- Implementar dark mode = CSS adicional custom
```

### Bootstrap 5 - SOPORTA ✅
```
[data-bs-theme="dark"] {
  --bs-body-color: #dee2e6;
  --bs-body-bg: #212529;
  /* ... más variables */
}
```

---

## 9. Tipografía

### Materialize
```scss
Encabezados limitados
Font sizes: fixed
Font weights: limitados
Line heights: no variables
```

### Bootstrap 5
```scss
Escala tipográfica completa
Font size variables
Font weight utilities
Line height utilities
Letter spacing
Text decoration utilities
```

---

## 10. Grid System

### Comparativa Grid

| Feature | Materialize | Bootstrap 5 |
|---------|-------------|------------|
| Columnas | 12 | 12 |
| Breakpoints | 3 | 6 |
| Flex-based | ✓ | ✓ |
| Offsets | ✓ | ✓ |
| Nesting | ✓ | ✓ |
| Gutters variables | ❌ | ✅ |
| Containers | ❌ | ✅ |
| Auto-layout | ⚠️ | ✅ |

---

## 11. JavaScript

### Materialize JS
```
- jQuery required
- No modules (vanilla)
- No TypeScript
- Limited plugins
- Manual initialization
```

### Bootstrap 5 JS
```
- No jQuery (vanilla JS)
- ES6+ modules
- TypeScript support
- Rich component library
- Auto-initialization available
- Plugin system
```

---

## 12. Resumen de Carencias

| Categoría | Cantidad | Severidad |
|-----------|----------|-----------|
| Componentes faltantes | 24+ | 🔴 Alta |
| Utilitarios CSS | 80%+ faltantes | 🔴 Alta |
| CSS Variables | 100% falta | 🔴 Alta |
| Accesibilidad | ~30% de gap | 🟡 Media |
| Dark Mode | No existe | 🟡 Media |
| TypeScript | No tiene | 🟠 Normal |
| Testing | 60% de gap | 🟡 Media |
| RTL Support | No existe | 🟠 Normal |

**Estimación de trabajo para paridad**: ~800-1000 horas

---

## 13. Roadmap de Equiparación

### Fase 1: Fundacional (240h)
- [ ] Modernizar build system
- [ ] Implementar CSS variables
- [ ] Agregar accesibilidad
- [ ] Setup TypeScript

### Fase 2: Componentes (300h)
- [ ] Agregar componentes faltantes
- [ ] Implementar utilidades CSS completas
- [ ] Dark mode support
- [ ] RTL support

### Fase 3: Polish (240h)
- [ ] Testing completo
- [ ] Optimización performance
- [ ] Documentación
- [ ] Ejemplos interactivos

