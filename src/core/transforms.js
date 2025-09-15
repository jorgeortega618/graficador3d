/**
 * Graficador 3D - Transformaciones 3D
 * Aplicación de transformaciones sobre el modelo
 */

import { mul4, T, S, Rx, Ry, Rz } from './math4.js';

/**
 * Aplica una traslación al modelo
 * Compone la matriz: Macc = T(dx,dy,dz) * Macc
 * @param {number[][]} Macc - Matriz de transformación acumulada actual
 * @param {number} dx - Desplazamiento en X
 * @param {number} dy - Desplazamiento en Y
 * @param {number} dz - Desplazamiento en Z
 * @returns {number[][]} Nueva matriz de transformación acumulada
 */
export function applyTranslate(Macc, dx, dy, dz) {
    const translateMatrix = T(dx, dy, dz);
    return mul4(translateMatrix, Macc);
}

/**
 * Aplica rotaciones al modelo en el orden Rx, Ry, Rz
 * Compone la matriz: Macc = Rz(rz) * Ry(ry) * Rx(rx) * Macc
 * @param {number[][]} Macc - Matriz de transformación acumulada actual
 * @param {number} rx - Rotación en X (grados)
 * @param {number} ry - Rotación en Y (grados)
 * @param {number} rz - Rotación en Z (grados)
 * @returns {number[][]} Nueva matriz de transformación acumulada
 */
export function applyRotate(Macc, rx, ry, rz) {
    // Aplicar rotaciones en orden: Rx, luego Ry, luego Rz
    let result = Macc;
    
    if (rx !== 0) {
        const rotateX = Rx(rx);
        result = mul4(rotateX, result);
    }
    
    if (ry !== 0) {
        const rotateY = Ry(ry);
        result = mul4(rotateY, result);
    }
    
    if (rz !== 0) {
        const rotateZ = Rz(rz);
        result = mul4(rotateZ, result);
    }
    
    return result;
}

/**
 * Aplica un escalamiento uniforme al modelo
 * Compone la matriz: Macc = S(k) * Macc
 * @param {number[][]} Macc - Matriz de transformación acumulada actual
 * @param {number} k - Factor de escala
 * @returns {number[][]} Nueva matriz de transformación acumulada
 */
export function applyScale(Macc, k) {
    const scaleMatrix = S(k);
    return mul4(scaleMatrix, Macc);
}
