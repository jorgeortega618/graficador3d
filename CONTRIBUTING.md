# Contribuyendo al Graficador 3D

¡Gracias por tu interés en contribuir al proyecto Graficador 3D! Este documento proporciona pautas para contribuir al proyecto.

## Estructura del Proyecto

```
graficador3D/
├── public/           # Archivos estáticos (HTML, CSS)
├── src/             # Código fuente JavaScript
│   ├── core/        # Funciones matemáticas y proyecciones
│   ├── io/          # Parseo de archivos y datos de demo
│   ├── render/      # Renderizado y interacciones
│   └── ui/          # Controles de interfaz
├── sample_data/     # Archivos de ejemplo (.xyz, .txt)
└── README.md        # Documentación principal
```

## Cómo Contribuir

### 1. Fork del Repositorio
```bash
git clone https://github.com/jorgeortega618/graficador3d.git
cd graficador3d
```

### 2. Crear una Rama
```bash
git checkout -b feature/nueva-funcionalidad
```

### 3. Realizar Cambios
- Mantén el estilo de código consistente
- Agrega comentarios JSDoc a las funciones
- Prueba tus cambios localmente

### 4. Commit y Push
```bash
git add .
git commit -m "feat: descripción de la nueva funcionalidad"
git push origin feature/nueva-funcionalidad
```

### 5. Crear Pull Request
- Describe claramente los cambios realizados
- Incluye capturas de pantalla si es relevante
- Referencia issues relacionados

## Estándares de Código

### JavaScript
- Usar ES6+ modules
- Funciones documentadas con JSDoc
- Nombres descriptivos para variables y funciones
- Evitar variables globales

### Estructura de Archivos
- Un módulo por archivo
- Imports al inicio del archivo
- Exports al final del archivo

## Tipos de Contribuciones

### Nuevas Proyecciones
- Implementar en `src/core/projections.js`
- Agregar controles UI correspondientes
- Documentar la matemática utilizada

### Nuevos Formatos de Archivo
- Extender `src/io/parser.js`
- Agregar validación de formato
- Incluir archivos de ejemplo

### Mejoras de UI/UX
- Mantener consistencia visual
- Asegurar accesibilidad
- Probar en diferentes navegadores

### Optimizaciones de Rendimiento
- Perfilar antes y después
- Documentar mejoras obtenidas
- Mantener compatibilidad

## Reportar Issues

### Bugs
- Descripción clara del problema
- Pasos para reproducir
- Navegador y versión
- Capturas de pantalla si aplica

### Solicitudes de Funcionalidad
- Descripción del caso de uso
- Beneficios esperados
- Posible implementación

## Desarrollo Local

### Requisitos
- Navegador moderno con soporte ES6+ modules
- Servidor HTTP local (ej: Live Server, Python http.server)

### Configuración
```bash
# Opción 1: Python
python -m http.server 8000

# Opción 2: Node.js (si tienes npx)
npx serve .

# Opción 3: VS Code Live Server extension
```

### Pruebas
- Probar con diferentes datasets
- Verificar todas las proyecciones
- Probar controles de transformación
- Validar carga de archivos

## Contacto

Para preguntas sobre contribuciones:
- Crear un issue en GitHub
- Contactar a los mantenedores del proyecto

---

¡Esperamos tus contribuciones para hacer el Graficador 3D aún mejor!
