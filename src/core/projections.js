/**
 * Graficador 3D - Proyecciones
 * Implementación de diferentes tipos de proyección 3D a 2D
 */

import { mul4v, Rx, Ry, mul4 } from './math4.js';

/**
 * Convierte grados a radianes
 * @param {number} degrees - Ángulo en grados
 * @returns {number} Ángulo en radianes
 */
function degToRad(degrees) {
    return degrees * Math.PI / 180;
}

/**
 * Proyecta un punto 3D a 2D usando la configuración especificada
 * @param {number[]} p3 - Punto 3D [x, y, z]
 * @param {number[][]} Macc - Matriz de transformación acumulada
 * @param {Object} proj - Configuración de proyección
 * @returns {number[]} Punto 2D proyectado [x', y']
 */
export function projectPoint(p3, Macc, proj) {
    // Convertir punto 3D a coordenadas homogéneas
    const p4 = [p3[0], p3[1], p3[2], 1];
    
    // Aplicar transformaciones acumuladas
    const transformed = mul4v(Macc, p4);
    
    // Proyectar según el tipo especificado
    switch (proj.type) {
        case 'iso':
            return projectIsometric(transformed);
        case 'oblique':
            return projectOblique(transformed, proj.phi, proj.lambda);
        case 'axono':
            return projectAxonometric(transformed, proj.ax, proj.ay);
        case 'simple':
            return projectSimple(transformed);
        default:
            console.warn(`Tipo de proyección desconocido: ${proj.type}`);
            return projectSimple(transformed);
    }
}

/**
 * Proyección isométrica
 * Aplica Ry(45°) · Rx(35.264°) y luego proyección ortográfica XY
 * @param {number[]} p4 - Punto en coordenadas homogéneas [x, y, z, w]
 * @returns {number[]} Punto 2D [x', y']
 */
function projectIsometric(p4) {
    // Ángulos estándar para proyección isométrica
    const rotY = Ry(45);
    const rotX = Rx(35.264);
    
    // Componer las rotaciones: Rx · Ry
    const isoMatrix = mul4(rotX, rotY);
    
    // Aplicar la transformación isométrica
    const rotated = mul4v(isoMatrix, p4);
    
    // Proyección ortográfica (tomar solo X e Y)
    return [rotated[0], rotated[1]];
}

/**
 * Proyección oblicua (Caballera/Cabinet)
 * x' = x + λ * z * cos(φ)
 * y' = y + λ * z * sin(φ)
 * @param {number[]} p4 - Punto en coordenadas homogéneas [x, y, z, w]
 * @param {number} phi - Ángulo φ en grados
 * @param {number} lambda - Factor λ (0.5 para Cabinet, 1.0 para Caballera)
 * @returns {number[]} Punto 2D [x', y']
 */
function projectOblique(p4, phi, lambda) {
    const phiRad = degToRad(phi);
    const cosφ = Math.cos(phiRad);
    const sinφ = Math.sin(phiRad);
    
    const x = p4[0];
    const y = p4[1];
    const z = p4[2];
    
    const xPrime = x + lambda * z * cosφ;
    const yPrime = y + lambda * z * sinφ;
    
    return [xPrime, yPrime];
}

/**
 * Proyección axonométrica genérica
 * Aplica Ry(β) · Rx(α) y luego proyección ortográfica XY
 * @param {number[]} p4 - Punto en coordenadas homogéneas [x, y, z, w]
 * @param {number} alpha - Ángulo α en grados (rotación X)
 * @param {number} beta - Ángulo β en grados (rotación Y)
 * @returns {number[]} Punto 2D [x', y']
 */
function projectAxonometric(p4, alpha, beta) {
    const rotY = Ry(beta);
    const rotX = Rx(alpha);
    
    // Componer las rotaciones: Rx · Ry
    const axonoMatrix = mul4(rotX, rotY);
    
    // Aplicar la transformación axonométrica
    const rotated = mul4v(axonoMatrix, p4);
    
    // Proyección ortográfica (tomar solo X e Y)
    return [rotated[0], rotated[1]];
}

/**
 * Proyección simple (ortográfica XY)
 * Simplemente toma las coordenadas X e Y, ignora Z
 * @param {number[]} p4 - Punto en coordenadas homogéneas [x, y, z, w]
 * @returns {number[]} Punto 2D [x', y']
 */
function projectSimple(p4) {
    return [p4[0], p4[1]];
}

/**
 * Proyecta un array de puntos 3D a 2D
 * @param {number[][]} points3D - Array de puntos 3D [[x,y,z], ...]
 * @param {number[][]} Macc - Matriz de transformación acumulada
 * @param {Object} proj - Configuración de proyección
 * @returns {number[][]} Array de puntos 2D proyectados [[x',y'], ...]
 */
export function projectPoints(points3D, Macc, proj) {
    return points3D.map(point => projectPoint(point, Macc, proj));
}
