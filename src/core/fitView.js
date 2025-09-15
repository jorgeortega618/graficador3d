/**
 * Graficador 3D - Ajuste Automático de Vista
 * Cálculo de bounding box y auto-ajuste de la vista 2D
 */

import { projectPoints } from './projections.js';

/**
 * Calcula el bounding box 2D de los puntos proyectados
 * @param {number[][]} points2D - Array de puntos 2D [[x,y], ...]
 * @returns {Object} Bounding box { minX, maxX, minY, maxY, width, height, centerX, centerY }
 */
function calculateBoundingBox2D(points2D) {
    if (points2D.length === 0) {
        return {
            minX: 0, maxX: 0, minY: 0, maxY: 0,
            width: 0, height: 0, centerX: 0, centerY: 0
        };
    }

    let minX = points2D[0][0];
    let maxX = points2D[0][0];
    let minY = points2D[0][1];
    let maxY = points2D[0][1];

    for (let i = 1; i < points2D.length; i++) {
        const [x, y] = points2D[i];
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
    }

    const width = maxX - minX;
    const height = maxY - minY;
    const centerX = (minX + maxX) / 2;
    const centerY = (minY + maxY) / 2;

    return {
        minX, maxX, minY, maxY,
        width, height, centerX, centerY
    };
}

/**
 * Calcula los parámetros de vista para ajustar automáticamente el contenido
 * @param {number[][]} points3D - Puntos 3D del modelo
 * @param {number[][]} Macc - Matriz de transformación acumulada
 * @param {Object} proj - Configuración de proyección
 * @param {HTMLCanvasElement} canvas - Elemento canvas
 * @param {number} margin - Margen como porcentaje (0.1 = 10%)
 * @returns {Object} Nuevos parámetros de vista { pan: {x, y}, scale }
 */
export function calculateFitView(points3D, Macc, proj, canvas, margin = 0.1) {
    if (points3D.length === 0) {
        return {
            pan: { x: 0, y: 0 },
            scale: 1
        };
    }

    // Proyectar todos los puntos
    const projectedPoints = projectPoints(points3D, Macc, proj);
    
    // Calcular bounding box en 2D
    const bbox = calculateBoundingBox2D(projectedPoints);
    
    // Si todos los puntos están en el mismo lugar
    if (bbox.width === 0 && bbox.height === 0) {
        return {
            pan: { x: -bbox.centerX, y: -bbox.centerY },
            scale: Math.min(canvas.width, canvas.height) / 4 // Escala más grande por defecto
        };
    }

    // Calcular dimensiones disponibles del canvas con margen
    const availableWidth = canvas.width * (1 - 2 * margin);
    const availableHeight = canvas.height * (1 - 2 * margin);

    // Calcular escala para que quepa tanto en ancho como en alto
    const scaleX = bbox.width > 0 ? availableWidth / bbox.width : 1;
    const scaleY = bbox.height > 0 ? availableHeight / bbox.height : 1;
    let scale = Math.min(scaleX, scaleY);
    
    // Aplicar escala mínima para asegurar que el modelo sea visible
    const minScale = Math.min(canvas.width, canvas.height) / 20;
    const maxScale = Math.min(canvas.width, canvas.height) * 2;
    scale = Math.max(minScale, Math.min(maxScale, scale));

    // Calcular pan para centrar el contenido
    const pan = {
        x: -bbox.centerX,
        y: -bbox.centerY
    };

    return { pan, scale };
}

/**
 * Calcula el auto-ajuste considerando también los ejes coordenados
 * @param {number[][]} points3D - Puntos 3D del modelo
 * @param {number[][]} Macc - Matriz de transformación acumulada
 * @param {Object} proj - Configuración de proyección
 * @param {HTMLCanvasElement} canvas - Elemento canvas
 * @param {boolean} includeAxes - Si incluir los ejes en el cálculo
 * @param {number} margin - Margen como porcentaje
 * @returns {Object} Nuevos parámetros de vista { pan: {x, y}, scale }
 */
export function calculateFitViewWithAxes(points3D, Macc, proj, canvas, includeAxes = true, margin = 0.1) {
    // Si no hay puntos del modelo, ajustar solo para los ejes
    if (points3D.length === 0) {
        return {
            pan: { x: 0, y: 0 },
            scale: Math.min(canvas.width, canvas.height) / 8
        };
    }

    // Calcular el bounding box 3D del modelo para determinar el tamaño de los ejes
    let minX = points3D[0][0], maxX = points3D[0][0];
    let minY = points3D[0][1], maxY = points3D[0][1];
    let minZ = points3D[0][2], maxZ = points3D[0][2];

    for (let i = 1; i < points3D.length; i++) {
        const [x, y, z] = points3D[i];
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
        if (z < minZ) minZ = z;
        if (z > maxZ) maxZ = z;
    }

    const rangeX = maxX - minX;
    const rangeY = maxY - minY;
    const rangeZ = maxZ - minZ;
    const maxRange = Math.max(rangeX, rangeY, rangeZ);
    
    let allPoints = [...points3D];

    // Agregar puntos de los ejes si están habilitados, proporcionales al tamaño de los datos
    if (includeAxes && maxRange > 0) {
        const axisLength = maxRange * 0.6; // Ejes proporcionales a los datos
        const axisPoints = [
            [0, 0, 0],                    // Origen
            [axisLength, 0, 0],           // Eje X
            [0, axisLength, 0],           // Eje Y
            [0, 0, axisLength]            // Eje Z
        ];
        allPoints = [...allPoints, ...axisPoints];
    }

    return calculateFitView(allPoints, Macc, proj, canvas, margin);
}
