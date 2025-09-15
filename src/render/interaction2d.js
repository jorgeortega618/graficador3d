/**
 * Graficador 3D - Interacciones 2D
 * Manejo de pan y zoom en el canvas
 */

import { updateView } from '../state.js';

/**
 * Adjunta eventos de pan y zoom al canvas
 * @param {HTMLCanvasElement} canvas - Elemento canvas
 * @param {Object} state - Estado de la aplicación
 * @param {Function} onChange - Callback cuando cambia la vista
 * @returns {Function} Función para desconectar los eventos
 */
export function attachPanZoom(canvas, state, onChange) {
    let isDragging = false;
    let lastMousePos = { x: 0, y: 0 };
    let currentState = state;

    // Actualizar referencia del estado
    const updateState = (newState) => {
        currentState = newState;
    };

    // Manejo del mouse down (inicio del drag)
    const handleMouseDown = (event) => {
        isDragging = true;
        const rect = canvas.getBoundingClientRect();
        lastMousePos = {
            x: event.clientX - rect.left,
            y: event.clientY - rect.top
        };
        canvas.style.cursor = 'grabbing';
        event.preventDefault();
    };

    // Manejo del mouse move (dragging)
    const handleMouseMove = (event) => {
        if (!isDragging) return;

        const rect = canvas.getBoundingClientRect();
        const currentMousePos = {
            x: event.clientX - rect.left,
            y: event.clientY - rect.top
        };

        // Calcular el delta del movimiento
        const deltaX = currentMousePos.x - lastMousePos.x;
        const deltaY = currentMousePos.y - lastMousePos.y;

        // Convertir a coordenadas del mundo (invertir el escalamiento)
        const worldDeltaX = deltaX / currentState.view.scale;
        const worldDeltaY = -deltaY / currentState.view.scale; // Invertir Y

        // Actualizar el pan
        const newState = updateView(currentState, {
            pan: {
                x: currentState.view.pan.x + worldDeltaX,
                y: currentState.view.pan.y + worldDeltaY
            }
        });

        updateState(newState);
        onChange(newState);

        lastMousePos = currentMousePos;
        event.preventDefault();
    };

    // Manejo del mouse up (fin del drag)
    const handleMouseUp = (event) => {
        isDragging = false;
        canvas.style.cursor = 'grab';
        event.preventDefault();
    };

    // Manejo del wheel (zoom)
    const handleWheel = (event) => {
        event.preventDefault();

        // Factor de zoom exponencial
        const zoomFactor = event.deltaY > 0 ? 0.9 : 1.1;
        const newScale = Math.max(0.1, Math.min(10, currentState.view.scale * zoomFactor));

        // Actualizar el zoom
        const newState = updateView(currentState, {
            scale: newScale
        });

        updateState(newState);
        onChange(newState);
    };

    // Prevenir el menú contextual
    const handleContextMenu = (event) => {
        event.preventDefault();
    };

    // Adjuntar eventos
    canvas.addEventListener('mousedown', handleMouseDown);
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseup', handleMouseUp);
    canvas.addEventListener('mouseleave', handleMouseUp); // Tratar como mouse up si sale del canvas
    canvas.addEventListener('wheel', handleWheel);
    canvas.addEventListener('contextmenu', handleContextMenu);

    // Establecer cursor inicial
    canvas.style.cursor = 'grab';

    // Función para desconectar eventos
    const disconnect = () => {
        canvas.removeEventListener('mousedown', handleMouseDown);
        canvas.removeEventListener('mousemove', handleMouseMove);
        canvas.removeEventListener('mouseup', handleMouseUp);
        canvas.removeEventListener('mouseleave', handleMouseUp);
        canvas.removeEventListener('wheel', handleWheel);
        canvas.removeEventListener('contextmenu', handleContextMenu);
        canvas.style.cursor = 'default';
    };

    // Retornar objeto con métodos de control
    return {
        disconnect,
        updateState
    };
}
