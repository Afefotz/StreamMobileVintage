# Spec: OBS Dock Panel + Inline Editing

**Fecha:** 2026-04-23

---

## 1. Resumen

Crear un panel de control minimal (`dock.html`) que se integra en OBS como Browser Source, permitiendo controlar scores, nombres y fotos de jugadores sin salir de OBS. El overlay existente (`overlay.html`) se modifica para soportar edición inline directa.

---

## 2. Arquitectura

```
dock.html (OBS Browser Source - Panel de Control)
         ↓ Firebase
rooms/${room_id}/p1, p2, settings
         ↓ Firebase
overlay.html (OBS Browser Source - Visualización)
```

**Canales de comunicación:**
- Firebase Realtime Database como source of truth
- BroadcastChannel API para sync ultra-baja latencia entre tabs locales

---

## 3. Archivos

| Archivo | Acción | Descripción |
|---------|--------|-------------|
| `dock.html` | Crear | UI minimal para OBS dock (300x400px viewport) |
| `dock.css` | Crear | Estilos compactos del dock |
| `dock.js` | Crear | Firebase sync + hotkeys + compresión de imágenes |
| `overlay.html` | Modificar | Agregar `contenteditable` en nombres, `onclick` en fotos |
| `overlay.js` | Modificar | Handler para edición inline + BroadcastChannel listener |

---

## 4. Componentes UI del Dock

**Layout:**
```
┌────────────────────────────────┐
│ ScoreVS Dock    [room: xxx]    │
├────────────────────────────────┤
│ P1 [nombre editable]  [-][0][+]│
│ [foto clickeable]             │
├────────────────────────────────┤
│ P2 [nombre editable]  [-][0][+]│
│ [foto clickeable]             │
└────────────────────────────────┘
```

**Componentes:**

| Elemento | Tipo | Comportamiento |
|----------|------|----------------|
| Nombre jugador | `contenteditable` | `blur`/`Enter` → guarda a Firebase |
| Foto jugador | `<img>` clickeable | Click → abre `input:file` → comprimir → Base64 → Firebase |
| Score +/− | `<button>` | Click → `set()` a Firebase |
| Room ID badge | Display | Solo lectura |

---

## 5. Operaciones Firebase

| Acción | Path | Método |
|--------|------|--------|
| Update P1 name | `rooms/${room_id}/p1/name` | `set()` |
| Update P1 photo | `rooms/${room_id}/p1/photo` | `set()` |
| Update P1 score | `rooms/${room_id}/p1/score` | `set()` |
| Update P2 name | `rooms/${room_id}/p2/name` | `set()` |
| Update P2 photo | `rooms/${room_id}/p2/photo` | `set()` |
| Update P2 score | `rooms/${room_id}/p2/score` | `set()` |

---

## 6. Hotkeys (dock.js)

```javascript
const hotkeys = {
    'Control+1': () => changeScore('p1', 1),
    'Control+Shift+1': () => changeScore('p1', -1),
    'Control+2': () => changeScore('p2', 1),
    'Control+Shift+2': () => changeScore('p2', -1),
    'KeyR': () => resetScores()
};
```

**Nota:** Para hotkeys globales de OBS, el usuario configura en OBS atajos que envían clicks a los botones del dock.

---

## 7. Edición Inline en Overlay

**overlay.html cambios:**
- `player-name`: `contenteditable="false"` → `true` on dblclick
- `photo-frame`: `onclick="triggerPhotoUpload('pn')"` → envía evento al dock via BroadcastChannel

**Flujo:**
1. Usuario hace doble-click en nombre en overlay
2. Overlay habilita `contenteditable`, guarda foco
3. Usuario edita texto
4. `blur` o `Enter` → `set()` a Firebase → `contenteditable="false"`

---

## 8. Manejo de Errores

- **Firebase desconectado:** Indicator visual rojo en dock, guardar cambios en LocalStorage
- **Reconexión:** Resync desde LocalStorage
- **Timeout upload foto (10s):** Error inline, no guardar Base64 corrupto
- **Confirmación visual:** Flash verde 200ms en campo guardado, flash rojo en error

---

## 9. Rendimiento

- `contenteditable` con `transform` → 0% CPU idle
- No polling, solo eventos on-change
- Fotos comprimidas a max 100KB Base64
- Opacity usa CSS `opacity` (composited layer)

---

## 10. Dependencias

- Firebase JS SDK v8.10.0 (ya existente)
- Google Fonts: VT323, Great Vibes (ya existente)