# 🏆 ScoreVS Widget

Un widget de marcador interactivo, personalizable y en tiempo real diseñado para transmisiones en vivo (OBS Studio, PRISM Live, XSplit). Permite a los streamers llevar el control de los puntajes, nombres y fotografías de los jugadores desde un panel de administración web, reflejando los cambios instantáneamente en la transmisión.

![Estado del Proyecto](https://img.shields.io/badge/Estado-Versión%201.1.2(Estable)-success)
![Tecnologías](https://img.shields.io/badge/Stack-HTML5%20%7C%20CSS3%20%7C%20Vanilla%20JS-blue)
![Backend](https://img.shields.io/badge/BaaS-Firebase%20Realtime%20Database-orange)

## ✨ Características Principales

* **⚡ Sincronización en Tiempo Real:** Actualizaciones instantáneas sin necesidad de recargar la página gracias a Firebase.
* **🎨 Múltiples Temas Visuales (9 diseños):** Cambia el aspecto del overlay y del panel de control con un solo clic (Retro Win95, Moderno Oscuro/Claro, Cyberpunk Neón, Pastel, Rocoso, Láser, Papel y Metálico).
* **📸 Procesamiento de Imágenes Local:** Sube fotos desde tu dispositivo. El sistema las comprime en un `<canvas>` y las convierte a Base64 para un renderizado ultra rápido sin depender de servicios de almacenamiento externos.
* **🎬 Animaciones Reactivas:** Efectos visuales automáticos (zoom y resplandor) al detectar incrementos en el puntaje.
* **📱 Diseño Adaptable:** Soporte nativo para modo horizontal (estándar) y modo vertical (ideal para streams en TikTok, Shorts o juegos retro).
* **🔒 Salas Seguras:** Sistema de generación de URLs únicas con sufijos aleatorios y reglas de seguridad de Firebase para aislar los datos de cada transmisión.

---

## ✨ Novedades en la última versión

Hemos llevado la personalización visual al siguiente nivel aplicando ingeniería de CSS avanzada:

* **🎚️ Control de Opacidad Global:** Nuevo deslizador en el panel de control para ajustar la transparencia del overlay en tiempo real (de 50% a 100%). ¡El diseño del deslizador muta según el tema elegido!
* **🧠 Colores Relativos Inteligentes:** El sistema ahora calcula automáticamente colores de contraste. Por ejemplo, en el tema Cyberpunk, si eliges el neón rosa, los nombres cambian a cian para mantener una estética perfecta.
* **🖼️ Texturas Complejas en CSS Puro:** Adiós a las imágenes de fondo. Los nuevos temas utilizan múltiples capas de gradientes lineales, radiales y filtros SVG nativos para simular materiales físicos (piedra, musgo, metal grabado).

---

## 🖼️ Vistas Previas

| Sala Inicial | Panel de Administración | Overlay en OBS |
| :---: | :---: | :---: |
| <img src="assets/sala-inicial.png" width="230"/> | <img src="assets/panel-control.png" width="230"/> | <img src="assets/overlay-obs.png" width="230"/> |

## 🛠️ Tecnologías y Arquitectura

Este proyecto está construido sin frameworks pesados para garantizar la máxima velocidad de carga en los programas de transmisión:
* **Frontend:** HTML5, CSS3 (Flexbox, Variables), JavaScript (ES6+).
* **Backend/Base de Datos:** Firebase Realtime Database.
* **Despliegue:** Optimizado para Vercel / GitHub Pages.

## 🚀 Instalación y Despliegue Local

1.  Clona este repositorio:
    ```bash
    git clone [https://github.com/tu-usuario/scorevs-widget.git](https://github.com/tu-usuario/scorevs-widget.git)
    ```
2.  Crea un proyecto en [Firebase](https://firebase.google.com/) y habilita **Realtime Database**.
3.  Aplica las siguientes reglas de seguridad en Firebase:
    ```json
    {
      "rules": {
        ".read": false,
        ".write": false,
        "rooms": {
          "$room_id": {
            ".read": true,
            ".write": true
          }
        }
      }
    }
    ```
4.  Reemplaza el objeto `firebaseConfig` en los archivos `control.html` y `overlay.html` con las credenciales de tu proyecto.
5.  Sube el repositorio a Vercel, Netlify o GitHub Pages.

## 📖 Manual de Uso (Integración con OBS/PRISM)

1.  Ingresa a la página principal (`index.html`) y crea una sala.
2.  Desde el **Panel de Administración**, copia el enlace generado en el campo "Enlace para OBS".
3.  Abre OBS Studio o PRISM Live Studio.
4.  Añade una nueva fuente de tipo **Navegador (Browser Source)**.
5.  Pega el enlace, ajusta el ancho a `500` y el alto a `300` (o ajusta según tu preferencia).
6.  ¡Listo! Abre el panel de administración en tu celular o segundo monitor y controla el stream a distancia.

## 👨‍💻 Sobre el Autor

Desarrollador de software con sólida experiencia en programación y arquitectura de sistemas. Enfocado en crear herramientas web eficientes, reactivas y con arquitecturas escalables que resuelven problemas reales.

---
*Hecho con dedicación para la comunidad de Pump It Up*
