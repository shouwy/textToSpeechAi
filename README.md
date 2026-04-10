# 📚 WebNovel Reader — Text-to-Speech AI

A full-stack web application for reading and listening to webnovel chapters from any URL (e.g. NovelFrance).

> ⚠️ **For personal use only.** You provide the chapter URL; the app fetches and reads it. No copyrighted content is stored server-side.

---

## ✨ Features

| Feature | Description |
|---|---|
| 🔗 URL input | Paste any chapter URL to load its content |
| 📖 Clean reader | Extracts main text, removes ads & navigation |
| 🔊 Text-to-Speech | ElevenLabs → Google TTS → Web Speech API fallback |
| ⏯️ Full controls | Play / Pause / Stop, speed slider, voice selection |
| ↔️ Navigation | Auto-detects next/previous chapter links |
| 🖍️ Highlighting | Current paragraph highlighted during playback |

---

## 🏗️ Architecture

```
/backend   — Spring Boot 3 (Java 17) REST API
/frontend  — Angular 19 + Angular Material SPA
```

### Backend endpoints

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/api/extract` | Fetches + parses chapter HTML via Jsoup |
| `POST` | `/api/tts` | Synthesizes audio (ElevenLabs or Google) |
| `GET`  | `/api/tts/engine` | Returns the active TTS engine name |

### TTS strategy (priority order)

1. **ElevenLabs** — if `elevenlabs.api-key` is set
2. **Google Cloud TTS** — if `google.tts.api-key` is set
3. **Web Speech API** — 100% free browser fallback (no key needed)

---

## 🚀 Getting Started

### Prerequisites

- Java 17+
- Maven 3.9+
- Node.js 18+ / npm
- Angular CLI 19+

### 1. Clone the repository

```bash
git clone https://github.com/shouwy/textToSpeechAi.git
cd textToSpeechAi
```

### 2. Configure API keys (optional)

Edit `backend/src/main/resources/application.properties`:

```properties
# ElevenLabs (free tier at https://elevenlabs.io)
elevenlabs.api-key=YOUR_ELEVENLABS_API_KEY

# Google Cloud TTS (free tier, enable at https://console.cloud.google.com)
google.tts.api-key=YOUR_GOOGLE_API_KEY
```

> Leave both blank to use the **Web Speech API** browser fallback (no key needed).

### 3. Start the backend

```bash
cd backend
mvn spring-boot:run
```

The API is available at `http://localhost:8080`.

### 4. Start the frontend

```bash
cd frontend
npm install
ng serve
```

Open `http://localhost:4200` in your browser.

---

## 🧪 Running tests

### Backend

```bash
cd backend
mvn test
```

### Frontend

```bash
cd frontend
ng test --watch=false
```

---

## 🔧 Configuration reference

All settings are in `backend/src/main/resources/application.properties`:

| Property | Default | Description |
|---|---|---|
| `server.port` | `8080` | HTTP port |
| `cors.allowed-origins` | `http://localhost:4200` | Allowed frontend origins |
| `jsoup.timeout` | `10000` | HTTP timeout (ms) for page fetch |
| `jsoup.max-text-length` | `100000` | Max characters extracted per chapter |
| `elevenlabs.api-key` | *(empty)* | ElevenLabs API key |
| `google.tts.api-key` | *(empty)* | Google Cloud TTS API key |

---

## 📦 Tech stack

### Backend

- Java 17 + Spring Boot 3.2
- [Jsoup](https://jsoup.org/) — HTML parsing
- Lombok — boilerplate reduction
- Maven

### Frontend

- Angular 19
- Angular Material (Indigo/Pink theme)
- RxJS — reactive state management
- TypeScript (strict mode)
- Vitest — unit tests

---

## 📁 Project structure

```
backend/
  src/main/java/com/tts/
    controller/   ExtractController, TtsController
    service/      ExtractService, TtsService, ElevenLabsService, GoogleTtsService
    dto/          ExtractRequest, ExtractResponse, TtsRequest
    config/       CorsConfig, AppConfig

frontend/src/app/
  components/
    url-input/    URL input + load button
    reader/       Chapter title + paragraphs with highlight
    audio-player/ Play/Pause/Stop, speed, engine & voice selectors
    navigation/   Previous / Next chapter buttons
  services/
    chapter.ts    Fetches chapters from backend
    tts.ts        Manages TTS engine selection
    audio.ts      Abstracts HTMLAudioElement + Web Speech API
  models/
    chapter.model.ts
    tts.model.ts
  environments/
    environment.ts       (dev)
    environment.prod.ts  (prod)
```

---

## 🔐 Security notes

- URL validation is enforced server-side (http/https only, no file:// etc.)
- Jsoup connection timeout prevents slow-loris attacks
- Text extraction is capped at `jsoup.max-text-length` characters
- TTS text input is capped at 5 000 characters per request
- CORS is restricted to configured origins
