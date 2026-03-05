const firebaseConfig = {
            apiKey: "AIzaSyAcB2svnoMb1YOKQmwrrAa9i9vbSqxNprw",
            authDomain: "score-w95.firebaseapp.com",
            databaseURL: "https://score-w95-default-rtdb.firebaseio.com",
            projectId: "score-w95",
            storageBucket: "score-w95.firebasestorage.app",
            messagingSenderId: "244357143300",
            appId: "1:244357143300:web:e30629d5dbf0034f5bce51",
            measurementId: "G-R8VN2XHYM4"
        };

        if (!firebase.apps.length) firebase.initializeApp(firebaseConfig);
        // db = firebase.database().ref('match_data'); NO MULTIUSUARIO, SOLO UN MATCH ACTIVO

        // 1. Obtener el parámetro 'room' de la URL (ej: control.html?room=mistream)
        const urlParams = new URLSearchParams(window.location.search);
        const currentRoom = urlParams.get('room');

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
        db.on('value', (snapshot) => {
            const data = snapshot.val();
            if (data) {
                // Actualizar jugadores
                updatePlayer('p1', data.p1);
                updatePlayer('p2', data.p2);

                // Controlar el modo visual (con o sin fotos)
                const showPhotos = data.settings && data.settings.showPhotos !== undefined 
                                   ? data.settings.showPhotos 
                                   : true;
                
                // Controlar la posición de los jugadores (Swap)
                const swapPlayers = data.settings && data.settings.swapPlayers !== undefined 
                            ? data.settings.swapPlayers 
                            : false;
                
                // Aplicamos la clase al contenedor que envuelve a los jugadores y el "VS"
                const contentDiv = document.querySelector('.content');
                
                if (swapPlayers) {
                    contentDiv.classList.add('jugadores-invertidos'); // P2 - VS - P1
                } else {
                    contentDiv.classList.remove('jugadores-invertidos'); // P1 - VS - P2
                }
                
                if (showPhotos) {
                    contentDiv.classList.remove('modo-texto'); // Se ven los cuadros y fotos
                } else {
                    contentDiv.classList.add('modo-texto');    // Desaparecen los cuadros, se centra el texto
                }
                
                // Seleccionamos todos los marcos de fotos y los ocultamos/mostramos
                const photoFrames = document.querySelectorAll('.photo-frame');
                photoFrames.forEach(frame => {
                    frame.style.display = showPhotos ? 'flex' : 'none';
                });
            }

            // Controlar el tema visual
                const activeTheme = data.settings && data.settings.theme ? data.settings.theme : 'theme-win95';
                document.body.className = activeTheme; // Cambia la clase del <body>

            // Controlar el texto del título
                const customTitle = data.settings && data.settings.customTitle !== undefined 
                                    ? data.settings.customTitle 
                                    : 'Online_Match.exe';
                
                document.getElementById('overlay-title').innerText = customTitle;    
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
                // Inyectamos la clase
                scoreElement.classList.add('score-animating');
                
                // Le quitamos la clase 300 milisegundos después para que regrese a la normalidad
                setTimeout(() => {
                    scoreElement.classList.remove('score-animating');
                }, 300);
            }
            
            // Actualizamos el texto en pantalla y la memoria
            scoreElement.innerText = currentScore;
            lastScores[id] = currentScore;
        }     