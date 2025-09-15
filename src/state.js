/**
 * Graficador 3D - Gestión del Estado
 * Manejo centralizado del estado de la aplicación
 */

import { I4 } from './core/math4.js';

/**
 * Crea el estado inicial de la aplicación
 * @returns {Object} Estado inicial
 */
export function createState() {
    return {
        // Modelo 3D actual (array de puntos [x, y, z])
        model: [],
        
        // Matriz de transformación acumulada (4x4)
        Macc: I4(),
        
        // Estado de la vista 2D
        view: {
            pan: { x: 0, y: 0 },
            scale: 1
        },
        
        // Flags de visualización
        flags: {
            axes: true,
            points: true
        },
        
        // Configuración de proyección
        proj: {
            type: 'iso',        // 'iso', 'oblique', 'axono', 'simple'
            phi: 45,            // Ángulo phi para proyección oblicua (grados)
            lambda: 0.5,        // Factor lambda para proyección oblicua
            ax: 30,             // Ángulo alpha para proyección axonométrica (grados)
            ay: 35              // Ángulo beta para proyección axonométrica (grados)
        }
    };
}

/**
 * Clona profundamente el estado para evitar mutaciones
 * @param {Object} state - Estado a clonar
 * @returns {Object} Estado clonado
 */
export function cloneState(state) {
    return {
        model: [...state.model.map(point => [...point])],
        Macc: state.Macc.map(row => [...row]),
        view: {
            pan: { ...state.view.pan },
            scale: state.view.scale
        },
        flags: { ...state.flags },
        proj: { ...state.proj }
    };
}

/**
 * Actualiza el modelo en el estado
 * @param {Object} state - Estado actual
 * @param {Array} newModel - Nuevo modelo (array de puntos [x, y, z])
 * @returns {Object} Estado actualizado
 */
export function updateModel(state, newModel) {
    const newState = cloneState(state);
    newState.model = newModel.map(point => [...point]);
    newState.Macc = I4(); // Reiniciar transformaciones
    return newState;
}

/**
 * Actualiza la matriz de transformación acumulada
 * @param {Object} state - Estado actual
 * @param {number[][]} newMacc - Nueva matriz de transformación
 * @returns {Object} Estado actualizado
 */
export function updateTransform(state, newMacc) {
    const newState = cloneState(state);
    newState.Macc = newMacc.map(row => [...row]);
    return newState;
}

/**
 * Actualiza la configuración de proyección
 * @param {Object} state - Estado actual
 * @param {Object} projConfig - Nueva configuración de proyección
 * @returns {Object} Estado actualizado
 */
export function updateProjection(state, projConfig) {
    const newState = cloneState(state);
    newState.proj = { ...newState.proj, ...projConfig };
    return newState;
}

/**
 * Actualiza la vista 2D (pan y zoom)
 * @param {Object} state - Estado actual
 * @param {Object} viewConfig - Nueva configuración de vista
 * @returns {Object} Estado actualizado
 */
export function updateView(state, viewConfig) {
    const newState = cloneState(state);
    if (viewConfig.pan) {
        newState.view.pan = { ...newState.view.pan, ...viewConfig.pan };
    }
    if (viewConfig.scale !== undefined) {
        newState.view.scale = viewConfig.scale;
    }
    return newState;
}

/**
 * Actualiza los flags de visualización
 * @param {Object} state - Estado actual
 * @param {Object} flagConfig - Nuevos flags
 * @returns {Object} Estado actualizado
 */
export function updateFlags(state, flagConfig) {
    const newState = cloneState(state);
    newState.flags = { ...newState.flags, ...flagConfig };
    return newState;
}
