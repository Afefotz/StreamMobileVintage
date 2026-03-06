function generarLinks() {
  // 1. Obtenemos el texto original (solo quitando espacios al inicio y al final)
  const rawInput = document.getElementById("roomName").value.trim();

  // 2. VALIDACIÓN: ¿Hay espacios en medio del texto?
  if (rawInput.includes(" ")) {
    alert(
      "⚠️ El nombre de la sala no puede contener espacios. Por favor, únelo (ej: Fefemzmamadisimopro).",
    );
    return; // Detenemos la ejecución aquí, no se genera la sala
  }

  // 3. Obtenemos el valor y lo limpiamos (solo letras y números)
  let room = document.getElementById("roomName").value.trim().toLowerCase();
  room = room.replace(/[^a-z0-9]/g, "");

  // Capturamos el tema elegido
  const selectedTheme = document.getElementById("start-theme").value;

  // 4. Generamos la sala si quedó texto válido
  if (room.length > 0) {
    // 1. Generamos el sufijo aleatorio de 4 caracteres alfanuméricos
    const randomPin = Math.random().toString(36).substring(2, 6);

    // 2. Unimos el nombre con el pin (ej. torneo2026-a7b2)
    const uniqueRoom = `${room}-${randomPin}`;

    // 3. Redirigimos al panel de control pasando parámetros únicos en la URL (sala y tema)
    window.location.href = `control.html?room=${uniqueRoom}&theme=${selectedTheme}`;
  } else {
    alert("Por favor ingresa un nombre válido (solo letras y números).");
  }
}

// Permite presionar "Enter" para generar la sala
document.getElementById("roomName").addEventListener("keypress", function (e) {
  if (e.key === "Enter") {
    generarLinks();
  }
});

// Función para cambiar el tema en tiempo real en el Index
function cambiarTemaPreview() {
  const selectedTheme = document.getElementById("start-theme").value;
  document.body.className = selectedTheme;
}

// Ejecutar la vista previa apenas cargue la página
window.onload = function () {
  cambiarTemaPreview();
};
