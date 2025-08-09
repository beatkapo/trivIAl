import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Tu API key de ElevenLabs
const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY || 'YOUR_ELEVENLABS_API_KEY_HERE'; // Configura tu API key en variable de entorno

// Voces disponibles en español
const VOCES_ESPANOL = {
  // Voces predefinidas (cambia estos IDs por los de tu cuenta)
  masculina: 'tEMiC7LbpKm1kc0l4WmM',   // ID de ejemplo
  femenina: 'h3l1RP4XfcWsPwoRp9G6',   // ID de ejemplo
  // Puedes añadir más voces aquí
};

/**
 * Lista las voces disponibles en tu cuenta de ElevenLabs
 */
export async function listarVoces() {
  try {
    const response = await fetch('https://api.elevenlabs.io/v1/voices', {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'xi-api-key': ELEVENLABS_API_KEY
      }
    });

    if (!response.ok) {
      throw new Error(`Error HTTP: ${response.status}`);
    }

    const data = await response.json();
    console.log('🗣️ Voces disponibles:');
    data.voices.forEach(voice => {
      console.log(`- ${voice.name}: ${voice.voice_id} (${voice.category || 'N/A'})`);
    });
    return data.voices;
  } catch (error) {
    console.error('❌ Error listando voces:', error);
    return [];
  }
}

/**
 * Genera audio a partir de texto usando ElevenLabs
 * @param {string} texto - El texto a convertir en audio
 * @param {string} vozId - ID de la voz a usar
 * @param {string} nombreArchivo - Nombre del archivo de salida (sin extensión)
 * @returns {Promise<string>} - Ruta del archivo de audio generado
 */
export async function generarAudioElevenLabs(texto, vozId = VOCES_ESPANOL.masculina, nombreArchivo = 'pregunta') {
  try {
    console.log('🎤 Generando audio con ElevenLabs...');
    console.log('📝 Texto:', texto);
    console.log('🗣️ Voz ID:', vozId);

    // Generar audio usando la API REST de ElevenLabs
    const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${vozId}`, {
      method: 'POST',
      headers: {
        'Accept': 'audio/mpeg',
        'Content-Type': 'application/json',
        'xi-api-key': ELEVENLABS_API_KEY
      },
      body: JSON.stringify({
        text: texto,
        model_id: 'eleven_multilingual_v2', // Modelo multilingüe
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.8,
          style: 0.2,
          use_speaker_boost: true
        }
      })
    });

    if (!response.ok) {
      throw new Error(`Error HTTP: ${response.status} - ${response.statusText}`);
    }

    // Crear directorio de audio si no existe
    const dirAudio = path.join(__dirname, '..', '..', 'output', 'audios');
    if (!fs.existsSync(dirAudio)) {
      fs.mkdirSync(dirAudio, { recursive: true });
      console.log('📁 Directorio "audios" creado');
    }

    // Guardar archivo
    const rutaArchivo = path.join(dirAudio, `${nombreArchivo}.mp3`);
    
    // Convertir la respuesta a buffer y guardar
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    fs.writeFileSync(rutaArchivo, buffer);

    console.log('✅ Audio generado exitosamente');
    console.log('📍 Archivo guardado en:', rutaArchivo);
    
    return rutaArchivo;

  } catch (error) {
    console.error('❌ Error generando audio:', error);
    throw error;
  }
}

/**
 * Extrae el texto de la pregunta desde una URL
 * @param {string} url - URL de la pregunta
 * @returns {string} - Texto limpio de la pregunta
 */
export function extraerTextoPregunta(url) {
  try {
    const urlObj = new URL(url);
    const pregunta = decodeURIComponent(urlObj.searchParams.get('pregunta') || '');
    
    // Limpiar caracteres especiales para que sea más natural al hablar
    return pregunta
      .replace(/¿/g, '') // Quitar signos de interrogación de apertura
      .replace(/\?/g, '') // Quitar signos de interrogación de cierre
      .replace(/&/g, ' y ')
      .replace(/%20/g, ' ')
      .trim();
      
  } catch (error) {
    console.error('❌ Error extrayendo texto de pregunta:', error);
    return '';
  }
}

/**
 * Genera audio de la pregunta desde una URL
 * @param {string} url - URL de la pregunta
 * @param {string} vozId - ID de la voz (opcional)
 * @returns {Promise<string>} - Ruta del archivo de audio generado
 */
export async function generarAudioPregunta(url, vozId = VOCES_ESPANOL.masculina) {
  const textoPregunta = extraerTextoPregunta(url);
  
  if (!textoPregunta) {
    throw new Error('No se pudo extraer el texto de la pregunta');
  }

  console.log('📝 Texto extraído de la pregunta:', textoPregunta);

  // Generar nombre único para el archivo
  const timestamp = Date.now();
  const nombreArchivo = `pregunta_${timestamp}`;
  
  return await generarAudioElevenLabs(textoPregunta, vozId, nombreArchivo);
}

export { VOCES_ESPANOL };
