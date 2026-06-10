# 05. SEGURIDAD Y ACTUALIZACIONES CRÍTICAS

## Resumen Ejecutivo
Materialize v1 tiene vulnerabilidades críticas de seguridad, dependencias obsoletas y falta de protecciones modernas. Requiere actualización urgente.

---

## 1. Vulnerabilidades Identificadas

### 1.1 Vulnerabilidades Críticas 🔴

#### 1. jQuery - XSS y ReDoS
**Versión actual**: Desconocida (probablemente < 3.0)
**Severidad**: CRITICAL
**CVE**: CVE-2020-11022, CVE-2020-11023
**Impacto**: XSS attacks, ReDoS vulnerabilities

**Solución**: Remover jQuery completamente, migrar a vanilla JavaScript.

```javascript
// BEFORE (Vulnerable)
$('.modal').modal('open');
$.get('/api/data', function(data) {
  $('.content').html(data); // XSS vulnerability
});

// AFTER (Seguro)
document.querySelectorAll('.modal').forEach(el => {
  new Modal(el).open();
});

fetch('/api/data')
  .then(res => res.json())
  .then(data => {
    // Sanitize data
    const safe = sanitizeHTML(data.content);
    document.querySelector('.content').textContent = safe;
  });
```

#### 2. Expresiones regulares sin límite - ReDoS
**Severidad**: HIGH
**Ubicación**: `js/autocomplete.js`, `js/timepicker.js`
**Impacto**: DoS attacks

**Ejemplo vulnerable**:
```javascript
// BEFORE (Vulnerable - ReDoS)
const pattern = /(a+)+b/;
const userInput = 'aaaaaaaaaaaaaaaaaaaaaaaac';
pattern.test(userInput); // Freezes application

// AFTER (Seguro)
const pattern = /^a{1,5}b$/; // Bounded quantifiers
```

#### 3. Inyección de HTML en componentes
**Severidad**: HIGH
**Ubicación**: Modal, Toast, Tooltip
**Impacto**: XSS attacks

**Ejemplo vulnerable**:
```javascript
// BEFORE (Vulnerable)
const message = userInput;
Toast.create('<p>' + message + '</p>'); // XSS

// AFTER (Seguro)
const message = sanitize(userInput);
const p = document.createElement('p');
p.textContent = message;
Toast.create(p);
```

#### 4. Falta de CSRF Protection
**Severidad**: HIGH
**Impacto**: CSRF attacks en formularios
**Ubicación**: Formularios sin token

**Solución**:
```html
<form method="POST" action="/api/update">
  <input type="hidden" name="csrf_token" value="{{ csrf_token() }}">
</form>
```

#### 5. Almacenamiento inseguro en localStorage
**Severidad**: MEDIUM
**Ubicación**: Preferencias del usuario, temas
**Impacto**: Session hijacking

**Vulnerable**:
```javascript
// BEFORE (Inseguro)
localStorage.setItem('user_id', userId);
localStorage.setItem('auth_token', token); // Readable by JS

// AFTER (Seguro)
// Usar httpOnly cookies en servidor
// O sessionStorage para datos no sensibles
sessionStorage.setItem('theme', 'dark');
```

---

## 2. Vulnerabilidades de Dependencias

### 2.1 Audit de npm

```bash
npm audit
# Resultado típico:
# 45 vulnerabilities found
# - Critical: 8
# - High: 12
# - Medium: 15
# - Low: 10
```

### 2.2 Dependencias Vulnerables

| Paquete      | Versión Actual | Versión Segura | Severidad | CVE            |
| ------------ | -------------- | -------------- | --------- | -------------- |
| grunt        | ^1.0.1         | ^1.3.0         | MEDIUM    | CVE-2021-44906 |
| grunt-sass   | ^2.0.0         | ^3.0.0         | LOW       | Deprecated     |
| autoprefixer | ^7.1.1         | ^10.4.0        | MEDIUM    | Multiple       |
| babel        | ^6.24.1        | ^7.20.0        | HIGH      | Multiple       |
| uglify       | ^3.0.1         | Reemplazar     | MEDIUM    | Deprecated     |

### 2.3 Plan de Actualización

```json
{
  "devDependencies": {
    "vite": "^5.0.0",
    "sass": "^1.69.0",
    "typescript": "^5.3.0",
    "@biomejs/biome": "^2.4.16",
    "vitest": "^1.0.0",
    "@playwright/test": "^1.40.0"
  }
}
```

---

## 3. Protecciones Faltantes

### 3.1 Content Security Policy (CSP)

**Configurar en servidor**:
```nginx
add_header Content-Security-Policy "
  default-src 'self';
  script-src 'self' 'wasm-unsafe-eval';
  style-src 'self' 'unsafe-inline';
  img-src 'self' data: https:;
  font-src 'self';
  connect-src 'self';
  frame-ancestors 'none';
  form-action 'self';
" always;
```

**Validar en componentes**:
```javascript
// Usar nonce para scripts inline
<script nonce="{{ csp_nonce }}">
  // Safe
</script>
```

### 3.2 X-Frame-Options

```
X-Frame-Options: DENY
X-Frame-Options: SAMEORIGIN
```

### 3.3 X-Content-Type-Options

```
X-Content-Type-Options: nosniff
```

### 3.4 Strict-Transport-Security (HSTS)

```
Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
```

---

## 4. Implementación de Validación Segura

### 4.1 Sanitización de HTML

```javascript
// Safe HTML sanitizer
function sanitizeHTML(input) {
  const div = document.createElement('div');
  div.textContent = input;
  return div.innerHTML;
}

// O usar librería
import DOMPurify from 'dompurify';
const clean = DOMPurify.sanitize(dirty);
```

### 4.2 Validación de Entrada

```javascript
// Email validation
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
function isValidEmail(email) {
  return emailRegex.test(email);
}

// URL validation
function isValidURL(url) {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

// Numbers only
function isValidNumber(value) {
  return /^\d+$/.test(value);
}
```

### 4.3 Escape de salida

```javascript
// Para HTML
function escapeHTML(text) {
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return text.replace(/[&<>"']/g, m => map[m]);
}

// Para URLs
const safe = encodeURIComponent(userInput);

// Para atributos
function escapeAttribute(value) {
  return value.replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}
```

---

## 5. Checklist de Seguridad

### 5.1 Validación y Sanitización
- [ ] Validar todas las entradas de usuario
- [ ] Sanitizar HTML antes de insertarlo en DOM
- [ ] Usar `textContent` en lugar de `innerHTML` cuando sea posible
- [ ] Validar URLs antes de usar en `href` o `src`
- [ ] Escapar caracteres especiales en atributos

### 5.2 Autenticación y Autorización
- [ ] Implementar CSRF tokens en formularios
- [ ] Usar httpOnly cookies para tokens
- [ ] Implementar rate limiting
- [ ] Validar permisos en servidor (no solo client-side)
- [ ] Logging de eventos sensibles

### 5.3 Headers de Seguridad
- [ ] Implementar CSP (Content Security Policy)
- [ ] Configurar X-Frame-Options
- [ ] Configurar X-Content-Type-Options
- [ ] Configurar HSTS
- [ ] Configurar X-XSS-Protection

### 5.4 Dependencias
- [ ] Actualizar todas las dependencias
- [ ] Ejecutar `npm audit` regularmente
- [ ] Usar `npm ci` en CI/CD (no `npm install`)
- [ ] Mantener lockfile en control de versiones
- [ ] Automated dependency updates (Dependabot)

### 5.5 Testing de Seguridad
- [ ] SAST (Static Application Security Testing)
- [ ] DAST (Dynamic Application Security Testing)
- [ ] Pruebas de XSS
- [ ] Pruebas de CSRF
- [ ] Pruebas de inyección

---

## 6. Configuración de Seguridad Recomendada

### 6.1 package.json

```json
{
  "engines": {
    "node": ">=18.0.0",
    "npm": ">=9.0.0"
  },
  "scripts": {
    "audit": "npm audit --audit-level=moderate",
    "audit-fix": "npm audit fix --audit-level=moderate",
    "security-check": "npm audit && npm outdated"
  },
  "devDependencies": {
    "@security/scanner": "latest"
  }
}
```

### 6.2 Reglas de Seguridad en Biome (Reemplazando ESLint por errores de dependencias)

El proyecto migró de ESLint a Biome para resolver conflictos de dependencias que bloqueaban el desarrollo. Biome realiza el linting, formateo y análisis estático en una sola herramienta ultrarrápida.

Para configurar las reglas de linter y seguridad en Biome, se utiliza `biome.json`:

```json
// biome.json
{
  "$schema": "https://biomejs.dev/schemas/2.4.16/schema.json",
  "linter": {
    "enabled": true,
    "rules": {
      "recommended": true,
      "security": {
        "noDangerouslySetInnerHtml": "error"
      },
      "suspicious": {
        "noConsoleLog": "warn",
        "noDebugger": "error",
        "noEval": "error"
      }
    }
  }
}
```

Para ejecutar el análisis de código:
```bash
# Verificar lint, formato y seguridad
pnpm lint

# Aplicar correcciones seguras automáticamente
pnpm lint --write
```

### 6.3 GitHub Security

```yaml
# .github/dependabot.yml
version: 2
updates:
  - package-ecosystem: "npm"
    directory: "/"
    schedule:
      interval: "daily"
    allow:
      - dependency-type: "direct"
    open-pull-requests-limit: 5
    reviewers:
      - "security-team"
```

---

## 7. Protocolo de Reporte de Vulnerabilidades

### 7.1 SECURITY.md

```markdown
# Security Policy

## Reporting a Vulnerability

Please email security@materialize.dev with:
- Description of vulnerability
- Steps to reproduce
- Potential impact
- Suggested fix (optional)

We will:
- Acknowledge within 24 hours
- Provide timeline for fix
- Credit your discovery
- Release patch version
```

---

## 8. Auditoría Continua

### 8.1 GitHub Advanced Security
- [ ] Habilitar "Dependabot alerts"
- [ ] Habilitar "Secret scanning"
- [ ] Habilitar "Code scanning" (CodeQL)

### 8.2 CI/CD Pipeline
```yaml
# .github/workflows/security.yml
name: Security Audit
on: [push, pull_request]
jobs:
  audit:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm audit --audit-level=moderate
      - run: npx snyk test
```

---

## 9. Plan de Remedación (Timeline)

| Acción                      | Plazo      | Prioridad |
| --------------------------- | ---------- | --------- |
| Remover jQuery              | Semana 1-2 | 🔴 CRÍTICA |
| Actualizar dependencias     | Semana 1   | 🔴 CRÍTICA |
| Implementar CSP             | Semana 2   | 🔴 CRÍTICA |
| Audit de seguridad completo | Semana 3   | 🟡 ALTA    |
| Sanitización de componentes | Semana 2-4 | 🟡 ALTA    |
| Testing de seguridad        | Semana 4-5 | 🟡 ALTA    |
| SAST/DAST integration       | Semana 5-6 | 🟠 MEDIA   |
| Security documentation      | Semana 6   | 🟠 MEDIA   |

**Estimación total**: 40-60 horas

---

## 10. Referencias de Seguridad

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [OWASP Secure Coding Practices](https://owasp.org/www-project-secure-coding-practices-quick-reference-guide/)
- [MDN: Web Security](https://developer.mozilla.org/en-US/docs/Web/Security)
- [NIST Cybersecurity Framework](https://www.nist.gov/cyberframework)
- [CWE/SANS Top 25](https://cwe.mitre.org/top25/)

