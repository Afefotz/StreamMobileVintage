const firebaseConfig = {
    apiKey: "AIzaSyAcB2svnoMb1YOKQmwrrAa9i9vbSqxNprw",
    authDomain: "score-w95.firebaseapp.com",
    databaseURL: "https://score-w95-default-rtdb.firebaseio.com",
    projectId: "score-w95",
    storageBucket: "score-w95-firebasestorage.app",
    messagingSenderId: "244357143300",
    appId: "1:244357143300:web:e30629d5dbf0034f5bce51",
};

if (!firebase.apps.length) firebase.initializeApp(firebaseConfig);

const urlParams = new URLSearchParams(window.location.search);
const currentRoom = urlParams.get("room");

if (!currentRoom) {
    document.body.innerHTML = "<p style='padding:20px;color:red;'>No room specified. Add ?room=YOURROOM to URL</p>";
}

const db = firebase.database().ref(`rooms/${currentRoom}`);
let currentEditingPlayer = null;

document.getElementById("room-id").textContent = currentRoom;

const hotkeys = {
    'Control+1': () => changeScore('p1', 1),
    'Control+Shift+1': () => changeScore('p1', -1),
    'Control+2': () => changeScore('p2', 1),
    'Control+Shift+2': () => changeScore('p2', -1),
    'r': () => resetScores()
};

document.addEventListener('keydown', (e) => {
    const key = [
        e.ctrlKey ? 'Control' : '',
        e.shiftKey ? 'Shift' : '',
        e.key.length === 1 ? e.key.toLowerCase() : e.code
    ].filter(Boolean).join('+');
    const action = hotkeys[key];
    if (action) {
        e.preventDefault();
        action();
    }
});

db.on("value", (snapshot) => {
    const data = snapshot.val();
    if (!data) return;

    if (data.p1) {
        if (document.getElementById("name-p1") !== document.activeElement) {
            document.getElementById("name-p1").textContent = data.p1.name || "Player 1";
        }
        document.getElementById("score-p1").textContent = data.p1.score || 0;
        if (data.p1.photo && data.p1.photo.length > 10) {
            document.getElementById("img-p1").src = data.p1.photo;
        }
    }

    if (data.p2) {
        if (document.getElementById("name-p2") !== document.activeElement) {
            document.getElementById("name-p2").textContent = data.p2.name || "Player 2";
        }
        document.getElementById("score-p2").textContent = data.p2.score || 0;
        if (data.p2.photo && data.p2.photo.length > 10) {
            document.getElementById("img-p2").src = data.p2.photo;
        }
    }
});

function changeScore(player, amount) {
    db.child(player + "/score").transaction((score) => (score || 0) + amount);
    flashElement(document.getElementById("score-" + player), 'success');
}

function enableEdit(element, player) {
    element.contentEditable = "true";
    element.focus();
    currentEditingPlayer = player;
}

document.querySelectorAll('.player-name').forEach(el => {
    el.addEventListener('blur', () => {
        if (currentEditingPlayer) {
            saveName(currentEditingPlayer);
        }
    });
    el.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            el.blur();
        }
    });
});

function saveName(player) {
    const nameEl = document.getElementById("name-" + player);
    const name = nameEl.textContent.trim() || "Player";
    db.child(player).update({ name });
    nameEl.contentEditable = "false";
    flashElement(nameEl, 'success');
    currentEditingPlayer = null;
}

let pendingPhotoPlayer = null;

function openPhotoPicker(player) {
    const input = document.getElementById("photo-input");
    input.setAttribute("data-player", player);
    input.click();
}

function handlePhotoUpload(event, player) {
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
            document.getElementById("img-" + player).src = base64String;
            flashElement(document.getElementById("photo-" + player), 'success');
        };
        img.src = e.target.result;
    };
    reader.readAsDataURL(file);
}

function flashElement(el, type) {
    el.classList.remove('flash-success', 'flash-error');
    void el.offsetWidth;
    el.classList.add(type === 'success' ? 'flash-success' : 'flash-error');
}

function resetScores() {
    if (confirm("Reset both scores to 0?")) {
        db.update({ p1: { ...(db.p1 || {}), score: 0 }, p2: { ...(db.p2 || {}), score: 0 } });
    }
}

const connectedRef = firebase.database().ref(".info/connected");
connectedRef.on("value", (snap) => {
    const statusEl = document.getElementById("connection-status");
    if (snap.val() === true) {
        statusEl.textContent = "●";
        statusEl.className = "status-indicator connected";
    } else {
        statusEl.textContent = "●";
        statusEl.className = "status-indicator disconnected";
    }
});