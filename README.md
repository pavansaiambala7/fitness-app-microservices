# Fitness Application Microservices 🏋️‍♂️💪

A comprehensive, production-grade full-stack microservices application designed for fitness tracking, activity management, and user metrics. This system is built using **Java**, **Spring Boot**, **Spring Cloud**, and a **React** frontend, showcasing clean microservices architecture patterns.

Developed and implemented by **Pavan Sai Ambala** as a showcase of cloud-native development.

---

## 🏗️ Architecture Overview

The application is divided into decoupled, single-responsibility services that communicate with each other:

```
                      ┌──────────────────┐
                      │  React Frontend  │
                      └────────┬─────────┘
                               │
                       ┌───────▼───────┐
                       │  API Gateway  │
                       └───────┬───────┘
                               │
       ┌───────────────────────┼───────────────────────┐
       │                       │                       │
┌──────▼───────┐        ┌──────▼───────┐        ┌──────▼───────┐
│ User Service │        │ Activity Svc │        │  AI Service  │
│ (Profile/Auth)│       │(Workouts/Logs)│       │ (AI Coaching)│
└──────────────┘        └──────────────┘        └──────────────┘
```

### 🧱 Core Microservices:
1. **[eureka](file:///C:/Users/pavan/Desktop/fitness-app-microservices/eureka)**: Service Registry and Discovery server using Netflix Eureka so all services can locate each other dynamically.
2. **[configserver](file:///C:/Users/pavan/Desktop/fitness-app-microservices/configserver)**: Centralized configuration management server using Spring Cloud Config.
3. **[gateway](file:///C:/Users/pavan/Desktop/fitness-app-microservices/gateway)**: Spring Cloud API Gateway serving as the single entry point for all frontend requests, routing traffic to appropriate backend services.
4. **[userservice](file:///C:/Users/pavan/Desktop/fitness-app-microservices/userservice)**: Manages user registrations, profiles, credentials, and identity synchronization.
5. **[activityservice](file:///C:/Users/pavan/Desktop/fitness-app-microservices/activityservice)**: Tracks workout sessions, logs exercises, sets, reps, and calories burned.
6. **[aiservice](file:///C:/Users/pavan/Desktop/fitness-app-microservices/aiservice)**: Integrates AI intelligence to provide customized workout and diet recommendations.
7. **[fitness-app-frontend](file:///C:/Users/pavan/Desktop/fitness-app-microservices/fitness-app-frontend)**: Responsive web dashboard built in React for user interactions.

---

## 🛠️ Technology Stack

| Component | Technology |
|---|---|
| **Language** | Java 17+, JavaScript (ES6+) |
| **Framework** | Spring Boot 3.x, React.js |
| **Cloud Routing** | Spring Cloud Gateway, Netflix Eureka |
| **Security** | Spring Security, OAuth2 / Keycloak |
| **Database** | PostgreSQL / MySQL |
| **Build Tool** | Maven / Gradle |

---

## 🚀 How to Setup and Run Locally

### 1. Prerequisites
* **Java JDK 17** or higher installed.
* **Node.js** (for frontend package management).
* **Maven** (for building Spring Boot services).

### 2. Run the Service Registry First
1. Navigate to the Eureka folder:
   ```bash
   cd eureka
   ```
2. Build and run:
   ```bash
   ./mvnw spring-boot:run
   ```

### 3. Run the Config Server
1. Navigate to the Config Server folder:
   ```bash
   cd ../configserver
   ```
2. Build and run:
   ```bash
   ./mvnw spring-boot:run
   ```

### 4. Start the Backend Microservices
Repeat the `./mvnw spring-boot:run` command inside each backend service directory:
* `/userservice`
* `/activityservice`
* `/aiservice`
* `/gateway`

### 5. Start the React Frontend
1. Go to the frontend directory:
   ```bash
   cd ../fitness-app-frontend
   ```
2. Install dependencies and run:
   ```bash
   npm install
   npm start
   ```

---

## 💡 Key Engineering Practices Demonstrated

* **Service Discovery**: Dynamically registers microservices on startup without hardcoding endpoints.
* **API Gateway Routing**: Implements path-based routing, request filtering, and rate limiting at the edge.
* **Centralized Configuration**: Changes configurations dynamically across all services without redeploying.
* **Database Isolation**: Each service owns its dedicated database schema, preventing tight coupling.
* **Secure Communications**: Secured endpoints using modern OAuth2 protocols.

---

## 👤 Developer Profile

* **Developer:** Pavan Sai Ambala  
* **GitHub:** [@pavansaiambala7](https://github.com/pavansaiambala7)  
* **Academic Reference:** Based on curriculum guidelines from [EmbarkX](https://www.embarkx.com) courses.
