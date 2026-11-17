# Bookstore RabbitMQ

A distributed bookstore catalog built with Vue 3, Netlify Functions, RabbitMQ (CloudAMQP) and MongoDB Atlas. Read operations query MongoDB directly, while write operations are queued and applied through entity-specific task processors and batch functions.

[![Frontend](https://img.shields.io/badge/Frontend-Vercel-000000?logo=vercel&logoColor=white)](https://bookstore-rabbitmq.vercel.app/)
[![Backend](https://img.shields.io/badge/Backend-Netlify-00AD9F?logo=netlify&logoColor=white)](https://bookstore-rabbitmq.netlify.app/)
![Vue](https://img.shields.io/badge/Vue.js-3-42B883?logo=vue.js&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-6-646CFF?logo=vite&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-22-339933?logo=node.js&logoColor=white)
![RabbitMQ](https://img.shields.io/badge/RabbitMQ-CloudAMQP-FF6600?logo=rabbitmq&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?logo=mongodb&logoColor=white)

## Live application

| Component | URL |
| --- | --- |
| Frontend | [Bookstore](https://bookstore-rabbitmq.vercel.app/) |
| Backend | [Netlify API](https://bookstore-rabbitmq.netlify.app/) |

## Features

- Catalog management for books, authors and publishers (CRUD).
- Asynchronous writes through three independent RabbitMQ queues.
- Entity-specific task processors and batch operations.
- Durable queues, persistent messages and publisher confirmations.
- Consumer acknowledgements after successful database operations; failed messages are requeued.
- MongoDB Atlas persistence with numeric identifiers and existing catalog schemas.
- Independent frontend and serverless backend deployments.
- Manual task execution outside the catalog UI, following the course workflow.

## Architecture

```mermaid
flowchart TD
    UI[Vue 3 / Vercel] --> API[Netlify Functions]
    API -->|GET: Find / FindAll| DB[(MongoDB Atlas)]
    API -->|POST / PUT / DELETE| MQ[RabbitMQ / CloudAMQP]
    MQ --> BQ[bookstore]
    MQ --> AQ[authors]
    MQ --> PQ[publishers]
    BQ --> BT[bookTasks]
    AQ --> AT[authorTasks]
    PQ --> PT[publisherTasks]
    M[Manual invocation] --> BT & AT & PT
    BT & AT & PT --> B[Entity-specific batch functions]
    B --> DB
```

Writes return HTTP `202 Accepted` after publication to RabbitMQ; the change is not yet persisted in MongoDB. The corresponding Tasks function consumes messages, invokes batch logic internally and acknowledges each successful operation. The frontend can then refresh the catalog.

| Entity | RabbitMQ queue | MongoDB collection | Task processor |
| --- | --- | --- | --- |
| Books | `bookstore` | `books` | `bookTasks` |
| Authors | `authors` | `authors` | `authorTasks` |
| Publishers | `publishers` | `publishers` | `publisherTasks` |

## Project structure

```text
bookstore-RabbitMQ/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── lib/
│   │   ├── App.vue
│   │   ├── main.js
│   │   ├── router.js
│   │   └── style.css
│   ├── .env.example
│   ├── package.json
│   ├── vercel.json
│   └── vite.config.js
├── netlify/
│   ├── functions/       # CRUD, Tasks and Batch handlers
│   └── lib/             # Messaging, database and shared logic
├── public/              # Backend landing page
├── scripts/             # Existing development utilities
├── tests/               # Existing backend tests
├── .env.example
├── netlify.toml
├── package.json
└── README.md
```

## API reference

Base URL: `https://bookstore-rabbitmq.netlify.app/.netlify/functions`

| Method | Books | Authors | Publishers |
| --- | --- | --- | --- |
| GET | `bookFindAll` | `authorFindAll` | `publisherFindAll` |
| GET | `bookFind/:id` | `authorFind/:id` | `publisherFind/:id` |
| POST | `bookInsert` | `authorInsert` | `publisherInsert` |
| PUT | `bookUpdate/:id` | `authorUpdate/:id` | `publisherUpdate/:id` |
| DELETE | `bookDelete/:id` | `authorDelete/:id` | `publisherDelete/:id` |
| GET | `bookTasks` | `authorTasks` | `publisherTasks` |

Read endpoints return JSON arrays. The `*InsertBatch`, `*UpdateBatch` and `*DeleteBatch` functions are called internally by Tasks; direct HTTP calls are rejected with `403 Forbidden`.

### Example queued operation

```json
{
  "method": "UPDATE",
  "id": 4,
  "body": { "edition": "5th" }
}
```

This illustrates a message format; the actual identifier and fields depend on the requested operation. Each entity uses its own queue.

## Local development

### Prerequisites

- Node.js 22 and npm.
- A CloudAMQP instance with an AMQP connection URL.
- A MongoDB Atlas cluster, a database user with access to `bookstore`, and an authorized network address.

Clone the repository:

```bash
git clone https://github.com/AndreaCarrilloOp/bookstore-RabbitMQ.git
cd bookstore-RabbitMQ
```

### Backend

Copy `.env.example` to `.env` in the repository root and configure the backend environment:

```dotenv
CLOUDAMQP_URL=amqps://USERNAME:PASSWORD@HOST/VHOST
MONGODB_URI=mongodb+srv://USERNAME:PASSWORD@CLUSTER.mongodb.net/bookstore
MONGODB_DB=bookstore
TASKS_TOKEN=
TASKS_BATCH_SIZE=20
```

Use the connection strings supplied by the respective services. Keep credentials private and do not commit `.env`.

```bash
npm install
npm run dev
```

Backend: `http://localhost:8888`

### Frontend

Open another terminal in the repository and copy `frontend/.env.example` to `frontend/.env`:

```dotenv
VITE_API_BASE=http://localhost:8888
```

```bash
cd frontend
npm install
npm run dev
```

Open the local URL displayed by Vite (normally `http://localhost:5173`).

## Task processing

1. Create, edit or delete a record in the frontend.
2. Inspect the corresponding queue in the RabbitMQ management interface.
3. Invoke the matching Tasks endpoint manually.
4. Verify the result in MongoDB Atlas and refresh the frontend.

| Processor | Endpoint |
| --- | --- |
| Books | `/.netlify/functions/bookTasks` |
| Authors | `/.netlify/functions/authorTasks` |
| Publishers | `/.netlify/functions/publisherTasks` |

Example local response after one successful operation (illustrative):

```json
{
  "queue": "bookstore",
  "processed": 1,
  "remaining": false,
  "errors": []
}
```

If `remaining` is `true`, another invocation may be needed. If `TASKS_TOKEN` is configured, send the `x-tasks-token` header from a trusted HTTP client. Never place this token in a Vite environment variable. The Tasks endpoints perform writes despite using GET in this academic implementation; they are not health checks.

## Deployment

### Netlify — backend

| Setting | Value |
| --- | --- |
| Base directory | Repository root |
| Build command | Not required |
| Publish directory | `public` |
| Functions directory | `netlify/functions` |

Configure `CLOUDAMQP_URL`, `MONGODB_URI`, `MONGODB_DB`, `TASKS_BATCH_SIZE` and, optionally, `TASKS_TOKEN` as backend environment variables. Ensure the deployed backend can reach both cloud services.

### Vercel — frontend

| Setting | Value |
| --- | --- |
| Root directory | `frontend` |
| Framework preset | Vite |
| Install command | `npm install` |
| Build command | `npm run build` |
| Output directory | `dist` |
| Node.js | 22.x |
| `VITE_API_BASE` | `https://bookstore-rabbitmq.netlify.app` |

The frontend environment contains only the public API base URL. Database and messaging credentials belong exclusively to the backend.

## Academic context

Developed for EIF508 — Distributed Systems, Universidad Nacional (UNA), Costa Rica. 
