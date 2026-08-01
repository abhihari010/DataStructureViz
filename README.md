# DSA Visualizer

[Live Demo](https://data-structure-viz.vercel.app/)

*Note: The site may take some time to load due to free hosting.*

**Master Data Structures & Algorithms through Interactive Visualization and Hands-on Practice**

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
  - [Backend Setup](#backend-setup)
  - [Frontend Setup](#frontend-setup)
  - [Running with Docker](#running-with-docker)
- [Testing](#testing)
- [Deployment and Operations](#deployment-and-operations)
- [Usage](#usage)
- [Extending the Platform](#extending-the-platform)
- [Contributing](#contributing)
- [License](#license)

---

## Overview

**DSA Visualizer** is a modern, full-stack web platform designed to help users learn and master Data Structures and Algorithms (DSA) through:
- Real-time code execution in multiple languages (Java, Python, JavaScript, C++)
- Interactive visualizations for core data structures and algorithms
- A rich set of practice problems, grouped by topic
- User authentication, progress tracking, and more

Perfect for students, interview preparation, and anyone looking to strengthen their DSA skills.

---

## Features

- **Practice Problems:** Browse and solve problems by data structure (arrays, trees, graphs, stacks, queues, linked lists, etc.)
- **Code Execution:** Write and run code in Java, Python, JavaScript, and C++ with instant feedback
- **Visualizations:** See step-by-step visualizations for algorithms like BFS, DFS, sorting, and more
- **User Authentication:** Register, login, password reset, and email verification
- **Progress Tracking:** Track drafts, attempts, verified submissions, and activity
- **Responsive UI:** Modern, mobile-friendly interface
- **Extensible:** Easily add new problems, topics, or languages

---

## Tech Stack

- **Frontend:** React, TypeScript, Tailwind CSS, Radix UI, Vite
- **Backend:** Spring Boot (Java), PostgreSQL, Judge0 API (for code execution)
- **Other:** Docker, Maven, REST APIs

---

## Project Structure

```
DataStructureViz/
  ├── backend/         # Spring Boot backend (Java)
  │   ├── src/
  │   ├── pom.xml
  │   └── Dockerfile
  ├── client/          # React frontend (TypeScript)
  │   ├── src/
  │   ├── public/
  │   └── package.json
  ├── shared/          # Shared types/schemas
  ├── README.md        # (You are here!)
  └── ...
```

---

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18+ recommended)
- [Java](https://adoptopenjdk.net/) (17+)
- [Maven](https://maven.apache.org/)
- [Docker](https://www.docker.com/) (optional, for containerized deployment)
- [PostgreSQL](https://www.postgresql.org/) (or use Docker)

---

### Backend Setup

1. **Configure Environment Variables**

   Create a `.env` file in `backend/` (see `application.properties` for required variables):

   ```
   DATABASE_URL=jdbc:postgresql://localhost:5432/dsa
   DATABASE_USERNAME=your_db_user
   DATABASE_PASSWORD=your_db_password
   JUDGE0_API_URL=https://judge0-ce.p.rapidapi.com
   JUDGE0_API_KEY=your_rapidapi_key
   JUDGE0_API_HOST=judge0-ce.p.rapidapi.com
   JWT_SECRET=your_jwt_secret
   FRONTEND_URL=http://localhost:5173
   MAILJET_API_KEY=your_mailjet_api_key
   MAILJET_SECRET_KEY=your_mailjet_secret_key
   MAILJET_SENDER_EMAIL=noreply@example.com
   MAILJET_SENDER_NAME=DSA Visualizer
   ```

   For an H2-based local run, keep machine-specific values in the ignored
   `backend/src/main/resources/application-local.properties` and start with the
   `local` profile:

   ```sh
   cd backend
   mvn spring-boot:run -Dspring-boot.run.profiles=local
   ```

   Do not commit that file or place Judge0, database, JWT, or mail credentials
   in the client bundle. The public operational endpoints are
   `GET /api/health` (lightweight liveness) and `GET /api/health/readiness`
   (database-required readiness; Judge0 is reported as degraded and does not
   block readiness).

2. **Install Dependencies & Build**

   ```sh
   cd backend
   mvn clean package -DskipTests
   ```

3. **Run the Backend**

   ```sh
   mvn spring-boot:run
   ```

   The backend will be available at `http://localhost:8080/api`.

---

### Frontend Setup

1. **Install Dependencies**

   ```sh
   cd client
   npm ci
   ```

2. **Run the Frontend**

   ```sh
   npm run dev
   ```

   The frontend will be available at `http://localhost:5173`.

---

### Running with Docker

1. **Build and Run Backend Container**

   ```sh
   cd backend
   docker build -t abhihari010/dsa-backend:latest .
   docker run -p 8080:8080 --env-file .env abhihari010/dsa-backend:latest
   ```

2. **(Optional) Deploy Frontend with Docker/Vercel/Netlify**

---

## Testing

From the repository root, run the same gates used by CI:

```sh
cd backend
mvn -B test

cd ../client
npm ci
npm test
npm run check
npm run build
```

Backend tests use H2 and mock Judge0 with a local HTTP server, so they do not
need database, mail, JWT, or Judge0 credentials and do not consume provider
quota. CI also retains Maven Surefire output, client test logs, and dependency
reports as workflow artifacts. The client build checks that its largest
uncompressed JavaScript asset stays below 700 kB.

More detailed operational notes are in
[`docs/testing-and-operations.md`](docs/testing-and-operations.md).

---

## Deployment and Operations

The backend deployment configuration is Fly.io (`backend/fly.toml`). Set
runtime secrets in the deployment environment, never in Git or `VITE_*`
variables. The important operational endpoints are:

- `GET /api/health` — lightweight liveness; returns `200` without a database
  check.
- `GET /api/health/readiness` — database-required readiness; returns `503`
  when the database is unavailable and reports Judge0 as `DEGRADED` without
  exposing provider details or blocking basic readiness.

Configure `DATABASE_URL`, `DATABASE_USERNAME`, `DATABASE_PASSWORD`,
`JWT_SECRET`, `JUDGE0_API_URL`, `JUDGE0_API_KEY`, `JUDGE0_API_HOST`, and
`FRONTEND_URL` in the backend environment. Mailjet variables are additionally
required for email flows. RapidAPI/Judge0 credentials are server-only. Keep
local overrides in the ignored
`backend/src/main/resources/application-local.properties` file.

CI runs backend tests, the existing client test script, type-checking, the
production build, a 700 kB bundle-budget report, npm audit, Maven dependency
inventory, and pull-request dependency review. Audit output is retained for
triage; test and build failures remain blocking. See the
[`docs/testing-and-operations.md`](docs/testing-and-operations.md) runbook for
the concise Judge0 and deployment checklist.

---

## Usage

- **Visit the app:** Open `http://localhost:5173` in your browser.
- **Register/Login:** Create an account or log in.
- **Browse Problems:** Go to the Practice page to browse problems by topic.
- **Solve & Visualize:** Write code, run it, and see visualizations for supported problems.
- **Track Progress:** Review saved drafts, attempts, verified completions, and activity.

---

## Extending the Platform

- **Add New Problems:**  
  Add JSON files to `backend/src/main/resources/problems/` following the existing format.

- **Add New Topics:**  
  Update the topic configuration in `client/src/config/topic-config.ts`.

- **Add New Languages:**  
  Extend the backend code execution and wrapper services.

- **Add New Visualizations:**  
  Create new React components in `client/src/components/visualizations/`.

---

## Contributing

Contributions are welcome! Please open issues or pull requests for bug fixes, new features, or improvements.

1. Fork the repo
2. Create your feature branch (`git checkout -b feature/YourFeature`)
3. Commit your changes (`git commit -am 'Add new feature'`)
4. Push to the branch (`git push origin feature/YourFeature`)
5. Open a pull request

---

## License

This project is licensed under the MIT License.

---

## Acknowledgements

- [Judge0 API](https://judge0.com/) for code execution

