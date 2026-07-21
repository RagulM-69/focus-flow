# FocusFlow AI

An intelligent, production-ready productivity planner dashboard designed to organize, prioritize, and structure daily work.

## Project Structure

```
focusflow/
├── frontend/             # React 19 + Vite + Tailwind CSS v4 dashboard app
├── backend/              # Node.js 22 AWS Lambda backend stubs for Amazon Bedrock
├── docs/                 # System architecture and deployment guides
└── README.md             # Top-level workspace overview (this file)
```

---

## Getting Started

### 1. Frontend Setup
Navigate into the `frontend` folder, install dependencies, and launch the Vite development server:
```bash
cd frontend
npm install
npm run dev
```

By default, the frontend runs on [http://localhost:5173/](http://localhost:5173/).
It persists all tasks inside `localStorage` and operates a local calculation fallback.

#### Connecting to the Backend
To redirect planning requests to the backend Lambda service:
1. Create/edit `frontend/.env`.
2. Set the `VITE_API_URL` variable to point to your API Gateway or local server (e.g. `VITE_API_URL=http://localhost:3000`).

---

### 2. Backend Setup
The backend is structured for seamless AWS Lambda integration using Node.js 22 ESM.

To inspect and test:
```bash
cd backend
npm install
```

#### Lambda Modules
- `src/index.mjs` - API Gateway entrypoint handler with CORS wrappers.
- `src/bedrock.js` - Amazon Bedrock runtime client executor stub.
- `src/prompt.js` - Prompt formatter for task schedules.
- `src/responseFormatter.js` - Parser and type check validation guard.

---

## Deployment Architecture

The production-ready structure is designed to wire:
`React Frontend (S3/CloudFront)` ──> `API Gateway` ──> `AWS Lambda` ──> `Amazon Bedrock (Nova Lite)`

## 🌐 Live Demo
Visit [FocusFlow](https://main.d280t3r7xhocta.amplifyapp.com/)
