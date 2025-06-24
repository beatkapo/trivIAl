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
                model: "mistral",
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

// Función para generar pregunta con IA
async function generarPreguntaConIA() {
    try {
        // Crear el prompt con las preguntas existentes
        const preguntasExistentes = JSON.stringify(preguntas, null, 2);
        
        const prompt = `Genera una pregunta aleatoria de los siguientes temas: historia, cultura general, deportes, música, cine y televisión, naturaleza y geografía y famosos.

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
- Solo devuelve el JSON, sin texto adicional

No uses las siguientes preguntas, pero puedes basarte en ellas:
${preguntasExistentes}`;

        const respuesta = await consultarMistral(prompt);
        
        if (!respuesta) {
            throw new Error('No se recibió respuesta del modelo');
        }

        // Intentar parsear la respuesta JSON
        let nuevaPregunta;
        try {
            // Limpiar la respuesta para extraer solo el JSON
            const jsonMatch = respuesta.match(/\{[\s\S]*\}/);
            if (!jsonMatch) {
                throw new Error('No se encontró JSON válido en la respuesta');
            }
            
            nuevaPregunta = JSON.parse(jsonMatch[0]);
        } catch (parseError) {
            console.error('Error parseando JSON:', parseError);
            console.error('Respuesta recibida:', respuesta);
            return null;
        }

        // Validar la estructura
        if (!nuevaPregunta.pregunta || !nuevaPregunta.opciones || 
            !nuevaPregunta.correcta || !nuevaPregunta.tematica ||
            nuevaPregunta.opciones.length !== 3) {
            throw new Error('Estructura de pregunta inválida');
        }

        // Agregar la nueva pregunta al banco
        preguntas.push(nuevaPregunta);

        // Guardar las preguntas actualizadas en un archivo
        guardarPreguntas();

        console.log('Nueva pregunta generada:', nuevaPregunta);
        return nuevaPregunta;

    } catch (error) {
        console.error('Error generando pregunta con IA:', error);
        return null;
    }
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
    // Generar varias preguntas hasta conseguir una de la temática deseada
    for (let intento = 0; intento < 3; intento++) {
        const nuevaPregunta = await generarPreguntaConIA();
        if (nuevaPregunta && nuevaPregunta.tematica === tematica) {
            return generarURL(
                nuevaPregunta.pregunta,
                nuevaPregunta.opciones[0],
                nuevaPregunta.opciones[1],
                nuevaPregunta.opciones[2],
                nuevaPregunta.correcta,
                nuevaPregunta.tematica
            );
        }
    }
    
    // Si no se consigue, usar una pregunta existente de esa temática
    console.log(`No se pudo generar pregunta IA de ${tematica}, usando pregunta existente`);
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
