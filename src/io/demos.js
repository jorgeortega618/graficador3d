/**
 * Graficador 3D - Datos de Demostración
 * Generación de datos de prueba (cubo, etc.)
 */

/**
 * Genera los vértices de un cubo unitario centrado en el origen
 * @returns {number[][]} Array de 8 puntos 3D que forman un cubo
 */
export function cubeDemo() {
    return [
        // Cara frontal (z = -1)
        [-1, -1, -1], // Inferior izquierda frontal
        [ 1, -1, -1], // Inferior derecha frontal
        [ 1,  1, -1], // Superior derecha frontal
        [-1,  1, -1], // Superior izquierda frontal
        
        // Cara trasera (z = 1)
        [-1, -1,  1], // Inferior izquierda trasera
        [ 1, -1,  1], // Inferior derecha trasera
        [ 1,  1,  1], // Superior derecha trasera
        [-1,  1,  1]  // Superior izquierda trasera
    ];
}

/**
 * Genera los vértices de una pirámide cuadrada
 * @returns {number[][]} Array de 5 puntos 3D que forman una pirámide
 */
export function pyramidDemo() {
    return [
        // Base cuadrada (z = -1)
        [-1, -1, -1],
        [ 1, -1, -1],
        [ 1,  1, -1],
        [-1,  1, -1],
        
        // Vértice superior
        [ 0,  0,  2]
    ];
}

/**
 * Genera puntos distribuidos en una esfera
 * @param {number} count - Número de puntos a generar
 * @param {number} radius - Radio de la esfera
 * @returns {number[][]} Array de puntos 3D distribuidos en la esfera
 */
export function sphereDemo(count = 50, radius = 1) {
    const points = [];
    
    for (let i = 0; i < count; i++) {
        // Generar puntos usando coordenadas esféricas
        const theta = Math.random() * 2 * Math.PI; // Ángulo azimutal
        const phi = Math.acos(2 * Math.random() - 1); // Ángulo polar (distribución uniforme)
        
        const x = radius * Math.sin(phi) * Math.cos(theta);
        const y = radius * Math.sin(phi) * Math.sin(theta);
        const z = radius * Math.cos(phi);
        
        points.push([x, y, z]);
    }
    
    return points;
}

/**
 * Genera puntos en una hélice 3D
 * @param {number} turns - Número de vueltas de la hélice
 * @param {number} pointsPerTurn - Puntos por vuelta
 * @param {number} radius - Radio de la hélice
 * @param {number} height - Altura total de la hélice
 * @returns {number[][]} Array de puntos 3D que forman una hélice
 */
export function helixDemo(turns = 3, pointsPerTurn = 20, radius = 1, height = 4) {
    const points = [];
    const totalPoints = turns * pointsPerTurn;
    
    for (let i = 0; i < totalPoints; i++) {
        const t = i / (totalPoints - 1); // Parámetro normalizado [0, 1]
        const angle = t * turns * 2 * Math.PI;
        
        const x = radius * Math.cos(angle);
        const y = radius * Math.sin(angle);
        const z = -height / 2 + t * height; // De -height/2 a height/2
        
        points.push([x, y, z]);
    }
    
    return points;
}

/**
 * Genera una nube de puntos aleatoria dentro de un cubo
 * @param {number} count - Número de puntos
 * @param {number} size - Tamaño del cubo (lado)
 * @returns {number[][]} Array de puntos 3D aleatorios
 */
export function randomCloudDemo(count = 100, size = 2) {
    const points = [];
    const halfSize = size / 2;
    
    for (let i = 0; i < count; i++) {
        const x = (Math.random() - 0.5) * size;
        const y = (Math.random() - 0.5) * size;
        const z = (Math.random() - 0.5) * size;
        
        points.push([x, y, z]);
    }
    
    return points;
}

/**
 * Obtiene un conjunto de datos de demostración por nombre
 * @param {string} name - Nombre del demo ('cube', 'pyramid', 'sphere', 'helix', 'cloud')
 * @returns {number[][]} Array de puntos 3D
 */
export function getDemoData(name) {
    switch (name.toLowerCase()) {
        case 'cube':
            return cubeDemo();
        case 'pyramid':
            return pyramidDemo();
        case 'sphere':
            return sphereDemo();
        case 'helix':
            return helixDemo();
        case 'cloud':
            return randomCloudDemo();
        default:
            console.warn(`Demo desconocido: ${name}, usando cubo por defecto`);
            return cubeDemo();
    }
}
