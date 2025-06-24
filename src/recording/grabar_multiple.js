const { 
  obtenerPreguntaAleatoria, 
  obtenerPreguntaPorTematica, 
  obtenerPreguntaIA,
  obtenerPreguntaIAPorTematica
} = require('../core/generar_pregunta');
const { exec } = require('child_process');
const path = require('path');

// Configuración para grabaciones múltiples
const CONFIGURACIONES = {
  // Grabar una pregunta de cada temática del banco
  todasTematicas: async () => {
    const tematicas = ['historia', 'cultura-general', 'deportes', 'musica', 'cine-television', 'naturaleza-geografia', 'famosos'];
    const urls = [];
    
    for (const tematica of tematicas) {
      const url = obtenerPreguntaPorTematica(tematica);
      if (url) {
        urls.push({
          url,
          nombre: `banco_${tematica}`,
          descripcion: `Pregunta de ${tematica} del banco`
        });
      }
    }
    
    return urls;
  },

  // Grabar preguntas generadas por IA (una de cada temática)
  todasTematicasIA: async () => {
    const tematicas = ['historia', 'cultura-general', 'deportes', 'musica', 'cine-television', 'naturaleza-geografia', 'famosos'];
    const urls = [];
    
    for (const tematica of tematicas) {
      console.log(`🤖 Generando pregunta IA de ${tematica}...`);
      const url = await obtenerPreguntaIAPorTematica(tematica);
      if (url) {
        urls.push({
          url,
          nombre: `ia_${tematica}`,
          descripcion: `Pregunta IA de ${tematica}`
        });
      }
      // Esperar un poco entre generaciones para no saturar la IA
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
    
    return urls;
  },

  // Grabar 5 preguntas aleatorias del banco
  cincoBanco: async () => {
    const urls = [];
    for (let i = 0; i < 5; i++) {
      const url = obtenerPreguntaAleatoria();
      urls.push({
        url,
        nombre: `banco_aleatoria_${i + 1}`,
        descripcion: `Pregunta aleatoria ${i + 1} del banco`
      });
    }
    return urls;
  },

  // Grabar 3 preguntas generadas por IA
  tresIA: async () => {
    const urls = [];
    for (let i = 0; i < 3; i++) {
      console.log(`🤖 Generando pregunta IA ${i + 1}/3...`);
      const url = await obtenerPreguntaIA();
      if (url) {
        urls.push({
          url,
          nombre: `ia_aleatoria_${i + 1}`,
          descripcion: `Pregunta IA aleatoria ${i + 1}`
        });
      }
      // Esperar entre generaciones
      await new Promise(resolve => setTimeout(resolve, 3000));
    }
    return urls;
  }
};

// Función para ejecutar grabación individual
function ejecutarGrabacion(url, nombreBase, descripcion) {
  return new Promise((resolve, reject) => {
    console.log(`\n🎬 Iniciando grabación: ${descripcion}`);
    
    // Crear script temporal para esta grabación
    const scriptContent = `
const puppeteer = require('puppeteer');
const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');

// Función para generar nombre de archivo único
function generarNombreUnico(nombreBase) {
  const ahora = new Date();
  const fecha = ahora.toISOString().slice(0, 10);
  const hora = ahora.toTimeString().slice(0, 8).replace(/:/g, '-');
  const timestamp = ahora.getTime();
  
  return \`trivial_\${nombreBase}_\${fecha}_\${hora}_\${timestamp}.mp4\`;
}

// Función para crear directorio de videos
function crearDirectorioVideos() {
  const dirVideos = path.join(__dirname, '..', '..', 'output', 'videos');
  if (!fs.existsSync(dirVideos)) {
    fs.mkdirSync(dirVideos);
  }
  return dirVideos;
}

(async () => {
  const dirVideos = crearDirectorioVideos();
  const nombreArchivo = generarNombreUnico('${nombreBase}');
  const rutaCompleta = path.join(dirVideos, nombreArchivo);

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
  await page.goto('${url}');

  const ffmpegCmd = \`ffmpeg -y -f gdigrab -framerate 30 -video_size 450x800 -i desktop -t 18 "\${rutaCompleta}"\`;
  const ffmpeg = exec(ffmpegCmd);

  await new Promise(resolve => setTimeout(resolve, 18000));
  
  ffmpeg.kill('SIGINT');
  await new Promise(resolve => setTimeout(resolve, 1000));
  await browser.close();
  
  console.log('✅ Grabación completada:', nombreArchivo);
})();
`;

    // Guardar script temporal
    const scriptPath = path.join(__dirname, `temp_grabacion_${Date.now()}.js`);
    require('fs').writeFileSync(scriptPath, scriptContent);

    // Ejecutar script
    const proceso = exec(`node "${scriptPath}"`, (error, stdout, stderr) => {
      // Limpiar archivo temporal
      try {
        require('fs').unlinkSync(scriptPath);
      } catch (e) {}

      if (error) {
        console.error(`❌ Error en grabación ${descripcion}:`, error);
        reject(error);
      } else {
        console.log(`✅ Completada: ${descripcion}`);
        resolve();
      }
    });

    proceso.stdout.on('data', (data) => {
      process.stdout.write(data);
    });

    proceso.stderr.on('data', (data) => {
      process.stderr.write(data);
    });
  });
}

// Función principal para grabaciones múltiples
async function grabarMultiple(configuracion) {
  console.log('🎬 GRABADOR MÚLTIPLE DE TRIVIAL 🎬\n');
  
  if (!CONFIGURACIONES[configuracion]) {
    console.error('❌ Configuración no válida. Opciones disponibles:');
    Object.keys(CONFIGURACIONES).forEach(key => {
      console.log(`   - ${key}`);
    });
    return;
  }

  console.log(`📋 Ejecutando configuración: ${configuracion}\n`);
  
  try {
    const grabaciones = await CONFIGURACIONES[configuracion]();
    
    console.log(`📊 Se grabarán ${grabaciones.length} videos:\n`);
    grabaciones.forEach((g, i) => {
      console.log(`${i + 1}. ${g.descripcion}`);
    });
    
    console.log('\n🚀 Iniciando grabaciones...\n');
    
    for (let i = 0; i < grabaciones.length; i++) {
      const grabacion = grabaciones[i];
      console.log(`\n📹 Grabación ${i + 1}/${grabaciones.length}`);
      
      try {
        await ejecutarGrabacion(grabacion.url, grabacion.nombre, grabacion.descripcion);
        
        // Esperar entre grabaciones para evitar conflictos
        if (i < grabaciones.length - 1) {
          console.log('⏳ Esperando 3 segundos antes de la siguiente grabación...');
          await new Promise(resolve => setTimeout(resolve, 3000));
        }
      } catch (error) {
        console.error(`❌ Error en grabación ${i + 1}:`, error.message);
      }
    }
    
    console.log('\n🎉 ¡Todas las grabaciones completadas!');
    console.log(`📁 Videos guardados en: ${path.join(__dirname, '..', '..', 'output', 'videos')}`);
    
  } catch (error) {
    console.error('❌ Error en el proceso de grabación múltiple:', error);
  }
}

// Obtener configuración desde argumentos de línea de comandos
const configuracion = process.argv[2];

if (!configuracion) {
  console.log('🎬 GRABADOR MÚLTIPLE DE TRIVIAL 🎬\n');
  console.log('Uso: node grabar_multiple.js <configuracion>\n');
  console.log('Configuraciones disponibles:');
  console.log('  todasTematicas     - Una pregunta del banco por cada temática (7 videos)');
  console.log('  todasTematicasIA   - Una pregunta IA por cada temática (7 videos)');
  console.log('  cincoBanco         - 5 preguntas aleatorias del banco');
  console.log('  tresIA             - 3 preguntas generadas por IA');
  console.log('\nEjemplo:');
  console.log('  node grabar_multiple.js todasTematicas');
} else {
  grabarMultiple(configuracion);
}

module.exports = { CONFIGURACIONES, grabarMultiple, ejecutarGrabacion };
