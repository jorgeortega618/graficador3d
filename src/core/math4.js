/**
 * Graficador 3D - Operaciones Matemáticas 4x4
 * Matrices homogéneas y transformaciones 3D
 */

/**
 * Crea una matriz identidad 4x4
 * @returns {number[][]} Matriz identidad 4x4
 */
export function I4() {
    return [
        [1, 0, 0, 0],
        [0, 1, 0, 0],
        [0, 0, 1, 0],
        [0, 0, 0, 1]
    ];
}

/**
 * Multiplica dos matrices 4x4
 * @param {number[][]} A - Primera matriz 4x4
 * @param {number[][]} B - Segunda matriz 4x4
 * @returns {number[][]} Resultado de A * B
 */
export function mul4(A, B) {
    const result = Array(4).fill(null).map(() => Array(4).fill(0));
    
    for (let i = 0; i < 4; i++) {
        for (let j = 0; j < 4; j++) {
            for (let k = 0; k < 4; k++) {
                result[i][j] += A[i][k] * B[k][j];
            }
        }
    }
    
    return result;
}

/**
 * Multiplica una matriz 4x4 por un vector 4D
 * @param {number[][]} M - Matriz 4x4
 * @param {number[]} vec4 - Vector [x, y, z, w]
 * @returns {number[]} Vector resultado [x', y', z', w']
 */
export function mul4v(M, vec4) {
    const result = [0, 0, 0, 0];
    
    for (let i = 0; i < 4; i++) {
        for (let j = 0; j < 4; j++) {
            result[i] += M[i][j] * vec4[j];
        }
    }
    
    return result;
}

/**
 * Crea una matriz de traslación
 * @param {number} dx - Desplazamiento en X
 * @param {number} dy - Desplazamiento en Y
 * @param {number} dz - Desplazamiento en Z
 * @returns {number[][]} Matriz de traslación 4x4
 */
export function T(dx, dy, dz) {
    return [
        [1, 0, 0, dx],
        [0, 1, 0, dy],
        [0, 0, 1, dz],
        [0, 0, 0, 1]
    ];
}

/**
 * Crea una matriz de escalamiento uniforme
 * @param {number} k - Factor de escala
 * @returns {number[][]} Matriz de escalamiento 4x4
 */
export function S(k) {
    return [
        [k, 0, 0, 0],
        [0, k, 0, 0],
        [0, 0, k, 0],
        [0, 0, 0, 1]
    ];
}

/**
 * Convierte grados a radianes
 * @param {number} degrees - Ángulo en grados
 * @returns {number} Ángulo en radianes
 */
function degToRad(degrees) {
    return degrees * Math.PI / 180;
}

/**
 * Crea una matriz de rotación alrededor del eje X
 * @param {number} th - Ángulo en grados
 * @returns {number[][]} Matriz de rotación 4x4
 */
export function Rx(th) {
    const rad = degToRad(th);
    const cos = Math.cos(rad);
    const sin = Math.sin(rad);
    
    return [
        [1, 0,    0,   0],
        [0, cos, -sin, 0],
        [0, sin,  cos, 0],
        [0, 0,    0,   1]
    ];
}

/**
 * Crea una matriz de rotación alrededor del eje Y
 * @param {number} th - Ángulo en grados
 * @returns {number[][]} Matriz de rotación 4x4
 */
export function Ry(th) {
    const rad = degToRad(th);
    const cos = Math.cos(rad);
    const sin = Math.sin(rad);
    
    return [
        [cos,  0, sin, 0],
        [0,    1, 0,   0],
        [-sin, 0, cos, 0],
        [0,    0, 0,   1]
    ];
}

/**
 * Crea una matriz de rotación alrededor del eje Z
 * @param {number} th - Ángulo en grados
 * @returns {number[][]} Matriz de rotación 4x4
 */
export function Rz(th) {
    const rad = degToRad(th);
    const cos = Math.cos(rad);
    const sin = Math.sin(rad);
    
    return [
        [cos, -sin, 0, 0],
        [sin,  cos, 0, 0],
        [0,    0,   1, 0],
        [0,    0,   0, 1]
    ];
}
