// --- PEGA AQUÍ TU CONFIGURACIÓN DE FIREBASE ---
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
        //const db = firebase.database().ref('match_data'); // Cambié el nodo a 'match_data' para limpiar lo anterior NO MULTIUSUARIO

        // 1. Obtener el parámetro 'room' de la URL (ej: control.html?room=mistream)
        const urlParams = new URLSearchParams(window.location.search);
        const currentRoom = urlParams.get('room');

        // 2. Validación de seguridad básica
        if (!currentRoom) {
            alert("No se especificó ninguna sala. Redirigiendo al inicio...");
            window.location.href = "index.html"; // Regresa al login si intentan entrar directo
        }

        // Apuntar Firebase a la sala específica
        const db = firebase.database().ref(`rooms/${currentRoom}`);        

        // Sincronizar el panel con los datos existentes (Nombres, Fotos y Puntos - mostrar fotos o no)
        db.on('value', (snapshot) => {
            const data = snapshot.val();
            if (data) {
                // Sincronizar Jugador 1
                if (data.p1) {
                    const p1Name = document.getElementById('p1-name');
                    const p1Photo = document.getElementById('p1-photo');
                    
                    if (document.activeElement !== p1Name) p1Name.value = data.p1.name || '';
                    if (document.activeElement !== p1Photo) {
                        p1Photo.value = data.p1.photo || '';
                        
                        // Mostrar vista previa si ya hay foto guardada
                        const previewP1 = document.getElementById('preview-p1');
                        if (data.p1.photo && data.p1.photo.length > 10) {
                            previewP1.src = data.p1.photo;
                            previewP1.style.display = 'block';
                        } else {
                            previewP1.style.display = 'none';
                        }
                    }
                    
                    // Actualizar el display del marcador P1
                    document.getElementById('p1-current-score').innerText = data.p1.score || 0;
                }

                // Sincronizar Jugador 2
                if (data.p2) {
                    const p2Name = document.getElementById('p2-name');
                    const p2Photo = document.getElementById('p2-photo');
                    
                    if (document.activeElement !== p2Name) p2Name.value = data.p2.name || '';
                    if (document.activeElement !== p2Photo) {
                        p2Photo.value = data.p2.photo || '';
                        
                        // Mostrar vista previa si ya hay foto guardada
                        const previewP2 = document.getElementById('preview-p2');
                        if (data.p2.photo && data.p2.photo.length > 10) {
                            previewP2.src = data.p2.photo;
                            previewP2.style.display = 'block';
                        } else {
                            previewP2.style.display = 'none';
                        }
                    }
                    
                    // Actualizar el display del marcador P2
                    document.getElementById('p2-current-score').innerText = data.p2.score || 0;
                }

                // Sincronizar el estado del checkbox y la UI
                const showPhotos = data.settings && data.settings.showPhotos !== undefined 
                                   ? data.settings.showPhotos 
                                   : true; // Por defecto encendido
                
                // Actualiza el checkbox visualmente
                document.getElementById('toggle-photos').checked = showPhotos;

                // Oculta o muestra los campos de texto para las URLs
                const displayStyle = showPhotos ? 'block' : 'none';
                document.getElementById('photo-input-p1').style.display = displayStyle;
                document.getElementById('photo-input-p2').style.display = displayStyle;
            }

            // Sincronizar el estado del checkbox de intercambio
            const swapPlayers = data.settings && data.settings.swapPlayers !== undefined 
                                ? data.settings.swapPlayers 
                                : false; // Por defecto apagado (P1 a la izquierda)
                
            document.getElementById('toggle-swap').checked = swapPlayers;

            // Sincronizar el selector de temas
                const activeTheme = data.settings && data.settings.theme ? data.settings.theme : 'theme-win95';
                document.getElementById('theme-selector').value = activeTheme;
                
                // Opcional: También puedes hacer que el panel cambie de tema
                document.body.className = activeTheme;
        });

        // Función para guardar la configuración global
        function updateSettings() {
            const show = document.getElementById('toggle-photos').checked;
            const swap = document.getElementById('toggle-swap').checked; // Capturamos el nuevo checkbox
            const theme = document.getElementById('theme-selector').value; // Capturamos el tema seleccionado
    
            db.child('settings').update({ 
                showPhotos: show,
                swapPlayers: swap, // Lo guardamos en Firebase
                theme: theme // Lo guardamos en Firebase
            });
        }

        // Función para actualizar Nombre y Foto
        function updateInfo(player) {
            const name = document.getElementById(player + '-name').value;
            const photo = document.getElementById(player + '-photo').value;

            // Usamos .update para no borrar el puntaje actual
            db.child(player).update({
                name: name || "Player", // Si está vacío, pone Player
                photo: photo || ""      // Si está vacío, queda sin foto
            });
        }
        // Función para procesar, comprimir y convertir la imagen a Base64
        function comprimirImagen(event, player) {
            const file = event.target.files[0];
            if (!file) return;

            const reader = new FileReader();
    
            // Cuando el archivo local se termina de leer...
            reader.onload = function(e) {
                const img = new Image();
        
                // Cuando la imagen se carga en memoria...
                img.onload = function() {
                    // 1. Creamos un canvas virtual
                    const canvas = document.createElement('canvas');
                    const size = 150; // Redimensionamos a 150x150px (suficiente para el overlay)
                    canvas.width = size;
                    canvas.height = size;
            
                    const ctx = canvas.getContext('2d');
            
                    // 2. Rellenamos con fondo blanco (por si suben PNGs transparentes)
                    ctx.fillStyle = "#ffffff";
                    ctx.fillRect(0, 0, size, size);
            
                    // 3. Dibujamos la imagen estirada al cuadro
                    ctx.drawImage(img, 0, 0, size, size);
            
                    // 4. Convertimos el canvas a texto Base64 (JPEG al 70% de calidad)
                    const base64String = canvas.toDataURL('image/jpeg', 0.7);
            
                    // 5. Metemos ese texto en el input oculto que ya teníamos
                    document.getElementById(player + '-photo').value = base64String;

                    // 6. Mostrar la vista previa en el panel de control
                    const previewImg = document.getElementById('preview-' + player);
                    previewImg.src = base64String;
                    previewImg.style.display = 'block';
            
                    // Feedback visual retro
                    console.log(`Imagen de ${player} procesada y lista para subir.`);
                };
        
                img.src = e.target.result;
            };
    
            reader.readAsDataURL(file);
        }        

        // Función para Puntos (ahora busca dentro de /score)
        function changeScore(player, amount) {
            db.child(player + '/score').transaction((score) => (score || 0) + amount);
        }

        // Construir la URL absoluta para el overlay
        const baseURL = window.location.origin + window.location.pathname.replace('control.html', '');
        const finalOverlayURL = `${baseURL}overlay.html?room=${currentRoom}`;
        document.getElementById('overlayLink').value = finalOverlayURL;
        // Construir el link permanente (control.html?room=mistream)
        const finalPermanentURL = `${baseURL}control.html?room=${currentRoom}`;
        document.getElementById('permanentLink').value = finalPermanentURL;

        // Función para copiar al portapapeles con feedback visual
        function copiarLink() {
        const linkInput = document.getElementById('overlayLink');
        const btn = document.getElementById('btnCopiar');
    
        // Usamos la API nativa del navegador
        navigator.clipboard.writeText(linkInput.value)
            .then(() => {
                // Feedback visual: Cambiamos el texto temporalmente
                const textoOriginal = btn.innerHTML;
                btn.innerHTML = "✅ ¡Copiado! Pega este link en tu software de streaming.";
                btn.style.color = "green"; // Un toque de color para confirmar
            
                // Regresamos al estado original después de 5 segundos
                setTimeout(() => {
                    btn.innerHTML = textoOriginal;
                    btn.style.color = "";
                }, 5000);
            })
            .catch(err => {
                console.error('Error al copiar al portapapeles: ', err);
                alert("Tu navegador bloqueó la acción. Por favor, selecciona el texto y cópialo manualmente.");
            });
        }

        // Link permanente (control.html?room=mistream)
        function copiarLinkPermanente() {
            const linkInput = document.getElementById('permanentLink');
            const btn = document.getElementById('btnCopiarPerm');
        
            navigator.clipboard.writeText(linkInput.value)
                .then(() => {
                    const textoOriginal = btn.innerHTML;
                    btn.innerHTML = "✅ ¡Copiado! Guarda este link para administrar tu sala en el futuro.";
                    btn.style.color = "green";
            
                    setTimeout(() => {
                        btn.innerHTML = textoOriginal;
                        btn.style.color = "";
                    }, 5000);
                })
                .catch(err => {
                    console.error('Error al copiar al portapapeles: ', err);
                    alert("Tu navegador bloqueó la acción. Por favor, selecciona el texto y cópialo manualmente.");
                });
        }

        // Reset total
        function resetAll() {
            if(confirm("¿Borrar todo?")) {
                db.set({
                    p1: { name: "Player 1", score: 0, photo: "" },
                    p2: { name: "Player 2", score: 0, photo: "" }
                });
            }
        }