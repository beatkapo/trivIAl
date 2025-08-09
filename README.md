# 🎯 TrivIAl - Sistema Inteligente de Trivial

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![AI Powered](https://img.shields.io/badge/AI-Powered-blue.svg)](https://lmstudio.ai/)

**Sistema avanzado de generación automática de videos de trivial con IA, síntesis de voz y grabación profesional.**

> 🚀 **Genera videos de trivial únicos en segundos**: IA crea preguntas → ElevenLabs sintetiza voz → Sistema graba video automáticamente

## ✨ Características Principales

🤖 **Generación Inteligente de Preguntas**
- Integración con LMStudio para preguntas únicas
- Validación automática contra duplicados
- 7+ temáticas especializadas

🗣️ **Síntesis de Voz Premium**
- ElevenLabs para audio de alta calidad
- Voces naturales en español
- Sincronización perfecta con video

🎬 **Grabación Automatizada**
- Videos HD optimizados para redes sociales
- Grabación por lotes sin intervención
- Formato 9:16 ideal para móviles

📊 **Gestión Inteligente**
- Banco de preguntas persistente
- Detección de similitud avanzada
- Organización automática de archivos

## 🚀 Inicio Rápido

### Instalación
```bash
# Clonar el repositorio
git clone https://github.com/beatkapo/trivIAl.git
cd trivIAl

# Instalar dependencias
npm install

# Configurar variables de entorno (opcional)
cp .env.example .env
# Editar .env con tu API key de ElevenLabs
```

### Primer Video
```bash
# Generar un video con IA y voz sintetizada
npm run grabar-con-audio

# Generar múltiples videos sin pausa
npm run generar-videos 5

# Ver resultado en output/videos/
```

### Demo Interactivo
```bash
# Explorar el sistema
npm run demo
```

## 📋 Requisitos del Sistema

| Componente | Versión | Propósito | Obligatorio |
|------------|---------|-----------|-------------|
| **Node.js** | 18+ | Runtime principal | ✅ Sí |
| **FFmpeg** | Cualquiera | Grabación de video | ✅ Sí |
| **LMStudio** | Última | Generación IA | ⚠️ Para IA |
| **ElevenLabs API** | - | Síntesis de voz | ⚠️ Para audio |

### Configuración de LMStudio
1. Descargar desde [lmstudio.ai](https://lmstudio.ai/)
2. Cargar modelo en español (recomendado: Mistral 7B)
3. Iniciar servidor en `localhost:1234`

### Configuración de ElevenLabs
1. Registrarse en [elevenlabs.io](https://elevenlabs.io/)
2. Obtener API key desde configuración
3. Añadir a archivo `.env`

## 📁 Arquitectura del Proyecto

```
trivIAl/
├── 🤖 src/core/                # Motor de IA y lógica principal
│   ├── elevenlabs_audio.mjs          # Síntesis de voz ElevenLabs
│   ├── generar_pregunta.js           # Generador de preguntas
│   └── generar_preguntas_ia.js       # Integración con LMStudio
├── 🎬 src/recording/           # Sistema de grabación avanzado
│   ├── grabar_con_elevenlabs.mjs     # Grabación con audio IA
│   ├── generar_videos_masivo.mjs     # Generación por lotes
│   └── grabar_trivial.mjs            # Grabación individual
├── 🎨 src/ui/                  # Interfaz de usuario
│   └── trivial.html                  # UI responsive con animaciones
├── � data/                    # Base de datos de preguntas
│   └── preguntas_banco.json          # Banco persistente de preguntas
├── � output/                  # Archivos generados
│   ├── videos/                       # Videos MP4 generados
│   └── audios/                       # Archivos de audio MP3
├── � docs/                    # Documentación técnica
│   ├── GENERACION_MASIVA.md          # Guía de generación masiva
│   └── README_GRABACION.md           # Documentación de grabación
└── 🔧 Archivos de configuración
    ├── package.json                  # Dependencias y scripts NPM
    ├── .env.example                  # Variables de entorno
    └── inicio.js                     # CLI principal
```

## 🎨 Sistema de Temáticas

### Categorías Inteligentes con IA

| Temática | Color | Icono | Descripción | Ejemplos de IA |
|----------|-------|--------|-------------|----------------|
| **historia** | 🟤 Marrón | 📚 | Historia mundial, eventos, personajes | Batallas, imperios, descubrimientos |
| **cultura-general** | 🔵 Azul | 🧠 | Conocimiento general variado | Literatura, arte, curiosidades |
| **deportes** | 🟢 Verde | ⚽ | Deportes, atletas, competiciones | Fútbol, olimpiadas, récords |
| **musica** | 🟣 Morado | 🎵 | Música, artistas, géneros | Bandas, instrumentos, hits |
| **cine-television** | 🔴 Rojo | 🎬 | Entretenimiento audiovisual | Películas, series, actores |
| **ciencia** | 🟡 Amarillo | 🔬 | Ciencias, tecnología, inventos | Física, química, innovaciones |
| **geografia** | 🟢 Verde claro | 🌍 | Geografía mundial, países | Capitales, ríos, montañas |

### 🤖 Generación Inteligente por Categoría

El sistema utiliza IA especializada para crear preguntas únicas por temática:

```javascript
// Ejemplo: Pregunta de ciencia generada por IA
{
  "pregunta": "¿Cuál es el elemento químico más abundante en el universo?",
  "opciones": ["Oxígeno", "Hidrógeno", "Helio"],
  "correcta": 2,
  "tematica": "ciencia"
}
```

## 🛠️ Comandos y Scripts

### � Scripts de Producción

| Comando | Descripción | Uso |
|---------|-------------|-----|
| `npm run grabar-con-audio` | Generar 1 video con IA y voz | Producción individual |
| `npm run generar-videos N` | Generar N videos sin pausa | Producción masiva |
| `npm run generar-videos N D` | Generar N videos con delay D ms | Producción controlada |

### 🔧 Scripts de Desarrollo

| Comando | Descripción | Funcionalidad |
|---------|-------------|---------------|
| `npm start` | Mostrar ayuda completa | CLI principal |
| `npm run demo` | Abrir demo interactivo | Testing visual |
| `npm run generar` | Generar pregunta aleatoria | Testing preguntas |
| `npm run generar-ia` | Generar pregunta con IA | Testing IA |

### 💡 Ejemplos Prácticos

```bash
# Generar 10 videos para redes sociales
npm run generar-videos 10

# Generar 50 videos con pausa de 2 segundos entre cada uno
npm run generar-videos 50 2000

# Probar generación de pregunta con IA
npm run generar-ia

# Ver demo de todas las categorías
npm run demo
```

## 🔧 Configuración Avanzada

### Variables de Entorno

Crea un archivo `.env` basado en `.env.example`:

```bash
# API de síntesis de voz (opcional pero recomendado)
ELEVENLABS_API_KEY=tu_api_key_de_elevenlabs

# URL de LMStudio (opcional - por defecto localhost:1234)
LMSTUDIO_URL=http://localhost:1234
```

### Personalización del Sistema

#### 🎤 Configuración de Audio
```javascript
// En src/core/elevenlabs_audio.mjs
const VOCES_ESPANOL = {
  masculina: 'tEMiC7LbpKm1kc0l4WmM',
  femenina: 'ID_DE_OTRA_VOZ'  // Añadir más voces
};
```

#### 🎬 Configuración de Video
```javascript
// En src/recording/grabar_con_elevenlabs.mjs
const CONFIG_GRABACION = {
  resolucion: { width: 810, height: 1440 },    // 9:16 para móviles
  duracion: 18,                                 // segundos
  formato: 'mp4',
  calidad: 'high'
};
```

#### 🤖 Configuración de IA
```javascript
// En src/core/generar_preguntas_ia.js
const CONFIG_IA = {
  modelo: 'local-model',
  temperatura: 0.7,                    // Creatividad (0-1)
  max_tokens: 200,                     // Longitud de respuesta
  umbral_similitud: 0.7                // Detección de duplicados
};
```

## 📖 API y Desarrollo

### 🔗 Integración con URLs

El sistema utiliza URLs parametrizadas para la comunicación:

```
trivial.html?pregunta=TEXTO&opcion1=OP1&opcion2=OP2&opcion3=OP3&correcta=NUM&tematica=TEMA
```

**Ejemplo real:**
```
src/ui/trivial.html?pregunta=%C2%BFCu%C3%A1l%20es%20la%20capital%20de%20Francia%3F&opcion1=Madrid&opcion2=Par%C3%ADs&opcion3=Roma&correcta=2&tematica=cultura-general
```

### 🤖 API de LMStudio

```javascript
// Endpoint de generación
POST http://localhost:1234/v1/chat/completions

// Formato de respuesta esperado
{
  "pregunta": "¿Cuál es...?",
  "opciones": ["Opción 1", "Opción 2", "Opción 3"],
  "correcta": 2,
  "tematica": "historia"
}
```

### 🗣️ API de ElevenLabs

```javascript
// Síntesis de voz
POST https://api.elevenlabs.io/v1/text-to-speech/{voice_id}

Headers: {
  'xi-api-key': 'tu_api_key',
  'Content-Type': 'application/json'
}
```

### 📊 Estructura de Datos

#### Banco de Preguntas (`data/preguntas_banco.json`)
```json
{
  "historia": [
    {
      "pregunta": "¿En qué año comenzó la Primera Guerra Mundial?",
      "opciones": ["1912", "1914", "1916"],
      "correcta": 2,
      "fuente": "ia",
      "timestamp": "2025-08-09T10:15:30.000Z"
    }
  ]
}
```

## 🎥 Formatos de Salida

### 📹 Videos Generados

**Nomenclatura de archivos:**
```
trivial_{tematica}_{fuente}_{fecha}_{hora}_{timestamp}.mp4
```

**Ejemplo:**
```
trivial_historia_ia_2025-08-09_15-30-45_1754709775801.mp4
```

**Especificaciones técnicas:**
- **Resolución:** 810x1440 (9:16 - optimizado para móviles)
- **Duración:** 18 segundos
- **Formato:** MP4 H.264
- **Audio:** MP3 estéreo 44.1kHz
- **Bitrate:** Alta calidad para redes sociales

### 🎵 Archivos de Audio

**Ubicación:** `output/audios/`
- `correct.mp3` - Audio de respuesta correcta (persistente)
- `pregunta_[timestamp].mp3` - Audios generados (temporal)

## 🚀 Flujo de Trabajo Típico

### Para Creadores de Contenido

```bash
# 1. Configuración inicial (una sola vez)
npm install
cp .env.example .env
# Editar .env con API keys

# 2. Generación de contenido diario
npm run generar-videos 10        # 10 videos únicos
# ¡Videos listos en output/videos/ para subir a redes sociales!

# 3. Generación masiva para stock
npm run generar-videos 100       # 100 videos sin pausa
```

### Para Desarrolladores

```bash
# Testing y desarrollo
npm run demo                     # Probar interfaz
npm run generar-ia              # Test de generación IA
npm run grabar-con-audio        # Test completo de pipeline

# Debug y monitoreo
# Los logs aparecen en tiempo real durante la generación
```

## 🤝 Contribuir al Proyecto

### 🌟 Cómo Contribuir

1. **Fork** el repositorio
2. **Crear** rama para nueva funcionalidad: `git checkout -b feature/nueva-caracteristica`
3. **Commit** los cambios: `git commit -m 'feat: agregar nueva característica'`
4. **Push** a la rama: `git push origin feature/nueva-caracteristica`
5. **Abrir** Pull Request con descripción detallada

### 🐛 Reportar Bugs

Al reportar un bug, incluye:
- **Versión** de Node.js (`node --version`)
- **Sistema operativo** y versión
- **Pasos** para reproducir el error
- **Logs** completos del error
- **Configuración** utilizada

### 💡 Sugerir Mejoras

Las mejoras más valoradas:
- 🎨 Nuevas temáticas de preguntas
- 🗣️ Soporte para más idiomas/voces
- 🎬 Nuevos formatos de video
- 🤖 Mejoras en generación IA
- 📊 Analytics y métricas

## 🆘 Soporte y Documentación

### 📚 Recursos Disponibles

| Documento | Propósito | Audiencia |
|-----------|-----------|-----------|
| `INICIO_RAPIDO.md` | Guía de primeros pasos | Nuevos usuarios |
| `docs/GENERACION_MASIVA.md` | Producción a gran escala | Creadores de contenido |
| `docs/README_GRABACION.md` | Configuración técnica | Desarrolladores |
| `examples/` | Demostraciones interactivas | Todos |

### 🔧 Diagnóstico de Problemas

```bash
# Verificar instalación
node --version          # Debe ser 18+
npm --version          # Debe estar instalado
ffmpeg -version        # Debe estar en PATH

# Test de conectividad
curl http://localhost:1234/v1/models  # LMStudio activo
```

### 🌐 Comunidad y Soporte

- **🐛 Issues:** [GitHub Issues](https://github.com/beatkapo/trivIAl/issues)
- **💬 Discusiones:** [GitHub Discussions](https://github.com/beatkapo/trivIAl/discussions)
- **📧 Email:** Para soporte empresarial
- **📖 Wiki:** Documentación extendida

## � Licencia y Términos

### 📋 Licencia MIT

Este proyecto está licenciado bajo la **Licencia MIT** - consulta el archivo [LICENSE](LICENSE) para más detalles.

**Resumen de permisos:**
- ✅ **Uso comercial** - Puedes usar este software con fines comerciales
- ✅ **Modificación** - Puedes modificar el código fuente
- ✅ **Distribución** - Puedes distribuir el software
- ✅ **Uso privado** - Puedes usar el software de forma privada

**Limitaciones:**
- ❌ **Sin garantía** - El software se proporciona "tal como está"
- ❌ **Sin responsabilidad** - Los autores no son responsables de daños

### 🔐 APIs de Terceros

- **LMStudio:** Uso local, sin restricciones adicionales
- **ElevenLabs:** Sujeto a términos de servicio de ElevenLabs
- **FFmpeg:** Licencia LGPL/GPL según compilación

## 🎉 Agradecimientos

### 🙏 Créditos Especiales

- **LMStudio** - Por democratizar el acceso a LLMs locales
- **ElevenLabs** - Por su API de síntesis de voz de calidad
- **Puppeteer Team** - Por la automatización de navegador
- **FFmpeg Project** - Por el procesamiento multimedia
- **Comunidad Open Source** - Por las librerías y herramientas

### 🌟 Inspiración

Este proyecto nace de la necesidad de democratizar la creación de contenido educativo de calidad, combinando IA moderna con herramientas accesibles.

---

<div align="center">

### 🚀 ¡Crea Videos de Trivial Únicos en Segundos!

**[⬇️ Descargar](https://github.com/beatkapo/trivIAl/archive/main.zip)** • **[📖 Documentación](docs/)** • **[🐛 Reportar Bug](https://github.com/beatkapo/trivIAl/issues)** • **[💡 Sugerir Mejora](https://github.com/beatkapo/trivIAl/discussions)**

[![GitHub stars](https://img.shields.io/github/stars/beatkapo/trivIAl?style=social)](https://github.com/beatkapo/trivIAl/stargazers)
[![GitHub forks](https://img.shields.io/github/forks/beatkapo/trivIAl?style=social)](https://github.com/beatkapo/trivIAl/network/members)

**Hecho con ❤️ para la comunidad de creadores de contenido**

</div>
