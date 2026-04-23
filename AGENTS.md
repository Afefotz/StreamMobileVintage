# Agent Guide: ScoreVS Widget

## Architecture
- **Flow**: `index.html` (Room/Theme creation) → `control.html` (Admin Panel) → `overlay.html` (OBS Display).
- **Data Sync**: Uses Firebase Realtime Database for instantaneous updates across pages.
- **Images**: Processed via `<canvas>` and stored as Base64 strings in Firebase to avoid external storage.
- **Theming**: Controlled via CSS classes applied to `<body>`. Themes are passed as URL parameters.

## OBS Dock Panel (dock.html)
An alternative control panel designed to be embedded directly in OBS as a Browser Source.

**Files:**
- `dock.html` — Minimal UI (300x400px viewport)
- `dock.css` — Compact styles
- `dock.js` — Firebase sync + hotkeys + image compression

**Features:**
- Inline name editing (dblclick on overlay names)
- Clickable photos (opens file picker)
- Local hotkeys for score control
- BroadcastChannel sync with overlay for ultra-low latency

**URL Parameters:** `dock.html?room=TUSALA` (e.g., `dock.html?room=Mistream-a1b2`)

**Dock Hotkeys:**
| Shortcut | Action |
|----------|--------|
| `Ctrl+1` | P1 +1 |
| `Ctrl+Shift+1` | P1 -1 |
| `Ctrl+2` | P2 +1 |
| `Ctrl+Shift+2` | P2 -1 |
| `KeyR` | Reset both scores |

**OBS Integration:**
1. Create `dock.html?room=TUSALA` as a Browser Source
2. Set dimensions to 300x400px
3. Configure OBS global hotkeys to send clicks to dock buttons for global score control

## Critical Configuration
- **Firebase**: Update `firebaseConfig` object in BOTH `control.html` and `overlay.html`.
- **Database Rules**: Firebase Realtime Database must have the following rules:
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
- **URL Parameters**: Ensure `control.html` and `overlay.html` are accessed with the correct `room` and `theme` parameters (e.g., `control.html?room=test-a1b2`).
- **Database Structure**: Each room's data is stored under `rooms/{room_id}` with fields for players and settings.
  ``` json
  {
  "rooms": {
    "afefotz-8f4g": {
      "p1": {
        "name": "Afefotz",
        "photo": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/4gHYJ//Z",
        "score": 0
      },
      "p2": {
        "name": "Fefemz",
        "photo": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/4gHYEH/2Q==",
        "score": 0
      },
      "settings": {
        "accentColor": "#c0c0c0",
        "colors": {
          "bg": "#fdfdfd",
          "primary": "#1e548f",
          "score": "#ffffff",
          "secondary": "#fdfdfd",
          "text": "#333333",
          "window": "rgba(255,255,255,0.85)"
        },
        "customTitle": "Liga S Potosina - Semana 10",
        "opacity": 100,
        "orientation": "vertical",
        "showPhotos": true,
        "swapPlayers": true,
        "theme": "theme-win95",
        "variant": "Clásico Win95",
        "verticalMode": false
      }
    },
    "asav-bw0x": {
      "p1": {
        "name": "AsaV",
        "photo": "data:image/jpeg;base64,/9j/4AAgD//Z",
        "score": 4
      },
      "p2": {
        "name": "Gabbytha",
        "photo": "data:image/jpeg;base64,/9j/4AAQQB//Z",
        "score": 12
      },
      "settings": {
        "accentColor": "#00e676",
        "customTitle": "Liga B - Semana 8",
        "opacity": 100,
        "showPhotos": true,
        "swapPlayers": false,
        "theme": "theme-modern",
        "variant": "Azul Rey",
        "verticalMode": false
      }
    }
  }
}
  ```

## Development & Verification
- **Execution**: No build step required (Vanilla JS/HTML/CSS). Open files via a local server (e.g., Live Server) or upload to Vercel/GH Pages.
- **Manual Testing**: 
  1. Create a room in `index.html`.
  2. Open the resulting `control.html` link.
  3. Open the corresponding `overlay.html` link (or the "Enlace para OBS") in a separate window to verify real-time sync.
- **Room IDs**: Generated as `roomname-random4chars` (e.g., `test-a1b2`).

## Conventions
- **Styling**: Avoid adding external image assets for themes; use CSS gradients and SVG filters as per existing theme patterns.
- **Validation**: Room names must be alphanumeric and cannot contain spaces.
