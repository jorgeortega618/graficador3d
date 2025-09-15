/**
 * Graficador 3D - Parser de Archivos
 * Parseo de archivos .txt/.xyz con coordenadas 3D
 */

/**
 * Parsea el contenido de un archivo de texto con coordenadas 3D
 * Formato esperado: cada línea contiene "x y z" o "x,y,z"
 * @param {string} content - Contenido del archivo
 * @returns {Object} Resultado del parseo { success: boolean, points: Array, error?: string }
 */
export function parsePoints(content) {
    try {
        const lines = content.split('\n');
        const points = [];
        const errors = [];

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();
            
            // Ignorar líneas vacías y comentarios
            if (line === '' || line.startsWith('#') || line.startsWith('//')) {
                continue;
            }

            // Separar por espacios en blanco o comas
            const parts = line.split(/[\s,]+/).filter(part => part !== '');
            
            if (parts.length !== 3) {
                errors.push(`Línea ${i + 1}: Se esperan 3 coordenadas, encontradas ${parts.length}`);
                continue;
            }

            // Convertir a números
            const coords = [];
            let validLine = true;
            
            for (let j = 0; j < 3; j++) {
                const num = parseFloat(parts[j]);
                if (isNaN(num)) {
                    errors.push(`Línea ${i + 1}: "${parts[j]}" no es un número válido`);
                    validLine = false;
                    break;
                }
                coords.push(num);
            }

            if (validLine) {
                points.push(coords);
            }
        }

        // Si hay errores pero también puntos válidos, mostrar advertencia
        if (errors.length > 0 && points.length > 0) {
            console.warn('Errores durante el parseo:', errors);
            return {
                success: true,
                points,
                warnings: errors
            };
        }

        // Si solo hay errores, fallar
        if (errors.length > 0 && points.length === 0) {
            return {
                success: false,
                points: [],
                error: `No se pudieron parsear puntos válidos. Errores: ${errors.join(', ')}`
            };
        }

        // Éxito completo
        return {
            success: true,
            points
        };

    } catch (error) {
        return {
            success: false,
            points: [],
            error: `Error inesperado durante el parseo: ${error.message}`
        };
    }
}

/**
 * Lee un archivo y parsea su contenido
 * @param {File} file - Archivo a leer
 * @returns {Promise<Object>} Promesa que resuelve con el resultado del parseo
 */
export function parseFile(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        
        reader.onload = (event) => {
            const content = event.target.result;
            const result = parsePoints(content);
            resolve(result);
        };
        
        reader.onerror = () => {
            reject(new Error('Error al leer el archivo'));
        };
        
        reader.readAsText(file);
    });
}

/**
 * Valida que un archivo tenga una extensión válida
 * @param {File} file - Archivo a validar
 * @returns {boolean} True si la extensión es válida
 */
export function isValidFileType(file) {
    const validExtensions = ['.txt', '.xyz'];
    const fileName = file.name.toLowerCase();
    return validExtensions.some(ext => fileName.endsWith(ext));
}
