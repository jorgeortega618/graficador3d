# Graficador 3D - Computación Gráfica

Un graficador 3D educativo para el curso de Computación Gráfica que permite visualizar puntos 3D usando diferentes tipos de proyecciones y transformaciones.

## Equipo de Desarrollo

- **Acosta, Juan Sebastián**
- **Arteta, Laura**
- **Ortega, Jorge**

## Características Principales

- ✅ **Proyecciones 3D a 2D**: Isométrica, Oblicua, Axonométrica y Simple
- ✅ **Transformaciones 3D**: Traslación, Rotación y Escalamiento
- ✅ **Navegación 2D**: Pan y zoom interactivos
- ✅ **Carga de archivos**: Soporte para archivos .txt y .xyz
- ✅ **Datos de demostración**: Cubo y otras figuras predefinidas
- ✅ **Auto-ajuste de vista**: Centrado y escalado automático
- ✅ **Interfaz moderna**: Tema oscuro con controles intuitivos

## Cómo Ejecutar

1. **Clonar o descargar** este repositorio
2. **Abrir** `/public/index.html` en un navegador web usando **Live Server** (recomendado) o cualquier servidor HTTP local
3. **¡Listo!** La aplicación se ejecutará sin necesidad de instalación adicional

### Requisitos
- Navegador web moderno con soporte para ES6+ modules
- Servidor HTTP local (Live Server, Python HTTP server, etc.)

## Arquitectura del Proyecto

```
/public/
  index.html          # Página principal
  styles.css          # Estilos CSS
/src/
  app.js              # Punto de entrada de la aplicación
  state.js            # Gestión del estado global
  /core/
    math4.js          # Operaciones con matrices 4x4
    projections.js    # Implementación de proyecciones
    transforms.js     # Aplicación de transformaciones
    fitView.js        # Cálculo de auto-ajuste de vista
  /io/
    parser.js         # Parser de archivos de coordenadas
    demos.js          # Datos de demostración
  /render/
    canvas2d.js       # Renderizado en canvas 2D
    interaction2d.js  # Manejo de interacciones (pan/zoom)
  /ui/
    controls.js       # Conexión de controles de UI
```

## Tipos de Proyección

### 1. Proyección Isométrica
Proyección estándar que aplica las rotaciones:
- **Ry(45°) · Rx(35.264°)** seguido de proyección ortográfica XY
- Mantiene las proporciones y es visualmente equilibrada
- Ideal para visualización técnica

### 2. Proyección Oblicua (Caballera/Cabinet)
Proyección que preserva una cara frontal sin distorsión:
- **Fórmulas**: `x' = x + λ·z·cos(φ)`, `y' = y + λ·z·sin(φ)`
- **Parámetros configurables**:
  - `φ` (phi): Ángulo de proyección en grados
  - `λ` (lambda): Factor de reducción (0.5 para Cabinet, 1.0 para Caballera)

### 3. Proyección Axonométrica
Proyección genérica con ángulos personalizables:
- **Fórmula**: `Ry(β) · Rx(α)` seguido de proyección ortográfica
- **Parámetros configurables**:
  - `α` (alpha): Ángulo de rotación X en grados
  - `β` (beta): Ángulo de rotación Y en grados

### 4. Proyección Simple (Ortográfica XY)
Proyección básica que ignora la coordenada Z:
- **Fórmula**: `x' = x`, `y' = y`
- Útil para vistas 2D directas

## Transformaciones 3D

### Matrices Homogéneas 4x4
Todas las transformaciones utilizan matrices homogéneas 4x4 para permitir composición eficiente:

```javascript
// Matriz identidad
I4 = [[1,0,0,0], [0,1,0,0], [0,0,1,0], [0,0,0,1]]

// Traslación
T(dx,dy,dz) = [[1,0,0,dx], [0,1,0,dy], [0,0,1,dz], [0,0,0,1]]

// Escalamiento uniforme
S(k) = [[k,0,0,0], [0,k,0,0], [0,0,k,0], [0,0,0,1]]

// Rotación X
Rx(θ) = [[1,0,0,0], [0,cos(θ),-sin(θ),0], [0,sin(θ),cos(θ),0], [0,0,0,1]]
```

### Orden de Aplicación
Las transformaciones se aplican en el orden: **Macc = T_nueva · Macc**
- Esto permite que las transformaciones más recientes se apliquen primero
- El orden de rotaciones es: Rx, luego Ry, luego Rz

### Composición de Transformaciones
- **Traslación**: Mueve el modelo en el espacio 3D
- **Rotación**: Rota alrededor de los ejes X, Y, Z
- **Escalamiento**: Cambia el tamaño uniformemente
- **Reiniciar**: Restaura la matriz identidad (sin transformaciones)

## Formato de Archivos

### Archivos Soportados
- **`.txt`**: Archivos de texto plano
- **`.xyz`**: Archivos de coordenadas XYZ

### Formato de Datos
Cada línea debe contener exactamente 3 coordenadas:
```
# Comentarios empiezan con # o //
1.0 2.0 3.0
-1.5, 0.0, 2.5
0 0 0
```

**Separadores aceptados**: espacios, tabulaciones, comas
**Comentarios**: Líneas que empiecen con `#` o `//` son ignoradas

## Controles de Usuario

### Navegación 2D
- **Arrastrar**: Pan (mover la vista)
- **Rueda del mouse**: Zoom in/out
- **Auto-ajustar**: Centra y escala automáticamente el contenido

### Atajos de Teclado
- **Ctrl+R**: Reiniciar transformaciones del modelo
- **Ctrl+F**: Auto-ajustar vista
- **1**: Proyección Isométrica
- **2**: Proyección Oblicua
- **3**: Proyección Axonométrica
- **4**: Proyección Simple

### Controles de Transformación
- **Traslación**: Ingrese valores dx, dy, dz y presione "Aplicar Traslación"
- **Rotación**: Ingrese ángulos en grados para cada eje y presione "Aplicar Rotación"
- **Escalamiento**: Ingrese factor de escala o use botones rápidos (0.6x, 0.5x, 0.1x)

## Extensiones Futuras

### Funcionalidades Adicionales Posibles
1. **Renderizado de aristas**: Conectar puntos con líneas si se proporciona información de conectividad
2. **Exportar PNG**: Guardar la vista actual como imagen
3. **Sombreado por profundidad**: Ordenar puntos por coordenada Z para efectos visuales
4. **Persistencia**: Guardar/cargar estado en localStorage
5. **Más figuras demo**: Pirámide, esfera, hélice, nube de puntos
6. **Animaciones**: Rotación automática o interpolación entre estados

### Arquitectura Extensible
El código está organizado en módulos cohesionados que facilitan la extensión:
- **Nuevas proyecciones**: Agregar casos en `projections.js`
- **Nuevas transformaciones**: Extender `transforms.js`
- **Nuevos formatos**: Ampliar `parser.js`
- **Nuevos controles**: Expandir `controls.js`

## Aspectos Técnicos

### Tecnologías Utilizadas
- **HTML5 Canvas**: Para renderizado 2D
- **ES6+ Modules**: Arquitectura modular nativa
- **JavaScript puro**: Sin dependencias externas
- **CSS3**: Interfaz moderna con tema oscuro

### Principios de Diseño
- **Código pedagógico**: Comentado y estructurado para aprendizaje
- **Separación de responsabilidades**: Cada módulo tiene una función específica
- **Inmutabilidad**: El estado se actualiza de forma inmutable
- **Composición funcional**: Las transformaciones se componen matemáticamente

### Rendimiento
- **Proyección eficiente**: Cálculos optimizados con matrices
- **Renderizado selectivo**: Solo dibuja puntos visibles en pantalla
- **Gestión de memoria**: Evita leaks con manejo cuidadoso de eventos

## Recursos Educativos

### Conceptos de Computación Gráfica Implementados
1. **Coordenadas homogéneas**: Representación 4D para transformaciones 3D
2. **Composición de matrices**: Combinación eficiente de transformaciones
3. **Proyecciones geométricas**: Conversión de 3D a 2D con diferentes métodos
4. **Sistemas de coordenadas**: Transformación entre espacios de coordenadas
5. **Interacción usuario**: Mapeo entre coordenadas de pantalla y mundo

### Referencias Matemáticas
- **Matrices de transformación**: Álgebra lineal aplicada a gráficos
- **Trigonometría**: Rotaciones y proyecciones oblicuas
- **Geometría proyectiva**: Fundamentos de las proyecciones 3D→2D

## Licencia y Uso Académico

Este proyecto fue desarrollado con fines educativos para el curso de Computación Gráfica. 
El código es libre para uso académico y puede ser modificado y extendido según las necesidades del curso.

---

**Desarrollado por**: Acosta, Juan Sebastián • Arteta, Laura • Ortega, Jorge  
**Curso**: Computación Gráfica  
**Tecnología**: HTML5 + CSS3 + JavaScript ES6+ (Módulos nativos)
