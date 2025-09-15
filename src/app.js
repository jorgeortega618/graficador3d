/**
 * Graficador 3D - Aplicación Principal
 * Punto de entrada de la aplicación
 */

// Imports
import { I4, mul4, mul4v, T, S, Rx, Ry, Rz } from './core/math4.js';
import { createState, updateModel } from './state.js';
import { drawScene } from './render/canvas2d.js';
import { attachPanZoom } from './render/interaction2d.js';
import { wireControls } from './ui/controls.js';

console.log('Graficador 3D iniciando...');

// Pruebas rápidas del núcleo matemático
function testMath4() {
    console.log('=== Pruebas Math4 ===');
    
    // Test identidad
    const id = I4();
    console.log('Matriz identidad:', id);
    
    // Test multiplicación matriz-vector
    const point = [1, 2, 3, 1];
    const translated = mul4v(T(5, 0, 0), point);
    console.log('Punto [1,2,3] trasladado +5 en X:', translated);
    
    // Test rotación
    const rotated = mul4v(Ry(90), [1, 0, 0, 1]);
    console.log('Punto [1,0,0] rotado 90° en Y:', rotated);
    
    // Test escalamiento
    const scaled = mul4v(S(2), [1, 1, 1, 1]);
    console.log('Punto [1,1,1] escalado x2:', scaled);
    
    console.log('=== Fin pruebas Math4 ===');
}

// Estado global de la aplicación
let appState = null;
let canvas = null;
let ctx = null;
let panZoomController = null;
let uiController = null;

// Función de renderizado principal
function draw() {
    if (!ctx || !canvas || !appState) return;
    
    // Usar el sistema de renderizado real
    drawScene(ctx, canvas, appState);
    
    // Mostrar información del estado en overlay
    ctx.font = '12px Arial';
    ctx.textAlign = 'left';
    ctx.fillStyle = '#81c784';
    ctx.fillText(`Puntos: ${appState.model.length}`, 20, 30);
    ctx.fillText(`Proyección: ${appState.proj.type}`, 20, 50);
    ctx.fillText(`Zoom: ${(appState.view.scale * 100).toFixed(0)}%`, 20, 70);
}

// Datos de prueba - cubo unitario
function createTestCube() {
    return [
        // Vértices del cubo unitario
        [-1, -1, -1], [1, -1, -1], [1, 1, -1], [-1, 1, -1], // Cara frontal
        [-1, -1,  1], [1, -1,  1], [1, 1,  1], [-1, 1,  1]  // Cara trasera
    ];
}

// Callback para cambios de estado desde la UI
function onStateChange(newState) {
    appState = newState;
    // Actualizar el controlador de pan/zoom con el nuevo estado
    if (panZoomController) {
        panZoomController.updateState(newState);
    }
}

// Inicialización de la aplicación
document.addEventListener('DOMContentLoaded', () => {
    // Obtener referencias del DOM
    canvas = document.getElementById('view');
    ctx = canvas.getContext('2d');
    
    // Crear estado inicial
    appState = createState();
    console.log('Estado inicial creado:', appState);
    
    // Cargar datos de prueba
    const testCube = createTestCube();
    appState = updateModel(appState, testCube);
    console.log('Cubo de prueba cargado:', testCube.length, 'puntos');
    
    // Ajustar escala inicial para ver mejor
    appState.view.scale = 50;
    
    // Ejecutar pruebas
    testMath4();
    
    // Conectar pan/zoom
    panZoomController = attachPanZoom(canvas, appState, (newState) => {
        appState = newState;
        draw();
    });
    
    // Conectar controles de UI
    uiController = wireControls(appState, onStateChange, draw);
    
    // Renderizado inicial
    draw();
    
    console.log('Aplicación inicializada correctamente');
});
