import puppeteer from 'puppeteer';
import { exec } from 'child_process';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

// Importar la función de ElevenLabs
import { generarAudioPregunta } from '../core/elevenlabs_audio.mjs';

// Para obtener __dirname en ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Función para cargar banco de preguntas
function cargarBancoPreguntas() {
  try {
    const rutaBanco = path.join(__dirname, '..', '..', 'data', 'preguntas_banco.json');
    const contenido = fs.readFileSync(rutaBanco, 'utf8');
    return JSON.parse(contenido);
  } catch (error) {
    console.error('Error cargando banco de preguntas:', error);
    return [];
  }
}

// Función para guardar nueva pregunta en el banco
function guardarPreguntaEnBanco(preguntaData) {
  try {
    const rutaBanco = path.join(__dirname, '..', '..', 'data', 'preguntas_banco.json');
    const bancoActual = cargarBancoPreguntas();
    
    // Añadir la nueva pregunta
    const nuevaPregunta = {
      pregunta: preguntaData.pregunta,
      opciones: preguntaData.opciones,
      correcta: preguntaData.correcta,
      tematica: preguntaData.tematica
    };
    
    bancoActual.push(nuevaPregunta);
    
    // Guardar el banco actualizado
    fs.writeFileSync(rutaBanco, JSON.stringify(bancoActual, null, 2), 'utf8');
    console.log(`💾 Pregunta añadida al banco. Total: ${bancoActual.length} preguntas`);
    
    return true;
  } catch (error) {
    console.error('❌ Error guardando pregunta en banco:', error);
    return false;
  }
}

// Función para verificar si una pregunta ya existe en el banco o es muy similar
function preguntaExisteEnBanco(preguntaNueva, bancoPreguntas) {
  // Verificar coincidencia exacta
  const preguntaNormalizada = preguntaNueva.toLowerCase().trim();
  const coincidenciaExacta = bancoPreguntas.some(p => 
    p.pregunta.toLowerCase().trim() === preguntaNormalizada
  );
  
  if (coincidenciaExacta) {
    console.log('❌ Pregunta exacta ya existe en el banco');
    return true;
  }
  
  // Verificar similitud con cada pregunta del banco usando función avanzada
  for (const preguntaExistente of bancoPreguntas) {
    if (esSimilar(preguntaNueva, preguntaExistente.pregunta)) {
      console.log(`❌ Pregunta muy similar encontrada: "${preguntaExistente.pregunta}"`);
      return true;
    }
  }
  
  return false;
}

// Función avanzada para detectar similitud semántica entre preguntas
function esSimilar(pregunta1, pregunta2, umbral = 0.7) {
  // Normalizar texto para comparar
  const normalize = (texto) => {
    return texto.toLowerCase()
      .replace(/[áàäâ]/g, 'a')
      .replace(/[éèëê]/g, 'e')
      .replace(/[íìïî]/g, 'i')
      .replace(/[óòöô]/g, 'o')
      .replace(/[úùüû]/g, 'u')
      .replace(/[ñ]/g, 'n')
      .replace(/[¿?¡!]/g, '')
      .replace(/[^\w\s]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  };

  const p1 = normalize(pregunta1);
  const p2 = normalize(pregunta2);

  // Si son idénticas después de normalizar
  if (p1 === p2) return true;

  // Extraer palabras clave (sin palabras comunes)
  const stopWords = ['el', 'la', 'los', 'las', 'un', 'una', 'de', 'del', 'en', 'es', 'que', 'cual', 'quien', 'donde', 'como', 'cuando', 'por', 'para', 'con', 'se', 'su', 'sus', 'te', 'le', 'lo', 'me', 'mi', 'tu', 'si', 'no', 'y', 'o', 'pero', 'sin', 'hasta', 'desde'];
  
  const extractKeywords = (texto) => {
    return texto.split(' ').filter(word => 
      word.length > 3 && !stopWords.includes(word)
    );
  };

  const keywords1 = extractKeywords(p1);
  const keywords2 = extractKeywords(p2);

  // Calcular similitud de palabras clave
  const intersection = keywords1.filter(word => keywords2.includes(word));
  const union = [...new Set([...keywords1, ...keywords2])];
  const keywordSimilarity = union.length > 0 ? intersection.length / union.length : 0;

  return keywordSimilarity >= umbral;
}

// Función para generar pregunta con IA con validación de unicidad
async function generarPreguntaIA() {
  const bancoPreguntas = cargarBancoPreguntas();
  
  console.log(`📚 Banco de preguntas cargado: ${bancoPreguntas.length} preguntas existentes`);
  
  let intento = 1;
  
  while (true) {
    try {
      console.log(`🤖 Intento ${intento} - Generando pregunta nueva...`);
      
      const response = await fetch('http://localhost:1234/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: "local-model",
          messages: [
            {
              role: "system",
              content: "Eres un experto en crear preguntas de trivial. Debes generar una pregunta ÚNICA Y ORIGINAL con exactamente 3 opciones de respuesta. IMPORTANTE: Responde ÚNICAMENTE con el formato JSON especificado, sin texto adicional."
            },
            {
              role: "user", 
              content: `Genera una pregunta de trivial NUEVA y ORIGINAL. 

IMPORTANTE: 
- La pregunta y TODAS las opciones deben estar en ESPAÑOL
- No uses palabras en inglés (excepto nombres propios verificables)
- DEBES usar SOLO una de estas temáticas: historia, cultura-general, deportes, musica, cine-television, naturaleza-geografia, famosos, ciencia
- ASEGÚRATE de que la respuesta correcta sea 100% correcta y verificable

Formato de respuesta JSON EXACTO (sin texto adicional):
{
  "pregunta": "texto de la pregunta",
  "opciones": ["opción 1", "opción 2", "opción 3"],
  "correcta": número (1, 2 o 3),
  "tematica": "una palabra clave de la temática"
}`
            }
          ],
          temperature: 0.9,
          max_tokens: 200
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const contenido = data.choices[0].message.content.trim();
      
      // Extraer JSON del contenido
      let jsonMatch = contenido.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        console.log(`⚠️ Intento ${intento}: No se encontró JSON válido en la respuesta`);
        continue;
      }
      
      const preguntaData = JSON.parse(jsonMatch[0]);
      
      // Validar estructura
      if (!preguntaData.pregunta || !preguntaData.opciones || !preguntaData.correcta || !preguntaData.tematica) {
        console.log(`⚠️ Intento ${intento}: Estructura JSON inválida`);
        continue;
      }
      
      // Validar que la temática sea una de las válidas del Trivial
      const tematicasValidas = ['historia', 'cultura-general', 'deportes', 'musica', 'cine-television', 'naturaleza-geografia', 'famosos', 'ciencia'];
      if (!tematicasValidas.includes(preguntaData.tematica)) {
        console.log(`⚠️ Intento ${intento}: Temática inválida "${preguntaData.tematica}". Debe ser una de: ${tematicasValidas.join(', ')}`);
        continue;
      }
      
      // Validar que todas las opciones estén en español (no contengan palabras comunes en inglés, pero permitir nombres propios)
      const palabrasIngles = /\b(the|and|or|of|in|on|at|to|for|with|by|from|up|about|into|through|during|before|after|above|below|between|among|against|within|without|across|around|under|over|shark|whale|blue|white|black|red|green|yellow|orange|purple|pink|brown|gray|grey|good|bad|new|old|high|low|hot|cold|left|right|top|bottom|first|last|best|worst|young|happy|sad)\b/i;
      const tieneIngles = preguntaData.opciones.some(opcion => palabrasIngles.test(opcion));
      
      if (tieneIngles) {
        console.log(`⚠️ Intento ${intento}: Detectadas palabras en inglés en las opciones:`, preguntaData.opciones);
        intento++;
        await new Promise(resolve => setTimeout(resolve, Math.min(1000 + intento * 500, 10000)));
        continue;
      }

      // Verificar si la pregunta ya existe en el banco
      if (preguntaExisteEnBanco(preguntaData.pregunta, bancoPreguntas)) {
        console.log(`⚠️ Intento ${intento}: Pregunta "${preguntaData.pregunta}" ya existe en el banco. Reintentando...`);
        intento++;
        await new Promise(resolve => setTimeout(resolve, Math.min(1000 + intento * 500, 10000)));
        continue;
      }

      // Si llegamos aquí, la pregunta es nueva y única
      console.log(`✅ ¡Pregunta única generada en el intento ${intento}!`);
      console.log(`📝 Pregunta: ${preguntaData.pregunta}`);
      console.log(`🎯 Temática: ${preguntaData.tematica}`);
      
      // Guardar la nueva pregunta en el banco
      guardarPreguntaEnBanco(preguntaData);

      // Construir URL
      const baseUrl = "file://" + path.join(__dirname, '..', 'ui', 'trivial.html');
      const params = new URLSearchParams({
        pregunta: preguntaData.pregunta,
        opcion1: preguntaData.opciones[0],
        opcion2: preguntaData.opciones[1], 
        opcion3: preguntaData.opciones[2],
        correcta: preguntaData.correcta.toString(),
        tematica: preguntaData.tematica
      });
      
      return `${baseUrl}?${params.toString()}`;
      
    } catch (error) {
      console.error(`❌ Intento ${intento}: Error generando pregunta:`, error.message);
      
      // Delay progresivo: 2s inicialmente, luego aumenta gradualmente hasta máximo 10s
      const delay = Math.min(2000 + (intento - 1) * 500, 10000);
      console.log(`⏳ Esperando ${delay / 1000} segundos antes del siguiente intento...`);
      await new Promise(resolve => setTimeout(resolve, delay));
      
      intento++;
    }
  }
}

// Función para reproducir audio en Windows
function reproducirAudio(rutaArchivo) {
  return new Promise((resolve, reject) => {
    // Usar PowerShell con Add-Type para reproducir MP3
    const comando = `powershell -c "Add-Type -AssemblyName presentationCore; $mediaPlayer = New-Object System.Windows.Media.MediaPlayer; $mediaPlayer.Open('${rutaArchivo}'); $mediaPlayer.Play(); Start-Sleep -Seconds 5"`;
    exec(comando, (error, stdout, stderr) => {
      if (error) {
        console.error('❌ Error reproduciendo audio:', error);
        // No rechazar, solo mostrar el error y continuar
        resolve();
      } else {
        console.log('🔊 Audio reproducido exitosamente');
        resolve();
      }
    });
  });
}

// Función para generar nombre de archivo único
function generarNombreUnico(tematica = 'general', tipo = 'ia') {
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
    fs.mkdirSync(dirVideos, { recursive: true });
    console.log('📁 Directorio "videos" creado');
  }
  return dirVideos;
}

(async () => {
  console.log('🎬 GRABADOR DE TRIVIAL CON AUDIO DE ELEVENLABS 🎬\n');
  
  // Crear directorio de videos
  const dirVideos = crearDirectorioVideos();
  
  // Variables para el nombre del archivo
  let url;
  let tipoFuente = 'ia'; // 'banco', 'ia' o 'personalizada'
  
  // Generar pregunta con IA (con validación de unicidad automática)
  console.log('🤖 Generando pregunta nueva con IA...');
  try {
    url = await generarPreguntaIA();
    tipoFuente = 'ia';
    console.log('✅ Pregunta IA generada exitosamente');
  } catch (error) {
    console.error('❌ Error generando pregunta IA:', error);
    console.log('🔄 Usando pregunta de respaldo...');
    // Pregunta de respaldo
    url = "file://" + path.join(__dirname, '..', 'ui', 'trivial.html') + 
          "?pregunta=¿Cuál%20es%20la%20capital%20de%20España?&opcion1=Madrid&opcion2=Barcelona&opcion3=Sevilla&correcta=1&tematica=geografia";
    tipoFuente = 'respaldo';
  }

  if (!url) {
    console.error('❌ No se pudo generar la URL de la pregunta. Terminando...');
    process.exit(1);
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

  // Generar audio de la pregunta ANTES de abrir la página
  console.log('🎤 Generando audio de la pregunta...');
  let rutaAudio;
  try {
    rutaAudio = await generarAudioPregunta(url);
    console.log('✅ Audio generado:', rutaAudio);
  } catch (error) {
    console.error('❌ Error generando audio:', error);
    console.log('⚠️ Continuando sin audio...');
  }

  // Lanza el navegador en modo no headless para que ffmpeg pueda grabar la ventana
  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: { width: 810, height: 1440 },
    args: [
      '--window-size=810,1440',
      '--window-position=0,0',
      '--disable-infobars',
      '--disable-extensions',
      '--disable-plugins',
      '--disable-web-security',
      '--disable-features=VizDisplayCompositor',
      '--no-first-run',
      '--disable-default-apps',
      // HABILITAR AUDIO EN EL NAVEGADOR
      '--autoplay-policy=no-user-gesture-required',
      '--enable-audio',
      '--enable-audio-service-sandbox=false',
      '--allow-running-insecure-content',
      '--disable-background-timer-throttling',
      '--disable-renderer-backgrounding',
      '--no-sandbox',
      // PANTALLA COMPLETA SIN KIOSKO (para evitar cortes)
      '--start-fullscreen',
      '--disable-web-security',
      '--high-dpi-support=0',
      '--force-device-scale-factor=1'
    ]
  });
  const page = await browser.newPage();

  // Habilitar audio en la página específicamente
  await page.evaluateOnNewDocument(() => {
    // Sobrescribir configuración de audio
    Object.defineProperty(navigator, 'userActivation', {
      get: () => ({ hasBeenActive: true, isActive: true })
    });
  });

  // Conceder permisos válidos
  const context = browser.defaultBrowserContext();
  await context.overridePermissions('file://', ['microphone']);
  
  // Abre el archivo con los parámetros
  await page.goto(url, { waitUntil: 'networkidle0' });

  // Esperar un momento adicional para que se inicialice JavaScript
  await new Promise(resolve => setTimeout(resolve, 500));

  // Comando ffmpeg para grabar la región de la ventana CON AUDIO
  const ffmpegCmd = `ffmpeg -y -f gdigrab -framerate 30 -video_size 810x1440 -use_wallclock_as_timestamps 1 -i desktop -f dshow -audio_buffer_size 50 -i audio="Mezcla estéreo (Realtek(R) Audio)" -c:v libx264 -c:a aac -b:a 128k -ac 2 -ar 44100 -map 0:0 -map 1:0 -async 1 -t 18 "${rutaCompleta}"`;
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

  // SIMULAR CLICK EN RESPUESTA CORRECTA DESPUÉS DE 15 SEGUNDOS (para que llegue a 0)
  console.log('⏱️ Esperando 15 segundos antes de simular click en respuesta correcta...');
  await new Promise(resolve => setTimeout(resolve, 15000));
  
  try {
    // Hacer click en la respuesta correcta
    console.log('�️ Simulando click en la respuesta correcta...');
    await page.evaluate(() => {
      const opciones = document.querySelectorAll('.option');
      const opcionesArray = Array.from(opciones);
      
      // Buscar la opción correcta por datos o por posición
      const urlParams = new URLSearchParams(window.location.search);
      const correctaIndex = parseInt(urlParams.get('correcta')) - 1; // -1 porque es base 1
      
      if (opcionesArray[correctaIndex]) {
        opcionesArray[correctaIndex].click();
        console.log('✅ Click simulado en opción:', correctaIndex + 1);
        return true;
      }
      return false;
    });
    
    // Esperar a que se aplique la clase 'correct'
    console.log('👁️ Esperando a que se revele la respuesta correcta...');
    await page.waitForFunction(() => {
      const opciones = document.querySelectorAll('.option');
      return Array.from(opciones).some(opcion => 
        opcion.classList.contains('correct')
      );
    }, { timeout: 5000 });

    console.log('🎯 ¡Respuesta correcta revelada! Reproduciendo correct.mp3...');
    
    // Reproducir correct.mp3 desde el sistema
    const rutaCorrect = path.join(__dirname, '..', '..', 'output', 'audios', 'correct.mp3');
    if (fs.existsSync(rutaCorrect)) {
      try {
        await reproducirAudio(rutaCorrect);
        console.log('🔊 Sonido correct.mp3 reproducido exitosamente');
      } catch (error) {
        console.error('❌ Error reproduciendo correct.mp3:', error);
      }
    } else {
      console.error('❌ Archivo correct.mp3 no encontrado en:', rutaCorrect);
    }
  } catch (error) {
    console.log('⚠️ Error simulando click o detectando respuesta:', error.message);
    console.log('📝 Continuando con la grabación...');
  }

  // Esperar un poco más para que termine la animación
  await new Promise(resolve => setTimeout(resolve, 3000));

  // Detén la grabación
  console.log('🛑 Deteniendo grabación...');
  ffmpeg.kill('SIGINT');
  console.log('✅ Grabación finalizada!');
  console.log('🎥 Video guardado como:', nombreArchivo);
  console.log('📍 Ubicación:', rutaCompleta);
  
  // Cerrar navegador
  await new Promise(resolve => setTimeout(resolve, 1000));
  console.log('🔄 Cerrando navegador...');
  await browser.close();
  console.log('✅ Navegador cerrado exitosamente');
  
  // Mostrar resumen final
  console.log('\n📊 RESUMEN DE GRABACIÓN:');
  console.log('========================');
  console.log(`📁 Directorio: ${dirVideos}`);
  console.log(`🎥 Archivo: ${nombreArchivo}`);
  console.log(`🎯 Temática: ${tematica}`);
  console.log(`📦 Fuente: ${tipoFuente}`);
  console.log(`⏱️  Duración: 18 segundos`);
  console.log(`📏 Resolución: 810x1440`);
  console.log('🎉 ¡Proceso completado exitosamente!');
})().catch(error => {
  console.error('❌ Error general en el proceso:', error);
  console.log('🔄 Intentando cerrar navegador si está abierto...');
  
  // Intentar cerrar el navegador en caso de error
  if (typeof browser !== 'undefined' && browser) {
    browser.close().catch(e => console.log('⚠️ Error cerrando navegador:', e.message));
  }
  
  process.exit(1);
});