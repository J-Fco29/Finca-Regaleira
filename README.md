# 🏰 Finca Regaleira - Registro de Viajeros

Plataforma web de registro y gestión de huéspedes para estancias y viajes en **Finca Regaleira**. Diseñada para facilitar el registro de los viajeros mediante código QR antes o a su llegada, recopilando información esencial médica, logística y de convivencia.

---

## 📋 Descripción del Proyecto

Este proyecto (Trabajo Digi) surge con el propósito de optimizar y digitalizar la recepción y organización de los viajeros. A través de un punto de acceso directo vía **código QR**, cada usuario accede a un formulario interactivo que le permite completar su ficha de viajero de forma ágil y segura.

---

## ✨ Características y Requisitos

### 1. 📲 Acceso Rápido por Código QR
- Escaneo directo desde dispositivos móviles para acceder a la plataforma sin necesidad de descargas previas.

### 2. 📝 Formulario de Registro Integral
- **Datos Personales**: Información básica de contacto e identificación del viajero.
- **Fotografía Personal**: Subida de foto para reconocimiento y acreditación en la finca.
- **Salud y Accesibilidad**:
  - Declaración de alergias o intolerancias alimentarias/ambientales (con especificación detallada).
  - Registro de lesiones físicas o condiciones médicas relevantes.
  - Grado de discapacidad reconocido (para asignación de accesos adaptados).
- **Preferencias de Alojamiento**:
  - Preferencias de distribución y asignación de compañeros de habitación.

### 3. 📸 Galería de Instalaciones
- Fotografías informativas del recinto, incluyendo:
  - Habitaciones y áreas de descanso.
  - Comedor y zonas comunes.

---

## 📁 Estructura del Repositorio

```plaintext
finca_regaleira_pagina/
├── .idea/                 # Configuración del entorno de desarrollo (IDE)
├── app/                   # Aplicación web
│   ├── index.html         # Formulario de registro
│   ├── app.js             # Lógica y validación del formulario
│   ├── style.css          # Estilos
│   └── registros.txt      # Registros de viajeros
├── imagenes/              # Imágenes del proyecto
├── instrucciones          # Requisitos iniciales del proyecto
└── README.md              # Documentación principal del proyecto
```

---

## 🛠️ Tecnologías Sugeridas / Previstas

- **Frontend**: HTML5, CSS3 / Framework CSS (Bootstrap / Tailwind CSS), JavaScript moderno.
- **Procesamiento de Formularios y Almacenamiento**:
  - Backend con Node.js / Python / PHP, o servicios cloud / serverless (Firebase, Supabase, Google Forms / Sheets API).
  - Almacenamiento multimedia para la subida de fotos (Cloudinary, Firebase Storage o carpeta local).
- **Generación de QR**: Librerías como `qrcode.js` o generadores de QR vectoriales.

---

## 🚀 Puesta en Marcha (Desarrollo Local)

1. **Clonar el repositorio:**
   ```bash
   git clone https://github.com/asegovia26/finca_regaleira_pagina.git
   cd finca_regaleira_pagina
   ```

2. **Abrir el proyecto:**
   - Si utilizas un servidor local ligero (por ejemplo, con la extensión *Live Server* de VS Code o WebStorm):
     ```bash
     npx serve app -l 8000
     # o con Python:
     python3 -m http.server 8000 --directory app
     ```
   - Accede a `http://localhost:8000` en tu navegador.

---

## 📌 Hoja de Ruta (Roadmap)

- [x] Especificación de requisitos en [instrucciones](instrucciones).
- [ ] Maquetación de la página principal y galería fotográfica (habitaciones y comedor).
- [ ] Implementación del formulario interactivo:
  - [ ] Subida de imagen personal.
  - [ ] Campos condicionales para alergias y lesiones.
  - [ ] Campo para grado de discapacidad.
  - [ ] Sección de compañeros de habitación.
- [ ] Generación y prueba del código QR para acceso móvil.
- [ ] Integración con base de datos o sistema de recepción de respuestas.

---

## 👥 Colaboradores

- **Equipo Trabajo Digi**
  - Repositorio: [finca_regaleira_pagina en GitHub](https://github.com/asegovia26/finca_regaleira_pagina)
