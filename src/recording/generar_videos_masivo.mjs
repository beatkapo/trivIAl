import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Obtener número de videos desde argumentos de línea de comandos
const numeroVideos = parseInt(process.argv[2]) || 10;
const delayEntreVideos = parseInt(process.argv[3]) || 0; // Sin delay por defecto

console.log('🎬 GENERADOR MASIVO DE VIDEOS DE TRIVIAL 🎬');
console.log('===========================================');
console.log(`📊 Videos a generar: ${numeroVideos}`);
console.log(`⏱️  Delay entre videos: ${delayEntreVideos}ms`);
console.log(`🤖 Usando LLM de LMStudio para generar preguntas`);
console.log('');

let videosGenerados = 0;
let errores = 0;
const tiempoInicio = Date.now();

// Función para ejecutar un video
function generarVideo(numeroVideo) {
  return new Promise((resolve, reject) => {
    console.log(`\n🎯 [${numeroVideo}/${numeroVideos}] Iniciando generación de video ${numeroVideo}...`);
    
    const proceso = spawn('npm', ['run', 'grabar-con-audio'], {
      stdio: 'pipe',
      shell: true,
      cwd: path.join(__dirname, '..', '..')
    });

    let salida = '';
    let error = '';

    proceso.stdout.on('data', (data) => {
      const texto = data.toString();
      salida += texto;
      
      // Mostrar logs importantes
      if (texto.includes('🎤 Generando audio') || 
          texto.includes('✅ Audio generado') ||
          texto.includes('🎬 Iniciando grabación') ||
          texto.includes('✅ Respuesta detectada') ||
          texto.includes('✅ Grabación finalizada')) {
        console.log(`   [${numeroVideo}] ${texto.trim()}`);
      }
    });

    proceso.stderr.on('data', (data) => {
      error += data.toString();
    });

    proceso.on('close', (code) => {
      if (code === 0) {
        console.log(`✅ [${numeroVideo}/${numeroVideos}] Video ${numeroVideo} generado exitosamente`);
        videosGenerados++;
        resolve();
      } else {
        console.error(`❌ [${numeroVideo}/${numeroVideos}] Error generando video ${numeroVideo} (código: ${code})`);
        if (error) {
          console.error(`   Error: ${error.slice(0, 200)}...`);
        }
        errores++;
        reject(new Error(`Error en video ${numeroVideo}`));
      }
    });

    // Timeout de 60 segundos por video
    setTimeout(() => {
      proceso.kill();
      console.error(`⏰ [${numeroVideo}/${numeroVideos}] Timeout en video ${numeroVideo}`);
      errores++;
      reject(new Error(`Timeout en video ${numeroVideo}`));
    }, 60000);
  });
}

// Función para generar videos secuencialmente
async function generarVideosSecuencial() {
  for (let i = 1; i <= numeroVideos; i++) {
    try {
      await generarVideo(i);
      
      // Delay entre videos (excepto el último)
      if (i < numeroVideos) {
        console.log(`⏳ Esperando ${delayEntreVideos}ms antes del siguiente video...`);
        await new Promise(resolve => setTimeout(resolve, delayEntreVideos));
      }
    } catch (error) {
      console.error(`❌ Error en video ${i}:`, error.message);
      
      // Continuar con el siguiente video después de un error
      if (i < numeroVideos) {
        console.log(`🔄 Continuando con el siguiente video...`);
        await new Promise(resolve => setTimeout(resolve, delayEntreVideos));
      }
    }
  }
}

// Iniciar la generación
(async () => {
  try {
    console.log(`🚀 Iniciando generación de ${numeroVideos} videos...`);
    console.log(`📍 Cada video tardará aproximadamente 25-30 segundos`);
    console.log(`⏱️  Tiempo estimado total: ${Math.ceil((numeroVideos * 30 + (numeroVideos - 1) * delayEntreVideos / 1000) / 60)} minutos`);
    console.log('');

    await generarVideosSecuencial();

    const tiempoTotal = Math.round((Date.now() - tiempoInicio) / 1000);
    const tiempoMinutos = Math.floor(tiempoTotal / 60);
    const tiempoSegundos = tiempoTotal % 60;

    console.log('\n🏁 PROCESO COMPLETADO');
    console.log('=====================');
    console.log(`✅ Videos generados exitosamente: ${videosGenerados}`);
    console.log(`❌ Errores: ${errores}`);
    console.log(`⏱️  Tiempo total: ${tiempoMinutos}m ${tiempoSegundos}s`);
    console.log(`📊 Ratio de éxito: ${Math.round((videosGenerados / numeroVideos) * 100)}%`);
    console.log('\n📁 Videos guardados en: output/videos/');
    console.log('🎉 ¡Generación masiva completada!');

  } catch (error) {
    console.error('❌ Error fatal en la generación masiva:', error);
    process.exit(1);
  }
})();
