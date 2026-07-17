# ✈️ Flight Management System

A full-stack flight booking and management application built with **Spring Boot**, **JDBC (JdbcTemplate)**, and **MySQL**, following a clean, layered architecture (DTO → DAO → Service → Controller). The system supports two roles — **Customer** and **Administrator** — and covers the complete lifecycle of flights, schedules, and bookings.

---

## 📖 Abstract

The Flight Management System is a Java-based booking solution for flight tickets. It consolidates data provided by different airline carriers and gives users flight details and rates in real time.

Travellers can book, cancel, view, and update their bookings with ease. Administrators can manage the underlying flight, schedule, and route data that powers the booking engine. Everything is exposed through a single, cohesive backend application with a companion frontend client.

---

## 🎯 Scope

### ✅ In Scope

The system supports two categories of users, each with its own set of privileges.

**Customer**
- Create a user account
- Log in to the application
- Check available flights
- Make a booking
- View bookings
- Cancel a booking
- Modify a booking

**Administrator**
- Log in to the application
- Add flight, schedule, and route details
- View flight, schedule, and route details
- Cancel or modify flight, schedule, and route details

### 🚫 Out of Scope

1. Boarding pass generation and seating plan management
2. Third-party integrations such as email and SMS services
3. Payment processing

---

## 🏗️ Architecture

The backend follows a strict layered architecture:

```
Controller  →  Service  →  DAO  →  Database
   ↑              ↑          ↑
  DTOs        Business    JdbcTemplate
             Validation    + Raw SQL
```

- **Controller layer** — `@RestController` classes exposing JSON REST APIs.
- **Service layer** — business validation and orchestration (e.g. seat availability, phone/email/UIN validation).
- **DAO layer** — `JdbcTemplate`-backed data access, mapping raw SQL `ResultSet`s to domain models.
- **Model / DTO layer** — plain Java POJOs mirroring the database schema.
- **RBAC layer** — session-based authentication with a custom `@AdminOnly` annotation and interceptor, enforced without Spring Security.
- **Exception handling** — a global `@RestControllerAdvice` returns structured JSON errors for `404` and `400` cases.

---

## 🧱 Domain Model

| Entity | Description |
|---|---|
| `User` | Customer or Administrator account |
| `Airport` | Fixed reference data (code, name, location) |
| `Flight` | Carrier, model, and seat capacity |
| `Schedule` | Source/destination airports with departure & arrival times |
| `ScheduledFlight` | A `Flight` mapped to a `Schedule`, with available seats and ticket cost |
| `Booking` | A reservation tied to a `User`, a `ScheduledFlight`, and one or more `Passenger`s |
| `Passenger` | Passenger details attached to a booking (name, age, UIN, luggage) |

---

## 📂 Project Structure

```
FlightManagementSystem/
├── backend/
│   ├── src/main/java/com/example/FlightMgmtSys/
│   │   ├── config/          # Web MVC / interceptor configuration
│   │   ├── controller/      # REST controllers
│   │   ├── dao/             # DAO interfaces + JdbcTemplate implementations
│   │   ├── exception/       # Custom exceptions + global exception handler
│   │   ├── model/           # Domain POJOs / DTOs
│   │   ├── security/        # RBAC: @AdminOnly annotation, AuthInterceptor
│   │   ├── service/         # Business logic + validation
│   │   └── FlightMgmtSysApplication.java
│   ├── src/main/resources/
│   │   └── application.properties
│   ├── flight_management_schema.sql   # Full DB schema, triggers, indexes, seed data
│   ├── flight_data_population.sql     # Additional seed data
│   ├── pom.xml
│   └── mvnw / mvnw.cmd
└── frontend/
    ├── public/
    ├── src/
    └── package.json
```

---

## 🗄️ Database Schema

The system uses a relational MySQL schema (`flight_management_schema.sql`) with **7 core tables** mapping directly to the domain model above (`airport`, `user`, `flight`, `schedule`, `scheduled_flight`, `booking`, `passenger`), including:

- Foreign key constraints linking bookings, passengers, schedules, and flights
- Indexes for common lookup/search patterns
- `BEFORE INSERT` / `BEFORE UPDATE` triggers (using `SIGNAL SQLSTATE`) to enforce schedule validation rules that MySQL `CHECK` constraints couldn't reliably express
- Seed data: 8 Indian airports and sample flights/schedules

Soft deletes are used throughout — records are marked `INACTIVE` or `CANCELLED` rather than physically removed, preserving historical integrity (e.g. past bookings remain viewable after cancellation).

---

## 🔐 Authentication & Authorization (RBAC)

Authentication is **JWT-based**, built on **Spring Security**:

- `SecurityConfig` defines the security filter chain and which endpoints are public vs. protected.
- On login, the server issues a signed JWT (`JwtUtil`) using an HMAC-SHA key derived from the `jwt.secret` property, valid for 24 hours.
- `JwtAuthenticationFilter` runs on every request, extracts and validates the token, and populates the Spring Security context.
- `CustomUserDetailsService` and `CustomUserDetails` integrate the app's `User` model with Spring Security's `UserDetailsService`.
- Requests without a valid token are rejected with `401 Unauthorized`; role-restricted endpoints (creating flights, deleting users, etc.) return `403 Forbidden` for non-admin users.

---

## 🔌 API Reference

### Users
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/users/register` | Register a new customer |
| POST | `/api/users/login` | Log in (returns JWT token) |
| GET | `/api/users/{id}` | View user by ID |
| GET | `/api/users` | View all users *(admin)* |
| PUT | `/api/users` | Update user |
| DELETE | `/api/users/{id}` | Delete user *(admin)* |

### Flights
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/flights` | Add flight *(admin)* |
| GET | `/api/flights/{flightNumber}` | View flight |
| GET | `/api/flights` | View all flights |
| PUT | `/api/flights` | Modify flight *(admin)* |
| DELETE | `/api/flights/{flightNumber}` | Delete flight *(admin)* |

### Scheduled Flights
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/scheduled-flights` | Schedule a flight *(admin)* |
| GET | `/api/scheduled-flights/search?source=X&dest=Y&date=Z` | Search by route + date |
| GET | `/api/scheduled-flights/{flightNumber}` | View by flight number |
| GET | `/api/scheduled-flights` | View all |
| PUT | `/api/scheduled-flights` | Modify scheduled flight *(admin)* |
| DELETE | `/api/scheduled-flights/{id}` | Delete *(admin)* |

### Bookings
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/bookings` | Create a booking |
| GET | `/api/bookings/{bookingId}` | View booking by ID |
| GET | `/api/bookings` | View all bookings |
| PUT | `/api/bookings` | Modify booking |
| DELETE | `/api/bookings/{bookingId}` | Cancel booking |

### Airports
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/airports` | View all airports |
| GET | `/api/airports/{code}` | View airport by code |

---

## ✅ Business Rules & Validation

- **Phone numbers** must be exactly 10 digits and cannot start with `0`.
- **Emails** must start with an alphanumeric character and contain only alphanumeric characters in the local part.
- **User type** must be either `ADMIN` or `CUSTOMER`.
- **Flights** require a positive seat capacity and non-empty model/carrier names.
- **Schedules** require the arrival time to be after the departure time, source and destination airports to differ, and both to exist in the database; scheduled dates must be in the future.
- **Bookings** cannot exceed the available seats on a scheduled flight; ticket cost is computed as `scheduledFlight.ticketCost × noOfPassengers`.
- **Passenger UIN** (Aadhaar-style identifier) must be exactly 12 digits, with a positive age and non-empty name.
- Cancelling a booking restores the seats it had reserved.

---

## 🛠️ Tech Stack

**Backend**
- Java 21
- Spring Boot (Web MVC)
- Spring Security + JWT (`io.jsonwebtoken` / JJWT)
- Spring JDBC (`JdbcTemplate`)
- MySQL
- Maven

**Frontend**
- Located under `frontend/` — a JavaScript/Node-based client consuming the REST API

---

## 🚀 Getting Started

### Prerequisites
- JDK 21+
- Maven (or use the included `mvnw` / `mvnw.cmd` wrapper)
- MySQL 8+
- Node.js (for the frontend)

### 1. Set up the database
```bash
mysql -u root -p < backend/flight_management_schema.sql
mysql -u root -p < backend/flight_data_population.sql
```

### 2. Configure the backend
Update `backend/src/main/resources/application.properties`:
```properties
spring.datasource.url=jdbc:mysql://localhost:3306/flight_management_db
spring.datasource.username=root
spring.datasource.password=your_password
spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver
```

### 3. Run the backend
```bash
cd backend
./mvnw spring-boot:run
```
The API will start on `http://localhost:8080`.

### 4. Run the frontend
```bash
cd frontend
npm install
npm run dev
```

---

## 🧪 Testing the API

```bash
# View seed airports
curl http://localhost:8080/api/airports

# Register a customer
curl -X POST http://localhost:8080/api/users/register -H "Content-Type: application/json" -d '{ ... }'

# Log in (returns a JWT)
curl -X POST http://localhost:8080/api/users/login -H "Content-Type: application/json" -d '{ ... }'

# Search scheduled flights (pass the JWT as a bearer token)
curl -H "Authorization: Bearer <token>" "http://localhost:8080/api/scheduled-flights/search?source=DEL&dest=BOM&date=2026-08-01"

# Create a booking
curl -H "Authorization: Bearer <token>" -X POST http://localhost:8080/api/bookings -H "Content-Type: application/json" -d '{ ... }'
```

---

## 🗺️ Roadmap

- [ ] Boarding pass generation
- [ ] Payment gateway integration
- [ ] Email/SMS notifications
- [ ] Password hashing (currently plain text to match seed data — structured for easy upgrade)


