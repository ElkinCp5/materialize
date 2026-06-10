/**
 * .pnpmfile.cjs
 * 
 * Hook de pnpm para remover rangos de versión de dependencias directas
 * Propósito: Seguridad - evitar incompatibilidades y vulnerabilidades
 * 
 * Este archivo remueve ^ y ~ del inicio de los rangos de versión,
 * permitiendo que pnpm resuelva automáticamente las versiones disponibles.
 */

module.exports = {
  hooks: {
    readPackage(pkg) {
      // Procesar devDependencies
      if (pkg.devDependencies && typeof pkg.devDependencies === 'object') {
        Object.keys(pkg.devDependencies).forEach(name => {
          const version = pkg.devDependencies[name]
          if (typeof version === 'string') {
            // Solo remover ^ y ~ al inicio
            pkg.devDependencies[name] = version
              .replace(/^\^/, '')  // Remover ^ del inicio
              .replace(/^~/, '')   // Remover ~ del inicio
          }
        })
      }

      // Procesar dependencies
      if (pkg.dependencies && typeof pkg.dependencies === 'object') {
        Object.keys(pkg.dependencies).forEach(name => {
          const version = pkg.dependencies[name]
          if (typeof version === 'string') {
            pkg.dependencies[name] = version
              .replace(/^\^/, '')
              .replace(/^~/, '')
          }
        })
      }

      return pkg
    }
  }
}

