# 🎯 Sistema de Trivial Interactivo

Un sistema completo para crear, personalizar y grabar animaciones de preguntas de trivial con diferentes temáticas visuales e integración con IA.

## 🚀 Inicio Rápido

```bash
# Instalar dependencias
npm install

# Ver comandos disponibles
node inicio.js

# Abrir demo de categorías
node inicio.js demo

# Generar pregunta aleatoria
node inicio.js generar

# Grabar todas las temáticas
node inicio.js grabar-multiple todasTematicas
```

## 📁 Estructura del Proyecto

```
trivial/
├── 📂 src/                     # Código fuente
│   ├── 📂 core/               # Lógica principal
│   │   ├── generar_pregunta.js        # Generador de preguntas y URLs
│   │   └── generar_preguntas_ia.js    # Generación masiva con IA
│   ├── 📂 ui/                 # Interfaz de usuario
│   │   └── trivial.html              # Interfaz web principal
│   └── 📂 recording/          # Sistema de grabación
│       ├── grabar_trivial.js         # Grabación individual
│       └── grabar_multiple.js        # Grabación múltiple
├── 📂 data/                    # Datos del sistema
│   └── preguntas_banco.json          # Banco de preguntas
├── 📂 output/                  # Archivos generados
│   └── videos/                       # Videos grabados
├── 📂 examples/                # Ejemplos y demos
│   └── demo_categorias.html          # Demo de todas las categorías
├── 📂 docs/                    # Documentación
│   └── README_GRABACION.md           # Guía de grabación
├── 📂 assets/                  # Recursos
│   └── verde.png                     # Imagen de fondo
├── inicio.js                   # Script principal de inicio
├── package.json               # Configuración del proyecto
└── README.md                  # Este archivo
```

## 🎨 Características

### ✨ **Temáticas Visuales**
- 📚 **Historia** (marrón) - `historia`
- 🧠 **Cultura General** (azul) - `cultura-general`  
- ⚽ **Deportes** (verde) - `deportes`
- 🎵 **Música** (morado) - `musica`
- 🎬 **Cine y Televisión** (rojo) - `cine-television`
- 🌍 **Naturaleza y Geografía** (verde claro) - `naturaleza-geografia`
- ⭐ **Famosos** (dorado) - `famosos`

### 🤖 **Integración con IA**
- Generación automática de preguntas con Mistral
- Evita preguntas repetidas
- Persistencia automática en JSON
- Generación por temática específica

### 🎬 **Sistema de Grabación**
- Nombres de archivo únicos con timestamp
- Grabación individual o múltiple
- Organización automática en carpetas
- Soporte para diferentes fuentes (banco, IA, personalizada)

### 🎯 **Funcionalidades**
- ✅ Parámetros por URL (pregunta, opciones, respuesta correcta, temática)
- ✅ Animaciones suaves y profesionales
- ✅ Temporizador visual de 10 segundos
- ✅ Efectos de sonido y visuales
- ✅ Responsive design
- ✅ Nombre de categoría visible

## 🛠️ Comandos Principales

### 📋 **Comandos de Inicio**
```bash
node inicio.js demo              # Abrir demo de categorías
node inicio.js trivial           # Abrir interfaz principal
node inicio.js generar           # Generar pregunta aleatoria
```

### 🎬 **Comandos de Grabación**
```bash
node inicio.js grabar                           # Grabación individual
node inicio.js grabar-multiple todasTematicas  # Todas las temáticas
node inicio.js grabar-multiple todasTematicasIA # Todas con IA
node inicio.js grabar-multiple cincoBanco      # 5 preguntas aleatorias
node inicio.js grabar-multiple tresIA          # 3 preguntas IA
```

### 🤖 **Comandos de IA**
```bash
node inicio.js generar-ia        # Generación masiva con IA
```

## 🔧 Configuración

### **Requisitos**
1. **Node.js** (v18+)
2. **FFmpeg** (para grabación de video)
3. **Puppeteer** (instalado automáticamente)
4. **Mistral** en localhost:1234 (opcional, para IA)

### **Instalación**
```bash
# Clonar o descargar el proyecto
cd trivial

# Instalar dependencias
npm install

# Verificar FFmpeg
ffmpeg -version
```

## 📖 Guías de Uso

### **1. Crear Pregunta Personalizada**
```javascript
// En src/core/generar_pregunta.js
const url = crearPreguntaPersonalizada(
  "¿Cuál es la capital de Francia?",
  "Madrid",
  "París", 
  "Roma",
  2,  // Opción correcta (París)
  "cultura-general"
);
```

### **2. Usar Preguntas por Temática**
```javascript
// Pregunta de historia
const url = obtenerPreguntaPorTematica('historia');

// Pregunta de deportes  
const url = obtenerPreguntaPorTematica('deportes');
```

### **3. Generar con IA**
```javascript
// Pregunta IA aleatoria
const url = await obtenerPreguntaIA();

// Pregunta IA de temática específica
const url = await obtenerPreguntaIAPorTematica('musica');
```

## 🎥 Formato de Videos

Los videos se guardan con nombres únicos:
```
trivial_{tematica}_{fuente}_{fecha}_{hora}_{timestamp}.mp4
```

**Ejemplo:**
```
trivial_historia_ia_2025-06-25_15-30-45_1719332445123.mp4
```

## 📊 APIs y URLs

### **Formato de URL**
```
trivial.html?pregunta={pregunta}&opcion1={op1}&opcion2={op2}&opcion3={op3}&correcta={1-3}&tematica={tema}
```

### **Ejemplo de URL**
```
src/ui/trivial.html?pregunta=%C2%BFCu%C3%A1l%20es%20la%20capital%20de%20Francia%3F&opcion1=Madrid&opcion2=Par%C3%ADs&opcion3=Roma&correcta=2&tematica=cultura-general
```

## 🤝 Contribuir

1. Fork el proyecto
2. Crear rama para feature (`git checkout -b feature/nueva-caracteristica`)
3. Commit cambios (`git commit -m 'Agregar nueva característica'`)
4. Push a la rama (`git push origin feature/nueva-caracteristica`)
5. Abrir Pull Request

## 📝 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para detalles.

## 🆘 Soporte

- 📖 Documentación completa en `docs/`
- 🎬 Guía de grabación en `docs/README_GRABACION.md`
- 🎯 Ejemplos en `examples/`
- 💡 Issues en GitHub

---

**¡Disfruta creando preguntas de trivial interactivas y profesionales! 🎉**
