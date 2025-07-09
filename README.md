# DSA Visualizer

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
- **Progress Tracking:** Track solved problems and progress (future/optional)
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
   JWT_SECRET=your_jwt_secret
   SUPPORT_EMAIL=your_email@gmail.com
   SUPPORT_EMAIL_PASSWORD=your_email_password
   ```

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
   npm install
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

## Usage

- **Visit the app:** Open `http://localhost:5173` in your browser.
- **Register/Login:** Create an account or log in.
- **Browse Problems:** Go to the Practice page to browse problems by topic.
- **Solve & Visualize:** Write code, run it, and see visualizations for supported problems.
- **Track Progress:** (Future) Your solved problems and stats will be tracked.

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
- [Spring Boot](https://spring.io/projects/spring-boot)
- [React](https://react.dev/)
- [Radix UI](https://www.radix-ui.com/)
- [Tailwind CSS](https://tailwindcss.com/)

---

**Happy Learning and Coding!** 