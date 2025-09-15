/**
 * Graficador 3D - Controles de UI
 * Conexión entre elementos DOM y funcionalidad de la aplicación
 */

import { parseFile, isValidFileType } from '../io/parser.js';
import { cubeDemo } from '../io/demos.js';
import { updateModel, updateProjection, updateFlags, updateTransform, updateView } from '../state.js';
import { applyTranslate, applyRotate, applyScale } from '../core/transforms.js';
import { calculateFitViewWithAxes } from '../core/fitView.js';
import { I4, mul4 } from '../core/math4.js';

/**
 * Muestra un mensaje de error al usuario
 * @param {string} message - Mensaje de error
 */
function showError(message) {
    // Crear elemento de notificación si no existe
    let errorDiv = document.getElementById('error-notification');
    if (!errorDiv) {
        errorDiv = document.createElement('div');
        errorDiv.id = 'error-notification';
        errorDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #f44336;
            color: white;
            padding: 12px 20px;
            border-radius: 4px;
            font-size: 14px;
            z-index: 1000;
            max-width: 300px;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        `;
        document.body.appendChild(errorDiv);
    }
    
    errorDiv.textContent = message;
    errorDiv.style.display = 'block';
    
    // Auto-ocultar después de 5 segundos
    setTimeout(() => {
        errorDiv.style.display = 'none';
    }, 5000);
}

/**
 * Muestra un mensaje de éxito al usuario
 * @param {string} message - Mensaje de éxito
 */
function showSuccess(message) {
    let successDiv = document.getElementById('success-notification');
    if (!successDiv) {
        successDiv = document.createElement('div');
        successDiv.id = 'success-notification';
        successDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #4caf50;
            color: white;
            padding: 12px 20px;
            border-radius: 4px;
            font-size: 14px;
            z-index: 1000;
            max-width: 300px;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        `;
        document.body.appendChild(successDiv);
    }
    
    successDiv.textContent = message;
    successDiv.style.display = 'block';
    
    setTimeout(() => {
        successDiv.style.display = 'none';
    }, 3000);
}

/**
 * Valida un valor numérico de entrada
 * @param {string} value - Valor a validar
 * @param {string} fieldName - Nombre del campo para mensajes de error
 * @returns {number|null} Valor numérico o null si es inválido
 */
function validateNumericInput(value, fieldName) {
    const num = parseFloat(value);
    if (isNaN(num)) {
        showError(`${fieldName}: Valor numérico inválido`);
        return null;
    }
    return num;
}

/**
 * Conecta todos los controles de la UI con la funcionalidad de la aplicación
 * @param {Object} state - Estado inicial de la aplicación
 * @param {Function} onStateChange - Callback cuando cambia el estado
 * @param {Function} onRedraw - Callback para redibujar
 */
export function wireControls(state, onStateChange, onRedraw) {
    let currentState = state;

    // Función auxiliar para actualizar estado
    const updateState = (newState) => {
        currentState = newState;
        onStateChange(newState);
        onRedraw();
        
        // Actualizar información en la UI
        updateCanvasInfo();
    };

    // Actualizar información del canvas
    const updateCanvasInfo = () => {
        const pointCountEl = document.getElementById('pointCount');
        const zoomLevelEl = document.getElementById('zoomLevel');
        
        if (pointCountEl) {
            pointCountEl.textContent = `Puntos: ${currentState.model.length}`;
        }
        if (zoomLevelEl) {
            zoomLevelEl.textContent = `Zoom: ${(currentState.view.scale * 100).toFixed(0)}%`;
        }
    };

    // === CARGA DE ARCHIVOS ===
    const fileInput = document.getElementById('fileInput');
    const loadDemoBtn = document.getElementById('loadDemo');

    fileInput.addEventListener('change', async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        if (!isValidFileType(file)) {
            showError('Tipo de archivo no válido. Use archivos .txt o .xyz');
            fileInput.value = '';
            return;
        }

        try {
            const result = await parseFile(file);
            
            if (result.success) {
                let newState = updateModel(currentState, result.points);
                
                // Establecer ángulo de vista por defecto para coincidir con imagen de referencia
                const defaultRotationMatrix = applyRotate(I4(), 15, -25, 0);
                newState = updateTransform(newState, defaultRotationMatrix);
                baseTransformMatrix = defaultRotationMatrix;
                
                // Auto-ajustar vista para que el modelo llene la pantalla
                const canvas = document.getElementById('view');
                const fitParams = calculateFitViewWithAxes(
                    result.points,
                    defaultRotationMatrix,
                    newState.proj,
                    canvas,
                    newState.flags.axes,
                    0.05 // Margen pequeño para maximizar el uso del espacio
                );
                newState = updateView(newState, fitParams);
                
                updateState(newState);
                showSuccess(`Archivo cargado: ${result.points.length} puntos`);
                console.log('Archivo cargado exitosamente:', result.points.length, 'puntos');
            } else {
                showError(`Error al cargar archivo: ${result.error}`);
                console.error('Error al cargar archivo:', result.error);
            }
        } catch (error) {
            showError(`Error al leer el archivo: ${error.message}`);
        }
        
        fileInput.value = '';
    });

    loadDemoBtn.addEventListener('click', () => {
        const demoData = cubeDemo();
        let newState = updateModel(currentState, demoData);
        
        // Establecer ángulo de vista por defecto para coincidir con imagen de referencia
        const defaultRotationMatrix = applyRotate(I4(), 15, -25, 0);
        newState = updateTransform(newState, defaultRotationMatrix);
        baseTransformMatrix = defaultRotationMatrix;
        
        // Auto-ajustar vista para que el modelo llene la pantalla
        const canvas = document.getElementById('view');
        const fitParams = calculateFitViewWithAxes(
            demoData,
            defaultRotationMatrix,
            newState.proj,
            canvas,
            newState.flags.axes,
            0.05 // Margen pequeño para maximizar el uso del espacio
        );
        newState = updateView(newState, fitParams);
        
        updateState(newState);
        showSuccess('Datos de demostración cargados');
        console.log('Demo cargado: cubo con', demoData.length, 'puntos');
    });

    // === PROYECCIONES ===
    const projectionSelect = document.getElementById('projectionType');
    const obliqueParams = document.getElementById('obliqueParams');
    const axonoParams = document.getElementById('axonoParams');
    
    const obliquePhi = document.getElementById('obliquePhi');
    const obliqueLambda = document.getElementById('obliqueLambda');
    const axonoAlpha = document.getElementById('axonoAlpha');
    const axonoBeta = document.getElementById('axonoBeta');

    // Mostrar/ocultar parámetros según la proyección
    const updateProjectionParams = () => {
        const projType = projectionSelect.value;
        
        obliqueParams.classList.toggle('active', projType === 'oblique');
        axonoParams.classList.toggle('active', projType === 'axono');
    };

    projectionSelect.addEventListener('change', () => {
        updateProjectionParams();
        
        const newState = updateProjection(currentState, {
            type: projectionSelect.value
        });
        updateState(newState);
    });

    // Parámetros de proyección oblicua
    obliquePhi.addEventListener('input', () => {
        const newState = updateProjection(currentState, {
            phi: parseFloat(obliquePhi.value)
        });
        updateState(newState);
    });

    obliqueLambda.addEventListener('input', () => {
        const newState = updateProjection(currentState, {
            lambda: parseFloat(obliqueLambda.value)
        });
        updateState(newState);
    });

    // Parámetros de proyección axonométrica
    axonoAlpha.addEventListener('input', () => {
        const newState = updateProjection(currentState, {
            ax: parseFloat(axonoAlpha.value)
        });
        updateState(newState);
    });

    axonoBeta.addEventListener('input', () => {
        const newState = updateProjection(currentState, {
            ay: parseFloat(axonoBeta.value)
        });
        updateState(newState);
    });

    // === TRANSFORMACIONES 3D ===
    const translateX = document.getElementById('translateX');
    const translateY = document.getElementById('translateY');
    const translateZ = document.getElementById('translateZ');
    const applyTranslateBtn = document.getElementById('applyTranslate');

    const rotateX = document.getElementById('rotateX');
    const rotateY = document.getElementById('rotateY');
    const rotateZ = document.getElementById('rotateZ');
    const applyRotateBtn = document.getElementById('applyRotate');

    const scaleValue = document.getElementById('scaleValue');
    const applyScaleBtn = document.getElementById('applyScale');
    const scalePresets = document.querySelectorAll('.scale-preset');

    const resetModelBtn = document.getElementById('resetModel');
    const autoFitBtn = document.getElementById('autoFit');

    // Sliders de traslación con actualización en tiempo real
    const translateXValue = document.getElementById('translateXValue');
    const translateYValue = document.getElementById('translateYValue');
    const translateZValue = document.getElementById('translateZValue');
    
    let baseTransformMatrix = I4(); // Matriz base sin traslaciones
    
    const updateTranslation = () => {
        const dx = parseFloat(translateX.value) || 0;
        const dy = parseFloat(translateY.value) || 0;
        const dz = parseFloat(translateZ.value) || 0;
        
        // Actualizar valores mostrados
        translateXValue.textContent = dx.toFixed(1);
        translateYValue.textContent = dy.toFixed(1);
        translateZValue.textContent = dz.toFixed(1);
        
        // Aplicar traslación a la matriz base
        const translationMatrix = applyTranslate(I4(), dx, dy, dz);
        const newMacc = mul4(translationMatrix, baseTransformMatrix);
        const newState = updateTransform(currentState, newMacc);
        updateState(newState);
    };
    
    translateX.addEventListener('input', updateTranslation);
    translateY.addEventListener('input', updateTranslation);
    translateZ.addEventListener('input', updateTranslation);

    // Sliders de rotación con actualización en tiempo real
    const rotateXValue = document.getElementById('rotateXValue');
    const rotateYValue = document.getElementById('rotateYValue');
    const rotateZValue = document.getElementById('rotateZValue');
    
    const updateRotation = () => {
        const rx = parseFloat(rotateX.value) || 0;
        const ry = parseFloat(rotateY.value) || 0;
        const rz = parseFloat(rotateZ.value) || 0;
        
        // Actualizar valores mostrados
        rotateXValue.textContent = rx + '°';
        rotateYValue.textContent = ry + '°';
        rotateZValue.textContent = rz + '°';
        
        // Aplicar rotación desde la identidad
        const rotationMatrix = applyRotate(I4(), rx, ry, rz);
        baseTransformMatrix = rotationMatrix;
        
        // Aplicar también la traslación actual
        const dx = parseFloat(translateX.value) || 0;
        const dy = parseFloat(translateY.value) || 0;
        const dz = parseFloat(translateZ.value) || 0;
        
        const translationMatrix = applyTranslate(I4(), dx, dy, dz);
        const newMacc = mul4(translationMatrix, baseTransformMatrix);
        const newState = updateTransform(currentState, newMacc);
        updateState(newState);
    };
    
    rotateX.addEventListener('input', updateRotation);
    rotateY.addEventListener('input', updateRotation);
    rotateZ.addEventListener('input', updateRotation);

    // Escalamiento
    applyScaleBtn.addEventListener('click', () => {
        const k = parseFloat(scaleValue.value) || 1;

        if (k === 1) return;

        const newMacc = applyScale(currentState.Macc, k);
        const newState = updateTransform(currentState, newMacc);
        updateState(newState);

        // Resetear valor
        scaleValue.value = '1';

        console.log(`Escalamiento aplicado: ${k}x`);
    });

    // Presets de escala
    scalePresets.forEach(preset => {
        preset.addEventListener('click', () => {
            const k = parseFloat(preset.dataset.scale);
            const newMacc = applyScale(currentState.Macc, k);
            const newState = updateTransform(currentState, newMacc);
            updateState(newState);

            console.log(`Escalamiento rápido aplicado: ${k}x`);
        });
    });

    // Reiniciar modelo (resetear transformaciones)
    resetModelBtn.addEventListener('click', () => {
        // Resetear sliders
        translateX.value = '0';
        translateY.value = '0';
        translateZ.value = '0';
        rotateX.value = '0';
        rotateY.value = '0';
        rotateZ.value = '0';
        
        // Actualizar valores mostrados
        translateXValue.textContent = '0.0';
        translateYValue.textContent = '0.0';
        translateZValue.textContent = '0.0';
        rotateXValue.textContent = '0°';
        rotateYValue.textContent = '0°';
        rotateZValue.textContent = '0°';
        
        // Resetear matriz base
        baseTransformMatrix = I4();
        
        const newState = updateTransform(currentState, I4());
        updateState(newState);
        console.log('Transformaciones reiniciadas');
    });

    // Auto-ajustar vista
    autoFitBtn.addEventListener('click', () => {
        const canvas = document.getElementById('view');
        const fitParams = calculateFitViewWithAxes(
            currentState.model,
            currentState.Macc,
            currentState.proj,
            canvas,
            currentState.flags.axes,
            0.1 // 10% de margen
        );

        const newState = updateView(currentState, fitParams);
        updateState(newState);
        console.log('Vista auto-ajustada');
    });

    // Ajustar a pantalla (fit-to-screen)
    const fitToScreenBtn = document.getElementById('fitToScreen');
    fitToScreenBtn.addEventListener('click', () => {
        const canvas = document.getElementById('view');
        
        // Calcular parámetros para ajustar completamente a la pantalla
        const fitParams = calculateFitViewWithAxes(
            currentState.model,
            currentState.Macc,
            currentState.proj,
            canvas,
            currentState.flags.axes,
            0.05 // 5% de margen más ajustado
        );

        // Si no hay modelo, ajustar solo los ejes
        if (currentState.model.length === 0) {
            fitParams.pan = { x: 0, y: 0 };
            fitParams.scale = Math.min(canvas.width, canvas.height) / 12; // Escala para ejes
        }

        const newState = updateView(currentState, fitParams);
        updateState(newState);
        console.log('Vista ajustada a pantalla');
        showSuccess('Vista ajustada a pantalla completa');
    });

    // === VISUALIZACIÓN ===
    const showAxes = document.getElementById('showAxes');
    const showPoints = document.getElementById('showPoints');

    showAxes.addEventListener('change', () => {
        const newState = updateFlags(currentState, {
            axes: showAxes.checked
        });
        updateState(newState);
    });

    showPoints.addEventListener('change', () => {
        const newState = updateFlags(currentState, {
            points: showPoints.checked
        });
        updateState(newState);
    });

    // === ATAJOS DE TECLADO ===
    document.addEventListener('keydown', (event) => {
        // Solo procesar si no estamos en un input
        if (event.target.tagName === 'INPUT' || event.target.tagName === 'SELECT') return;
        
        switch (event.key.toLowerCase()) {
            case 'r':
                if (event.ctrlKey) {
                    event.preventDefault();
                    resetModelBtn.click();
                }
                break;
            case 'f':
                if (event.ctrlKey) {
                    event.preventDefault();
                    autoFitBtn.click();
                }
                break;
            case '1':
                projectionSelect.value = 'iso';
                projectionSelect.dispatchEvent(new Event('change'));
                break;
            case '2':
                projectionSelect.value = 'oblique';
                projectionSelect.dispatchEvent(new Event('change'));
                break;
            case '3':
                projectionSelect.value = 'axono';
                projectionSelect.dispatchEvent(new Event('change'));
                break;
            case '4':
                projectionSelect.value = 'simple';
                projectionSelect.dispatchEvent(new Event('change'));
                break;
        }
    });

    // === INICIALIZACIÓN ===
    // Configurar valores iniciales de los controles
    projectionSelect.value = currentState.proj.type;
    obliquePhi.value = currentState.proj.phi;
    obliqueLambda.value = currentState.proj.lambda;
    axonoAlpha.value = currentState.proj.ax;
    axonoBeta.value = currentState.proj.ay;
    showAxes.checked = currentState.flags.axes;
    showPoints.checked = currentState.flags.points;
    
    updateProjectionParams();
    updateCanvasInfo();

    // Función para actualizar la referencia del estado desde el exterior
    const updateStateReference = (newState) => {
        currentState = newState;
        updateCanvasInfo();
    };

    return {
        updateStateReference
    };
}
