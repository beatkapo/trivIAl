const { generarPreguntaConIA, guardarPreguntas, preguntas } = require('./generar_pregunta');

// Script para generar múltiples preguntas con IA
async function generarPreguntasMasivamente(cantidad = 5) {
    console.log(`Generando ${cantidad} preguntas con IA...`);
    console.log('Asegúrate de que Mistral esté ejecutándose en localhost:1234\n');

    const preguntasGeneradas = [];
    
    for (let i = 0; i < cantidad; i++) {
        console.log(`Generando pregunta ${i + 1}/${cantidad}...`);
        
        try {
            const nuevaPregunta = await generarPreguntaConIA();
            
            if (nuevaPregunta) {
                preguntasGeneradas.push(nuevaPregunta);
                console.log(`✅ Pregunta ${i + 1} generada: ${nuevaPregunta.pregunta}`);
                console.log(`   Temática: ${nuevaPregunta.tematica}`);
            } else {
                console.log(`❌ Error generando pregunta ${i + 1}`);
            }
        } catch (error) {
            console.error(`❌ Error en pregunta ${i + 1}:`, error.message);
        }
        
        // Pausa entre peticiones para no saturar la API
        if (i < cantidad - 1) {
            console.log('Esperando 2 segundos...\n');
            await new Promise(resolve => setTimeout(resolve, 2000));
        }
    }

    console.log(`\n=== RESUMEN ===`);
    console.log(`Preguntas generadas exitosamente: ${preguntasGeneradas.length}/${cantidad}`);
    console.log(`Total de preguntas en banco: ${preguntas.length}`);
    
    if (preguntasGeneradas.length > 0) {
        console.log('\n=== PREGUNTAS GENERADAS ===');
        preguntasGeneradas.forEach((p, index) => {
            console.log(`\n${index + 1}. ${p.pregunta}`);
            console.log(`   Temática: ${p.tematica}`);
            console.log(`   Opciones: ${p.opciones.join(' | ')}`);
            console.log(`   Correcta: ${p.opciones[p.correcta - 1]}`);
        });
    }
}

// Script para generar preguntas por temática específica
async function generarPreguntasPorTematica(tematica, cantidad = 3) {
    console.log(`Generando ${cantidad} preguntas de temática: ${tematica}`);
    
    const tematicasValidas = [
        'historia', 'cultura-general', 'deportes', 'musica', 
        'cine-television', 'naturaleza-geografia', 'famosos'
    ];
    
    if (!tematicasValidas.includes(tematica)) {
        console.error(`Temática inválida. Usa una de: ${tematicasValidas.join(', ')}`);
        return;
    }

    let preguntasGeneradas = 0;
    let intentos = 0;
    const maxIntentos = cantidad * 3; // Máximo 3 intentos por pregunta deseada

    while (preguntasGeneradas < cantidad && intentos < maxIntentos) {
        intentos++;
        console.log(`Intento ${intentos}...`);
        
        try {
            const nuevaPregunta = await generarPreguntaConIA();
            
            if (nuevaPregunta && nuevaPregunta.tematica === tematica) {
                preguntasGeneradas++;
                console.log(`✅ Pregunta ${preguntasGeneradas} de ${tematica}: ${nuevaPregunta.pregunta}`);
            } else if (nuevaPregunta) {
                console.log(`⚠️ Pregunta generada pero de temática diferente: ${nuevaPregunta.tematica}`);
            } else {
                console.log(`❌ Error generando pregunta`);
            }
        } catch (error) {
            console.error(`❌ Error:`, error.message);
        }
        
        // Pausa entre peticiones
        if (intentos < maxIntentos) {
            await new Promise(resolve => setTimeout(resolve, 2000));
        }
    }

    console.log(`\nCompletado: ${preguntasGeneradas}/${cantidad} preguntas de ${tematica} generadas`);
}

// Ejecutar según argumentos de línea de comandos
if (require.main === module) {
    const args = process.argv.slice(2);
    
    if (args.length === 0) {
        // Sin argumentos: generar 5 preguntas aleatorias
        generarPreguntasMasivamente(5);
    } else if (args[0] === '--cantidad' && args[1]) {
        // --cantidad N: generar N preguntas aleatorias
        const cantidad = parseInt(args[1]);
        if (cantidad > 0) {
            generarPreguntasMasivamente(cantidad);
        } else {
            console.error('La cantidad debe ser un número positivo');
        }
    } else if (args[0] === '--tematica' && args[1]) {
        // --tematica TEMA [cantidad]: generar preguntas de una temática
        const tematica = args[1];
        const cantidad = args[2] ? parseInt(args[2]) : 3;
        generarPreguntasPorTematica(tematica, cantidad);
    } else {
        console.log('Uso:');
        console.log('  node generar_preguntas_ia.js                    # Generar 5 preguntas aleatorias');
        console.log('  node generar_preguntas_ia.js --cantidad 10      # Generar 10 preguntas aleatorias');
        console.log('  node generar_preguntas_ia.js --tematica historia 5  # Generar 5 preguntas de historia');
        console.log('');
        console.log('Temáticas disponibles: historia, cultura-general, deportes, musica, cine-television, naturaleza-geografia, famosos');
    }
}

module.exports = {
    generarPreguntasMasivamente,
    generarPreguntasPorTematica
};
