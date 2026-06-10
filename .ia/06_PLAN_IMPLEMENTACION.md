# 06. PLAN DE IMPLEMENTACIÓN - MATERIALIZE V2

## Visión General
Transformar Materialize de un framework obsoleto a una solución moderna, segura y accesible comparable a Bootstrap 5.

---

## 1. Fases de Implementación

### Fase 0: Preparación (1-2 semanas) 🟡

#### Objetivos
- Configurar ambiente de desarrollo
- Establecer CI/CD
- Documentar arquitectura
- Setup de testing

#### Tareas
```
[ ] Crear rama v2-dev
[ ] Configurar GitHub Actions
[ ] Establecer convenciones de código
[ ] Setup de husky + pre-commit hooks
[ ] Crear ARCHITECTURE.md
[ ] Setup de testing framework
[ ] Crear issue templates
[ ] Documentar roadmap público
```

**Deliverables**:
- `.github/workflows/` configurado
- `.husky/` hooks creados
- `ARCHITECTURE.md` documento base
- `TESTING.md` guía

---

### Fase 1: Fundacional (4-6 semanas) 🔴 CRÍTICA

#### Objetivos
- Actualizar stack de desarrollo
- Implementar CSS variables
- Migrar de jQuery
- Mejorar accesibilidad

#### 1.1 Modernizar Build System (40h)

```bash
# Instalación
npm install -D vite @vitejs/plugin-vue typescript sass

# package.json actualizado
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "lint": "biome check src/",
    "format": "biome format src/ --write",
    "test": "vitest",
    "test:ui": "vitest --ui"
  }
}
```

**Tareas**:
- [ ] Instalar Vite
- [ ] Crear vite.config.ts
- [ ] Migrar SCSS a new build
- [ ] Configurar CSS extraction
- [ ] Setup de minificación
- [ ] Setup de source maps
- [ ] Testing del build

**Deliverables**:
- `vite.config.ts`
- `tsconfig.json`
- Build optimizado

---

#### 1.2 Implementar CSS Variables (60h)

**Estructura de archivos**:
```
sass/
├── _variables-root.scss       # CSS variables
├── components/
│   ├── _buttons.scss          # Usa variables
│   ├── _cards.scss            # Usa variables
│   ├── _forms.scss            # Usa variables
│   └── ...
└── themes/
    ├── _light.scss
    ├── _dark.scss
    └── _custom.scss
```

**Tareas**:
- [ ] Crear `_variables-root.scss` (100+ variables)
- [ ] Actualizar cada componente a usar variables
- [ ] Crear tema light (default)
- [ ] Crear tema dark
- [ ] Crear sistema de custom themes
- [ ] Setup de SCSS mixins para breakpoints
- [ ] Testing de variables en todos los navegadores

**Deliverables**:
- Sistema completo de CSS variables
- Temas light/dark funcionales
- Documentación de variables

---

#### 1.3 Remover jQuery (80h)

**Componentes a migrar**:
```javascript
✓ Modal.js
✓ Sidenav.js
✓ Dropdown.js
✓ Tabs.js
✓ Collapsible.js
✓ Carousel.js
✓ Datepicker.js
✓ Timepicker.js
✓ Autocomplete.js
✓ Chips.js
✓ Tooltip.js
✓ Toast.js
✓ Materialbox.js
```

**Estructura**:
```typescript
// src/components/Modal.ts
export interface ModalOptions {
  opacity?: number;
  duration?: number;
  onOpen?: () => void;
  onClose?: () => void;
}

export class Modal {
  constructor(element: HTMLElement, options?: ModalOptions);
  open(): Promise<void>;
  close(): Promise<void>;
  destroy(): void;
}
```

**Tareas**:
- [ ] Crear interfaz TypeScript para cada componente
- [ ] Implementar componentes sin jQuery
- [ ] Usar APIs nativas (fetch, EventTarget, etc.)
- [ ] Setup de módulos ES6
- [ ] Migration guide para usuarios
- [ ] Testing de cada componente

**Deliverables**:
- Todos los componentes sin jQuery
- ESM modules
- TypeScript definitions

---

#### 1.4 Accesibilidad WCAG 2.1 AA (100h)

**Auditoría de accesibilidad**:
```bash
# Herramientas
npm install -D axe-core pa11y lighthouse
```

**Por componente**:
```html
<!-- Buttons -->
<button 
  class="btn btn-primary"
  aria-label="Submit form"
  aria-disabled="false"
  role="button">
  Send
</button>

<!-- Forms -->
<label for="email" class="form-label">Email Address</label>
<input 
  id="email" 
  type="email" 
  class="form-control"
  aria-describedby="email-help"
  required>
<small id="email-help">We'll never share your email.</small>

<!-- Modals -->
<div 
  id="modal" 
  class="modal" 
  role="dialog" 
  aria-labelledby="modal-title"
  aria-modal="true">
  <h2 id="modal-title">Modal Title</h2>
  <p>Modal content</p>
</div>
```

**Tareas**:
- [ ] Auditoría completa con axe-core
- [ ] ARIA labels en todos los componentes
- [ ] Verificar contraste WCAG AA
- [ ] Navegación por teclado (Tab, Enter, Esc)
- [ ] Focus management
- [ ] Semantic HTML (button vs div)
- [ ] Pruebas con screen readers
- [ ] Testing automatizado

**Verificaciones**:
- [ ] WAVE WebAIM
- [ ] axe DevTools
- [ ] Lighthouse Accessibility
- [ ] NVDA/JAWS testing
- [ ] Keyboard navigation

**Deliverables**:
- WCAG 2.1 AA compliant
- Accessibility report
- Testing guidelines

---

### Fase 2: Componentes Amplificados (8-10 semanas) 🟡

#### 2.1 Agregar Componentes Faltantes (120h)

**Componentes a crear**:

```scss
// New components
✓ Alerts
✓ Pagination
✓ Progress bars
✓ Popovers
✓ Offcanvas/Drawers
✓ Breadcrumbs
✓ Spinners/Loaders (mejorados)
✓ Input groups
✓ Floating labels
✓ Button groups
✓ Accordion (mejorado collapsible)

// Components to enhance
~ Buttons (agregar más variantes)
~ Forms (agregar más validaciones)
~ Modals (agregar más tamaños)
~ Cards (agregar variantes)
~ Tables (agregar responsive)
```

**Ejemplo: Alerts**
```scss
// sass/components/_alerts.scss
.alert {
  padding: var(--mz-spacing-md);
  margin-bottom: var(--mz-spacing-md);
  border: 1px solid transparent;
  border-radius: var(--mz-border-radius-md);
  
  &.alert-success {
    color: #155724;
    background-color: #d4edda;
    border-color: #c3e6cb;
  }
  
  &.alert-warning {
    color: #856404;
    background-color: #fff3cd;
    border-color: #ffeaa7;
  }
  
  &.alert-danger {
    color: #721c24;
    background-color: #f8d7da;
    border-color: #f5c6cb;
  }
  
  &.alert-info {
    color: #0c5460;
    background-color: #d1ecf1;
    border-color: #bee5eb;
  }
}

// Close button
.alert-close {
  float: right;
  font-size: 1.5rem;
  font-weight: 700;
  line-height: 1;
  color: inherit;
  background: transparent;
  border: 0;
  cursor: pointer;
  
  &:hover { opacity: 0.75; }
}
```

**Tareas por componente**:
- [ ] Diseño SCSS
- [ ] Componente JavaScript (opcional)
- [ ] Documentación
- [ ] Ejemplos
- [ ] Testing
- [ ] Accesibilidad

**Deliverables**:
- 12+ nuevos componentes
- Ejemplos interactivos
- Documentación completa

---

#### 2.2 Sistema Completo de Utilidades CSS (40h)

```scss
// sass/utilities/

// _display.scss
.d-none { display: none; }
.d-inline { display: inline; }
.d-inline-block { display: inline-block; }
.d-block { display: block; }
.d-flex { display: flex; }
.d-grid { display: grid; }

// Responsive
@media (min-width: 600px) {
  .d-sm-none { display: none; }
  .d-sm-inline { display: inline; }
  // ...
}

// _flexbox.scss
.flex-row { flex-direction: row; }
.flex-column { flex-direction: column; }
.flex-wrap { flex-wrap: wrap; }
.flex-nowrap { flex-wrap: nowrap; }

.justify-content-start { justify-content: flex-start; }
.justify-content-center { justify-content: center; }
.justify-content-between { justify-content: space-between; }
.justify-content-around { justify-content: space-around; }
.justify-content-end { justify-content: flex-end; }

.align-items-start { align-items: flex-start; }
.align-items-center { align-items: center; }
.align-items-end { align-items: flex-end; }

// _spacing.scss (margin/padding)
@for $i from 0 through 5 {
  $size: $i * 16px; // spacing unit
  
  .m#{$i} { margin: $size; }
  .mt#{$i} { margin-top: $size; }
  .mb#{$i} { margin-bottom: $size; }
  .ml#{$i} { margin-left: $size; }
  .mr#{$i} { margin-right: $size; }
  .mx#{$i} { margin-left: $size; margin-right: $size; }
  .my#{$i} { margin-top: $size; margin-bottom: $size; }
  
  .p#{$i} { padding: $size; }
  .pt#{$i} { padding-top: $size; }
  .pb#{$i} { padding-bottom: $size; }
  .pl#{$i} { padding-left: $size; }
  .pr#{$i} { padding-right: $size; }
  .px#{$i} { padding-left: $size; padding-right: $size; }
  .py#{$i} { padding-top: $size; padding-bottom: $size; }
}

// _border.scss
.border { border: 1px solid var(--mz-border-primary); }
.border-top { border-top: 1px solid var(--mz-border-primary); }
.border-right { border-right: 1px solid var(--mz-border-primary); }
.border-bottom { border-bottom: 1px solid var(--mz-border-primary); }
.border-left { border-left: 1px solid var(--mz-border-primary); }

.rounded { border-radius: var(--mz-border-radius-md); }
.rounded-top { border-radius: var(--mz-border-radius-md) var(--mz-border-radius-md) 0 0; }
.rounded-circle { border-radius: 50%; }

// _shadow.scss
.shadow-sm { box-shadow: var(--mz-shadow-sm); }
.shadow { box-shadow: var(--mz-shadow-md); }
.shadow-lg { box-shadow: var(--mz-shadow-lg); }
.shadow-none { box-shadow: none; }

// _text.scss
.text-primary { color: var(--mz-primary); }
.text-secondary { color: var(--mz-secondary); }
.text-success { color: var(--mz-success); }
.text-warning { color: var(--mz-warning); }
.text-danger { color: var(--mz-danger); }
.text-muted { color: var(--mz-text-tertiary); }

.text-center { text-align: center; }
.text-left { text-align: left; }
.text-right { text-align: right; }

.fw-light { font-weight: var(--mz-font-weight-light); }
.fw-normal { font-weight: var(--mz-font-weight-normal); }
.fw-bold { font-weight: var(--mz-font-weight-bold); }

.text-truncate {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.text-break { word-break: break-word; }

// _opacity.scss
.opacity-0 { opacity: 0; }
.opacity-25 { opacity: 0.25; }
.opacity-50 { opacity: 0.5; }
.opacity-75 { opacity: 0.75; }
.opacity-100 { opacity: 1; }

// _overflow.scss
.overflow-auto { overflow: auto; }
.overflow-hidden { overflow: hidden; }
.overflow-visible { overflow: visible; }

// _position.scss
.position-static { position: static; }
.position-relative { position: relative; }
.position-absolute { position: absolute; }
.position-fixed { position: fixed; }
.position-sticky { position: sticky; }

// _sizing.scss
.w-25 { width: 25%; }
.w-50 { width: 50%; }
.w-75 { width: 75%; }
.w-100 { width: 100%; }
.w-auto { width: auto; }

.h-25 { height: 25%; }
.h-50 { height: 50%; }
.h-75 { height: 75%; }
.h-100 { height: 100%; }
.h-auto { height: auto; }
```

**Tareas**:
- [ ] Crear 10+ archivos de utilidades
- [ ] Responsive variants para cada utilidad
- [ ] Testing de combinaciones
- [ ] Documentación con ejemplos

**Deliverables**:
- Sistema completo de utilidades
- Responsive classes
- Utility documentation

---

#### 2.3 Dark Mode Completo (20h)

```html
<!-- HTML: Theme toggle -->
<button 
  id="theme-toggle" 
  class="btn btn-icon"
  aria-label="Toggle dark mode"
  data-testid="theme-toggle">
  <i class="icon-moon"></i>
</button>

<script type="module">
  import { ThemeManager } from './utils/ThemeManager.js';
  
  const manager = new ThemeManager({
    storageKey: 'materialize-theme',
    autoDetect: true // Detectar prefers-color-scheme
  });
  
  document.getElementById('theme-toggle').addEventListener('click', () => {
    manager.toggle();
  });
</script>
```

**Tareas**:
- [ ] Dark mode variables
- [ ] ThemeManager utility class
- [ ] Detector de preferencia del sistema
- [ ] Persistencia en localStorage
- [ ] Transiciones suaves
- [ ] Testing en ambos temas

**Deliverables**:
- Dark mode totalmente funcional
- Auto-detection de preferencia
- ThemeManager API

---

### Fase 3: Endurecimiento y Pulido (6-8 semanas) 🟠

#### 3.1 Testing Exhaustivo (80h)

**Setup**:
```bash
npm install -D vitest @vitest/ui @testing-library/dom jsdom
npm install -D @playwright/test
```

**Estructura**:
```
tests/
├── unit/
│   ├── components/
│   │   ├── Modal.test.ts
│   │   ├── Button.test.ts
│   │   └── ...
│   └── utils/
├── integration/
│   ├── accessibility.test.ts
│   ├── theming.test.ts
│   └── ...
└── e2e/
    ├── modal.spec.ts
    ├── form-submission.spec.ts
    └── ...
```

**Cobertura objetivo**: 85%+

```bash
vitest --coverage
# Output:
# ✓ 89% statements
# ✓ 87% branches
# ✓ 91% functions
# ✓ 88% lines
```

**Tareas**:
- [ ] Unit tests para cada componente
- [ ] Integration tests para flujos
- [ ] E2E tests para user flows
- [ ] Accessibility testing
- [ ] Performance testing
- [ ] Coverage reports

---

#### 3.2 Security Audit Completo (50h)

```bash
npm audit
npm audit fix --audit-level=moderate
npx snyk test
npx biome check src/
```

**Checklist de seguridad**:
- [ ] XSS prevention en todos los componentes
- [ ] CSRF tokens en formularios
- [ ] CSP headers configurados
- [ ] Dependencies actualizadas
- [ ] No vulnerabilidades conocidas
- [ ] OWASP Top 10 review
- [ ] Security testing automatizado

**Deliverables**:
- `SECURITY.md` documento
- Security headers configurados
- Automated security scanning

---

#### 3.3 Documentación Completa (60h)

```
docs/
├── getting-started/
├── components/
│   ├── buttons.md
│   ├── forms.md
│   ├── modals.md
│   └── ...
├── utilities/
├── themes/
├── accessibility/
├── migration-guide/
├── api-reference/
└── contributing/
```

**Tareas**:
- [ ] Documentación de cada componente
- [ ] Guía de instalación
- [ ] Guía de uso
- [ ] Ejemplos interactivos
- [ ] API reference
- [ ] Accessibility guide
- [ ] Migration guide v1 → v2

**Deliverables**:
- Sitio de documentación completo
- Ejemplos interactivos
- API documentation

---

#### 3.4 Performance Optimization (40h)

```bash
# Mediciones
npm install -D @vitejs/plugin-compression lighthouse-ci
```

**Objetivos**:
- CSS: < 30KB minified + gzipped
- JS: < 20KB minified + gzipped
- Lighthouse score: > 95

**Tareas**:
- [ ] Code splitting
- [ ] Tree shaking
- [ ] CSS purging
- [ ] Image optimization
- [ ] Font optimization
- [ ] Lazy loading
- [ ] Performance monitoring

---

### Fase 4: Release y Mantenimiento (2-3 semanas) 🟢

#### 4.1 Beta Release (Semana 1)

```bash
npm publish --tag beta
# v2.0.0-beta.1
```

**Tareas**:
- [ ] Create changelog
- [ ] Anunciar beta públicamente
- [ ] Recopilar feedback
- [ ] Bug fixes basados en feedback

---

#### 4.2 RC Release (Semana 2)

```bash
npm publish --tag next
# v2.0.0-rc.1
```

**Tareas**:
- [ ] Freeze de features
- [ ] Bug fixes finales
- [ ] Final testing
- [ ] Documentación de release notes

---

#### 4.3 v2.0.0 Release (Semana 3)

```bash
npm publish
# v2.0.0
```

**Tareas**:
- [ ] Anunciar release oficial
- [ ] Blog post sobre v2
- [ ] Webinar/presentation
- [ ] Setup de soporte

---

## 2. Cronograma Detallado

```
Semana 1-2:    Fase 0 - Preparación
Semana 3-8:    Fase 1 - Fundacional
Semana 9-18:   Fase 2 - Componentes
Semana 19-26:  Fase 3 - Endurecimiento
Semana 27-29:  Fase 4 - Release

Total: ~7 meses de desarrollo
Equipo recomendado: 3-4 personas
```

---

## 3. Recursos Requeridos

### 3.1 Equipo
- 1 Tech Lead / Architect
- 2 Developers fullstack
- 1 QA / Testing
- 1 Documentation writer (part-time)

### 3.2 Herramientas
- GitHub (repo, discussions, wiki)
- CI/CD (GitHub Actions)
- Testing (Vitest, Playwright)
- Security (Snyk, CodeQL)
- Analytics (npm downloads)

### 3.3 Presupuesto Estimado
- Desarrollo: 800-1000 horas
- Testing: 150-200 horas
- Documentation: 100-150 horas
- Security: 60-80 horas
- **Total: 1110-1430 horas**

**Costo aproximado** (a $50/h): $55,500 - $71,500

---

## 4. Métricas de Éxito

| Métrica | Target | Baseline |
|---------|--------|----------|
| Componentes | 50+ | 36 |
| Utilidades CSS | 150+ | 20 |
| TypeScript coverage | 100% | 0% |
| Test coverage | 85%+ | 40% |
| Accessibility | WCAG 2.1 AA | No |
| Dark mode | ✓ | ✗ |
| CSS variables | 100+ | 0 |
| Bundle size | < 50KB | 50KB |
| Performance score | > 95 | 70 |
| Security score | > 95% | < 50% |

---

## 5. Riesgos y Mitigación

| Riesgo | Probabilidad | Impacto | Mitigación |
|--------|---|---|---|
| Delay en modernización | Alta | Alta | Sprint planning agresivo |
| Breaking changes para usuarios | Media | Alta | Detailed migration guide |
| Dependencias vulnerables | Media | Alta | Automated security scanning |
| Baja adopción v2 | Media | Media | Marketing + community engagement |
| Performance regression | Baja | Alta | Continuous performance testing |

---

## 6. Next Steps

1. **Inmediato**: Crear branch `v2-dev` y setup de desarrollo
2. **Semana 1**: Completar Fase 0 (preparación)
3. **Semana 3**: Comenzar Fase 1 (fundacional)
4. **Semana 9**: Review de progreso y ajustes
5. **Semana 19**: Feature freeze y testing intensivo
6. **Semana 27**: Release v2.0.0

