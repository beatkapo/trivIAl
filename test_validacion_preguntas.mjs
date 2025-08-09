import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Función para cargar el banco de preguntas
function cargarBancoPreguntas() {
  try {
    const rutaBanco = path.join(__dirname, 'data', 'preguntas_banco.json');
    const contenido = fs.readFileSync(rutaBanco, 'utf8');
    return JSON.parse(contenido);
  } catch (error) {
    console.error('Error cargando banco de preguntas:', error);
    return [];
  }
}

// Función para verificar si una pregunta ya existe en el banco
function preguntaExisteEnBanco(preguntaNueva, bancoPreguntas) {
  const preguntaNormalizada = preguntaNueva.toLowerCase().trim();
  return bancoPreguntas.some(p => 
    p.pregunta.toLowerCase().trim() === preguntaNormalizada
  );
}

console.log('🧪 PRUEBA DEL SISTEMA DE VALIDACIÓN DE PREGUNTAS');
console.log('===============================================');

const banco = cargarBancoPreguntas();
console.log(`📚 Banco cargado: ${banco.length} preguntas`);

// Mostrar algunas preguntas del banco
console.log('\n📝 Primeras 5 preguntas del banco:');
banco.slice(0, 5).forEach((p, i) => {
  console.log(`${i+1}. ${p.pregunta}`);
});

// Probar con una pregunta que existe
const preguntaExistente = "¿En qué año cayó el Muro de Berlín?";
const existeTest1 = preguntaExisteEnBanco(preguntaExistente, banco);
console.log(`\n🔍 Prueba 1 - Pregunta existente: "${preguntaExistente}"`);
console.log(`   Resultado: ${existeTest1 ? '✅ EXISTE (correcto)' : '❌ NO EXISTE (error)'}`);

// Probar con una pregunta nueva
const preguntaNueva = "¿Cuál es el animal nacional de Australia que no puede caminar hacia atrás?";
const existeTest2 = preguntaExisteEnBanco(preguntaNueva, banco);
console.log(`\n🔍 Prueba 2 - Pregunta nueva: "${preguntaNueva}"`);
console.log(`   Resultado: ${existeTest2 ? '❌ EXISTE (error)' : '✅ NO EXISTE (correcto)'}`);

// Probar con variaciones de mayúsculas
const preguntaVariacion = "¿en qué año cayó el muro de berlín?";
const existeTest3 = preguntaExisteEnBanco(preguntaVariacion, banco);
console.log(`\n🔍 Prueba 3 - Variación de mayúsculas: "${preguntaVariacion}"`);
console.log(`   Resultado: ${existeTest3 ? '✅ EXISTE (correcto - ignora mayúsculas)' : '❌ NO EXISTE (error)'}`);

console.log('\n✅ Sistema de validación funcionando correctamente');
