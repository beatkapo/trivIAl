# 🚀 Guía Rápida - Sistema de Trivial

## ⚡ Comandos Esenciales

```bash
# Inicio rápido
npm start                    # Ver ayuda
npm run demo                 # Abrir demo

# Generar preguntas  
npm run generar              # Pregunta aleatoria
npm run generar-ia           # Generar con IA

# Grabar videos
npm run grabar               # Grabación individual
npm run grabar-todas         # Todas las temáticas
npm run grabar-ia            # Todas con IA
```

## 📁 Archivos Importantes

- `src/ui/trivial.html` - Interfaz principal
- `src/core/generar_pregunta.js` - Generador de preguntas
- `data/preguntas_banco.json` - Banco de preguntas
- `output/videos/` - Videos generados

## 🎯 Temáticas Disponibles

| ID | Nombre | Color |
|---|---|---|
| `historia` | Historia | Marrón |
| `cultura-general` | Cultura General | Azul |
| `deportes` | Deportes | Verde |
| `musica` | Música | Morado |
| `cine-television` | Cine y TV | Rojo |
| `naturaleza-geografia` | Naturaleza | Verde claro |
| `famosos` | Famosos | Dorado |

## 🔧 Configuración Rápida

1. **Instalar FFmpeg** (para grabación)
2. **Opcional: Mistral** en localhost:1234 (para IA)
3. **Ejecutar:** `npm install`

## 🎬 Formato de URL

```
trivial.html?pregunta=TEXTO&opcion1=OP1&opcion2=OP2&opcion3=OP3&correcta=2&tematica=historia
```

## 🆘 Problemas Comunes

- **Error FFmpeg:** Verificar instalación con `ffmpeg -version`
- **Error IA:** Verificar Mistral en http://localhost:1234
- **Rutas rotas:** Ejecutar desde directorio raíz del proyecto

---
📖 **Documentación completa:** `README.md`
