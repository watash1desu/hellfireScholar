# Hellfire Backend Starter


This is a minimal backend for signup/login using Node + Express + MongoDB (Mongoose).


## Quick start


1. Create project folder and add files (see file list in the canvas).
2. Copy `.env.example` to `.env` and set values. If you prefer Atlas, paste your Atlas URI into MONGO_URI.
3. Install dependencies:
```bash
npm install
```
4. Start (dev):
```bash
npm run dev
```
5. Server will run on `http://localhost:4000` by default.


## Endpoints


- `POST /api/auth/register` — body: `{ name, email, password }`
- `POST /api/auth/login` — body: `{ email, password }`
- `GET /ping` — test route