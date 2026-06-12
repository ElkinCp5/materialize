# **PLAN MAESTRO DE MODERNIZACIÓN: MATERIALIZE v2.0 (JUNIO 2026\)**

Este documento unifica, actualiza y detalla la especificación técnica completa, la arquitectura de software, la guía de estilo, los protocolos de seguridad, la comparativa frente a Bootstrap 5 y el roadmap estratégico para la evolución de Materialize CSS a su versión 2.0.

## **1\. RESUMEN EJECUTIVO Y DIAGNÓSTICO ACTUAL**

### **1.1 El Estado del Arte (Materialize v1)**

Materialize CSS es un framework de UI basado en Material Design de Google, desarrollado originalmente entre 2014 y 2015\. El proyecto se encuentra estancado en su versión 1.0.0 estable desde 2019, lo que ha generado una acumulación severa de deuda técnica. Su falta de mantenimiento activo oficial lo sitúa en una desventaja crítica frente a competidores modernos como Bootstrap 5, Tailwind CSS y Lit/Vanilla Web Components.

### **1.2 Métricas de Impacto y Viabilidad**

| Dimensión                  | Estado de Materialize v1                                     | Meta Objetivo en Materialize v2.0                              |
| :------------------------- | :----------------------------------------------------------- | :------------------------------------------------------------- |
| **Dependencias Core**      | jQuery (Dependencia explícita y forzada)                     | Vanilla TypeScript puro (0% dependencias)                      |
| **Personalización**        | Compilación de SASS manual (Variables hardcodeadas)          | CSS Variables interactivas (+100 propiedades en *runtime*)     |
| **Soporte de Temas**       | Inexistente (Fuerza manual de estilos)                       | Modo Oscuro automático nativo e hilos de renderizado reactivos |
| **Cumplimiento WCAG**      | Deficiente (Incompatible con lectores de pantalla)           | Certificación WCAG 2.1 AA completa                             |
| **Ecosistema JS**          | Grunt, Babel 6, Jasmine                                      | Vite, TypeScript, Vitest, Playwright, Biome                    |
| **Vulnerabilidades**       | 45 identificadas (8 Críticas, 12 Altas, 15 Medias, 10 Bajas) | 0 vulnerabilidades conocidas (Clean Audit)                     |
| **Lighthouse Score**       | Promedio de 70 (Falta de optimización y peso excesivo)       | Promedio de ![][image1] en performance, accesibilidad y SEO    |
| **Peso del Bundle (gzip)** | CSS compilado: \~50KB                                        | JS compilado: \~25KB                                           | CSS optimizado: \< 30KB | JS optimizado: \< 15KB |

## **2\. PRINCIPIOS DE ARQUITECTURA Y CAPA DE CONVENCIONES**

Para extender y modernizar el framework sin provocar una ruptura catastrófica en los entornos de producción que ya utilizan Materialize v1, se establece una capa formal de convivencia de bajo nivel:

* **Namespace Protegido (mz-):** Todas las nuevas clases estéticas CSS, selectores, atributos descriptivos (data-mz-\*) y eventos nativos personalizados (mz:) usan estrictamente el prefijo de espacio de nombres para evitar colisiones estéticas con hojas de estilo anteriores.  
* **Coexistencia Paralela Nactiva:** Los antiguos scripts y selectores originales siguen funcionando de manera estándar. Los nuevos componentes se montan sobre sus propios contextos.  
* **Vanilla TypeScript Estricto:** Se anula jQuery en la infraestructura v2. Cada componente nuevo se define como una clase estática que opera directamente sobre la API del DOM nativo.  
* **API Híbrida Inteligente:** Los componentes pueden inicializarse de forma puramente programática:  
  const picker \= new MzDateRangePicker(element, options);

  O autodetectarse de forma declarativa mediante markup HTML a través de atributos específicos que el motor AutoInit analizará automáticamente en segundo plano.  
* **Eventos Desacoplados y Tipados:** La comunicación reactiva ocurre a través de eventos estándar del DOM (CustomEvent) emitidos sobre el elemento raíz del componente. Esto permite su suscripción mediante un simple el.addEventListener('mz:change', ...) desde cualquier framework (React, Vue, Svelte) o JS vainilla.

## **3\. ESTRUCTURA DE ARCHIVOS UNIFICADA**

src/  
├── sass/  
│   ├── materialize/          ← Framework v1 original intacto  
│   │   └── ...  
│   ├── components/           ← Nuevos estilos modulares de expansión v2  
│   │   ├── \_date-range.scss  
│   │   ├── \_time-range.scss  
│   │   ├── \_input-password.scss  
│   │   ├── \_input-group.scss  
│   │   ├── \_select-search.scss  
│   │   ├── \_steps.scss  
│   │   ├── \_cascade.scss  
│   │   ├── \_masonry.scss  
│   │   ├── \_tree.scss  
│   │   └── \_popover.scss  
│   ├── layout/                 
│   │   ├── \_grid.scss          
│   │   └── \_flexbox.scss       
│   ├── utilities/              
│   │   └── \_validation.scss    
│   └── materialize-ext.scss  ← Punto de entrada SASS de la extensión  
│  
├── ts/  
│   ├── core/                 ← Capa fundacional de arquitectura  
│   │   ├── Component.ts      ← Clase abstracta y contrato de ciclo de vida  
│   │   ├── EventEmitter.ts   ← Mezclador (Mixin) de eventos reactivos  
│   │   ├── AutoInit.ts       ← Motor del MutationObserver para SPA  
│   │   └── utils/            ← Utilidades puras de optimización  
│   │       ├── dom.ts        ← Manipulador seguro de nodos  
│   │       ├── date.ts       ← Motor aritmético temporal (sin dependencias)  
│   │       ├── position.ts   ← Algoritmo de posicionamiento físico y flip  
│   │       ├── validators.ts ← Regex anti-ReDoS de seguridad  
│   │       └── observer.ts   ← Helper optimizado del IntersectionObserver  
│   ├── components/           ← Controladores dinámicos de UI  
│   │   ├── DateRangePicker.ts  
│   │   ├── TimeRangePicker.ts  
│   │   ├── InputPassword.ts  
│   │   ├── InputGroup.ts  
│   │   ├── SelectSearch.ts  
│   │   ├── Steps.ts  
│   │   ├── Cascade.ts  
│   │   ├── Masonry.ts  
│   │   ├── Tree.ts  
│   │   ├── TreeSelect.ts  
│   │   ├── Popover.ts  
│   │   └── FormValidation.ts  
│   └── index.ts              ← Punto de entrada compilador JS/TS

## **4\. CICLO DE VIDA Y MOTOR DE OPTIMIZACIÓN DEL DOM**

### **4.1 La Clase Base Component**

Todos los componentes nuevos extienden esta interfaz común de ciclo de vida para estandarizar su inicialización y prevenir fugas de memoria (*memory leaks*):

export abstract class Component\<O \= object\> {  
  protected readonly el: HTMLElement;  
  protected readonly options: O;  
  protected \_isInitialized \= false;

  constructor(el: HTMLElement, options?: Partial\<O\>) {  
    this.el \= el;  
    this.options \= this.mergeOptions(options);  
    this.init();  
    this.\_isInitialized \= true;  
  }

  protected abstract init(): void;  
  public abstract destroy(): void;

  protected emit(event: string, detail: any \= {}): void {  
    const customEvent \= new CustomEvent(\`mz:${event}\`, {  
      bubbles: true,  
      cancelable: true,  
      detail  
    });  
    this.el.dispatchEvent(customEvent);  
  }

  protected on(event: string, callback: EventListener): void {  
    this.el.addEventListener(\`mz:${event}\`, callback);  
  }

  protected abstract mergeOptions(userOptions?: Partial\<O\>): O;  
}

### **4.2 Inicialización Declarativa con AutoInit**

AutoInit optimiza la DX (*Developer Experience*) permitiendo un desarrollo sin código JS explícito. Escanea el DOM al cargar y vigila mutaciones asíncronas:

export class AutoInit {  
  private static observer: MutationObserver | null \= null;  
  private static registries \= new Map\<string, any\>();

  public static register(name: string, componentClass: any): void {  
    this.registries.set(name, componentClass);  
  }

  public static init(context: ParentNode \= document): void {  
    this.registries.forEach((componentClass, name) \=\> {  
      const elements \= context.querySelectorAll(\`\[data-mz-${name}\]\`);  
      elements.forEach((el) \=\> {  
        if (\!(el as any).\_\_mzInstance) {  
          const configAttr \= el.getAttribute(\`data-mz-${name}\`) || '{}';  
          try {  
            const options \= JSON.parse(configAttr);  
            (el as any).\_\_mzInstance \= new componentClass(el, options);  
          } catch (e) {  
            (el as any).\_\_mzInstance \= new componentClass(el);  
          }  
        }  
      });  
    });

    this.setupMutationObserver();  
  }

  private static setupMutationObserver(): void {  
    if (this.observer) return;

    this.observer \= new MutationObserver((mutations) \=\> {  
      mutations.forEach((mutation) \=\> {  
        mutation.addedNodes.forEach((node) \=\> {  
          if (node instanceof HTMLElement) {  
            this.init(node);  
          }  
        });  
      });  
    });

    this.observer.observe(document.body, { childList: true, subtree: true });  
  }  
}

### **4.3 Incorporación Estratégica: El Helper utils/observer.ts**

Para mejorar drásticamente el rendimiento de renderizado en árboles del DOM complejos, se integra este ayudante centralizado de IntersectionObserver.

Evita la creación innecesaria de múltiples observadores en memoria, reutilizando una única instancia compartida por página para procesar devoluciones asociadas a la visibilidad de elementos, con un fallback ultraoptimizado para navegadores legacy basado en listeners pasivos.

export type IntersectionCallback \= (isIntersecting: boolean) \=\> void;

export interface ObserveOptions {  
  threshold?: number;  
  rootMargin?: string;  
}

const registry \= new Map\<Element, IntersectionCallback\>();  
let sharedObserver: IntersectionObserver | null \= null;

function getSharedObserver(options: ObserveOptions): IntersectionObserver {  
  if (\!sharedObserver) {  
    sharedObserver \= new IntersectionObserver(  
      (entries) \=\> {  
        entries.forEach((entry) \=\> {  
          const cb \= registry.get(entry.target);  
          if (cb) cb(entry.isIntersecting);  
        });  
      },  
      {  
        threshold: options.threshold ?? 0.1,  
        rootMargin: options.rootMargin ?? "0px",  
      }  
    );  
  }  
  return sharedObserver;  
}

// FALLBACK ELEGIBLE — Scroll \+ Viewport  
interface FallbackEntry {  
  element: Element;  
  callback: IntersectionCallback;  
  threshold: number;  
  lastState: boolean | null;  
}

const fallbackEntries: FallbackEntry\[\] \= \[\];  
let fallbackListenerAttached \= false;

function isElementInViewport(element: Element, threshold: number): boolean {  
  const rect \= element.getBoundingClientRect();  
  const windowHeight \= window.innerHeight || document.documentElement.clientHeight;  
  const windowWidth \= window.innerWidth || document.documentElement.clientWidth;

  const visibleHeight \= Math.min(rect.bottom, windowHeight) \- Math.max(rect.top, 0);  
  const visibleWidth \= Math.min(rect.right, windowWidth) \- Math.max(rect.left, 0);

  if (visibleHeight \<= 0 || visibleWidth \<= 0\) return false;

  const visibleArea \= visibleHeight \* visibleWidth;  
  const totalArea \= rect.height \* rect.width;

  if (totalArea \=== 0\) return false;  
  return (visibleArea / totalArea) \>= threshold;  
}

function runFallbackCheck(): void {  
  fallbackEntries.forEach((entry) \=\> {  
    const isIntersecting \= isElementInViewport(entry.element, entry.threshold);  
    if (isIntersecting \!== entry.lastState) {  
      entry.lastState \= isIntersecting;  
      entry.callback(isIntersecting);  
    }  
  });  
}

function attachFallbackListener(): void {  
  if (fallbackListenerAttached) return;  
  fallbackListenerAttached \= true;

  window.addEventListener("scroll", runFallbackCheck, { passive: true });  
  window.addEventListener("resize", runFallbackCheck, { passive: true });  
  runFallbackCheck();  
}

function observeFallback(element: Element, callback: IntersectionCallback, options: ObserveOptions): void {  
  fallbackEntries.push({  
    element,  
    callback,  
    threshold: options.threshold ?? 0.1,  
    lastState: null,  
  });  
  attachFallbackListener();  
  runFallbackCheck();  
}

function unobserveFallback(element: Element): void {  
  const index \= fallbackEntries.findIndex((e) \=\> e.element \=== element);  
  if (index \!== \-1) fallbackEntries.splice(index, 1);

  if (fallbackEntries.length \=== 0 && fallbackListenerAttached) {  
    window.removeEventListener("scroll", runFallbackCheck);  
    window.removeEventListener("resize", runFallbackCheck);  
    fallbackListenerAttached \= false;  
  }  
}

// API PÚBLICA DE OBSERVACIÓN  
const supportsIntersectionObserver \= typeof window \!== "undefined" && "IntersectionObserver" in window;

export function observe(element: Element, callback: IntersectionCallback, options: ObserveOptions \= {}): void {  
  if (supportsIntersectionObserver) {  
    registry.set(element, callback);  
    getSharedObserver(options).observe(element);  
  } else {  
    observeFallback(element, callback, options);  
  }  
}

export function unobserve(element: Element): void {  
  if (supportsIntersectionObserver) {  
    registry.delete(element);  
    sharedObserver?.unobserve(element);  
  } else {  
    unobserveFallback(element);  
  }  
}

export function disconnectAll(): void {  
  if (supportsIntersectionObserver) {  
    sharedObserver?.disconnect();  
    sharedObserver \= null;  
    registry.clear();  
  } else {  
    fallbackEntries.length \= 0;  
    if (fallbackListenerAttached) {  
      window.removeEventListener("scroll", runFallbackCheck);  
      window.removeEventListener("resize", runFallbackCheck);  
      fallbackListenerAttached \= false;  
    }  
  }  
}

## **5\. ESPECIFICACIONES LÓGICAS DE COMPONENTES NUEVOS**

### **5.1 Date Range Picker**

* **Propósito:** Selección de rangos temporales en una sola sesión web interactiva con maquetación de calendario lateral dual.  
* **Estados Internos:** idle (estado inicial), selecting (esperando el segundo click de término), selected (rango establecido), disabled.  
* **Mapeo y Lógica:** El algoritmo lee la fecha del primer click; en hover dibuja las celdas intermedias. Si el segundo click captura un valor inferior a la primera fecha, la lógica invierte automáticamente las posiciones para evitar inconsistencias de tiempo. Días bloqueados (disabledDates) y límites espaciales (minDate, maxDate) se evalúan mediante funciones puras en utils/date.ts.

### **5.2 Time Range Picker**

* **Propósito:** Capturar rangos horarios continuos en ruedas interactivas de scroll continuo.  
* **Mapeo de Control:** Las columnas de selección de horas (00-23) y minutos (00-59 con saltos dinámicos) usan física de desplazamiento por inercia táctil o mouse. Al soltar, se calcula el ítem más cercano y se aplica un "snap" visual inmediato de ajuste por CSS.  
* **Validación:** Valida de manera nativa y reactiva que ![][image2]. En caso contrario, inhabilita el botón del footer y añade la clase .is-invalid al wrapper.

### **5.3 Input Password**

* **Propósito:** Campo de entrada de alta seguridad con toggle de visibilidad integrado, medidor visual de fortaleza y generador criptográfico fuerte.  
* **Lógica de Generación:** Emplea de manera obligatoria crypto.getRandomValues() sobre un charset variable configurado por el programador. Baraja recursivamente la cadena final (*shuffle*) para asegurar que al menos un elemento de cada regla activa esté presente, logrando una entropía máxima para proteger al usuario.  
* **Fórmula de Fuerza:** Incrementa de 0 a 4 puntos sobre criterios explícitos: longitud ![][image3] (+1), mayúsculas y minúsculas mixtas (+1), dígitos numéricos (+1) y caracteres especiales (+1). El indicador cambia dinámicamente sus clases de color según el valor final:  
  ![][image4]

### **5.4 Input Group**

* **Propósito:** Componente de maquetación flexbox pura que unifica elementos en un solo cuerpo.  
* **Operación:** Propaga eventos del input interno como focus y blur para inyectar o remover respectivamente la clase .is-focused sobre el wrapper principal, manteniendo sincronizadas las sombras y bordes circundantes en tiempo real.

### **5.5 Select con Búsqueda (SelectSearch)**

* **Propósito:** Elemento select personalizable con buscador, grupos definidos y modo multiselección por chips.  
* **Sincronización:** El \<select\> nativo original se oculta de forma segura pero se actualiza programáticamente a cada instante para preservar la compatibilidad con motores tradicionales de formularios y serializaciones en el backend.  
* **Filtros:** Incorpora un mecanismo interno de *debounce* a 150ms sobre las búsquedas para atenuar repintados en listas de miles de nodos, aislando las coincidencias y envolviéndolas dinámicamente en etiquetas \<mark\> estéticas.

### **5.6 Steps (Asistente de Pasos)**

* **Propósito:** Wizard dinámico de avance lineal o no lineal.  
* **Lógica Avanzada:** Admite una promesa opcional asíncrona (onBeforeNext) como interceptor en el flujo. Al avanzar, el asistente evalúa esta lógica (ej. enviar API de validación) y solo si se resuelve con éxito permite pasar del panel actual .active al siguiente.

### **5.7 Cascada (Selects Encadenados)**

* **Propósito:** Conexión lógica y asíncrona de inputs multinivel (ej: País ![][image5] Provincia ![][image5] Ciudad).  
* **Flujo:** La selección de un valor en el nivel superior limpia y bloquea recursivamente todas las dependencias inferiores de la cadena. Se despliega un spinner integrado en el componente hijo mientras se resuelven los datos asíncronos de la nueva lista.

### **5.8 Validación de Formulario (FormValidation)**

* **Propósito:** Motor declarativo completo para validación sin lógica javascript adicional obligatoria.  
* **Sintaxis de marcado:** data-mz-required, data-mz-min-length="8", data-mz-pattern="...", etc.  
* **Mecanismo:** Intercepta la acción de envío del formulario (submit). Si detecta inputs con fallos, aborta la subida de datos, despliega textos informativos dentro de las etiquetas .mz-error-message del DOM y ejecuta un scroll suave (*smooth scrolling*) dirigido de manera automática al primer elemento que ha fallado.

### **5.9 Masonry**

* **Propósito:** Disposición de tarjetas en columnas fluidas dinámicas de altura variable sin recurrir a CSS Columns.  
* **Algoritmo:** Al cargarse o redimensionarse la pantalla, el script calcula el ancho actual, determina el número de columnas y mantiene un array en memoria con el registro de la altura acumulada de cada carril. Posiciona de forma absoluta cada elemento nuevo bajo la columna con la altura mínima registrada en ese instante, actualizando dinámicamente el tamaño del elemento contenedor contenedor. Para mitigar problemas de parpadeo, se enlaza directamente a un ResizeObserver.

### **5.10 Tree y TreeSelect**

* **Propósito:** Navegación jerárquica jerarquizada y con estados condicionales para capturas de datos.  
* **Efecto Cascada:** Los checkboxes de verificación en modo múltiple se autocalculan asíncronamente en ambos sentidos. Al marcar un nodo raíz, se autoseleccionan todos sus hijos de manera descendente. Al desmarcar un hijo de un nodo seleccionado, se recalcula el estado de todos sus ancestros para transformarlos en casillas de estado parcial indeterminado (*indeterminate*).

### **5.11 Popover**

* **Propósito:** Tooltip enriquecido de interacción compleja y dinámico.  
* **Algoritmo Auto-Flip:** Integrado a utils/position.ts, calcula si la posición ideal (ej: top) colisiona con los bordes de la ventana. De ser así, invierte el eje (bottom) de manera automática. Si sigue colisionando, busca espacio en los costados laterales, eligiendo el eje con mayor área libre para evitar que el contenido se recorte visualmente.

## **6\. SISTEMA DE ESTILOS Y UTILIDADES CSS (150+ CLASES)**

Toda la hoja de estilos de utilidades se integra con propiedades SASS modernas y cuenta con variantes dinámicas al hacer hover.

### **6.1 Espaciados (Padding & Margin)**

Estructurados de 0 a 5 representando valores proporcionales basados en variables de raíz:

* Variantes: p-, pt-, pb-, pl-, pr-, px-, py- (Ídem para márgenes usando m-).  
* Valores por escala: 0 (0px), 1 (4px), 2 (8px), 3 (16px), 4 (24px), 5 (32px).

### **6.2 Moduladores de Opacidad**

Valores fijos: .opacity-0 a .opacity-100 en intervalos constantes de 10%.

* .opacity-hover: Rebaja de manera dinámica la opacidad al 80% al posicionar el ratón encima del elemento.

### **6.3 Colores de Fondo Reactivos**

* .bg-primary / .bg-secondary / .bg-success / .bg-warning / .bg-danger / .bg-info / .bg-light / .bg-dark.  
  Al hacer hover, disminuyen de manera nativa su brillo un ![][image6] para dar retroalimentación visual táctil inmediata.

### **6.4 Sombras con Hover Integrado**

* .shadow-sm (Sombras sutiles).  
* .shadow-md (Sombras medianas).  
* .shadow-lg (Sombra pronunciada).  
* .shadow-sm-hover / .shadow-lg-hover: Escalado dinámico de sombras y profundidades por CSS exclusivamente al interactuar con el puntero.

### **6.5 Animaciones y Transiciones Nativas**

* Keyframes incluidos por defecto: fadeIn, slideIn, bounce, pulse, rotate.  
* Clases asociadas: .animate-fade-in, .animate-slide-in, .animate-bounce, .animate-pulse.  
* Modificadores de transformación: .animate-scale-hover (Escala del contenedor a ![][image7] por CSS en hover) y .animate-shadow-hover (Desplaza sutilmente hacia arriba y proyecta sombra).

## **7\. SISTEMA DE VARIABLES CSS DE COLORES Y TEMAS**

El corazón de la modernización estética de la v2.0 radica en el uso completo de variables nativas en el DOM (*runtime CSS custom properties*). Permite mutar paletas enteras y dar soporte al Modo Oscuro nativo sin recargar recursos.

/\* sass/components/\_css-variables.scss \*/  
:root {  
  /\* Escala de Grises Modular \*/  
  \--mz-gray-50: \#fafafa;  
  \--mz-gray-100: \#f5f5f5;  
  \--mz-gray-200: \#eeeeee;  
  \--mz-gray-300: \#e0e0e0;  
  \--mz-gray-400: \#bdbdbd;  
  \--mz-gray-500: \#9e9e9e;  
  \--mz-gray-600: \#757575;  
  \--mz-gray-700: \#616161;  
  \--mz-gray-800: \#424242;  
  \--mz-gray-900: \#212121;

  /\* Tema Light (Default) \*/  
  \--mz-theme-bg: \#ffffff;  
  \--mz-theme-surface: var(--mz-gray-50);  
  \--mz-text-primary: var(--mz-gray-900);  
  \--mz-text-secondary: var(--mz-gray-600);  
  \--mz-text-muted: var(--mz-gray-400);

  \--mz-primary: \#ee6e73;  
  \--mz-primary-dark: \#d05358;  
  \--mz-secondary: \#26a69a;  
  \--mz-success: \#4caf50;  
  \--mz-warning: \#fb8c00;  
  \--mz-danger: \#e53935;  
  \--mz-info: \#2196f3;

  /\* Elevaciones de Sombras \*/  
  \--mz-shadow-sm: 0 2px 4px rgba(0, 0, 0, 0.05);  
  \--mz-shadow-md: 0 4px 8px rgba(0, 0, 0, 0.08);  
  \--mz-shadow-lg: 0 8px 16px rgba(0, 0, 0, 0.12);

  /\* Atributos Estéticos \*/  
  \--mz-border-radius: 8px;  
  \--mz-border-radius-lg: 16px;  
  \--mz-border-radius-circle: 50%;  
  \--mz-transition-base: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);  
}

/\* Tema Dark \*/  
\[data-mz-theme="dark"\] {  
  \--mz-theme-bg: \#121212;  
  \--mz-theme-surface: \#1e1e1e;  
  \--mz-text-primary: var(--mz-gray-100);  
  \--mz-text-secondary: var(--mz-gray-400);  
  \--mz-text-muted: var(--mz-gray-600);

  \--mz-primary: \#ff8a8e;  
  \--mz-primary-dark: \#ee6e73;  
  \--mz-secondary: \#80cbc4;

  \--mz-shadow-sm: 0 2px 4px rgba(0, 0, 0, 0.3);  
  \--mz-shadow-md: 0 4px 8px rgba(0, 0, 0, 0.4);  
  \--mz-shadow-lg: 0 8px 16px rgba(0, 0, 0, 0.5);  
}

## **8\. INFORME DE SEGURIDAD Y PLAN DE REMEDIACIÓN**

### **8.1 Vulnerabilidades Críticas Mitigadas**

1. **Remover jQuery (XSS & ReDoS):** Materialize v1 emplea versiones vulnerables a secuestros de sesión mediante inyecciones HTML (CVE-2020-11022, CVE-2020-11023). Al remover jQuery y forzar el uso de elementos seguros nativos (textContent), se mitiga este vector al ![][image8].  
2. **Sanitización Obligatoria en Componentes:** Elementos como Toast, Tooltip y Modal en la versión anterior insertaban HTML plano de manera directa en el DOM (innerHTML). En la v2, todas las cadenas se sanitizan estrictamente mediante parsers seguros del navegador o el uso exclusivo de APIs que escapan datos de forma nativa.  
3. **Expresiones Regulares Seguras:** Módulos de captura como Autocomplete y TimePicker contenían patrones regex vulnerables a ataques de Denegación de Servicio (ReDoS). Se han reescrito y probado bajo límites de ejecución controlada en utils/validators.ts.

### **8.2 Configuración del Linter de Seguridad y Formateo (Biome)**

El proyecto ha migrado de ESLint a **Biome** debido a los conflictos internos de dependencias obsoletas heredadas del ecosistema antiguo. Biome unifica las directrices de seguridad, linter y formateador a velocidades extremas.

/\* biome.json \*/  
{  
  "$schema": "\[https://biomejs.dev/schemas/1.8.2/schema.json\](https://biomejs.dev/schemas/1.8.2/schema.json)",  
  "organizeImports": {  
    "enabled": true  
  },  
  "linter": {  
    "enabled": true,  
    "rules": {  
      "recommended": true,  
      "security": {  
        "noDangerouslySetInnerHtml": "error",  
        "noDangerouslySetInnerHtmlWithChildren": "error"  
      },  
      "correctness": {  
        "noUnusedVariables": "warn",  
        "noUnusedImports": "error"  
      }  
    }  
  },  
  "formatter": {  
    "enabled": true,  
    "formatWithErrors": false,  
    "indentStyle": "space",  
    "indentWidth": 2,  
    "lineWidth": 100  
  }  
}

## **9\. COMPARATIVA DETALLADA FRENTE A BOOTSTRAP 5**

La siguiente matriz analiza el alcance funcional y de arquitectura de la modernización frente al estándar actual de la industria:

| Característica Técnica       | Materialize v1.0            | Bootstrap v5.3                 | Materialize v2.0 EXT                    |
| :--------------------------- | :-------------------------- | :----------------------------- | :-------------------------------------- |
| **Dependencia de jQuery**    | Sí (Requerido)              | No (Vanilla JS)                | **No (TypeScript puro)**                |
| **Soporte de TypeScript**    | No (Falta de tipos)         | Parcial (Tipos externos)       | **Sí (Nativo y compilado)**             |
| **CSS Custom Properties**    | No (Inexistente)            | Sí (Parcial)                   | **Sí (+100 variables globales)**        |
| **Soporte de Modo Oscuro**   | No                          | Sí (Por atributos)             | **Sí (Automático y reactivo)**          |
| **Componentes de Rejilla**   | Grid simple (3 breakpoints) | Grid extendido (6 breakpoints) | **Grid moderno con contenedores CSS**   |
| **Accesibilidad WCAG 2.1**   | Deficiente                  | WCAG 2.1 AA Compliant          | **WCAG 2.1 AA Compliant**               |
| **RTL (Right to Left)**      | No                          | Sí                             | **Sí (Soporte nativo mediante SASS)**   |
| **Componentes Avanzados**    | 36 básicos                  | 50+ avanzados                  | **50+ (12 nuevos de alta complejidad)** |
| **Soporte de Build moderno** | Grunt (Desactualizado)      | Webpack / Rollup               | **Vite \+ esbuild de alta velocidad**   |

## **10\. CRONOGRAMA DE IMPLEMENTACIÓN Y ROADMAP**

El proceso de modernización se estructurará a lo largo de un período estimado de **7 meses (aprox. 1,000 horas de desarrollo)** con un equipo recomendado de 3 a 4 ingenieros de software, distribuidos de la siguiente manera:

                                CRONOGRAMA MAESTRO DE RUTA  
                                  
   Fase 0: Preparación (1-2 Semanas)  
   ├── Setup de Entorno, Git Branching v2-dev, Configuración de CI/CD (Vite, Vitest, Playwright)  
   └── Estructuración de Biome de Seguridad y Husky Hooks  
     
   Fase 1: Infraestructura Core (4-6 Semanas) ──► ¡FASE CRÍTICA\!  
   ├── Creación de Capas Utilitarias (dom.ts, date.ts, position.ts, validators.ts, observer.ts)  
   ├── Extracción completa de jQuery e inyección del motor abstract Component y AutoInit  
   └── Inyección de CSS Variables básicas y paletas Light/Dark automatizadas  
     
   Fase 2: Componentes Amplificados (8-10 Semanas)  
   ├── Construcción de los 12 nuevos componentes avanzados y utilidades SCSS (150+ clases)  
   └── Setup dinámico del ThemeManager y modo de accesibilidad ARIA completa  
     
   Fase 3: Endurecimiento, Pruebas y Cobertura (6-8 Semanas)  
   ├── Escalado de Test de Cobertura a un mínimo de 85% (Vitest \+ Playwright)  
   ├── Auditoría de Seguridad Integral (OWASP Top 10\) y optimización estricta de bundle  
   └── Documentación completa e interactiva con guías de migración paso a paso  
     
   Fase 4: Lanzamiento y Estabilización (2-3 Semanas)  
   ├── Lanzamiento de la versión Beta y recopilación del feedback de la comunidad  
   └── Bug fixing final, Release Candidate y lanzamiento definitivo de Materialize v2.0.0

### **10.1 Presupuesto Estimado de Ingeniería**

* **Desarrollo de Software:** 850 horas de ingeniería especializada.  
* **Aseguramiento de Calidad (QA/Tests):** 180 horas de control automático de flujos de usuario.  
* **Documentación Técnica:** 100 horas de generación de casos de uso y guías de desarrollo.  
* **Auditoría de Seguridad Adicional:** 50 horas de validación física de escapes e inyecciones.  
* **Costo Financiero Estimado (Tarifa base $50/h):** **$59,000 USD \- $67,500 USD**.

Con esta modernización estratégica, Materialize v2.0 se posicionará nuevamente como una alternativa líder de diseño basada en Material Design, combinando un rendimiento técnico de nivel empresarial, con una experiencia de desarrollo (*DX*) excelente y un ecosistema moderno y robusto.

[image1]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACUAAAAWCAYAAABHcFUAAAACGElEQVR4XpVUO07EMBCNtVohhESDtBHabOIoqREiBRId1Ei0Wy8H4AKICyA6qr0FJ6CgoUCIQ3AQxv+xPbbDk2bjefPxi3ecqpoFhpZoHcBF6Bya9eHnkBUkSbAxozBjCw0RY2QG5vDhuCUCzfrIN5FUxEeEQ7ogIkkqizDf+CFfhFGJC4kmHkXEHbLBquq67hrsk/d8O03T0vCFsv9BN1MP8Tuje9M0hyBsB/YDdr+q6yPBh6WFg7IwMTu8jM7PXGYHcVKc8y0I+wJ7HMfxOMyRyKhzp4F9HzEXVmnPEmqxAFE3YB9gz+v1+gTFcF5AJjzdPxaDkYkGIQYnd9m13TuIewU79cMKpFbk4V/Kx2xEk4Ak+BsP2rZ9AlG/TbMZbQA1sPMxq2kMWyYWxjDMm2zkBWh3LVwAEPVQ6wvgVxDvLRXGOSXEX3Xki82FCDiZbzH4+FMR1WXgC8VERnCoTNw2cevkd4vzO6AWKs+H9EMSEf4qSoxBaRQDrAdZDPRVpcVguPapTVI8BiPTLGUW8Dfdwqm89bw/k7SYh9wLFr54JprKSvESMljOSLpJ5F6oSosOynDYlVgWq2fBFHqnptvmdqUdB0NPF9Oy7/sarr6YK2mtfoY2DMOKmXmL+mrBiHd+eKUKgHk6hw33IGqvnll7EeJtcXYn4hRToEKF2dVIJaV4DCqHxbpJhEef4hB8TnlULQZNK/YPBJA1Fp7f+XwAAAAASUVORK5CYII=>

[image2]: <data:image/png;base64,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>

[image3]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAZCAYAAABQDyyRAAADDUlEQVR4XpVWPYhUMRDeoCIinIXgure7+Xm7q1wj4isEG1E4sPCn0OJQEdFWtBC0EbnmGsVGrJYDsbHQyk6vucJGUMRC0cJSsBDtLEW/eUneS/LmvV0/mE1m5svMZJKXu06nDUJUg51GYEzWGDpcjEpPRo9SpwVRgNCZrHOKaIyW2itUHpaTVFDjBLbEV6MWsNaGJRUiRyMLCNtaTJOCi4HGtiAeDIcxlWBSMbAeY8x+pdQ9yFRKebHb7e5kV4FwDPJGa7OS5/k2axURN71LIbiiEO+s0foZxqV+vz9AAdcxf2uMVjUyYTAY7ADhCuSDkuqqrTZGyY+KsYWGJuy8i4QvF5G4sgqB2I+00atWrTwWzkAd0FqvgPwOcmcyGS/UuDOA5DnWfsGmJon9tpJyPbQxcOlEZwuCHIe8htxHG3fHvGYgUaaU/I51X3EMRyliNsp24Yg3hsPh6ZTPtCOCwMLDCLZJLYT0Alc1LbXiVRAo4ha4f0mkVI/R1ReY3yRC8dS0XSp/qCFlPB5vR/vuIsg3tHYcuCoECzClDq75IiA/UNSydbUmjzEMLicC3AgvJxeGbJQB/GvY9QbGI273VMQfxLgUcutTp1MiSogv4j1dyjw/5D7PdlBn0fJlJPuYjUZDZ6ZunIf8RrzPRptunLE4EztFqxckbr8q3gV9hhY7Svk7C0iyDnnodR8b8U4g7i/4cu9zEHg4ZE/ZS7ZJbeu4xHHS9PhcWb7vzopETxBjraQVEJ3+Yn+g7Oe9FMWRSp40OCe05kARJ8nJTOt6oNCnhiSfUIi2dvsD9TLsTzHfWrFZpKn+E/SG2M/wp7LHeQHyHEf7Shu9l4/P2ThjQ3c4Az1euMinIOeyLNsnUoIHPb8G7zeq7OGC0F2wEs6djEajPZ3oYtoJHzmASP9tId1ZcDYHEXyKhNNipD+fbvQ2r2N8QIVEsdj01lb8tnVt/l2Q18tspKxUr6GstIHZYI4wD2cO+DBMSwJX6CuLL/V0IYeE07okcjaF56zMJkLwvtha15yFX5ygXmyq/wPlRnkzVimmXQAAAABJRU5ErkJggg==>

[image4]: <data:image/png;base64,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>

[image5]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABUAAAAYCAYAAAAVibZIAAABTElEQVR4XpWUPU7EMBCFHYmCAhASSgFObCeKlAPAYagoKai4BCXVipqCci+5Y9brzGTeBPaTIk/e/HoUxblKs5hk/75xSbHpdMVvB1kepSvhX8jbmCxDyiCVUgSsK9WBAcBOVV6JUbbAkE1kRzXECdwZRWYsXWAFST2ldBlieG3b9orrIgqXwmqhiTF+hBAezdssuygOeazso5ULxhg+6e2iuhRnFC2hTUrDOxV/EW4O7emWrnTPn5DPYNvjONJqwzdpu2mabvhcDK2cQJ6+75+o4N4/+E7dC3ewPuaj6r2/o53+DMMQdaASXNXUHhk04Rvt9Lm4+QFeKljN5O+UdvrVdb3njc+Gp5DdzPN8nc3tUugKjFVRGGhMLVNVIcDSYPVD4R140EKx+aG6rJzKX8DJkj/cGjArhncXgZsVQAKQsOA2/t4VUJnbpcABu7kXAiPaDEYAAAAASUVORK5CYII=>

[image6]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACYAAAAZCAYAAABdEVzWAAADzElEQVR4XqVWPWgUQRTeJbEIGiwkOeLt7szcqYeF+HMomEIUEhFECYooGgSxkTRiBEM0IAgp/MOQpBAJiEUQYsTWQlS0CCKIiJ1YKGkstLKwifF7OztzszOzlx8/eDez733v7Tfv7e1dEISBhrHN7VeEokTlD4sINoinkxprLr2glpnmp/i9KVYUyt0hlJcGy00oREu1Wu3s6OhYZwdkDflZKpXW1uv1NWbci8aNl5Lgj5O3UqmsZ4w9g93mnM8kSXJWnlHlyNNHUbyJeOVyObKryWYYKQQuccpwaeAmJ1CsO+tESF2Br58LvkPVwPUQOLO4bsVNN2A/h/gbzsUh7LuiKNqM9SrsRxzHR836DkDaChtIGHuJdQHCHtkcoJULMYP4omVPqEtE6MRocP2CbqySUGtYCL4P6374z9ChIf4i9uNUU/E0zC6RMCT0Ye2GzdvCFBexKdhnFP6OdRZ2GO4WI94F+0ZdU4kJS4ZwfSSjBNRlGjGNUPls2KPVhdF6X8coPsGSpN7wqBJyrW2ptYPzVgsDwL8C68l4oeD8pjNCQwlt/cISCDM6ZpIw6okkJ8wFatyFTWMbRnHUBv59PFdlqoN9L2ws8I0whSNJQnfM+4yFFJ/EaO5h/QCbh9A5rDvNxgkh4GLvYdeShI2BM0ghGh18TxsjDO2GO26N5sLSEz/kgg8jsUVes37wf0HMHpMXR2mneuHfHtB9wqCVOqVGiA62Ie80pnMrjqMq+RwxElKmFqafsfyparVae5CKks6sC/Owx0HheCAUgtQId+GFyljyAJ2/zuTbYIq6TDxHHDnIluqYCZMP+yq4KNlxghSf6BGCuxf2BUIrdE3vN9glnZjCaAihmTD4ziH2Vwh+IXUYHc6sK3ObyI2QAN6gyS9vLEd4DkdV3OkaASfLC8tYtGRv9EXEpLBAFmVylK/lr4FMUMXNEaqcrI4Wlh3uTqgfES1NtS391qkOTFvNlCNI2CQ9I8oHkSfh/wM7niOHYTpCepHSC9UMgXvMFEavH+xvmBx9ZwR7spMv4OaLTP7U/EbhT/gGbVN0+C4j/grredg47CdswCiVMeUI6ZupDq0YEBoj5yPsAAUwpZGUZyQbyNfVUG5jraAwBPcJIQ6q30gbQv4ujgTyn5MDjHg3xLyDPQdvtOCvjzd3dVhVqUaSm97otOnSn/ndMqDJtFG2dI0Gs9hjFW+gwK2Rup2YXcMheLAcDiFsQi0MNINMairSPo8fpr9ov0x4U7KT/2dpP3yFtM8XdGGwPAnK5Qnpk7leP3JdsAbXpDv/AIR0xaIZgCZ8AAAAAElFTkSuQmCC>

[image7]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACUAAAAZCAYAAAC2JufVAAADkElEQVR4XqVVPWgUQRjdRQOKPxEkhHh3M7tnMAS08VBRLCy0SBGQIBgQtFLBRrCJFoIgFoJYCDYiagQRRQsLRUHEwkLLiJUgGIhYiY0RRKK+Nz87s7Ozdxd8MOzO+973zdtvZneTJEkTPXgx1xg8WX8oi6upmqny3aDUNiVI9afLqFqSRvMiZIUKu2PuS34LgKjrtOV7u3Ioh3uIowhyYh4qiOdEkSnk0yFfIJI8Ojq6XkhxWkp5A+M8xgh5K0XBVUKIo61WcyvvQa1oNBpNKcSJHESpJu85UGRcCnkK11dCyqUsz2Zt3Ec4J1AUaWIOix7ngphM4P5jnuc7bQL4DULId4j9dUPweqXT6Qy4asaRNYXEg7juwVjA/WzFQfy8rMTD3ETOI95bEvNLMPa82Wyu5nxoaGgtuKcYHzA+IXYHu7ELaxRFo9UJdGkESfNIUJ0iKmKPgKE29F+xyIwfADeFsQi+wzlN8UElt7VSsBZaySS0dV51qifSBIvuR84fnKcZPwJ+UuptOsLSylRuTMVgdi0K16kuprxkuzjOy0yc12aNqQfgruJwcwu/YI0n2JHMZcWQ2k75prxNtyLvlov6i+swOygrpnD/AnUPG1WK+EXzQkhFKTbSLmcqnw3DsTm0Z/zFrQZHYBLnzZlFaGxsbF0hweKtVmsHcn9irQtFYrgICWsqN51S5suqEqO2SS0uvTOlzprXKaMPCvElQO4idC+Hh4fXuEggxBPqTpnvVB1sGgrvhf63WtyrpU0JmpriHN24TB1MHOCcu4SXowOOpl5ze122garndaruoLfb7UG0fVOi1GmC71ADi39GzrVClNJEdhLcN4xxUrn+HCzBpDJFtJp6+8DdZhY96OeybhJ9oK0pjHuFxlzwW9gIfg7jF8ZuE1IHFuNte3N7kFU6ne0DMPEQ3P3EfFBhchrjrKuZpFmenUPnvuf88lvSRgmhvzcL6mncr+AH2v4e3dhGjfkqP3NvjAa7Rx6L8pWfwLiF7r3hv81q+CsBfx3jMXTHEL8r2UkhJ6yGcN0qIUJFpamhCn4FDy7GIV45L6QOKR5gCzUwti/TP2YXLK7hWhZ24/y45TwqNi+jW9SLOUfLg+pXyWUVpWggLU9jf+JIB4LbsGYNjCom7maqD30VPSvUwXZgOTl9qq0o5q3XQazk1smJ+lg1QiZkw3lvFE/RA/WP+X/os2pZ5mbKlhf8Bx7+uSZEjoLCAAAAAElFTkSuQmCC>

[image8]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAZCAYAAAB3oa15AAAEUElEQVR4Xq1Wz2sdVRSegRQUK/VX+vC9mblvXrTBRWnwtRRKFRdGdKGIUZHUvyDpSrGF0IVgAiaLUlpK2tKNi6BUBEtxIQYNuAm6EAR1kYUoT7JyU5JNQdLvmzln5s68uW8mxQ/um7nnfOfc8809c+d5vgfkP7VoxqpHnuf/yCg5XDoqTF6l1TaNdBeJNWFemeNAA4qifkU3LH63232s0+k86Y/I0u/3D7RarUeSiZNlQ0iNuBbqNRWsvjHmQwi4bUy0guv1rMic4gVB8DB4V8MwfKPoG4FuivfKdl0/juNJJF3BuBEZM8tFikRPF54lh1zGZE7kiaKoD/vvuPZgoJhPMP7BmAfXYFcC+N7B/BdcVxE1lmevAIjP4UnM4fo9xn8Q8JntT2r3E94MF4Z/anx8/KAs/F2v1zukXN7TRh855DKGscrB/QcYP04emXyUcxR5GvOPWAcfHq5nYHsX42uK0TjnNkvgm7iewhgUBaTMiYmJEL4tJlcPFngc858xzioVtvO00ac8xmD80Y3jFufMj/kGBTLIpDtyRfmAD85yfeuUmhVJnjaR+SsTYPmliF0upja4uf1r2L2kGBVU3kEUcgKcHS0InIVcgPgjs6gLIs80xiUva52KR1+qPUEiwFgCEqRM2C9TAPs392VPc5v9bJJWNP+WBUjP72IsScxLeH+2Om22h+/hfi4MKM7nTh+G/1ahdaqqTUxql2u1gBRSaEEAw9TOnUkLjXbL8ZGx7H56NPLlRNyXGPOI/UJ2Y4xPvtA6FbUnqLLnAuK0ACHJC7tRFkB041wYxuu43xsSIDugAgR+HMfH2C56krFwk7eOD/5JxF3E9VXOs0gX7B3Id8j3eEbDvl4WYO+AFPlaWQA5BQEOsGXA+UpbBzs2g9Zah7hnYb+A8VbKHKHDFlD22YW67MOFpou5WstCoXXkKN6M5MTDTrXgv6anlhOjBMC+VCkgbaGBfHz4Im9XC0he4gUrNKuFhVOAJ6cOWwvcu2xJ4fjI+Snrk8hqHbmA4jtAJP2JjxySvqw2JH0Itm84eK/vSiRzTcEY2O8ZK1ZTl1uHUMGJAAEFQJjR+UgB2O41r0Thny4k+QnjY7WFQfCMST982V8PLPo+xt8412MxyV+FaNP+YguS1sGYto0iaqAC5Buz2m63n7J5GeQJDfiEMfZk7KCwX4MgPKq8MAyOw/4n+Ocw3jbpR2uZx6Jy+v3n9Yj8oZt+3fl34zfcTylHwV1lvDf8PMcQczMWH9Z9AfPFlGdTh6f2TyV4ImErX2Fx/HvhoPp42kcoEtwXU4HFlbijLFL+ThfhJ38In4D/c+T4Ftc7eYuV2EMCmsBFrBFvownLfqA53ylA7oqXwl2WyLX60GLN4OK77MNwMV32GowMq3BWmBrCzx5aQzQmZsgj9h/rQiFT9QI1iw259xEraMZ6YNSkr3HbaEJt0gVOt9OxL+w3S8WONVFhQ6j3Ab/WFsR4vXRCAAAAAElFTkSuQmCC>