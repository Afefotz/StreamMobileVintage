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
// db = firebase.database().ref('match_data'); NO MULTIUSUARIO, SOLO UN MATCH ACTIVO

// 1. Obtener el parámetro 'room' de la URL (ej: control.html?room=mistream)
const urlParams = new URLSearchParams(window.location.search);
const currentRoom = urlParams.get("room");

// 2. Validación de seguridad básica
if (!currentRoom) {
  alert("No se especificó ninguna sala. Redirigiendo al inicio...");
  window.location.href = "index.html"; // Regresa al login si intentan entrar directo
}

// 3. Apuntar Firebase a la sala específica
const db = firebase.database().ref(`rooms/${currentRoom}`);

// Memoria para saber si el puntaje subió
let lastScores = { p1: 0, p2: 0 };

// Escuchar cambios
db.on("value", (snapshot) => {
  const data = snapshot.val();
  if (data) {
    // Actualizar jugadores
    updatePlayer("p1", data.p1);
    updatePlayer("p2", data.p2);

    // Controlar el modo visual (con o sin fotos)
    const showPhotos =
      data.settings && data.settings.showPhotos !== undefined
        ? data.settings.showPhotos
        : true;

    // Controlar la posición de los jugadores (Swap)
    const swapPlayers =
      data.settings && data.settings.swapPlayers !== undefined
        ? data.settings.swapPlayers
        : false;

    // Aplicamos la clase al contenedor que envuelve a los jugadores y el "VS"
    const contentDiv = document.querySelector(".content");

    if (swapPlayers) {
      contentDiv.classList.add("jugadores-invertidos"); // P2 - VS - P1
    } else {
      contentDiv.classList.remove("jugadores-invertidos"); // P1 - VS - P2
    }

    if (showPhotos) {
      contentDiv.classList.remove("modo-texto"); // Se ven los cuadros y fotos
    } else {
      contentDiv.classList.add("modo-texto"); // Desaparecen los cuadros, se centra el texto
    }

    // Controlar el modo vertical
    const verticalMode =
      data.settings && data.settings.verticalMode !== undefined
        ? data.settings.verticalMode
        : false;

    if (verticalMode) {
      contentDiv.classList.add("modo-vertical");
    } else {
      contentDiv.classList.remove("modo-vertical");
    }

    // Seleccionamos todos los marcos de fotos y los ocultamos/mostramos
    const photoFrames = document.querySelectorAll(".photo-frame");
    photoFrames.forEach((frame) => {
      frame.style.display = showPhotos ? "flex" : "none";
    });
  }

  // Controlar el tema visual
  const activeTheme =
    data.settings && data.settings.theme ? data.settings.theme : "theme-win95";
  document.body.className = activeTheme; // Cambia la clase del <body>

  // Controlar el texto del título
  const customTitle =
    data.settings && data.settings.customTitle !== undefined
      ? data.settings.customTitle
      : "Online_Match.exe";

  document.getElementById("overlay-title").innerText = customTitle;

  // --- LEER E INYECTAR COLOR DINÁMICO ---
  const themeActual =
    data.settings && data.settings.theme ? data.settings.theme : "theme-modern";
  const savedColor =
    data.settings && data.settings.accentColor
      ? data.settings.accentColor.toLowerCase()
      : "#00ffff";

  // 1. Calcular contraste general (para barras de título, etc.)
  function getContrastColor(hex) {
    hex = hex.replace("#", "");
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    const yiq = (r * 299 + g * 587 + b * 114) / 1000;
    return yiq >= 128 ? "#000000" : "#ffffff";
  }
  const textColor = getContrastColor(savedColor);

  // 2. LÓGICA CONDICIONAL: Colores relativos para temas complejos
  let playerNameColor, vsColor;

  if (themeActual === "theme-neon") {
    // Si el color principal es rosa, los nombres van en cian
    if (savedColor === "#ff00ff" || savedColor === "#f0f") {
      playerNameColor = "#00ffff";
      vsColor = "#ffea00";
    } else {
      // Para cualquier otro color (ej. Cian, Verde), los nombres van en rosa
      playerNameColor = "#f0f";
      vsColor = "#ffea00";
    }
  } else {
    // Para los demás temas, mantenemos el comportamiento por defecto
    playerNameColor = savedColor;
    vsColor = textColor;
  }

// 3. Inyectar TODAS las variables al CSS del documento
  document.documentElement.style.setProperty("--main-color", savedColor);
  document.documentElement.style.setProperty("--text-on-accent", textColor);
  document.documentElement.style.setProperty("--player-name-color", playerNameColor);
  document.documentElement.style.setProperty("--vs-color", vsColor);

  // Aseguramos mantener la clase base (ej. theme-stone)
  document.body.className = themeActual; 

  // Agregamos la clase de textura dependiendo del color hexadecimal elegido
  if (themeActual === "theme-stone") {
    if (savedColor === "#cc5544") {
        document.body.classList.add("textura-ladrillo");
    } else if (savedColor === "#2b2b2b") {
        document.body.classList.add("textura-musgo");
    } else {
        document.body.classList.add("textura-volcanica");
    }
  }
  else if (themeActual === "theme-paper") {
    if (savedColor === "#fdfdfd") {
        document.body.classList.add("textura-cuaderno");
    } else if (savedColor === "#f4e8c1") {
        document.body.classList.add("textura-pergamino");
    } else if (savedColor === "#1e548f") {
        document.body.classList.add("textura-plano");
    }
  }
  else if (themeActual === "theme-metal") {
    if (savedColor === "#e0e5ec") {
        document.body.classList.add("textura-plata");
    } else if (savedColor === "#ffd700") {
        document.body.classList.add("textura-oro");
    } else if (savedColor === "#cd7f32") {
        document.body.classList.add("textura-bronce");
    }
  }

  const savedOpacity = data.settings && data.settings.opacity !== undefined ? data.settings.opacity : 100;
  document.documentElement.style.setProperty("--widget-opacity", savedOpacity / 100);

});

function updatePlayer(id, data) {
  if (!data) return;

  // Actualizar texto
  document.getElementById(`name-${id}`).innerText = data.name || "PLAYER";
  //document.getElementById(`score-${id}`).innerText = data.score || 0; Se agregó lógica de animación, así que esto se hace más abajo para comparar el puntaje nuevo con el anterior

  // Actualizar imagen
  const imgElement = document.getElementById(`img-${id}`);

  // Si hay foto guardada (ya sea un link http o un Base64 largo)
  if (data.photo && data.photo.length > 10) {
    imgElement.src = data.photo;
  } else {
    // Generamos un placeholder local con SVG (no requiere internet)
    // Usamos %23 en lugar de # para los colores hexadecimales en la URL
    const svgPlaceholder = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="50" height="50"><rect width="50" height="50" fill="%23cccccc"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="Arial" font-weight="bold" font-size="18px" fill="%23333333">${id.toUpperCase()}</text></svg>`;

    imgElement.src = svgPlaceholder;
  }

  // Lógica de Animación para el Marcador
  const currentScore = data.score || 0;
  const scoreElement = document.getElementById(`score-${id}`);

  // Si el puntaje nuevo es MAYOR al anterior, disparamos la animación
if (currentScore > lastScores[id]) {
    scoreElement.classList.add("score-animating");
    setTimeout(() => scoreElement.classList.remove("score-animating"), 500);
  } else {
    scoreElement.classList.remove("score-animating");
  }

scoreElement.innerText = currentScore;
  lastScores[id] = currentScore;
}

const bc = new BroadcastChannel('obs_score_sync');
let currentEditingPlayer = null;

bc.onmessage = (e) => {
    const { type, player, data } = e.data;
    if (type === 'photo-upload-request') {
        openPhotoPicker(player);
    }
};

function enableEdit(element, player) {
    element.contentEditable = "true";
    element.focus();
    currentEditingPlayer = player;
}

document.querySelectorAll('.player-name').forEach(el => {
    el.addEventListener('blur', () => {
        if (currentEditingPlayer && document.activeElement === el) {
            saveOverlayName(currentEditingPlayer);
        }
    });
    el.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            el.blur();
        }
    });
});

function saveOverlayName(player) {
    const nameEl = document.getElementById("name-" + player);
    const name = nameEl.textContent.trim() || "Player";
    db.child(player).update({ name });
    nameEl.contentEditable = "false";
    currentEditingPlayer = null;
}

function openPhotoPicker(player) {
    const input = document.getElementById("overlay-photo-input");
    input.setAttribute("data-player", player);
    input.click();
}

function handleOverlayPhotoUpload(event, player) {
    const file = event.target.files[0];
    if (!file || !player) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        const img = new Image();
        img.onload = function() {
            const canvas = document.createElement("canvas");
            const size = 150;
            canvas.width = size;
            canvas.height = size;
            const ctx = canvas.getContext("2d");
            ctx.fillStyle = "#ffffff";
            ctx.fillRect(0, 0, size, size);
            ctx.drawImage(img, 0, 0, size, size);
            const base64String = canvas.toDataURL("image/jpeg", 0.7);
            db.child(player).update({ photo: base64String });
        };
        img.src = e.target.result;
    };
    reader.readAsDataURL(file);
}

function triggerPhotoUpload(player) {
    bc.postMessage({ type: 'photo-upload-request', player });
}
