/**
 * Graficador 3D - Renderizado 2D
 * Dibujo de ejes, puntos y elementos en canvas
 */

import { projectPoints } from '../core/projections.js';

/**
 * Limpia el canvas con el color de fondo
 * @param {CanvasRenderingContext2D} ctx - Contexto del canvas
 * @param {HTMLCanvasElement} canvas - Elemento canvas
 */
function clearCanvas(ctx, canvas) {
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

/**
 * Transforma coordenadas del mundo a coordenadas de pantalla
 * @param {number} x - Coordenada X del mundo
 * @param {number} y - Coordenada Y del mundo
 * @param {HTMLCanvasElement} canvas - Elemento canvas
 * @param {Object} view - Estado de la vista (pan, scale)
 * @returns {number[]} Coordenadas de pantalla [sx, sy]
 */
function worldToScreen(x, y, canvas, view) {
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    
    const sx = centerX + (x + view.pan.x) * view.scale;
    const sy = centerY - (y + view.pan.y) * view.scale; // Invertir Y para que +Y sea hacia arriba
    
    return [sx, sy];
}

/**
 * Calcula el bounding box de los puntos 3D transformados
 * @param {number[][]} points3D - Puntos 3D del modelo
 * @param {number[][]} Macc - Matriz de transformación acumulada
 * @returns {Object} Bounding box con min y max para cada eje
 */
function calculateBoundingBox3D(points3D, Macc) {
    if (points3D.length === 0) {
        return {
            minX: -5, maxX: 5,
            minY: -5, maxY: 5,
            minZ: -5, maxZ: 5
        };
    }
    
    // Aplicar transformaciones a los puntos
    const transformedPoints = points3D.map(([x, y, z]) => {
        const point = [x, y, z, 1];
        const transformed = [
            Macc[0][0] * point[0] + Macc[0][1] * point[1] + Macc[0][2] * point[2] + Macc[0][3] * point[3],
            Macc[1][0] * point[0] + Macc[1][1] * point[1] + Macc[1][2] * point[2] + Macc[1][3] * point[3],
            Macc[2][0] * point[0] + Macc[2][1] * point[1] + Macc[2][2] * point[2] + Macc[2][3] * point[3]
        ];
        return transformed;
    });
    
    let minX = transformedPoints[0][0], maxX = transformedPoints[0][0];
    let minY = transformedPoints[0][1], maxY = transformedPoints[0][1];
    let minZ = transformedPoints[0][2], maxZ = transformedPoints[0][2];
    
    transformedPoints.forEach(([x, y, z]) => {
        minX = Math.min(minX, x);
        maxX = Math.max(maxX, x);
        minY = Math.min(minY, y);
        maxY = Math.max(maxY, y);
        minZ = Math.min(minZ, z);
        maxZ = Math.max(maxZ, z);
    });
    
    // Agregar margen del 20%
    const marginX = (maxX - minX) * 0.2;
    const marginY = (maxY - minY) * 0.2;
    const marginZ = (maxZ - minZ) * 0.2;
    
    return {
        minX: minX - marginX,
        maxX: maxX + marginX,
        minY: minY - marginY,
        maxY: maxY + marginY,
        minZ: minZ - marginZ,
        maxZ: maxZ + marginZ
    };
}

/**
 * Dibuja un fondo 3D con esquina adaptativo al tamaño de los datos
 * @param {CanvasRenderingContext2D} ctx - Contexto del canvas
 * @param {HTMLCanvasElement} canvas - Elemento canvas
 * @param {Object} view - Estado de la vista
 * @param {number[][]} Macc - Matriz de transformación acumulada
 * @param {Object} proj - Configuración de proyección
 * @param {number[][]} points3D - Puntos 3D del modelo para calcular tamaño
 */
function draw3DBackground(ctx, canvas, view, Macc, proj, points3D) {
    // Limpiar con blanco
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Calcular bounding box de los datos
    const bbox = calculateBoundingBox3D(points3D, Macc);
    
    // Usar el bounding box para definir el tamaño de los planos
    const { minX, maxX, minY, maxY, minZ, maxZ } = bbox;
    
    // Piso (plano XY en Z = minZ)
    const floorPoints = [
        [minX, minY, minZ],
        [maxX, minY, minZ],
        [maxX, maxY, minZ],
        [minX, maxY, minZ]
    ];
    
    // Pared trasera (plano XZ en Y = minY)
    const backWallPoints = [
        [minX, minY, minZ],
        [maxX, minY, minZ],
        [maxX, minY, maxZ],
        [minX, minY, maxZ]
    ];
    
    // Pared lateral (plano YZ en X = minX)
    const sideWallPoints = [
        [minX, minY, minZ],
        [minX, maxY, minZ],
        [minX, maxY, maxZ],
        [minX, minY, maxZ]
    ];
    
    // Proyectar y dibujar cada plano
    drawPlane(ctx, canvas, floorPoints, view, Macc, proj, '#f0f0f0', '#e8e8e8'); // Piso gris claro
    drawPlane(ctx, canvas, backWallPoints, view, Macc, proj, '#f8f8f8', '#f0f0f0'); // Pared trasera más clara
    drawPlane(ctx, canvas, sideWallPoints, view, Macc, proj, '#f5f5f5', '#eeeeee'); // Pared lateral intermedia
}

/**
 * Dibuja un plano 3D con gradiente
 * @param {CanvasRenderingContext2D} ctx - Contexto del canvas
 * @param {HTMLCanvasElement} canvas - Elemento canvas
 * @param {number[][]} planePoints - Puntos del plano
 * @param {Object} view - Estado de la vista
 * @param {number[][]} Macc - Matriz de transformación acumulada
 * @param {Object} proj - Configuración de proyección
 * @param {string} color1 - Color principal
 * @param {string} color2 - Color secundario para gradiente
 */
function drawPlane(ctx, canvas, planePoints, view, Macc, proj, color1, color2) {
    // Proyectar puntos del plano
    const projectedPlane = projectPoints(planePoints, Macc, proj);
    const screenPlane = projectedPlane.map(([x, y]) => worldToScreen(x, y, canvas, view));
    
    // Crear gradiente para el plano
    const [p1, p2, p3, p4] = screenPlane;
    const gradient = ctx.createLinearGradient(p1[0], p1[1], p3[0], p3[1]);
    gradient.addColorStop(0, color1);
    gradient.addColorStop(1, color2);
    
    // Dibujar el plano
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.moveTo(p1[0], p1[1]);
    ctx.lineTo(p2[0], p2[1]);
    ctx.lineTo(p3[0], p3[1]);
    ctx.lineTo(p4[0], p4[1]);
    ctx.closePath();
    ctx.fill();
    
    // Agregar borde sutil
    ctx.strokeStyle = 'rgba(200, 200, 200, 0.5)';
    ctx.lineWidth = 1;
    ctx.stroke();
}

/**
 * Dibuja grillas adaptativas en los planos de fondo
 * @param {CanvasRenderingContext2D} ctx - Contexto del canvas
 * @param {HTMLCanvasElement} canvas - Elemento canvas
 * @param {Object} view - Estado de la vista
 * @param {number[][]} Macc - Matriz de transformación acumulada
 * @param {Object} proj - Configuración de proyección
 * @param {number[][]} points3D - Puntos 3D del modelo
 */
function drawGrid(ctx, canvas, view, Macc, proj, points3D) {
    // Calcular bounding box de los datos
    const bbox = calculateBoundingBox3D(points3D, Macc);
    const { minX, maxX, minY, maxY, minZ, maxZ } = bbox;
    
    // Calcular paso de grilla basado en el tamaño de los datos
    const rangeX = maxX - minX;
    const rangeY = maxY - minY;
    const rangeZ = maxZ - minZ;
    const maxRange = Math.max(rangeX, rangeY, rangeZ);
    
    // Determinar paso de grilla apropiado y proporcional al rango de datos
    let gridStep;
    if (maxRange < 0.001) {
        // Para datos muy pequeños (< 0.001)
        gridStep = maxRange / 8;
    } else if (maxRange < 0.01) {
        // Para datos pequeños (0.001 - 0.01)
        gridStep = maxRange / 10;
    } else if (maxRange < 0.1) {
        // Para datos medianos pequeños (0.01 - 0.1)
        gridStep = maxRange / 12;
    } else if (maxRange < 1) {
        // Para datos medianos (0.1 - 1)
        gridStep = maxRange / 15;
    } else {
        // Para datos grandes (> 1), usar el algoritmo original
        gridStep = Math.pow(10, Math.floor(Math.log10(maxRange / 10)));
        if (maxRange / gridStep > 20) gridStep *= 2;
        if (maxRange / gridStep > 20) gridStep *= 2.5;
    }
    
    // Asegurar que el paso no sea demasiado pequeño para ser útil
    if (gridStep < maxRange / 50) {
        gridStep = maxRange / 20;
    }
    
    // Grilla en el piso
    drawAdaptivePlaneGrid(ctx, canvas, view, Macc, proj, bbox, gridStep, 'floor');
    
    // Grilla en pared trasera
    drawAdaptivePlaneGrid(ctx, canvas, view, Macc, proj, bbox, gridStep, 'backWall');
    
    // Grilla en pared lateral
    drawAdaptivePlaneGrid(ctx, canvas, view, Macc, proj, bbox, gridStep, 'sideWall');
}

/**
 * Dibuja grilla adaptativa en un plano específico
 * @param {CanvasRenderingContext2D} ctx - Contexto del canvas
 * @param {HTMLCanvasElement} canvas - Elemento canvas
 * @param {Object} view - Estado de la vista
 * @param {number[][]} Macc - Matriz de transformación acumulada
 * @param {Object} proj - Configuración de proyección
 * @param {Object} bbox - Bounding box de los datos
 * @param {number} gridStep - Paso de la grilla
 * @param {string} plane - Tipo de plano ('floor', 'backWall', 'sideWall')
 */
function drawAdaptivePlaneGrid(ctx, canvas, view, Macc, proj, bbox, gridStep, plane) {
    const { minX, maxX, minY, maxY, minZ, maxZ } = bbox;
    
    ctx.strokeStyle = 'rgba(180, 180, 180, 0.6)';
    ctx.lineWidth = 0.5;
    
    // Calcular límites de grilla redondeados al paso más cercano
    const roundToStep = (value, step) => Math.floor(value / step) * step;
    const ceilToStep = (value, step) => Math.ceil(value / step) * step;
    
    switch (plane) {
        case 'floor':
            // Líneas verticales (paralelas a Y)
            for (let x = roundToStep(minX, gridStep); x <= ceilToStep(maxX, gridStep); x += gridStep) {
                const line = [[x, minY, minZ], [x, maxY, minZ]];
                drawGridLine(ctx, canvas, view, Macc, proj, line);
                
                // Etiqueta numérica en el piso
                if (Math.abs(x % (gridStep * 2)) < gridStep * 0.1) {
                    const label = Math.abs(x) < 0.001 ? x.toExponential(2) : 
                                 Math.abs(x) < 0.01 ? x.toFixed(4) :
                                 Math.abs(x) < 0.1 ? x.toFixed(3) :
                                 Math.abs(x) < 1 ? x.toFixed(2) : x.toString();
                    drawGridLabel(ctx, canvas, view, Macc, proj, [x, minY, minZ], label);
                }
            }
            // Líneas horizontales (paralelas a X)
            for (let y = roundToStep(minY, gridStep); y <= ceilToStep(maxY, gridStep); y += gridStep) {
                const line = [[minX, y, minZ], [maxX, y, minZ]];
                drawGridLine(ctx, canvas, view, Macc, proj, line);
                
                // Etiqueta numérica en el piso
                if (Math.abs(y % (gridStep * 2)) < gridStep * 0.1) {
                    const label = Math.abs(y) < 0.001 ? y.toExponential(2) : 
                                 Math.abs(y) < 0.01 ? y.toFixed(4) :
                                 Math.abs(y) < 0.1 ? y.toFixed(3) :
                                 Math.abs(y) < 1 ? y.toFixed(2) : y.toString();
                    drawGridLabel(ctx, canvas, view, Macc, proj, [minX, y, minZ], label);
                }
            }
            break;
            
        case 'backWall':
            // Líneas verticales en Z
            for (let x = roundToStep(minX, gridStep); x <= ceilToStep(maxX, gridStep); x += gridStep) {
                const line = [[x, minY, minZ], [x, minY, maxZ]];
                drawGridLine(ctx, canvas, view, Macc, proj, line);
            }
            // Líneas horizontales en Z
            for (let z = roundToStep(minZ, gridStep); z <= ceilToStep(maxZ, gridStep); z += gridStep) {
                const line = [[minX, minY, z], [maxX, minY, z]];
                drawGridLine(ctx, canvas, view, Macc, proj, line);
                
                // Etiqueta numérica en pared trasera
                if (z % (gridStep * 2) === 0) {
                    drawGridLabel(ctx, canvas, view, Macc, proj, [minX, minY, z], z.toString());
                }
            }
            break;
            
        case 'sideWall':
            // Líneas verticales en Z
            for (let y = roundToStep(minY, gridStep); y <= ceilToStep(maxY, gridStep); y += gridStep) {
                const line = [[minX, y, minZ], [minX, y, maxZ]];
                drawGridLine(ctx, canvas, view, Macc, proj, line);
            }
            // Líneas horizontales en Z
            for (let z = roundToStep(minZ, gridStep); z <= ceilToStep(maxZ, gridStep); z += gridStep) {
                const line = [[minX, minY, z], [minX, maxY, z]];
                drawGridLine(ctx, canvas, view, Macc, proj, line);
            }
            break;
    }
}

/**
 * Dibuja una etiqueta numérica en la grilla
 * @param {CanvasRenderingContext2D} ctx - Contexto del canvas
 * @param {HTMLCanvasElement} canvas - Elemento canvas
 * @param {Object} view - Estado de la vista
 * @param {number[][]} Macc - Matriz de transformación acumulada
 * @param {Object} proj - Configuración de proyección
 * @param {number[]} point3D - Punto 3D donde colocar la etiqueta
 * @param {string} label - Texto de la etiqueta
 */
function drawGridLabel(ctx, canvas, view, Macc, proj, point3D, label) {
    const projectedPoint = projectPoints([point3D], Macc, proj);
    const [sx, sy] = worldToScreen(projectedPoint[0][0], projectedPoint[0][1], canvas, view);
    
    ctx.fillStyle = 'rgba(120, 120, 120, 0.8)';
    ctx.font = '10px Arial';
    ctx.fillText(label, sx + 3, sy - 3);
}

/**
 * Dibuja una línea de grilla
 * @param {CanvasRenderingContext2D} ctx - Contexto del canvas
 * @param {HTMLCanvasElement} canvas - Elemento canvas
 * @param {Object} view - Estado de la vista
 * @param {number[][]} Macc - Matriz de transformación acumulada
 * @param {Object} proj - Configuración de proyección
 * @param {number[][]} line - Puntos de la línea
 */
function drawGridLine(ctx, canvas, view, Macc, proj, line) {
    const projectedLine = projectPoints(line, Macc, proj);
    const screenLine = projectedLine.map(([x, y]) => worldToScreen(x, y, canvas, view));
    
    ctx.beginPath();
    ctx.moveTo(screenLine[0][0], screenLine[0][1]);
    ctx.lineTo(screenLine[1][0], screenLine[1][1]);
    ctx.stroke();
}

/**
 * Dibuja líneas de perspectiva adicionales para efecto 3D
 * @param {CanvasRenderingContext2D} ctx - Contexto del canvas
 * @param {HTMLCanvasElement} canvas - Elemento canvas
 * @param {Object} view - Estado de la vista
 * @param {number[][]} Macc - Matriz de transformación acumulada
 * @param {Object} proj - Configuración de proyección
 */
function drawPerspectiveLines(ctx, canvas, view, Macc, proj) {
    const gridSize = 5;
    
    // Líneas verticales en Z para dar sensación de profundidad
    ctx.strokeStyle = 'rgba(180, 180, 180, 0.4)';
    ctx.lineWidth = 0.5;
    
    for (let x = -gridSize; x <= gridSize; x += 2) {
        for (let y = -gridSize; y <= gridSize; y += 2) {
            const zLine = [
                [x, y, -2],
                [x, y, 2]
            ];
            
            const projectedZ = projectPoints(zLine, Macc, proj);
            const screenZ = projectedZ.map(([px, py]) => worldToScreen(px, py, canvas, view));
            
            ctx.beginPath();
            ctx.moveTo(screenZ[0][0], screenZ[0][1]);
            ctx.lineTo(screenZ[1][0], screenZ[1][1]);
            ctx.stroke();
        }
    }
}

/**
 * Dibuja los ejes coordenados 3D proyectados con tamaño adaptativo
 * @param {CanvasRenderingContext2D} ctx - Contexto del canvas
 * @param {HTMLCanvasElement} canvas - Elemento canvas
 * @param {Object} view - Estado de la vista
 * @param {number[][]} Macc - Matriz de transformación acumulada
 * @param {Object} proj - Configuración de proyección
 * @param {number[][]} points3D - Puntos 3D del modelo para calcular tamaño
 */
function drawAxes(ctx, canvas, view, Macc, proj, points3D) {
    // Calcular bounding box para determinar tamaño de ejes
    const bbox = calculateBoundingBox3D(points3D, Macc);
    const { minX, maxX, minY, maxY, minZ, maxZ } = bbox;
    
    // Calcular longitud de ejes basada en el rango de datos
    const rangeX = maxX - minX;
    const rangeY = maxY - minY;
    const rangeZ = maxZ - minZ;
    const maxRange = Math.max(rangeX, rangeY, rangeZ);
    
    // Longitud de ejes = 60% del rango máximo (para que no dominen la vista)
    const axisLength = maxRange * 0.6;
    
    // Definir los puntos de los ejes en 3D (extendidos)
    const axisPoints = [
        // Origen
        [0, 0, 0],
        // Eje X (rojo) - extendido en ambas direcciones
        [-axisLength, 0, 0], [axisLength, 0, 0],
        // Eje Y (verde) - extendido en ambas direcciones  
        [0, -axisLength, 0], [0, axisLength, 0],
        // Eje Z (azul) - extendido en ambas direcciones
        [0, 0, -axisLength], [0, 0, axisLength]
    ];
    
    // Proyectar los puntos de los ejes
    const projectedAxes = projectPoints(axisPoints, Macc, proj);
    
    // Convertir a coordenadas de pantalla
    const screenAxes = projectedAxes.map(([x, y]) => worldToScreen(x, y, canvas, view));
    
    const [origin, xNeg, xPos, yNeg, yPos, zNeg, zPos] = screenAxes;
    
    ctx.lineWidth = 2;
    
    // Eje X (rojo) - línea completa
    ctx.strokeStyle = '#d32f2f';
    ctx.beginPath();
    ctx.moveTo(xNeg[0], xNeg[1]);
    ctx.lineTo(xPos[0], xPos[1]);
    ctx.stroke();
    
    // Etiqueta X
    ctx.fillStyle = '#d32f2f';
    ctx.font = 'bold 16px Arial';
    ctx.fillText('X', xPos[0] + 8, xPos[1] - 8);
    
    // Eje Y (verde) - línea completa
    ctx.strokeStyle = '#388e3c';
    ctx.beginPath();
    ctx.moveTo(yNeg[0], yNeg[1]);
    ctx.lineTo(yPos[0], yPos[1]);
    ctx.stroke();
    
    // Etiqueta Y
    ctx.fillStyle = '#388e3c';
    ctx.fillText('Y', yPos[0] + 8, yPos[1] - 8);
    
    // Eje Z (azul) - línea completa
    ctx.strokeStyle = '#1976d2';
    ctx.beginPath();
    ctx.moveTo(zNeg[0], zNeg[1]);
    ctx.lineTo(zPos[0], zPos[1]);
    ctx.stroke();
    
    // Etiqueta Z
    ctx.fillStyle = '#1976d2';
    ctx.fillText('Z', zPos[0] + 8, zPos[1] - 8);
    
    // Dibujar marcas de escala en los ejes
    drawAxisTicks(ctx, canvas, view, Macc, proj, axisLength, maxRange);
}

/**
 * Dibuja marcas de escala adaptativas en los ejes
 * @param {CanvasRenderingContext2D} ctx - Contexto del canvas
 * @param {HTMLCanvasElement} canvas - Elemento canvas
 * @param {Object} view - Estado de la vista
 * @param {number[][]} Macc - Matriz de transformación acumulada
 * @param {Object} proj - Configuración de proyección
 * @param {number} axisLength - Longitud de los ejes
 * @param {number} maxRange - Rango máximo de los datos
 */
function drawAxisTicks(ctx, canvas, view, Macc, proj, axisLength, maxRange) {
    // Calcular paso de marcas basado en el rango de datos
    let tickStep = Math.pow(10, Math.floor(Math.log10(maxRange / 8)));
    if (maxRange / tickStep > 16) tickStep *= 2;
    if (maxRange / tickStep > 16) tickStep *= 2.5;
    
    const tickSize = axisLength * 0.02; // Tamaño de marca = 2% de la longitud del eje
    
    ctx.lineWidth = 1;
    ctx.font = '12px Arial';
    
    // Calcular número de marcas a mostrar
    const numTicks = Math.floor(axisLength / tickStep);
    
    // Marcas en eje X
    ctx.strokeStyle = '#d32f2f';
    ctx.fillStyle = '#d32f2f';
    for (let i = -numTicks; i <= numTicks; i++) {
        if (i === 0) continue; // Skip origin
        
        const tickValue = i * tickStep;
        const tickPoints = [
            [tickValue, 0, 0],
            [tickValue, tickSize, 0],
            [tickValue, -tickSize, 0]
        ];
        
        const projectedTicks = projectPoints(tickPoints, Macc, proj);
        const screenTicks = projectedTicks.map(([x, y]) => worldToScreen(x, y, canvas, view));
        
        // Dibujar marca
        ctx.beginPath();
        ctx.moveTo(screenTicks[1][0], screenTicks[1][1]);
        ctx.lineTo(screenTicks[2][0], screenTicks[2][1]);
        ctx.stroke();
        
        // Etiqueta numérica (solo cada 2 marcas para evitar saturación)
        if (i % 2 === 0) {
            const label = tickValue % 1 === 0 ? tickValue.toString() : tickValue.toFixed(1);
            ctx.fillText(label, screenTicks[0][0] + 3, screenTicks[0][1] - 3);
        }
    }
    
    // Marcas en eje Y
    ctx.strokeStyle = '#388e3c';
    ctx.fillStyle = '#388e3c';
    for (let i = -numTicks; i <= numTicks; i++) {
        if (i === 0) continue;
        
        const tickValue = i * tickStep;
        const tickPoints = [
            [0, tickValue, 0],
            [tickSize, tickValue, 0],
            [-tickSize, tickValue, 0]
        ];
        
        const projectedTicks = projectPoints(tickPoints, Macc, proj);
        const screenTicks = projectedTicks.map(([x, y]) => worldToScreen(x, y, canvas, view));
        
        ctx.beginPath();
        ctx.moveTo(screenTicks[1][0], screenTicks[1][1]);
        ctx.lineTo(screenTicks[2][0], screenTicks[2][1]);
        ctx.stroke();
        
        if (i % 2 === 0) {
            const label = tickValue % 1 === 0 ? tickValue.toString() : tickValue.toFixed(1);
            ctx.fillText(label, screenTicks[0][0] + 3, screenTicks[0][1] - 3);
        }
    }
    
    // Marcas en eje Z
    ctx.strokeStyle = '#1976d2';
    ctx.fillStyle = '#1976d2';
    for (let i = -numTicks; i <= numTicks; i++) {
        if (i === 0) continue;
        
        const tickValue = i * tickStep;
        const tickPoints = [
            [0, 0, tickValue],
            [tickSize, 0, tickValue],
            [-tickSize, 0, tickValue]
        ];
        
        const projectedTicks = projectPoints(tickPoints, Macc, proj);
        const screenTicks = projectedTicks.map(([x, y]) => worldToScreen(x, y, canvas, view));
        
        ctx.beginPath();
        ctx.moveTo(screenTicks[1][0], screenTicks[1][1]);
        ctx.lineTo(screenTicks[2][0], screenTicks[2][1]);
        ctx.stroke();
        
        if (i % 2 === 0) {
            const label = tickValue % 1 === 0 ? tickValue.toString() : tickValue.toFixed(1);
            ctx.fillText(label, screenTicks[0][0] + 3, screenTicks[0][1] - 3);
        }
    }
}

/**
 * Calcula el tamaño base de punto adaptativo según el número de puntos
 * @param {number} pointCount - Número de puntos en el dataset
 * @returns {number} Tamaño base del punto
 */
function calculateAdaptivePointSize(pointCount) {
    if (pointCount <= 50) {
        return 400; // Puntos grandes para datasets pequeños (cubo, pirámide)
    } else if (pointCount <= 200) {
        return 300; // Puntos medianos para datasets medianos
    } else if (pointCount <= 1000) {
        return 200; // Puntos pequeños para datasets grandes
    } else if (pointCount <= 5000) {
        return 150; // Puntos muy pequeños para datasets muy grandes (bunnyGrap.xyz)
    } else {
        return 100; // Puntos mínimos para datasets masivos (>5000 puntos)
    }
}

/**
 * Dibuja los puntos del modelo
 * @param {CanvasRenderingContext2D} ctx - Contexto del canvas
 * @param {HTMLCanvasElement} canvas - Elemento canvas
 * @param {number[][]} points3D - Puntos 3D del modelo
 * @param {Object} view - Estado de la vista
 * @param {number[][]} Macc - Matriz de transformación acumulada
 * @param {Object} proj - Configuración de proyección
 */
function drawPoints(ctx, canvas, points3D, view, Macc, proj) {
    if (points3D.length === 0) return;
    
    // Proyectar todos los puntos
    const projectedPoints = projectPoints(points3D, Macc, proj);
    
    // Calcular tamaño de punto adaptativo basado en número de puntos y zoom
    const baseSize = calculateAdaptivePointSize(points3D.length);
    const pointSize = Math.max(0.5, Math.min(8, baseSize * view.scale * 0.01));
    
    // Usar colores degradados basados en la coordenada Z para dar profundidad
    const colors = [
        '#1976d2', '#1e88e5', '#42a5f5', '#64b5f6', 
        '#90caf9', '#bbdefb', '#e3f2fd', '#f3e5f5',
        '#ce93d8', '#ba68c8', '#ab47bc', '#9c27b0',
        '#8e24aa', '#7b1fa2', '#6a1b9a', '#4a148c'
    ];
    
    // Dibujar cada punto con color basado en su índice
    projectedPoints.forEach(([x, y], index) => {
        const [sx, sy] = worldToScreen(x, y, canvas, view);
        
        // Solo dibujar si está dentro del canvas
        if (sx >= -pointSize && sx <= canvas.width + pointSize &&
            sy >= -pointSize && sy <= canvas.height + pointSize) {
            
            // Seleccionar color basado en el índice del punto
            const colorIndex = index % colors.length;
            ctx.fillStyle = colors[colorIndex];
            
            ctx.beginPath();
            ctx.arc(sx, sy, pointSize, 0, 2 * Math.PI);
            ctx.fill();
            
            // Agregar borde sutil
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 1;
            ctx.stroke();
        }
    });
}

/**
 * Función principal de renderizado
 * @param {CanvasRenderingContext2D} ctx - Contexto del canvas
 * @param {HTMLCanvasElement} canvas - Elemento canvas
 * @param {Object} state - Estado completo de la aplicación
 */
export function drawScene(ctx, canvas, state) {
    // Limpiar canvas
    clearCanvas(ctx, canvas);
    
    // Dibujar fondo 3D con esquina adaptativo al tamaño de los datos
    draw3DBackground(ctx, canvas, state.view, state.Macc, state.proj, state.model);
    
    // Dibujar grillas adaptativas en los planos de fondo
    drawGrid(ctx, canvas, state.view, state.Macc, state.proj, state.model);
    
    // Dibujar ejes si están habilitados
    if (state.flags.axes) {
        drawAxes(ctx, canvas, state.view, state.Macc, state.proj, state.model);
    }
    
    // Dibujar puntos si están habilitados y hay modelo cargado
    if (state.flags.points && state.model.length > 0) {
        drawPoints(ctx, canvas, state.model, state.view, state.Macc, state.proj);
    }
}
