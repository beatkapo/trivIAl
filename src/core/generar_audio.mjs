import { Client } from "@gradio/client";
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const refText = "En el primer programa de Futuroimperfecto de esta nueva etapa, de este nuevo proyecto, en un arranque que me dio tipo charla Ted, dije: El humor es más fuerte que el odio. Y bueno, gustó mucho eso, no?. Y los programas también, estamos muy contentos, de verdad, la aceptación maravillosa. Muchísimas gracias. Pero la semana pasada, ante el escándalo de corrupción del PSOE, el tsunami informativo de aquella tarde noche, acaparó la atención de la mayoría de la gente, que yo pensé: A ver, Andreu, si el humor es más fuerte que el odio, sí vale. Pero la corrupción lo contamina todo, incluso el propio humor, que ha pasado aquí. Solución, digo: Júntalo todo."


const genText = "Agarrame de las pelotas. Esto es una prueba de texto para generar un audio con la voz de Andreu Buenafuente. Vamos a ver cómo suena."; 
const response_0 = await fetch("https://github.com/beatkapo/trivIAl/blob/main/examples/audio_sample.wav");
const exampleAudio = await response_0.blob();
						
const client = await Client.connect("jpgallegoar/Spanish-F5");
const result = await client.predict("/infer", { 
				ref_audio_orig: exampleAudio, 		
		ref_text: refText, 		
		gen_text: genText, 		
		model: "F5-TTS",
		remove_silence: true, 		
		cross_fade_duration: 0, 		
		speed: 0.3, 
});

console.log(result.data);

// Descargar y guardar el archivo de audio
if (result.data && result.data.length > 0) {
    try {
        // Obtener la URL del archivo de audio generado
        const audioUrl = result.data[0].url || result.data[0];
        
        // Crear nombre de archivo con timestamp
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const filename = `audio_generado_${timestamp}.wav`;
        
        // Ruta de destino
        const outputDir = path.join(__dirname, '..', '..', 'output', 'audios');
        const outputPath = path.join(outputDir, filename);
        
        // Asegurar que el directorio existe
        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
        }
        
        // Descargar el archivo
        const audioResponse = await fetch(audioUrl);
        if (!audioResponse.ok) {
            throw new Error(`Error al descargar audio: ${audioResponse.status}`);
        }
        
        // Obtener el buffer del audio
        const audioBuffer = await audioResponse.arrayBuffer();
        
        // Guardar el archivo
        fs.writeFileSync(outputPath, Buffer.from(audioBuffer));
        
        console.log(`Audio guardado exitosamente en: ${outputPath}`);
        
    } catch (error) {
        console.error('Error al descargar y guardar el audio:', error);
    }
} else {
    console.error('No se recibió datos de audio válidos');
}
