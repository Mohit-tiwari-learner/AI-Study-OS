# AI Study OS — Backend (Express + Gemini)

Tiny Node.js server that powers the 4 AI features in the app.

## 1. Setup

```bash
cd backend
npm install
cp .env.example .env
# open .env and paste your Gemini API key
# get one free at https://aistudio.google.com/app/apikey
```

## 2. Run

```bash
npm run dev      # auto-restart on changes
# or
npm start
```

Server runs at **http://localhost:5000**.

The frontend in this application automatically calls this URL.
To override (e.g. deployed backend), create a `.env.local` at the project root:

```
VITE_API_URL=https://your-backend.example.com
```

## 3. Endpoints

| Method | Path           | Body                                    | Returns |
|--------|----------------|-----------------------------------------|---------|
| POST   | `/api/notes`   | `{ text }`                              | `{ notes }` markdown |
| POST   | `/api/summary` | `{ notes }`                             | `{ summary, keyPoints[], questions[] }` |
| POST   | `/api/planner` | `{ syllabus, deadline, hoursPerDay }`   | `{ plan: [{ day, date, focus, tasks[] }] }` |
| POST   | `/api/doubt`   | `{ messages: [{role,content}], hinglish }` | `{ answer }` |

## 4. Model

Uses `gemini-1.5-flash` for speed + free tier. Change `MODEL` in `server.js` to `gemini-1.5-pro` for higher quality.
