// --- CONFIGURACIÓN DE FIREBASE ---
const firebaseConfig = {
  apiKey: "AIzaSyAcB2svnoMb1YOKQmwrrAa9i9vbSqxNprw",
  authDomain: "score-w95.firebaseapp.com",
  databaseURL: "https://score-w95-default-rtdb.firebaseio.com",
  projectId: "score-w95",
  storageBucket: "score-w95.firebasestorage.app",
  messagingSenderId: "244357143300",
  appId: "1:244357143300:web:e30629d5dbf0034f5bce51",
  measurementId: "G-R8VN2XHYM4",
};

if (!firebase.apps.length) firebase.initializeApp(firebaseConfig);
//const db = firebase.database().ref('match_data'); // Cambié el nodo a 'match_data' para limpiar lo anterior NO MULTIUSUARIO

// 1. Obtener el parámetro 'room' de la URL (ej: control.html?room=mistream)
const urlParams = new URLSearchParams(window.location.search);
const currentRoom = urlParams.get("room");
const initialTheme = urlParams.get("theme");

// 2. Validación de seguridad básica
if (!currentRoom) {
  alert("No se especificó ninguna sala. Redirigiendo al inicio...");
  window.location.href = "index.html"; // Regresa al login si intentan entrar directo
}

// Apuntar Firebase a la sala específica
if (!firebase.apps.length) firebase.initializeApp(firebaseConfig);
const db = firebase.database().ref(`rooms/${currentRoom}`);

// 4. Configuración inicial del Tema
if (initialTheme) {
  // Asignamos el título por defecto según el tema elegido
  let defaultTitle = "Live_Match.exe";
  if (initialTheme === "theme-modern") defaultTitle = "Online Matching";
  else if (initialTheme === "theme-modern-light") defaultTitle = "Live Stream";
  else if (initialTheme === "theme-neon") defaultTitle = "VERSUS";
  else if (initialTheme === "theme-pastel") defaultTitle = "♡ Sweet Match ♡";
  else if (initialTheme === "theme-stone") defaultTitle = "EPIC DUEL";
  else if (initialTheme === "theme-laser") defaultTitle = "LASER // DEATHMATCH";

  // Guardamos en Firebase instantáneamente
  db.child("settings").update({
    theme: initialTheme,
    customTitle: defaultTitle,
  });

  // LIMPIEZA PRO: Borramos el parámetro '?theme=' de la URL sin recargar la página.
  // Así, si el usuario refresca la página, no se sobreescriben sus cambios futuros.
  window.history.replaceState(null, "", `control.html?room=${currentRoom}`);
}

// --- DICCIONARIO DE VARIANTES DE COLOR ---
const paletasDeColor = {
  "theme-win95": [
    { nombre: "Clásico Win95", hex: "#c0c0c0" }, // Win95 es Win95, no se toca
  ],
  "theme-modern": [
    { nombre: "Gris Claro (Por defecto)", hex: "#e0e0e0" },
    { nombre: "Verde Cyber", hex: "#00e676" },
    { nombre: "Amarillo Eléctrico", hex: "#ffea00" },
    { nombre: "Naranja Fuego", hex: "#ff9100" },
  ],
  "theme-modern-light": [
    { nombre: "Gris Oscuro (Por defecto)", hex: "#333333" },
    { nombre: "Azul Rey", hex: "#2979ff" },
    { nombre: "Morado Profundo", hex: "#651fff" },
  ],
  "theme-neon": [
    { nombre: "Cian (Por defecto)", hex: "#00ffff" },
    { nombre: "Rosa Neón", hex: "#ff00ff" },
    { nombre: "Verde Tóxico", hex: "#39ff14" },
  ],
  "theme-pastel": [
    { nombre: "Rosa Fresa", hex: "#ffb2cc" },
    { nombre: "Amarillo Vainilla", hex: "#f0f2ae" },
    { nombre: "Naranja Durazno", hex: "#fccfaf" },
    { nombre: "Verde Menta", hex: "#b5ead7" },
  ],
  "theme-stone": [
    { nombre: "Gris Volcánico", hex: "#b0b0b0" },
    { nombre: "Rojo Ladrillo", hex: "#cc5544" },
    { nombre: "Verde Musgo", hex: "#6b8e23" },
  ],
  "theme-laser": [
    { nombre: "Rojo Peligro", hex: "#ff0000" },
    { nombre: "Verde Radiactivo", hex: "#00ff00" },
    { nombre: "Amarillo Precaución", hex: "#ffff00" },
    { nombre: "Morado Galáctico", hex: "#bf00ff" },
  ],
};

// Sincronizar el panel con los datos existentes (Nombres, Fotos y Puntos - mostrar fotos o no y Modo Vertical)
db.on("value", (snapshot) => {
  const data = snapshot.val();
  if (data) {
    // Sincronizar Jugador 1
    if (data.p1) {
      const p1Name = document.getElementById("p1-name");
      const p1Photo = document.getElementById("p1-photo");

      if (document.activeElement !== p1Name) p1Name.value = data.p1.name || "";
      if (document.activeElement !== p1Photo) {
        p1Photo.value = data.p1.photo || "";

        // Mostrar vista previa si ya hay foto guardada
        const previewP1 = document.getElementById("preview-p1");
        if (data.p1.photo && data.p1.photo.length > 10) {
          previewP1.src = data.p1.photo;
          previewP1.style.display = "block";
        } else {
          previewP1.style.display = "none";
        }
      }

      // Actualizar el display del marcador P1
      document.getElementById("p1-current-score").innerText =
        data.p1.score || 0;
    }

    // Sincronizar Jugador 2
    if (data.p2) {
      const p2Name = document.getElementById("p2-name");
      const p2Photo = document.getElementById("p2-photo");

      if (document.activeElement !== p2Name) p2Name.value = data.p2.name || "";
      if (document.activeElement !== p2Photo) {
        p2Photo.value = data.p2.photo || "";

        // Mostrar vista previa si ya hay foto guardada
        const previewP2 = document.getElementById("preview-p2");
        if (data.p2.photo && data.p2.photo.length > 10) {
          previewP2.src = data.p2.photo;
          previewP2.style.display = "block";
        } else {
          previewP2.style.display = "none";
        }
      }

      // Actualizar el display del marcador P2
      document.getElementById("p2-current-score").innerText =
        data.p2.score || 0;
    }

    // Sincronizar el estado del checkbox y la UI
    const showPhotos =
      data.settings && data.settings.showPhotos !== undefined
        ? data.settings.showPhotos
        : true; // Por defecto encendido

    // Actualiza el checkbox visualmente
    document.getElementById("toggle-photos").checked = showPhotos;

    // Oculta o muestra los campos de texto para las URLs
    const displayStyle = showPhotos ? "block" : "none";
    document.getElementById("photo-input-p1").style.display = displayStyle;
    document.getElementById("photo-input-p2").style.display = displayStyle;
  }

  // Sincronizar el estado del checkbox de intercambio
  const swapPlayers =
    data.settings && data.settings.swapPlayers !== undefined
      ? data.settings.swapPlayers
      : false; // Por defecto apagado (P1 a la izquierda)

  document.getElementById("toggle-swap").checked = swapPlayers;

  // Sincronizar el selector de temas
  const activeTheme =
    data.settings && data.settings.theme ? data.settings.theme : "theme-win95";
  document.getElementById("theme-selector").value = activeTheme;

  // Cambia el look del panel
  document.body.className = activeTheme;

  // Cambiar el título superior del panel de control
  const panelTitle = document.getElementById("panel-title");
  if (activeTheme === "theme-win95")
    panelTitle.innerText = "Versus_Admin_v1.exe";
  else if (activeTheme === "theme-modern")
    panelTitle.innerText = "Admin Dashboard Control";
  else if (activeTheme === "theme-modern-light")
    panelTitle.innerText = "Panel de Control";
  else if (activeTheme === "theme-neon")
    panelTitle.innerText = "SYS_ADMIN // OVERRIDE";
  else if (activeTheme === "theme-pastel")
    panelTitle.innerText = "✧ Stream Admin ✧";
  else if (activeTheme === "theme-stone")
    panelTitle.innerText = "Colosseum Admin";
  else if (activeTheme === "theme-laser")
    panelTitle.innerText = "LASER_COMMAND_CTR";

  // Sincronizar Título Personalizado
  const customTitle =
    data.settings && data.settings.customTitle !== undefined
      ? data.settings.customTitle
      : "Online_Match.exe";

  // Solo reescribe el valor si el usuario no está tecleando activamente en ese campo
  const titleInput = document.getElementById("custom-title");
  if (document.activeElement !== titleInput) {
    titleInput.value = customTitle;
  }

  // Sincronizar Diseño Vertical
  const verticalMode =
    data.settings && data.settings.verticalMode !== undefined
      ? data.settings.verticalMode
      : false;
  document.getElementById("toggle-vertical").checked = verticalMode;

  // --- SINCRONIZAR COLOR Y VARIABLES CSS ---
  // 1. Definir cuál es el tema actual leyendo de Firebase
  const themeActual =
    data.settings && data.settings.theme ? data.settings.theme : "theme-modern";

  // 2. Cargar las opciones correctas pasándole el tema
  cargarVariantesDeColor(themeActual);

  // 3. Obtener el color guardado
  let savedColor =
    data.settings && data.settings.accentColor
      ? data.settings.accentColor.toLowerCase()
      : paletasDeColor[themeActual][0].hex.toLowerCase();

  // 3.1 Aplicar el color principal a una variable CSS global (como antes)
document.documentElement.style.setProperty('--main-color', savedColor);

// 3.2 LÓGICA CONDICIONAL: Determinar colores relativos para el tema Neón
let playerNameColor, vsColor;

if (themeActual === 'theme-neon') {
    // Si el color principal es rosa magenta (independientemente de la variante exacta, chequeamos por rosa genérico)
    if (savedColor === '#ff00ff' || savedColor === '#f0f') {
        playerNameColor = '#00ffff'; // Azul Cian para nombres si el neón es rosa
        vsColor = '#ffea00';        // Amarillo para VS
    } else {
        // Para cualquier otro color de neón (cian por defecto, verde, etc.)
        playerNameColor = '#f0f';    // Rosa Magenta para nombres
        vsColor = '#ffea00';        // Amarillo para VS
    }
} else {
    // Para otros temas (Moderno, Pastel, etc.), podemos definir lógicas similares o colores fijos si prefieres
    // De momento, mantengamos los valores predeterminados para no romper los otros temas
    playerNameColor = 'var(--main-color)'; // O lo que uses por defecto
    vsColor = 'var(--text-on-accent)';    // O lo que uses por defecto
}

// 3.3 Aplicar los colores relativos inteligentes a nuevas variables CSS
document.documentElement.style.setProperty('--player-name-color', playerNameColor);
document.documentElement.style.setProperty('--vs-color', vsColor);

  // 4. Seleccionar la opción en el menú (sin interrumpir)
  const variantSelect = document.getElementById("theme-variant");
  if (document.activeElement !== variantSelect) {
    variantSelect.value = savedColor;
  }

  // 5. Calcular contraste y aplicar a toda la página
  function getContrastColor(hex) {
    hex = hex.replace("#", "");
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    const yiq = (r * 299 + g * 587 + b * 114) / 1000;
    return yiq >= 128 ? "#000000" : "#ffffff";
  }

  const textColor = getContrastColor(savedColor);
  document.documentElement.style.setProperty("--main-color", savedColor);
  document.documentElement.style.setProperty("--text-on-accent", textColor);

});

// Función que detecta el cambio de tema y asigna un título predeterminado
function cambiarTemaAutomatico() {
  const theme = document.getElementById("theme-selector").value;
  const titleInput = document.getElementById("custom-title");
  const currentTitle = titleInput.value.trim();

  // 1. Definimos cuáles son los títulos "de fábrica"
  const titulosPredeterminados = [
    "Live_Match.exe",
    "Online Matching",
    "Live Stream",
    "VERSUS",
    "♡ Sweet Match ♡",
    "EPIC DUEL",
    "LASER // DEATHMATCH",
    "", // También consideramos "vacío" como predeterminado para que lo llene
  ];

  // 2. Verificamos si el usuario tiene un título de fábrica o uno propio
  const esTituloDeFabrica = titulosPredeterminados.includes(currentTitle);

  // 3. SOLO si es de fábrica, le aplicamos el nuevo título del tema
  if (esTituloDeFabrica) {
    if (theme === "theme-win95") titleInput.value = "Live_Match.exe";
    else if (theme === "theme-modern") titleInput.value = "Online Matching";
    else if (theme === "theme-modern-light")
      titleInput.value = "Online Matching";
    else if (theme === "theme-neon") titleInput.value = "VERSUS";
    else if (theme === "theme-pastel") titleInput.value = "♡ Sweet Match ♡";
    else if (theme === "theme-stone") titleInput.value = "EPIC DUEL";
    else if (theme === "theme-laser") titleInput.value = "LASER // DEATHMATCH";
  }

  // Guardamos los cambios inmediatamente
  cargarVariantesDeColor();
  updateSettings();
}

// Memoria para saber qué opciones están cargadas actualmente
let temaVariantesActual = "";

// Función que inyecta las opciones SOLO si el tema cambió
function cargarVariantesDeColor(temaFuerza = null) {
  const theme = temaFuerza || document.getElementById("theme-selector").value;
  const variantSelect = document.getElementById("theme-variant");

  // LA MAGIA: Si las opciones de este tema ya están dibujadas, no las borres.
  if (temaVariantesActual === theme && variantSelect.options.length > 0) return;

  // Si es un tema nuevo, guardamos en memoria y procedemos
  temaVariantesActual = theme;
  const colores = paletasDeColor[theme] || paletasDeColor["theme-modern"];

  // Limpiar las opciones anteriores
  variantSelect.innerHTML = "";

  // Crear las nuevas opciones
  colores.forEach((color) => {
    const option = document.createElement("option");
    option.value = color.hex.toLowerCase(); // Forzamos a minúsculas
    option.innerText = color.nombre;
    variantSelect.appendChild(option);
  });
}

// Función para guardar la configuración global
function updateSettings() {
  const show = document.getElementById("toggle-photos").checked;
  const swap = document.getElementById("toggle-swap").checked; // Capturamos el nuevo checkbox
  const theme = document.getElementById("theme-selector").value; // Capturamos el tema seleccionado
  const title = document.getElementById("custom-title").value; // Capturamos el título
  const vertical = document.getElementById("toggle-vertical").checked; // Capturamos el nuevo checkbox
  //const accentColor = document.getElementById('theme-color').value; // Capturamos el nuevo color del tema
  const accentColor = document.getElementById("theme-variant").value; // Capturamos la variante de color seleccionada

  db.child("settings").update({
    showPhotos: show,
    swapPlayers: swap, // Lo guardamos en Firebase
    theme: theme, // Lo guardamos en Firebase
    customTitle: title, // Lo enviamos a Firebase
    verticalMode: vertical, // Lo enviamos a Firebase
    accentColor: accentColor,
  });
}

// Función para actualizar Nombre y Foto
function updateInfo(player) {
  const name = document.getElementById(player + "-name").value;
  const photo = document.getElementById(player + "-photo").value;

  // Usamos .update para no borrar el puntaje actual
  db.child(player).update({
    name: name || "Player", // Si está vacío, pone Player
    photo: photo || "", // Si está vacío, queda sin foto
  });
}
// Función para procesar, comprimir y convertir la imagen a Base64
function comprimirImagen(event, player) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();

  // Cuando el archivo local se termina de leer...
  reader.onload = function (e) {
    const img = new Image();

    // Cuando la imagen se carga en memoria...
    img.onload = function () {
      // 1. Creamos un canvas virtual
      const canvas = document.createElement("canvas");
      const size = 150; // Redimensionamos a 150x150px (suficiente para el overlay)
      canvas.width = size;
      canvas.height = size;

      const ctx = canvas.getContext("2d");

      // 2. Rellenamos con fondo blanco (por si suben PNGs transparentes)
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, size, size);

      // 3. Dibujamos la imagen estirada al cuadro
      ctx.drawImage(img, 0, 0, size, size);

      // 4. Convertimos el canvas a texto Base64 (JPEG al 70% de calidad)
      const base64String = canvas.toDataURL("image/jpeg", 0.7);

      // 5. Metemos ese texto en el input oculto que ya teníamos
      document.getElementById(player + "-photo").value = base64String;

      // 6. Mostrar la vista previa en el panel de control
      const previewImg = document.getElementById("preview-" + player);
      previewImg.src = base64String;
      previewImg.style.display = "block";

      // Feedback visual retro
      console.log(`Imagen de ${player} procesada y lista para subir.`);
    };

    img.src = e.target.result;
  };

  reader.readAsDataURL(file);
}

// Función para Puntos (ahora busca dentro de /score)
function changeScore(player, amount) {
  db.child(player + "/score").transaction((score) => (score || 0) + amount);
}

// Construir la URL absoluta para el overlay (sin el tema, porque el overlay lo toma de Firebase) y mostrarla en el input para que el usuario la copie fácilmente
const baseURL =
  window.location.origin + window.location.pathname.replace("control.html", "");
const finalOverlayURL = `${baseURL}overlay.html?room=${currentRoom}`;
document.getElementById("overlayLink").value = finalOverlayURL;
// Construir el link permanente (control.html?room=mistream)
const finalPermanentURL = `${baseURL}control.html?room=${currentRoom}`;
document.getElementById("permanentLink").value = finalPermanentURL;

// Función para copiar al portapapeles con feedback visual
function copiarLink() {
  const linkInput = document.getElementById("overlayLink");
  const btn = document.getElementById("btnCopiar");

  // Usamos la API nativa del navegador
  navigator.clipboard
    .writeText(linkInput.value)
    .then(() => {
      // Feedback visual: Cambiamos el texto temporalmente
      const textoOriginal = btn.innerHTML;
      btn.innerHTML =
        "✅ ¡Copiado! Pega este link en tu software de streaming.";
      btn.style.color = "green"; // Un toque de color para confirmar

      // Regresamos al estado original después de 5 segundos
      setTimeout(() => {
        btn.innerHTML = textoOriginal;
        btn.style.color = "";
      }, 5000);
    })
    .catch((err) => {
      console.error("Error al copiar al portapapeles: ", err);
      alert(
        "Tu navegador bloqueó la acción. Por favor, selecciona el texto y cópialo manualmente.",
      );
    });
}

// Link permanente (control.html?room=mistream)
function copiarLinkPermanente() {
  const linkInput = document.getElementById("permanentLink");
  const btn = document.getElementById("btnCopiarPerm");

  navigator.clipboard
    .writeText(linkInput.value)
    .then(() => {
      const textoOriginal = btn.innerHTML;
      btn.innerHTML =
        "✅ ¡Copiado! Guarda este link para administrar tu sala en el futuro.";
      btn.style.color = "green";

      setTimeout(() => {
        btn.innerHTML = textoOriginal;
        btn.style.color = "";
      }, 5000);
    })
    .catch((err) => {
      console.error("Error al copiar al portapapeles: ", err);
      alert(
        "Tu navegador bloqueó la acción. Por favor, selecciona el texto y cópialo manualmente.",
      );
    });
}

// Reset total
function resetAll() {
  if (confirm("¿Borrar todo?")) {
    db.set({
      p1: { name: "Player 1", score: 0, photo: "" },
      p2: { name: "Player 2", score: 0, photo: "" },
    });
  }
}
