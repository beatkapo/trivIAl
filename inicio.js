#!/usr/bin/env node
/**
 * Script principal para iniciar el sistema de trivial
 * Permite ejecutar diferentes funciones del sistema
 */

const path = require('path');
const { spawn } = require('child_process');

// Comandos disponibles
const COMANDOS = {
  'demo': {
    descripcion: 'Abrir el demo de categorías en el navegador',
    archivo: 'examples/demo_categorias.html',
    accion: 'abrir'
  },
  'generar': {
    descripcion: 'Generar pregunta aleatoria (requiere Node.js)',
    archivo: 'src/core/generar_pregunta.js',
    accion: 'ejecutar'
  },
  'generar-ia': {
    descripcion: 'Generar preguntas masivamente con IA',
    archivo: 'src/core/generar_preguntas_ia.js',
    accion: 'ejecutar'
  },
  'grabar': {
    descripcion: 'Grabar animación individual',
    archivo: 'src/recording/grabar_trivial.js',
    accion: 'ejecutar'
  },
  'grabar-multiple': {
    descripcion: 'Grabar múltiples animaciones',
    archivo: 'src/recording/grabar_multiple.js',
    accion: 'ejecutar'
  },
  'trivial': {
    descripcion: 'Abrir interfaz de trivial',
    archivo: 'src/ui/trivial.html',
    accion: 'abrir'
  }
};

function mostrarAyuda() {
  console.log('🎯 SISTEMA DE TRIVIAL - Comandos Disponibles\n');
  console.log('Uso: node inicio.js <comando> [argumentos]\n');
  
  console.log('📋 Comandos disponibles:');
  Object.entries(COMANDOS).forEach(([cmd, info]) => {
    console.log(`  ${cmd.padEnd(15)} - ${info.descripcion}`);
  });
  
  console.log('\n🎬 Ejemplos de uso:');
  console.log('  node inicio.js demo                    # Abrir demo');
  console.log('  node inicio.js generar                 # Generar pregunta');
  console.log('  node inicio.js grabar-multiple todasTematicas  # Grabar todas las temáticas');
  console.log('  node inicio.js trivial                 # Abrir interfaz');
  
  console.log('\n📁 Estructura del proyecto:');
  console.log('  src/core/        - Lógica principal (generación de preguntas)');
  console.log('  src/ui/          - Interfaz web (HTML)');
  console.log('  src/recording/   - Scripts de grabación');
  console.log('  data/            - Banco de preguntas (JSON)');
  console.log('  output/          - Videos generados');
  console.log('  examples/        - Ejemplos y demos');
  console.log('  docs/            - Documentación');
  console.log('  assets/          - Recursos (imágenes, etc.)');
}

function ejecutarComando(comando, args) {
  const info = COMANDOS[comando];
  if (!info) {
    console.error(`❌ Comando '${comando}' no encontrado.`);
    mostrarAyuda();
    return;
  }

  const rutaArchivo = path.join(__dirname, info.archivo);
  
  if (info.accion === 'ejecutar') {
    console.log(`🚀 Ejecutando: ${info.descripcion}`);
    
    const proceso = spawn('node', [rutaArchivo, ...args], {
      stdio: 'inherit',
      shell: true
    });
    
    proceso.on('error', (error) => {
      console.error(`❌ Error ejecutando comando: ${error.message}`);
    });
    
  } else if (info.accion === 'abrir') {
    console.log(`🌐 Abriendo: ${info.descripcion}`);
    console.log(`📁 Archivo: ${rutaArchivo}`);
    
    // En Windows, usar start para abrir archivos
    const comando = process.platform === 'win32' ? 'start' : 
                   process.platform === 'darwin' ? 'open' : 'xdg-open';
    
    const proceso = spawn(comando, [rutaArchivo], {
      shell: true,
      detached: true,
      stdio: 'ignore'
    });
    
    proceso.unref();
    console.log('✅ Archivo abierto en el navegador/aplicación predeterminada');
  }
}

// Procesar argumentos de línea de comandos
const comando = process.argv[2];
const args = process.argv.slice(3);

if (!comando || comando === 'help' || comando === '--help' || comando === '-h') {
  mostrarAyuda();
} else {
  ejecutarComando(comando, args);
}
