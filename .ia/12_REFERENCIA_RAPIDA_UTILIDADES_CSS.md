# REFERENCIA RÁPIDA - UTILIDADES CSS MATERIALIZE V2

**Acceso rápido a todas las clases de utilidad CSS recién agregadas**

---

## 🔍 Busca por Tema

### 1️⃣ PADDING

| Clase | Valor | Clase | Valor | Clase | Valor |
|-------|-------|-------|-------|-------|-------|
| .p0 | 0 | .pt0 | 0 | .px0 | 0 |
| .p1 | 4px | .pt1 | 4px | .px1 | 4px |
| .p2 | 8px | .pt2 | 8px | .px2 | 8px |
| .p3 | 16px | .pt3 | 16px | .px3 | 16px |
| .p4 | 24px | .pt4 | 24px | .px4 | 24px |
| .p5 | 32px | .pt5 | 32px | .px5 | 32px |

**Variantes:** `.pt`, `.pb`, `.pl`, `.pr`, `.px`, `.py` (mismo patrón 0-5)

**Ejemplo:**
```html
<div class="p3 pt1 pb2">Padding 16px todo, 4px top, 8px bottom</div>
```

---

### 2️⃣ MARGIN

| Clase | Valor | Clase | Valor | Clase | Valor |
|-------|-------|-------|-------|-------|-------|
| .m0 | 0 | .mt0 | 0 | .mx0 | 0 |
| .m1 | 4px | .mt1 | 4px | .mx1 | 4px |
| .m2 | 8px | .mt2 | 8px | .mx2 | 8px |
| .m3 | 16px | .mt3 | 16px | .mx3 | 16px |
| .m4 | 24px | .mt4 | 24px | .mx4 | 24px |
| .m5 | 32px | .mt5 | 32px | .mx5 | 32px |

**Variantes:** `.mt`, `.mb`, `.ml`, `.mr`, `.mx`, `.my` (mismo patrón 0-5)

**Ejemplo:**
```html
<div class="m3 mx-auto">Margin 16px, centrado horizontalmente</div>
```

---

### 3️⃣ OPACITY

| Clase | Valor | Clase | Valor | Clase | Valor |
|-------|-------|-------|-------|-------|-------|
| .opacity-0 | 0% | .opacity-25 | 25% | .opacity-60 | 60% |
| .opacity-10 | 10% | .opacity-30 | 30% | .opacity-70 | 70% |
| .opacity-20 | 20% | .opacity-40 | 40% | .opacity-80 | 80% |
| | | .opacity-50 | 50% | .opacity-90 | 90% |
| | | .opacity-75 | 75% | .opacity-100 | 100% |

**Con Hover:**
- `.opacity-hover` → Reduce a 80% en hover

**Ejemplo:**
```html
<img src="image.jpg" class="opacity-50 opacity-hover">
<!-- 50% opacidad, 80% en hover -->
```

---

### 4️⃣ BACKGROUND COLORS

| Clase | Color | Hover |
|-------|-------|-------|
| `.bg-primary` | Primario (#ee6e73) | Oscurece |
| `.bg-secondary` | Secundario (#26a69a) | Oscurece |
| `.bg-success` | Verde (#4caf50) | -15% |
| `.bg-warning` | Amarillo (#fb8c00) | -15% |
| `.bg-danger` | Rojo (#e53935) | Oscurece |
| `.bg-info` | Azul (#2196f3) | Oscurece |
| `.bg-light` | Gris claro (#f5f5f5) | Más oscuro |
| `.bg-dark` | Gris oscuro (#212121) | Más claro |

**Ejemplo:**
```html
<button class="bg-primary p2 text-white">
  Cambia de color en hover automáticamente
</button>
```

---

### 5️⃣ ANIMACIONES

#### Keyframes Disponibles

| Animación | Efecto |
|-----------|--------|
| `fadeIn` | Aparece gradualmente |
| `slideIn` | Desliza hacia arriba |
| `slideInLeft` | Desliza desde la izquierda |
| `slideInRight` | Desliza desde la derecha |
| `bounce` | Rebota infinitamente |
| `pulse` | Pulsa infinitamente |
| `rotate` | Rotación infinita |

#### Clases de Animación

| Clase | Efecto |
|-------|--------|
| `.animate-fade-in` | Fade in (300ms) |
| `.animate-slide-in` | Slide up (300ms) |
| `.animate-slide-in-left` | Slide left (300ms) |
| `.animate-slide-in-right` | Slide right (300ms) |
| `.animate-bounce` | Rebota 1s infinito |
| `.animate-pulse` | Pulsa 2s infinito |

**Ejemplo:**
```html
<div class="animate-fade-in">Aparece con efecto fade</div>
<div class="animate-bounce">Rebota infinitamente</div>
```

---

### 6️⃣ HOVER ANIMATIONS

| Clase | Efecto |
|-------|--------|
| `.animate-scale-hover` | Escala a 1.05 en hover |
| `.animate-shadow-hover` | Sombra + traslación en hover |
| `.animate-color-hover` | Cambia color en hover |
| `.shadow-sm-hover` | Aumenta sombra pequeña |
| `.shadow-lg-hover` | Aumenta sombra grande |

**Ejemplo:**
```html
<div class="p3 animate-scale-hover shadow-sm-hover">
  Escala + sombra en hover
</div>
```

---

### 7️⃣ TRANSICIONES

| Clase | Propiedad | Duración |
|-------|-----------|----------|
| `.transition-all` | Todo | Base (300ms) |
| `.transition-fade` | Opacity | Base |
| `.transition-transform` | Transform | Base |
| `.transition-colors` | Colores | Base |
| `.transition-shadow` | Shadow | Base |
| `.transition-fast` | Todo | Rápida (150ms) |
| `.transition-slow` | Todo | Lenta (500ms) |

**Ejemplo:**
```html
<div class="transition-all animate-scale-hover">
  Transición suave en hover
</div>
```

---

### 8️⃣ FLEXBOX

| Clase | Propiedad |
|-------|-----------|
| `.d-flex` | Display flex |
| `.flex-row` | Dirección horizontal |
| `.flex-column` | Dirección vertical |
| `.flex-wrap` | Envuelve items |
| `.justify-content-center` | Centra horizontalmente |
| `.justify-content-between` | Espaciado entre |
| `.align-items-center` | Centra verticalmente |
| `.gap-1` / `.gap-2` / `.gap-3` | Espaciado entre items |

**Ejemplo:**
```html
<div class="d-flex justify-content-center align-items-center gap-2">
  Flex centrado con espaciado
</div>
```

---

### 9️⃣ BORDES Y SOMBRAS

| Clase | Efecto |
|-------|--------|
| `.border` | Borde en todos lados |
| `.border-top` | Borde superior |
| `.rounded` | Bordes redondeados |
| `.rounded-circle` | Circular |
| `.shadow-sm` | Sombra pequeña |
| `.shadow-md` | Sombra media |
| `.shadow-lg` | Sombra grande |
| `.shadow-xl` | Sombra extragrande |

**Ejemplo:**
```html
<div class="rounded shadow-md p3">Card con sombra</div>
```

---

### 🔟 TIPOGRAFÍA

| Clase | Efecto |
|-------|--------|
| `.fw-light` | Font weight 300 |
| `.fw-normal` | Font weight 400 |
| `.fw-bold` | Font weight 700 |
| `.text-center` | Centrado |
| `.text-uppercase` | MAYÚSCULAS |
| `.text-lowercase` | minúsculas |
| `.text-capitalize` | Capitalizado |
| `.text-truncate` | Trunca con ... |
| `.text-primary` | Color primario |
| `.text-danger` | Color rojo |

**Ejemplo:**
```html
<h1 class="fw-bold text-center text-primary">Título</h1>
```

---

## 🎯 Combinaciones Populares

### Card Hover
```html
<div class="p3 rounded shadow-sm-hover animate-scale-hover transition-all">
  Content
</div>
```

### Button
```html
<button class="bg-primary p2 rounded text-white animate-color-hover">
  Click me
</button>
```

### Hero Section
```html
<div class="d-flex justify-content-center align-items-center min-h-100 
           bg-primary p3 animate-fade-in">
  <h1 class="text-white fw-bold">Welcome</h1>
</div>
```

### Navbar
```html
<nav class="d-flex justify-content-between align-items-center 
          bg-dark p2 shadow-lg">
  <h2 class="text-white fw-bold">Logo</h2>
  <div class="d-flex gap-2">
    <a href="#" class="text-white transition-colors">Link</a>
  </div>
</nav>
```

### Grid de Items
```html
<div class="d-flex flex-wrap gap-3">
  <div class="p3 rounded shadow-sm-hover animate-scale-hover" 
       style="flex: 1; min-width: 250px;">
    Item
  </div>
</div>
```

---

## 📊 Tabla de Referencia Completa

| Categoría | Total de Clases | Variantes |
|-----------|-----------------|-----------|
| Padding | 30 | p, pt, pb, pl, pr, px, py (0-5) |
| Margin | 30 | m, mt, mb, ml, mr, mx, my (0-5) |
| Opacity | 13 | opacity-0 a 100 (pasos 10%) |
| Background | 8 | primary, secondary, success, warning, danger, info, light, dark |
| Animaciones | 16 | fade, slide, bounce, pulse, rotate, scale, shadow, color |
| Transiciones | 15 | all, fade, transform, colors, shadow, fast, slow |
| Flexbox | 20+ | display, direction, justify, align, gap |
| Sombras | 10+ | shadow-sm a shadow-xl + hover variants |
| Tipografía | 30+ | weight, align, transform, color |
| **TOTAL** | **~170** | |

---

## 🚀 Ejemplos de Uso Rápido

### Espaciado Rápido
```html
<!-- Padding y margin -->
<div class="p3 m2">Padding 16px, Margin 8px</div>
```

### Card Interactiva
```html
<div class="p3 rounded shadow-sm-hover animate-scale-hover">
  <h3 class="fw-bold text-primary">Título</h3>
  <p class="text-muted">Descripción</p>
</div>
```

### Botón Elegante
```html
<button class="bg-primary p2 px3 rounded text-white animate-color-hover">
  Acción
</button>
```

### Imagen Interactiva
```html
<img src="img.jpg" class="rounded opacity-75 opacity-hover transition-all">
```

### Layout Flexbox
```html
<div class="d-flex justify-content-between align-items-center gap-2">
  <div>Izquierda</div>
  <div>Derecha</div>
</div>
```

---

## 💡 Tips de Uso

1. **Combinaciones permitidas:** Puedes combinar todas las clases
2. **Especificidad:** Usa `!important` solo si es necesario
3. **Responsive:** Agrega breakpoints según necesites
4. **Performance:** Minifica el CSS en producción
5. **Fallbacks:** Agrega prefijos `-webkit` si necesitas IE11

---

## 📂 Dónde Encontrar

- **Especificación completa:** [03_MEJORAS_PROPUESTAS.md](03_MEJORAS_PROPUESTAS.md) (Sección 2.2)
- **Ejemplos HTML:** [07_EJEMPLOS_IMPLEMENTACION.md](07_EJEMPLOS_IMPLEMENTACION.md) (Sección 8)
- **Archivos SCSS:** [10_ESTRUCTURA_ARCHIVOS_SCSS.md](10_ESTRUCTURA_ARCHIVOS_SCSS.md)
- **Cambios realizados:** [11_RESUMEN_CAMBIOS_UTILIDADES_CSS.md](11_RESUMEN_CAMBIOS_UTILIDADES_CSS.md)

---

**Última actualización:** 2026-06-09  
**Versión:** Materialize v2.0 (Draft)  
**Status:** ✅ Listo para implementar

