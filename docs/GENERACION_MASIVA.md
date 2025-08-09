# 🎬 Generador Masivo de Videos de Trivial

Este sistema permite generar múltiples videos de trivial automáticamente usando IA para crear preguntas variadas.

## 🚀 Uso

### Comando básico:
```bash
npm run generar-videos [número_de_videos] [delay_entre_videos_ms]
```

### Ejemplos:

```bash
# Generar 10 videos (por defecto)
npm run generar-videos

# Generar 50 videos
npm run generar-videos 50

# Generar 20 videos con 10 segundos de delay entre cada uno
npm run generar-videos 20 10000

# Generar 100 videos con 3 segundos de delay
npm run generar-videos 100 3000
```

## ⚙️ Configuración

### Requisitos previos:
1. **LMStudio** ejecutándose en `localhost:1234` con un modelo cargado
2. **ElevenLabs API** configurada (ver configuración de variables de entorno)
3. **ffmpeg** instalado y configurado
4. **Audio "Mezcla estéreo (Realtek Audio)"** disponible

### Variables de entorno:
1. Copia el archivo `.env.example` a `.env`:
   ```bash
   cp .env.example .env
   ```

2. Edita `.env` y configura tu API key de ElevenLabs:
   ```
   ELEVENLABS_API_KEY=tu_api_key_aqui
   ```

3. Obtén tu API key desde: https://elevenlabs.io/app/settings

### Parámetros:
- **número_de_videos**: Cantidad de videos a generar (por defecto: 10)
- **delay_entre_videos_ms**: Tiempo de espera entre videos en milisegundos (por defecto: 5000)

## 🎯 Proceso por video:

1. **Generación de pregunta IA** (~2-3 segundos)
   - LMStudio genera una pregunta aleatoria con temática variable
   - Incluye opciones de respuesta y respuesta correcta

2. **Generación de audio** (~3-5 segundos)
   - ElevenLabs convierte la pregunta a voz
   - Se guarda como MP3

3. **Grabación del video** (~18 segundos)
   - Puppeteer abre el navegador
   - ffmpeg graba pantalla + audio del sistema
   - Se reproduce la voz de la pregunta
   - Se detecta automáticamente la respuesta
   - Se reproduce el sonido de acierto

4. **Finalización** (~1-2 segundos)
   - Se cierra el navegador
   - Se guarda el video final

**Tiempo estimado por video**: 25-30 segundos

## 📊 Estadísticas

El script muestra en tiempo real:
- ✅ Videos generados exitosamente
- ❌ Número de errores
- ⏱️ Tiempo transcurrido
- 📊 Ratio de éxito
- 🎯 Progreso actual

## 📁 Archivos generados

### Videos:
- **Ubicación**: `output/videos/`
- **Formato**: `trivial_[tematica]_ia-auto_[fecha]_[hora]_[timestamp].mp4`
- **Duración**: 18 segundos
- **Resolución**: 810x1400
- **Audio**: Voz IA + efectos de sonido

### Audios:
- **Ubicación**: `output/audios/`
- **Formato**: `pregunta_[timestamp].mp3`
- **Calidad**: Alta definición con ElevenLabs

## 🛠️ Solución de problemas

### Error: "No se pudo conectar con LMStudio"
- Verificar que LMStudio esté ejecutándose en `localhost:1234`
- Comprobar que hay un modelo cargado
- Revisar la configuración de red

### Error: "Error generando audio ElevenLabs"
- Verificar API key de ElevenLabs
- Comprobar conexión a internet
- Revisar cuota disponible

### Error: "ffmpeg no encontrado"
- Instalar ffmpeg: `winget install FFmpeg`
- Añadir ffmpeg al PATH
- Reiniciar terminal

### Audio no se graba:
- Verificar dispositivo "Mezcla estéreo (Realtek Audio)"
- Ajustar volumen del sistema
- Comprobar permisos de audio

## 📈 Recomendaciones de uso

### Para proyectos pequeños (1-10 videos):
```bash
npm run generar-videos 10 3000
```

### Para bibliotecas medianas (50-100 videos):
```bash
npm run generar-videos 50 5000
```

### Para bibliotecas grandes (100+ videos):
```bash
npm run generar-videos 100 10000
```

### Uso nocturno (máxima eficiencia):
```bash
npm run generar-videos 200 2000
```

## 🔧 Personalización

Para modificar temáticas, tiempos, o configuraciones:
- **Temáticas**: Editar `src/core/generar_pregunta.js`
- **Tiempos de grabación**: Modificar `-t 18` en `src/recording/grabar_con_elevenlabs.mjs`
- **Delay por defecto**: Cambiar `delayEntreVideos` en `src/recording/generar_videos_masivo.mjs`

## 🎉 ¡Listo para generar contenido masivo!

Con este sistema puedes crear cientos de videos de trivial únicos y de alta calidad de forma completamente automatizada.
