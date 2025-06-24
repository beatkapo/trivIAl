# 🎬 Sistema de Grabación de Trivial con Nombres Únicos

Este sistema permite grabar automáticamente las animaciones del trivial con nombres de archivo únicos y organizados.

## 📁 Estructura de Archivos

- `grabar_trivial.js` - Grabación individual con nombres únicos
- `grabar_multiple.js` - Grabación múltiple automatizada
- `videos/` - Directorio donde se guardan todos los videos (se crea automáticamente)

## 🎯 Formato de Nombres de Archivo

Los videos se guardan con el siguiente formato:
```
trivial_{tematica}_{fuente}_{fecha}_{hora}_{timestamp}.mp4
```

**Ejemplos:**
- `trivial_historia_banco_2025-06-25_15-30-45_1719332445123.mp4`
- `trivial_deportes_ia_2025-06-25_15-31-20_1719332480456.mp4`
- `trivial_musica_personalizada_2025-06-25_15-32-10_1719332530789.mp4`

### Componentes del nombre:
- **tematica**: historia, cultura-general, deportes, musica, cine-television, naturaleza-geografia, famosos, general
- **fuente**: banco, ia, personalizada, banco-fallback
- **fecha**: YYYY-MM-DD
- **hora**: HH-MM-SS
- **timestamp**: milisegundos únicos para evitar duplicados

## 🎥 Grabación Individual

### Uso básico:
```bash
node grabar_trivial.js
```

### Opciones de configuración en el archivo:

1. **Pregunta aleatoria del banco:**
```javascript
url = obtenerPreguntaAleatoria();
tipoFuente = 'banco';
```

2. **Pregunta específica por índice:**
```javascript
url = obtenerPreguntaPorIndice(0);
tipoFuente = 'banco';
```

3. **Pregunta por temática específica:**
```javascript
url = obtenerPreguntaPorTematica('historia');
tipoFuente = 'banco';
```

4. **Pregunta generada por IA:**
```javascript
url = await obtenerPreguntaIA();
tipoFuente = 'ia';
```

5. **Pregunta IA de temática específica:**
```javascript
url = await obtenerPreguntaIAPorTematica('deportes');
tipoFuente = 'ia';
```

6. **Pregunta personalizada:**
```javascript
url = crearPreguntaPersonalizada(
  "¿Cuál es el metal más abundante en la corteza terrestre?",
  "Hierro",
  "Aluminio", 
  "Cobre",
  2,
  "naturaleza-geografia"
);
tipoFuente = 'personalizada';
```

## 🎬 Grabación Múltiple

### Comandos disponibles:

1. **Una pregunta del banco por cada temática (7 videos):**
```bash
node grabar_multiple.js todasTematicas
```

2. **Una pregunta IA por cada temática (7 videos):**
```bash
node grabar_multiple.js todasTematicasIA
```

3. **5 preguntas aleatorias del banco:**
```bash
node grabar_multiple.js cincoBanco
```

4. **3 preguntas generadas por IA:**
```bash
node grabar_multiple.js tresIA
```

### Ver ayuda:
```bash
node grabar_multiple.js
```

## 🔧 Requisitos

1. **Node.js** con las dependencias instaladas:
   ```bash
   npm install puppeteer
   ```

2. **FFmpeg** instalado y en el PATH del sistema

3. **Mistral** corriendo en localhost:1234 (solo para preguntas IA)

## 📊 Salida de Información

El sistema muestra información detallada durante la grabación:

```
🎬 GRABADOR DE TRIVIAL CON NOMBRES ÚNICOS 🎬

📁 Directorio "videos" creado
🤖 Generando pregunta con IA...
Nueva pregunta generada: {...}
📝 Pregunta seleccionada: file:///.../trivial.html?pregunta=...&tematica=historia
🎯 Temática: historia
📦 Fuente: ia
💾 Archivo de video: trivial_historia_ia_2025-06-25_15-30-45_1719332445123.mp4
📁 Ruta completa: C:\...\videos\trivial_historia_ia_2025-06-25_15-30-45_1719332445123.mp4

🎬 Iniciando grabación...
✅ Grabación finalizada!
🎥 Video guardado como: trivial_historia_ia_2025-06-25_15-30-45_1719332445123.mp4

📊 RESUMEN DE GRABACIÓN:
========================
📁 Directorio: C:\...\videos
🎥 Archivo: trivial_historia_ia_2025-06-25_15-30-45_1719332445123.mp4
🎯 Temática: historia
📦 Fuente: ia
⏱️  Duración: 18 segundos
📏 Resolución: 450x800
```

## 🎨 Temáticas Disponibles

- **historia** - Historia (marrón)
- **cultura-general** - Cultura General (azul)
- **deportes** - Deportes (verde)
- **musica** - Música (morado)
- **cine-television** - Cine y Televisión (rojo)
- **naturaleza-geografia** - Naturaleza y Geografía (verde claro)
- **famosos** - Famosos (dorado)

## 🗂️ Organización de Videos

Todos los videos se guardan en el directorio `videos/` con nombres únicos que incluyen:
- Temática de la pregunta
- Fuente de la pregunta (banco, IA, personalizada)
- Fecha y hora exacta
- Timestamp único para evitar cualquier duplicado

Esto permite:
- ✅ No sobrescribir videos anteriores
- ✅ Identificar fácilmente el contenido de cada video
- ✅ Organizar por temática o fuente
- ✅ Rastrear cuándo se grabó cada video

## 🚀 Consejos de Uso

1. **Para desarrollo**: Usa grabación individual con preguntas específicas
2. **Para crear contenido variado**: Usa `todasTematicas` o `todasTematicasIA`
3. **Para pruebas rápidas**: Usa `cincoBanco`
4. **Para contenido IA**: Asegúrate de que Mistral esté corriendo antes de usar opciones IA

¡El sistema está listo para generar videos únicos y organizados de tu trivial! 🎉
