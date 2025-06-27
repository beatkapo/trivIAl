const path = require('path');
const fs = require('fs');

// Función para consultar el modelo Mistral
async function consultarMistral(prompt) {
    try {
        const response = await fetch('http://localhost:1234/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: "openhermes-2.5-mistral-7b",
                messages: [
                    {
                        role: "user",
                        content: prompt
                    }
                ],
                temperature: 0.7,
                max_tokens: 500
            })
        });

        if (!response.ok) {
            throw new Error(`Error HTTP: ${response.status}`);
        }

        const data = await response.json();
        return data.choices[0].message.content;
    } catch (error) {
        console.error('Error consultando Mistral:', error);
        return null;
    }
}

// Función para verificar si una pregunta ya existe o es similar
function esPreguntaSimilar(nuevaPregunta) {
    // Normalizar texto para comparación (minúsculas, sin acentos, sin signos de puntuación)
    function normalizar(texto) {
        return texto.toLowerCase()
            .normalize("NFD").replace(/[\u0300-\u036f]/g, "") // Quitar acentos
            .replace(/[^\w\s]/g, "") // Quitar signos de puntuación
            .replace(/\s+/g, " ") // Normalizar espacios
            .trim();
    }
    
    const preguntaNormalizada = normalizar(nuevaPregunta.pregunta);
    
    for (const preguntaExistente of preguntas) {
        const existenteNormalizada = normalizar(preguntaExistente.pregunta);
        
        // Verificar si es exactamente la misma pregunta
        if (preguntaNormalizada === existenteNormalizada) {
            return true;
        }
        
        // Verificar similitud por palabras clave (al menos 70% de coincidencia)
        const palabrasNueva = preguntaNormalizada.split(" ").filter(p => p.length > 3);
        const palabrasExistente = existenteNormalizada.split(" ").filter(p => p.length > 3);
        
        if (palabrasNueva.length > 0 && palabrasExistente.length > 0) {
            const coincidencias = palabrasNueva.filter(palabra => 
                palabrasExistente.some(pe => pe.includes(palabra) || palabra.includes(pe))
            ).length;
            
            const porcentajeSimilitud = coincidencias / Math.max(palabrasNueva.length, palabrasExistente.length);
            
            if (porcentajeSimilitud >= 0.7) {
                return true;
            }
        }
        
        // Verificar si las opciones son muy similares
        const opcionesNueva = nuevaPregunta.opciones.map(normalizar);
        const opcionesExistente = preguntaExistente.opciones.map(normalizar);
        
        let opcionesSimilares = 0;
        for (const opcionNueva of opcionesNueva) {
            for (const opcionExistente of opcionesExistente) {
                if (opcionNueva === opcionExistente || 
                    (opcionNueva.length > 3 && opcionExistente.includes(opcionNueva)) ||
                    (opcionExistente.length > 3 && opcionNueva.includes(opcionExistente))) {
                    opcionesSimilares++;
                    break;
                }
            }
        }
        
        // Si 2 o más opciones son similares, considerar pregunta similar
        if (opcionesSimilares >= 2) {
            return true;
        }
    }
    
    return false;
}

// Función para generar pregunta con IA
async function generarPreguntaConIA() {
    const maxIntentos = 5; // Máximo número de intentos para generar una pregunta única
    
    for (let intento = 1; intento <= maxIntentos; intento++) {
        try {
            console.log(`Intento ${intento} de generar pregunta única...`);
            
            const prompt = `Genera una pregunta original y única de los siguientes temas: historia, cultura general, deportes, música, cine y televisión, naturaleza y geografía y famosos.

Devuelve en formato JSON con esta estructura exacta:
{
  "pregunta": "texto de la pregunta",
  "opciones": ["opción 1", "opción 2", "opción 3"],
  "correcta": 1,
  "tematica": "nombre-de-la-tematica"
}

IMPORTANTE:
- "correcta" debe ser 1, 2 o 3 (indicando cuál opción es correcta)
- "tematica" debe ser uno de estos valores exactos: "historia", "cultura-general", "deportes", "musica", "cine-television", "naturaleza-geografia", "famosos"
- La pregunta debe ser completamente original y diferente a cualquier pregunta existente
- Solo devuelve el JSON, sin texto adicional
- Intento número: ${intento}`;

            const respuesta = await consultarMistral(prompt);
            
            if (!respuesta) {
                console.log(`Intento ${intento}: No se recibió respuesta del modelo`);
                continue;
            }

            // Intentar parsear la respuesta JSON
            let nuevaPregunta;
            try {
                // Limpiar la respuesta para extraer solo el JSON
                const jsonMatch = respuesta.match(/\{[\s\S]*\}/);
                if (!jsonMatch) {
                    console.log(`Intento ${intento}: No se encontró JSON válido en la respuesta`);
                    continue;
                }
                
                nuevaPregunta = JSON.parse(jsonMatch[0]);
            } catch (parseError) {
                console.error(`Intento ${intento}: Error parseando JSON:`, parseError);
                console.error('Respuesta recibida:', respuesta);
                continue;
            }

            // Validar la estructura
            if (!nuevaPregunta.pregunta || !nuevaPregunta.opciones || 
                !nuevaPregunta.correcta || !nuevaPregunta.tematica ||
                nuevaPregunta.opciones.length !== 3) {
                console.log(`Intento ${intento}: Estructura de pregunta inválida`);
                continue;
            }

            // Verificar si la pregunta ya existe o es similar
            if (esPreguntaSimilar(nuevaPregunta)) {
                console.log(`Intento ${intento}: Pregunta similar ya existe, generando otra...`);
                continue;
            }

            // Si llegamos aquí, la pregunta es única
            console.log(`¡Pregunta única generada en el intento ${intento}!`);
            
            // Agregar la nueva pregunta al banco
            preguntas.push(nuevaPregunta);

            // Guardar las preguntas actualizadas en un archivo
            guardarPreguntas();

            console.log('Nueva pregunta generada:', nuevaPregunta);
            return nuevaPregunta;

        } catch (error) {
            console.error(`Intento ${intento}: Error generando pregunta con IA:`, error);
        }
    }
    
    // Si llegamos aquí, no se pudo generar una pregunta única después de todos los intentos
    console.error(`No se pudo generar una pregunta única después de ${maxIntentos} intentos`);
    return null;
}

// Función para guardar preguntas en archivo JSON
function guardarPreguntas() {
    try {
        const rutaArchivo = path.join(__dirname, '..', '..', 'data', 'preguntas_banco.json');
        fs.writeFileSync(rutaArchivo, JSON.stringify(preguntas, null, 2), 'utf8');
        console.log(`Preguntas guardadas en: ${rutaArchivo}`);
    } catch (error) {
        console.error('Error guardando preguntas:', error);
    }
}

// Función para cargar preguntas desde archivo JSON
function cargarPreguntas() {
    try {
        const rutaArchivo = path.join(__dirname, '..', '..', 'data', 'preguntas_banco.json');
        if (fs.existsSync(rutaArchivo)) {
            const data = fs.readFileSync(rutaArchivo, 'utf8');
            const preguntasCargadas = JSON.parse(data);
            preguntas.length = 0; // Limpiar array actual
            preguntas.push(...preguntasCargadas); // Agregar preguntas cargadas
            console.log(`Cargadas ${preguntas.length} preguntas desde archivo`);
        }
    } catch (error) {
        console.error('Error cargando preguntas:', error);
    }
}

// Función para generar URL con parámetros
function generarURL(pregunta, opcion1, opcion2, opcion3, correcta, tematica = null) {
    const baseURL = 'file://' + path.join(__dirname, '..', 'ui', 'trivial.html');
    const params = new URLSearchParams({
        pregunta: encodeURIComponent(pregunta),
        opcion1: encodeURIComponent(opcion1),
        opcion2: encodeURIComponent(opcion2),
        opcion3: encodeURIComponent(opcion3),
        correcta: correcta.toString()
    });
    
    if (tematica) {
        params.set('tematica', tematica);
    }
    
    return `${baseURL}?${params.toString()}`;
}

// Banco de preguntas predefinidas organizadas por temática
const preguntas = [
    {
        pregunta: "¿En qué año cayó el Muro de Berlín?",
        opciones: ["1987", "1989", "1991"],
        correcta: 2,
        tematica: "historia"
    },
    {
        pregunta: "¿Quién fue el primer emperador romano?",
        opciones: ["Julio César", "Augusto", "Nerón"],
        correcta: 2,
        tematica: "historia"
    },
    {
        pregunta: "¿Cuál es la capital de Australia?",
        opciones: ["Sídney", "Melbourne", "Canberra"],
        correcta: 3,
        tematica: "cultura-general"
    },
    {
        pregunta: "¿Cuántos continentes hay en el mundo?",
        opciones: ["5", "6", "7"],
        correcta: 3,
        tematica: "cultura-general"
    },
    {
        pregunta: "¿En qué deporte se usa el término 'slam dunk'?",
        opciones: ["Voleibol", "Baloncesto", "Tenis"],
        correcta: 2,
        tematica: "deportes"
    },
    {
        pregunta: "¿Cada cuántos años se celebran los Juegos Olímpicos?",
        opciones: ["2 años", "4 años", "6 años"],
        correcta: 2,
        tematica: "deportes"
    },
    {
        pregunta: "¿Quién compuso 'La Novena Sinfonía'?",
        opciones: ["Mozart", "Beethoven", "Bach"],
        correcta: 2,
        tematica: "musica"
    },
    {
        pregunta: "¿Cuántas cuerdas tiene una guitarra estándar?",
        opciones: ["4", "6", "8"],
        correcta: 2,
        tematica: "musica"
    },
    {
        pregunta: "¿Quién dirigió la película 'Titanic'?",
        opciones: ["Steven Spielberg", "James Cameron", "Martin Scorsese"],
        correcta: 2,
        tematica: "cine-television"
    },
    {
        pregunta: "¿En qué año se estrenó la primera película de Star Wars?",
        opciones: ["1975", "1977", "1979"],
        correcta: 2,
        tematica: "cine-television"
    },
    {
        pregunta: "¿Cuál es el río más largo del mundo?",
        opciones: ["Nilo", "Amazonas", "Yangtsé"],
        correcta: 1,
        tematica: "naturaleza-geografia"
    },
    {
        pregunta: "¿Cuál es el desierto más grande del mundo?",
        opciones: ["Sahara", "Gobi", "Antártida"],
        correcta: 3,
        tematica: "naturaleza-geografia"
    },
    {
        pregunta: "¿Quién es conocido como 'El Rey del Pop'?",
        opciones: ["Elvis Presley", "Michael Jackson", "Prince"],
        correcta: 2,
        tematica: "famosos"
    },
    {
        pregunta: "¿Cuál es el nombre real de Lady Gaga?",
        opciones: ["Stefani Germanotta", "Christina Aguilera", "Britney Spears"],
        correcta: 1,
        tematica: "famosos"
    }
];

// Función para seleccionar una pregunta aleatoria
function obtenerPreguntaAleatoria() {
    const index = Math.floor(Math.random() * preguntas.length);
    const pregunta = preguntas[index];
    
    return generarURL(
        pregunta.pregunta,
        pregunta.opciones[0],
        pregunta.opciones[1],
        pregunta.opciones[2],
        pregunta.correcta,
        pregunta.tematica
    );
}

// Función para usar una pregunta específica por índice
function obtenerPreguntaPorIndice(index) {
    if (index >= 0 && index < preguntas.length) {
        const pregunta = preguntas[index];
        return generarURL(
            pregunta.pregunta,
            pregunta.opciones[0],
            pregunta.opciones[1],
            pregunta.opciones[2],
            pregunta.correcta,
            pregunta.tematica
        );
    }
    return null;
}

// Función para obtener pregunta aleatoria de una temática específica
function obtenerPreguntaPorTematica(tematica) {
    const preguntasTematica = preguntas.filter(p => p.tematica === tematica);
    if (preguntasTematica.length === 0) return null;
    
    const index = Math.floor(Math.random() * preguntasTematica.length);
    const pregunta = preguntasTematica[index];
    
    return generarURL(
        pregunta.pregunta,
        pregunta.opciones[0],
        pregunta.opciones[1],
        pregunta.opciones[2],
        pregunta.correcta,
        pregunta.tematica
    );
}

// Función para agregar una nueva pregunta personalizada
function crearPreguntaPersonalizada(pregunta, opcion1, opcion2, opcion3, correcta, tematica = null) {
    return generarURL(pregunta, opcion1, opcion2, opcion3, correcta, tematica);
}

// Función para obtener pregunta generada por IA
async function obtenerPreguntaIA() {
    const nuevaPregunta = await generarPreguntaConIA();
    if (nuevaPregunta) {
        return generarURL(
            nuevaPregunta.pregunta,
            nuevaPregunta.opciones[0],
            nuevaPregunta.opciones[1],
            nuevaPregunta.opciones[2],
            nuevaPregunta.correcta,
            nuevaPregunta.tematica
        );
    }
    return null;
}

// Función para obtener pregunta IA de temática específica
async function obtenerPreguntaIAPorTematica(tematica) {
    const maxIntentos = 5; // Máximo número de intentos para generar una pregunta única de la temática específica
    
    for (let intento = 1; intento <= maxIntentos; intento++) {
        console.log(`Intento ${intento} de generar pregunta única de temática ${tematica}...`);
        
        const prompt = `Genera una pregunta original y única específicamente sobre el tema: ${tematica}.

Devuelve en formato JSON con esta estructura exacta:
{
  "pregunta": "texto de la pregunta",
  "opciones": ["opción 1", "opción 2", "opción 3"],
  "correcta": 1,
  "tematica": "${tematica}"
}

IMPORTANTE:
- "correcta" debe ser 1, 2 o 3 (indicando cuál opción es correcta)
- "tematica" debe ser exactamente: "${tematica}"
- La pregunta debe ser completamente original y diferente a cualquier pregunta existente
- Solo devuelve el JSON, sin texto adicional
- Intento número: ${intento}`;

        try {
            const respuesta = await consultarMistral(prompt);
            
            if (!respuesta) {
                console.log(`Intento ${intento}: No se recibió respuesta del modelo`);
                continue;
            }

            // Intentar parsear la respuesta JSON
            let nuevaPregunta;
            try {
                const jsonMatch = respuesta.match(/\{[\s\S]*\}/);
                if (!jsonMatch) {
                    console.log(`Intento ${intento}: No se encontró JSON válido en la respuesta`);
                    continue;
                }
                
                nuevaPregunta = JSON.parse(jsonMatch[0]);
            } catch (parseError) {
                console.error(`Intento ${intento}: Error parseando JSON:`, parseError);
                continue;
            }

            // Validar la estructura y temática
            if (!nuevaPregunta.pregunta || !nuevaPregunta.opciones || 
                !nuevaPregunta.correcta || !nuevaPregunta.tematica ||
                nuevaPregunta.opciones.length !== 3 || nuevaPregunta.tematica !== tematica) {
                console.log(`Intento ${intento}: Estructura inválida o temática incorrecta`);
                continue;
            }

            // Verificar si la pregunta ya existe o es similar
            if (esPreguntaSimilar(nuevaPregunta)) {
                console.log(`Intento ${intento}: Pregunta similar ya existe, generando otra...`);
                continue;
            }

            // Si llegamos aquí, la pregunta es única y de la temática correcta
            console.log(`¡Pregunta única de ${tematica} generada en el intento ${intento}!`);
            
            // Agregar la nueva pregunta al banco
            preguntas.push(nuevaPregunta);
            guardarPreguntas();
            
            return generarURL(
                nuevaPregunta.pregunta,
                nuevaPregunta.opciones[0],
                nuevaPregunta.opciones[1],
                nuevaPregunta.opciones[2],
                nuevaPregunta.correcta,
                nuevaPregunta.tematica
            );
            
        } catch (error) {
            console.error(`Intento ${intento}: Error generando pregunta:`, error);
        }
    }
    
    // Si no se consigue, usar una pregunta existente de esa temática
    console.log(`No se pudo generar pregunta única de ${tematica} después de ${maxIntentos} intentos, usando pregunta existente`);
    return obtenerPreguntaPorTematica(tematica);
}

// Cargar preguntas al inicializar el módulo
cargarPreguntas();

module.exports = {
    generarURL,
    obtenerPreguntaAleatoria,
    obtenerPreguntaPorIndice,
    obtenerPreguntaPorTematica,
    crearPreguntaPersonalizada,
    obtenerPreguntaIA,
    obtenerPreguntaIAPorTematica,
    generarPreguntaConIA,
    guardarPreguntas,
    cargarPreguntas,
    preguntas
};

// Si se ejecuta directamente, muestra ejemplos
if (require.main === module) {
    (async () => {
        console.log('=== GENERADOR DE PREGUNTAS TRIVIAL CON IA ===\n');
        
        console.log('1. Pregunta aleatoria (banco existente):');
        console.log(obtenerPreguntaAleatoria());
        console.log('');
        
        console.log('2. Pregunta específica (índice 0):');
        console.log(obtenerPreguntaPorIndice(0));
        console.log('');
        
        console.log('3. Pregunta de temática específica (historia):');
        console.log(obtenerPreguntaPorTematica('historia'));
        console.log('');
        
        console.log('4. Generando pregunta con IA...');
        const preguntaIA = await obtenerPreguntaIA();
        if (preguntaIA) {
            console.log('Pregunta generada por IA:', preguntaIA);
        } else {
            console.log('No se pudo generar pregunta con IA');
        }
        console.log('');
        
        console.log('5. Generando pregunta IA de temática específica (deportes)...');
        const preguntaIATematica = await obtenerPreguntaIAPorTematica('deportes');
        if (preguntaIATematica) {
            console.log('Pregunta IA de deportes:', preguntaIATematica);
        } else {
            console.log('No se pudo generar pregunta IA de deportes');
        }
        console.log('');
        
        console.log('6. Pregunta personalizada con temática:');
        console.log(crearPreguntaPersonalizada(
            "¿Cuál es el metal más abundante en la corteza terrestre?",
            "Hierro",
            "Aluminio", 
            "Cobre",
            2,
            "naturaleza-geografia"
        ));
        console.log('');
        
        console.log('7. Temáticas disponibles:');
        const tematicas = [...new Set(preguntas.map(p => p.tematica))];
        tematicas.forEach(t => console.log(`   - ${t}`));
        console.log('');
        
        console.log('8. Preguntas por temática:');
        tematicas.forEach(tematica => {
            const count = preguntas.filter(p => p.tematica === tematica).length;
            console.log(`   ${tematica}: ${count} preguntas`);
        });
        
        console.log(`\n9. Total de preguntas en banco: ${preguntas.length}`);
        console.log('10. Las preguntas se guardan automáticamente en: preguntas_banco.json');
    })();
}
