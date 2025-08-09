import puppeteer from 'puppeteer';
import { exec } from 'child_process';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { 
  obtenerPreguntaAleatoria, 
  obtenerPreguntaPorIndice, 
  obtenerPreguntaPorTematica, 
  crearPreguntaPersonalizada,
  obtenerPreguntaIA,
  obtenerPreguntaIAPorTematica
} from '../core/generar_pregunta.js';

// Importar la función de ElevenLabs
import { generarAudioPregunta } from '../core/elevenlabs_audio.mjs';

// Para obtener __dirname en ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Función para reproducir audio en Windows
function reproducirAudio(rutaArchivo) {
  return new Promise((resolve, reject) => {
    const comando = `powershell -c "(New-Object Media.SoundPlayer '${rutaArchivo}').PlaySync()"`;
    exec(comando, (error, stdout, stderr) => {
      if (error) {
        console.error('❌ Error reproduciendo audio:', error);
        reject(error);
      } else {
        console.log('🔊 Audio reproducido exitosamente');
        resolve();
      }
    });
  });
}

// Función para generar nombre de archivo único
function generarNombreUnico(tematica = 'general', tipo = 'banco') {
  const ahora = new Date();
  const fecha = ahora.toISOString().slice(0, 10); // YYYY-MM-DD
  const hora = ahora.toTimeString().slice(0, 8).replace(/:/g, '-'); // HH-MM-SS
  const timestamp = ahora.getTime(); // timestamp único
  
  // Limpiar nombre de temática para usar en archivo
  const tematicaLimpia = tematica.replace(/[^a-zA-Z0-9]/g, '-');
  
  return `trivial_${tematicaLimpia}_${tipo}_${fecha}_${hora}_${timestamp}.mp4`;
}

// Función para extraer temática de la URL
function extraerTematicaDeURL(url) {
  try {
    const urlObj = new URL(url);
    return urlObj.searchParams.get('tematica') || 'general';
  } catch (error) {
    return 'general';
  }
}

// Función para crear directorio de videos si no existe
function crearDirectorioVideos() {
  const dirVideos = path.join(__dirname, '..', '..', 'output', 'videos');
  if (!fs.existsSync(dirVideos)) {
    fs.mkdirSync(dirVideos);
    console.log('📁 Directorio "videos" creado');
  }
  return dirVideos;
}

(async () => {
  console.log('🎬 GRABADOR DE TRIVIAL CON NOMBRES ÚNICOS 🎬\n');
  
  // Crear directorio de videos
  const dirVideos = crearDirectorioVideos();
  
  // Lanza el navegador en modo no headless para que ffmpeg pueda grabar la ventana
  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: { width: 810, height: 1440 },
    args: [
      '--window-size=810,1440',
      '--window-position=100,100',
      '--kiosk',
      '--force-device-scale-factor=1',
      '--disable-infobars',
      '--disable-extensions',
      '--disable-plugins',
      '--disable-web-security',
      '--disable-features=VizDisplayCompositor',
      '--no-first-run',
      '--disable-default-apps'
    ]
  });
  const page = await browser.newPage();

  // Variables para el nombre del archivo
  let url;
  let tipoFuente = 'banco'; // 'banco', 'ia' o 'personalizada'
  
  // ===== OPCIONES CLÁSICAS (banco existente) =====
  
  // Opción 1: Pregunta aleatoria (cualquier temática del banco)
  // url = obtenerPreguntaAleatoria();
  // tipoFuente = 'banco';
  
  // Opción 2: Pregunta específica por índice (descomenta para usar)
  // url = obtenerPreguntaPorIndice(0);
  // tipoFuente = 'banco';
  
  // Opción 3: Pregunta por temática específica del banco (descomenta para usar)
  // url = obtenerPreguntaPorTematica('historia');        // Historia
  // url = obtenerPreguntaPorTematica('cultura-general'); // Cultura General
  // url = obtenerPreguntaPorTematica('deportes');        // Deportes
  // url = obtenerPreguntaPorTematica('musica');          // Música
  // url = obtenerPreguntaPorTematica('cine-television'); // Cine y Televisión
  // url = obtenerPreguntaPorTematica('naturaleza-geografia'); // Naturaleza y Geografía
  // url = obtenerPreguntaPorTematica('famosos');         // Famosos
  // tipoFuente = 'banco';
  
  // ===== OPCIONES CON IA (requiere Mistral en localhost:1234) =====
  
  // Opción 4: Pregunta generada por IA (cualquier temática)
  console.log('🤖 Generando pregunta con IA...');
  url = await obtenerPreguntaIA();
  tipoFuente = 'ia';
  
  // Opción 5: Pregunta IA de temática específica (descomenta para usar)
  // console.log('🤖 Generando pregunta IA de deportes...');
  // url = await obtenerPreguntaIAPorTematica('deportes');
  // tipoFuente = 'ia';
  
  // ===== OPCIÓN PERSONALIZADA =====
  
  // Opción 6: Pregunta personalizada con temática (descomenta para usar)
  // url = crearPreguntaPersonalizada(
  //   "¿Cuál es el metal más abundante en la corteza terrestre?",
  //   "Hierro",
  //   "Aluminio", 
  //   "Cobre",
  //   2,
  //   "naturaleza-geografia"
  // );
  // tipoFuente = 'personalizada';

  if (!url) {
    console.error('❌ No se pudo generar la URL de la pregunta. Usando pregunta por defecto...');
    url = obtenerPreguntaAleatoria();
    tipoFuente = 'banco-fallback';
  }

  // Extraer temática de la URL
  const tematica = extraerTematicaDeURL(url);
  
  // Generar nombre único para el archivo
  const nombreArchivo = generarNombreUnico(tematica, tipoFuente);
  const rutaCompleta = path.join(dirVideos, nombreArchivo);

  console.log('📝 Pregunta seleccionada:', url);
  console.log('🎯 Temática:', tematica);
  console.log('📦 Fuente:', tipoFuente);
  console.log('💾 Archivo de video:', nombreArchivo);
  console.log('📁 Ruta completa:', rutaCompleta);
  console.log('');
  
  // Abre el archivo con los parámetros
  await page.goto(url);

  // Generar audio de la pregunta ANTES de empezar la grabación
  console.log('🎤 Generando audio de la pregunta...');
  let rutaAudio;
  try {
    rutaAudio = await generarAudioPregunta(url);
    console.log('✅ Audio generado:', rutaAudio);
  } catch (error) {
    console.error('❌ Error generando audio:', error);
    console.log('⚠️ Continuando sin audio...');
  }

  // Comando ffmpeg para grabar la región de la ventana CON AUDIO
  // Volviendo a Mezcla estéreo con técnicas avanzadas de sincronización
  const ffmpegCmd = `ffmpeg -y -f gdigrab -framerate 30 -video_size 810x1400 -use_wallclock_as_timestamps 1 -i desktop -f dshow -audio_buffer_size 50 -i audio="Mezcla estéreo (Realtek(R) Audio)" -c:v libx264 -c:a aac -b:a 128k -ac 2 -ar 44100 -map 0:0 -map 1:0 -async 1 -t 18 "${rutaCompleta}"`;
  console.log('🎬 Iniciando grabación con audio del sistema...');
  console.log('📍 Comando:', ffmpegCmd);
  console.log('💡 Capturando audio de Mezcla estéreo con buffer optimizado');
  const ffmpeg = exec(ffmpegCmd, (error, stdout, stderr) => {
    if (error) {
      console.error('❌ Error en ffmpeg:', error);
    }
    if (stderr) {
      console.log('⚠️ Stderr:', stderr);
    }
    if (stdout) {
      console.log('📝 Stdout:', stdout);
    }
  });

  // Esperar un momento para que la grabación se establezca
  await new Promise(resolve => setTimeout(resolve, 1000));

  // Reproducir el audio de la pregunta durante la grabación
  if (rutaAudio && fs.existsSync(rutaAudio)) {
    console.log('🔊 Reproduciendo audio de la pregunta...');
    try {
      // Reproducir audio de forma asíncrona para no bloquear la grabación
      reproducirAudio(rutaAudio).catch(err => {
        console.error('⚠️ Error en reproducción de audio:', err);
      });
    } catch (error) {
      console.error('⚠️ Error iniciando reproducción:', error);
    }
  }

  // Espera el tiempo restante de la animación (17 segundos más)
  await new Promise(resolve => setTimeout(resolve, 17000));

  // Detén la grabación
  ffmpeg.kill('SIGINT');
  console.log('✅ Grabación finalizada!');
  console.log('🎥 Video guardado como:', nombreArchivo);
  console.log('📍 Ubicación:', rutaCompleta);
  await new Promise(resolve => setTimeout(resolve, 1000));
  await browser.close();
  
  // Mostrar resumen final
  console.log('\n📊 RESUMEN DE GRABACIÓN:');
  console.log('========================');
  console.log(`📁 Directorio: ${dirVideos}`);
  console.log(`🎥 Archivo: ${nombreArchivo}`);
  console.log(`🎯 Temática: ${tematica}`);
  console.log(`📦 Fuente: ${tipoFuente}`);
  console.log(`⏱️  Duración: 18 segundos`);
  console.log(`📏 Resolución: 810x1440`);
})(); 