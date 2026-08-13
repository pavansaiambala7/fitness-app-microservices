# Fitness Application – Microservices Platform 🏋️‍♂️⚡

A high-performance, production-grade microservices platform designed for real-time fitness tracking, activity metrics aggregation, and AI-powered workout & nutrition recommendations. Built using **Java 17+**, **Spring Boot 3.x**, **Spring Cloud**, **LangChain4j + Gemini AI**, **pgvector**, and a **React.js** dashboard with real-time **5-second metric auto-refresh**.

Developed & implemented by **Pavan Sai Ambala** (`@pavansaiambala7p`).

---

## 🚀 Key Highlights & Architectural Features

* **6-Service Distributed Backend**: Decoupled microservices architecture following domain-driven boundaries:
  1. **[eureka](file:///./eureka)**: Service Discovery & Registry Server running on port `8761`.
  2. **[configserver](file:///./configserver)**: Centralized Configuration Management Server running on port `8888`.
  3. **[gateway](file:///./gateway)**: Spring Cloud API Gateway serving single-entry routing and global CORS on port `8080`.
  4. **[userservice](file:///./userservice)**: Profile, identity, and target metrics management running on port `8081`.
  5. **[activityservice](file:///./activityservice)**: Workout logging, metrics tracking, and real-time live statistics calculation on port `8082`.
  6. **[aiservice](file:///./aiservice)**: AI Recommendation Engine utilizing **LangChain4j**, **Gemini AI**, and **pgvector RAG** on port `8083`.

* **Database-per-Service Architecture**: Strict database isolation preventing coupling across domain models:
  * **User Service**: Dedicated **PostgreSQL** database (`fitness_user_db`).
  * **Activity Service**: Dedicated **MySQL** database (`fitness_activity_db`).
  * **AI Service**: Dedicated **PostgreSQL** database with **`pgvector`** extension (`fitness_vector_db`).

* **AI-Powered Recommendation Engine**:
  * Integrates **LangChain4j** with **Google Gemini AI**.
  * Implements **RAG (Retrieval-Augmented Generation)** knowledge base over sports science & biomechanics vector embeddings stored in `pgvector`.
  * Formulates tailored post-workout analysis, target intensity adjustments, and safety guidelines.

* **Real-time React.js Dashboard**:
  * Dynamic live fitness metrics dashboard with automated **5-second refresh interval**.
  * Visual pulse animation badge indicator showing real-time background sync state.
  * Interactive workout session logger and live exercise history.

---

## 🛠️ Technology Stack

| Domain | Technologies Used |
|---|---|
| **Backend Core** | Java 17+, Spring Boot 3.4.x, Spring Data JPA, Spring AMQP / RabbitMQ |
| **Cloud Routing & Config** | Spring Cloud Gateway, Netflix Eureka Service Discovery, Spring Cloud Config Server |
| **AI & RAG Engine** | LangChain4j, Google Gemini AI (`gemini-1.5-flash`), `pgvector` Vector Store |
| **Databases** | PostgreSQL, MySQL, pgvector |
| **Frontend** | React.js, Vite, Material-UI (MUI), Redux Toolkit, Axios |
| **Containerization** | Docker, Docker Compose |

---

## 🐳 Running with Docker Compose

To spin up all 6 backend microservices, 3 databases (PostgreSQL, MySQL, pgvector), RabbitMQ, and the React frontend in one command:

```bash
docker-compose up --build
```

### Port Mappings Summary:
- **React Frontend**: `http://localhost:3000`
- **API Gateway**: `http://localhost:8080`
- **Eureka Registry**: `http://localhost:8761`
- **Config Server**: `http://localhost:8888`
- **User Service**: `http://localhost:8081`
- **Activity Service**: `http://localhost:8082`
- **AI Service**: `http://localhost:8083`

---

## 👤 Developer Profile

* **Developer:** Pavan Sai Ambala  
* **GitHub:** [@pavansaiambala7](https://github.com/pavansaiambala7)  
* **Academic Reference:** Based on curriculum guidelines from [EmbarkX](https://www.embarkx.com) courses.
