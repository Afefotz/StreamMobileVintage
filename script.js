function updateClock() {
            const now = new Date();
            
            // Formatear hora
            const hours = String(now.getHours()).padStart(2, '0');
            const minutes = String(now.getMinutes()).padStart(2, '0');
            const seconds = String(now.getSeconds()).padStart(2, '0');
            document.getElementById('time').textContent = `${hours}:${minutes}:${seconds}`;

            // Formatear fecha
            const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
            document.getElementById('date').textContent = now.toLocaleDateString('es-ES', options);
        }

        // Actualizar cada segundo
        setInterval(updateClock, 1000);
        
        // Llamada inicial para evitar el retraso de 1 segundo
        updateClock();