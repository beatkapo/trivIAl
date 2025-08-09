# 🚀 Guía de Inicio Rápido - TrivIAl

Sistema inteligente de generación y grabación automática de videos de trivial con integración de IA y síntesis de voz.

## ⚡ Instalación y Configuración

### 1. Instalar dependencias
```bash
npm install
```

### 2. Configurar variables de entorno (Opcional - Para ElevenLabs)
```bash
# Copiar archivo de ejemplo
cp .env.example .env

# Editar .env y añadir tu API key de ElevenLabs
# ELEVENLABS_API_KEY=tu_api_key_aqui
```

### 3. Verificar FFmpeg (Requerido para grabación)
```bash
ffmpeg -version
```

## 🎯 Comandos Principales

### Generación de Videos
```bash
# Generar 1 video con IA
npm run grabar-con-audio

# Generar múltiples videos (sin pausa)
npm run generar-videos 5

# Generar con delay personalizado (ej: 3 segundos)
npm run generar-videos 5 3000
```

### Comandos de Desarrollo
```bash
npm start                    # Ver ayuda completa
npm run demo                 # Abrir demo interactivo
npm run generar              # Generar pregunta aleatoria
npm run generar-ia           # Generar pregunta con IA
```

## 🔧 Cómo Funciona el Sistema

### 1. **Generación de Preguntas con IA**
- **LMStudio** (localhost:1234) genera preguntas únicas por temática
- **Validación automática** contra banco de preguntas existentes
- **Detección de similitud** para evitar duplicados
- **Persistencia** automática en `data/preguntas_banco.json`

### 2. **Síntesis de Voz con ElevenLabs**
- **Conversión texto-a-voz** de alta calidad
- **Voz en español** con entonación natural
- **Archivos MP3** guardados en `output/audios/`
- **Sincronización** perfecta con el video

### 3. **Grabación Automatizada**
- **Puppeteer** controla navegador en modo kiosk
- **FFmpeg** captura pantalla y audio del sistema
- **18 segundos** de grabación por pregunta
- **Resolución optimizada** para redes sociales

### 4. **Flujo Completo por Video**
```
IA → Pregunta → Audio → Browser → Grabación → MP4
 ↓     ↓        ↓        ↓          ↓        ↓
2s    3s       5s      1s         18s     Total: ~30s
```

## 📁 Estructura de Archivos Generados

```
output/
├── audios/
│   ├── correct.mp3                    # Audio de respuesta correcta
│   └── pregunta_[timestamp].mp3       # Audios generados
└── videos/
    └── trivial_[tema]_ia_[fecha]_[timestamp].mp4
```

## � Temáticas Disponibles

| Temática | Color | Descripción |
|----------|-------|-------------|
| `historia` | 🟤 Marrón | Historia mundial y eventos |
| `cultura-general` | 🔵 Azul | Conocimiento general |
| `deportes` | 🟢 Verde | Deportes y atletas |
| `musica` | 🟣 Morado | Música y artistas |
| `cine-television` | 🔴 Rojo | Cine, TV y entretenimiento |
| `ciencia` | 🟡 Amarillo | Ciencias y tecnología |
| `geografia` | 🟢 Verde claro | Geografía mundial |

## 🎬 Configuración Avanzada

### Modificar tiempo de grabación
```javascript
// En src/recording/grabar_con_elevenlabs.mjs
const tiempoGrabacion = 18; // segundos
```

### Cambiar resolución de video
```javascript
// En src/recording/grabar_con_elevenlabs.mjs
const resolution = { width: 810, height: 1440 }; // 9:16 para móviles
```

### Configurar voz de ElevenLabs
```javascript
// En src/core/elevenlabs_audio.mjs
const VOCES_ESPANOL = {
  masculina: 'tEMiC7LbpKm1kc0l4WmM',  // ID de voz por defecto
  // Añadir más voces aquí
};
```

## 🚨 Solución de Problemas

### Error: "No se puede conectar a LMStudio"
```bash
# Verificar que LMStudio esté ejecutándose
curl http://localhost:1234/v1/models
```

### Error: "FFmpeg no encontrado"
```bash
# Windows: Instalar desde https://ffmpeg.org/
# Verificar instalación
ffmpeg -version
```

### Error: "API key de ElevenLabs inválida"
```bash
# Verificar API key en .env
# Obtener nueva key desde: https://elevenlabs.io/app/settings
```

### Video muy pequeño o grande
```bash
# El sistema compensa automáticamente el escalado de Windows
# Si tienes problemas, verifica el escalado del sistema (125%, 150%, etc.)
```

## � Links Útiles

- **📖 Documentación completa:** `README.md`
- **🎬 Guía de grabación:** `docs/README_GRABACION.md`
- **📊 Generación masiva:** `docs/GENERACION_MASIVA.md`
- **🤖 LMStudio:** https://lmstudio.ai/
- **🗣️ ElevenLabs:** https://elevenlabs.io/

---

💡 **Tip:** Comienza con `npm run grabar-con-audio` para generar tu primer video y familiarizarte con el sistema.
