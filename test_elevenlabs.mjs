import { listarVoces, generarAudioElevenLabs, generarAudioPregunta, extraerTextoPregunta } from './src/core/elevenlabs_audio.mjs';

console.log('🎤 PRUEBA DE ELEVENLABS 🎤\n');

async function probarElevenLabs() {
  try {
    // 1. Listar voces disponibles
    console.log('📋 Listando voces disponibles...');
    await listarVoces();
    console.log('');

    // 2. Generar audio de prueba
    const textoPrueba = "Hola, esta es una prueba de la integración con ElevenLabs para el juego de trivial.";
    console.log('🎯 Generando audio de prueba...');
    const archivoAudio = await generarAudioElevenLabs(textoPrueba, undefined, 'prueba_elevenlabs');
    console.log('');

    // 3. Ejemplo de URL de pregunta
    const urlEjemplo = "file://C:/Users/Fran/Documents/GitHub/trivIAl/src/ui/trivial.html?pregunta=%C2%BFCu%C3%A1l%20es%20la%20capital%20de%20Espa%C3%B1a%3F&opcion1=Madrid&opcion2=Barcelona&opcion3=Sevilla&correcta=1&tematica=geografia";
    
    console.log('📝 Extrayendo texto de URL de ejemplo...');
    const textoExtraido = extraerTextoPregunta(urlEjemplo);
    console.log('Texto extraído:', textoExtraido);
    
    if (textoExtraido) {
      console.log('🎯 Generando audio de la pregunta ejemplo...');
      const audioPregunta = await generarAudioPregunta(urlEjemplo);
      console.log('');
    }

    console.log('✅ ¡Prueba completada exitosamente!');
    console.log('📁 Revisa la carpeta output/audios para los archivos generados');

  } catch (error) {
    console.error('❌ Error en la prueba:', error);
    
    if (error.message.includes('401') || error.message.includes('unauthorized')) {
      console.log('💡 Necesitas configurar tu API key de ElevenLabs');
      console.log('1. Ve a https://elevenlabs.io/app/settings');
      console.log('2. Copia tu API key');
      console.log('3. Edita el archivo src/core/elevenlabs_audio.mjs y pon tu API key');
    }
  }
}

probarElevenLabs();
