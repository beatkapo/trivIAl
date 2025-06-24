const puppeteer = require('puppeteer');
const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');
const { 
  obtenerPreguntaAleatoria, 
  obtenerPreguntaPorIndice, 
  obtenerPreguntaPorTematica, 
  crearPreguntaPersonalizada,
  obtenerPreguntaIA,
  obtenerPreguntaIAPorTematica
} = require('../core/generar_pregunta');

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
    defaultViewport: { width: 450, height: 800 },
    args: [
      '--window-size=450,800',
      '--window-position=100,100',
      '--kiosk',
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

  // Comando ffmpeg para grabar la región de la ventana
  const ffmpegCmd = `ffmpeg -y -f gdigrab -framerate 30 -video_size 450x800 -i desktop -t 18 "${rutaCompleta}"`;
  console.log('🎬 Iniciando grabación...');
  const ffmpeg = exec(ffmpegCmd);

  // Espera el tiempo de la animación (18 segundos)
  await new Promise(resolve => setTimeout(resolve, 18000));

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
  console.log(`📏 Resolución: 450x800`);
})(); 