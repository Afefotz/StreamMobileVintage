function generarLinks() {
            // 1. Obtenemos el valor y lo limpiamos (solo letras y números)
            let room = document.getElementById('roomName').value.trim().toLowerCase();
            room = room.replace(/[^a-z0-9]/g, ''); 

            if(room.length > 0) {
                // 2. Generamos el sufijo aleatorio de 4 caracteres alfanuméricos
                const randomPin = Math.random().toString(36).substring(2, 6);
                
                // 3. Unimos el nombre con el pin (ej. torneo2026-a7b2)
                const uniqueRoom = `${room}-${randomPin}`;
                
                // 4. Redirigimos al panel de control pasando la sala única en la URL
                window.location.href = `control.html?room=${uniqueRoom}`;
            } else {
                alert("Por favor ingresa un nombre válido (solo letras y números).");
            }
        }

        // Permite presionar "Enter" para generar la sala
        document.getElementById('roomName').addEventListener('keypress', function (e) {
            if (e.key === 'Enter') {
                generarLinks();
            }
        });