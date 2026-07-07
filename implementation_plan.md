# Flight Management System — Implementation Plan

Build a complete Spring Boot 4.1 + MySQL Flight Management System with layered architecture (DTO → DAO → Service → Controller), covering user management, flight/schedule/route CRUD, and booking workflows for both customers and administrators.

## Current State

| What exists | Details |
|---|---|
| Spring Boot skeleton | [FlightMgmtSysApplication.java](file:///Users/amaanshahid/FlightMgmtSys/src/main/java/com/example/FlightMgmtSys/FlightMgmtSysApplication.java) — empty `@SpringBootApplication` |
| Maven POM | Spring Boot 4.1, Java 21, `spring-boot-starter-webmvc` only |
| Database schema | [flight_management_schema.sql](file:///Users/amaanshahid/FlightMgmtSys/flight_management_schema.sql) — 7 tables with triggers, indexes, and seed data |
| Config | [application.properties](file:///Users/amaanshahid/FlightMgmtSys/src/main/resources/application.properties) — only `spring.application.name` |

---

## User Review Required

> [!IMPORTANT]
> **Database connectivity approach**: The spec describes DAO classes with in-memory `List<>` attributes (e.g., `userList: List<User>`). The SQL schema, however, defines a full relational database. **I will implement JDBC-backed DAOs** using Spring's `JdbcTemplate` to match the SQL schema, while keeping the DAO interface signatures exactly as specified. This is the pragmatic choice given the schema already exists. Let me know if you prefer in-memory lists instead.

> [!IMPORTANT]
> **Authentication**: The spec mentions login but not a specific auth framework. I will implement a **simple session-based login** (store user in `HttpSession`) without Spring Security, keeping it lightweight. Passwords will be stored as plain text to match the seed data, but the code will be structured so hashing can be added later.

> [!IMPORTANT]
> **REST API vs MVC**: The POM includes `spring-boot-starter-webmvc`. I will build **REST controllers** (returning JSON via `@RestController`) since no frontend templates are specified. This makes the API consumable by any frontend (Postman, React, etc.).

## Open Questions

> [!NOTE]
> **`viewBooking(BigInteger)` return type**: The spec says it returns `List<Booking>` by booking ID, but a single booking ID should return a single booking. I will implement it to return a single `Booking` (consistent with viewing by ID), but wrap in a list at the service layer to match the spec signature.

> [!NOTE]
> **Ticket cost calculation**: The spec stores `ticketCost` in `Booking` but doesn't define how it's calculated. I will compute it as `scheduledFlight.ticketCost × noOfPassengers` during booking creation.

---

## Proposed Changes

The base package is `com.example.FlightMgmtSys`. All new files go under `src/main/java/com/example/FlightMgmtSys/`.

---

### 1. Maven & Configuration

#### [MODIFY] [pom.xml](file:///Users/amaanshahid/FlightMgmtSys/pom.xml)

Add required dependencies:
- `spring-boot-starter-jdbc` — for `JdbcTemplate` and datasource auto-config
- `mysql-connector-j` — MySQL JDBC driver (runtime scope)
- `spring-boot-starter-validation` — for `@Valid` / Bean Validation annotations

#### [MODIFY] [application.properties](file:///Users/amaanshahid/FlightMgmtSys/src/main/resources/application.properties)

Add MySQL datasource configuration:
```properties
spring.datasource.url=jdbc:mysql://localhost:3306/flight_management_db
spring.datasource.username=root
spring.datasource.password=root
spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver
```

---

### 2. Exception Handling

#### [NEW] `exception/RecordNotFoundException.java`
Runtime exception thrown when a lookup by ID finds no result (users, flights, bookings, etc.).

#### [NEW] `exception/ValidationException.java`
Runtime exception thrown when business validations fail (phone format, email format, seat availability, etc.).

#### [NEW] `exception/GlobalExceptionHandler.java`
`@RestControllerAdvice` that catches `RecordNotFoundException`, `ValidationException`, and generic exceptions, returning structured JSON error responses with appropriate HTTP status codes (404, 400, 500).

---

### 3. DTO / Model Layer

All DTOs are plain Java classes (POJOs) with fields, constructors, getters/setters, and `toString()`. They mirror the database schema.

#### [NEW] `model/User.java`
Fields: `userId` (BigInteger), `userType` (String), `userName` (String), `userPassword` (String), `userPhone` (BigInteger), `userEmail` (String).

#### [NEW] `model/Airport.java`
Fields: `airportCode` (String), `airportName` (String), `airportLocation` (String).

#### [NEW] `model/Flight.java`
Fields: `flightNumber` (BigInteger), `flightModel` (String), `carrierName` (String), `seatCapacity` (Integer).

#### [NEW] `model/Schedule.java`
Fields: `scheduleId` (BigInteger), `sourceAirport` (Airport), `destinationAirport` (Airport), `departureTime` (LocalDateTime), `arrivalTime` (LocalDateTime).

#### [NEW] `model/ScheduledFlight.java`
Fields: `scheduledFlightId` (BigInteger), `flight` (Flight), `schedule` (Schedule), `availableSeats` (Integer), `ticketCost` (BigDecimal).

#### [NEW] `model/Passenger.java`
Fields: `pnrNumber` (BigInteger), `passengerName` (String), `passengerAge` (Integer), `passengerUIN` (BigInteger), `luggage` (Double).

#### [NEW] `model/Booking.java`
Fields: `bookingId` (BigInteger), `userId` (User), `bookingDate` (LocalDate), `passengerList` (List\<Passenger\>), `ticketCost` (BigDecimal), `flight` (ScheduledFlight), `noOfPassengers` (Integer).

---

### 4. DAO Layer

Each DAO has an interface and a `JdbcTemplate`-backed implementation. The implementation maps rows from the DB schema to DTO objects.

#### [NEW] `dao/UserDao.java` (interface)
Methods: `addUser`, `viewUser(BigInteger)`, `viewUser()`, `updateUser`, `deleteUser`.

#### [NEW] `dao/UserDaoImpl.java`
`@Repository`. Uses `JdbcTemplate`. Maps `ResultSet` → `User`. Delete is a soft-delete (sets `user_state = 'INACTIVE'`).

---

#### [NEW] `dao/AirportDao.java` (interface)
Methods: `viewAirport()`, `viewAirport(String)`.

#### [NEW] `dao/AirportDaoImpl.java`
`@Repository`. Read-only DAO (airports are fixed per assumptions). Maps `ResultSet` → `Airport`.

---

#### [NEW] `dao/FlightDao.java` (interface)
Methods: `addFlight`, `modifyFlight`, `viewFlight(BigInteger)`, `viewFlight()`, `deleteFlight`.

#### [NEW] `dao/FlightDaoImpl.java`
`@Repository`. Delete is soft-delete (`flight_state = 'INACTIVE'`). Queries only `ACTIVE` flights for listing.

---

#### [NEW] `dao/ScheduledFlightDao.java` (interface)
Methods: `scheduleFlight`, `viewScheduledFlights(Airport, Airport, LocalDate)`, `viewScheduledFlights(BigInteger)`, `viewScheduledFlight()`, `modifyScheduledFlight(Flight, Schedule, int)`, `deleteScheduledFlight(BigInteger)`.

#### [NEW] `dao/ScheduledFlightDaoImpl.java`
`@Repository`. Complex joins across `scheduled_flight`, `flight`, `schedule`, and `airport` tables. Builds full `ScheduledFlight` objects with nested `Flight`, `Schedule`, and `Airport` models.

---

#### [NEW] `dao/BookingDao.java` (interface)
Methods: `addBooking`, `modifyBooking`, `viewBooking(BigInteger)`, `viewBooking()`, `deleteBooking`.

#### [NEW] `dao/BookingDaoImpl.java`
`@Repository`. Manages transactional inserts across `booking` and `passenger` tables. Booking deletion is a soft-cancel (`booking_state = 'CANCELLED'`), which also restores `available_seats` on the scheduled flight.

---

### 5. Service Layer

Each service has an interface and implementation. Implementations contain **business validation logic** and delegate persistence to the DAO layer.

#### [NEW] `service/UserService.java` (interface)
#### [NEW] `service/UserServiceImpl.java`
`@Service`. Key logic:
- `validateUser`: Phone must be 10 digits, not starting with 0. Email must start with alphanumeric, contain only alphanumeric in local part. UserType must be `ADMIN` or `CUSTOMER`.
- `addUser`: Validates, then delegates to DAO.
- `deleteUser`: Soft-delete via DAO.

---

#### [NEW] `service/AirportService.java` (interface)
#### [NEW] `service/AirportServiceImpl.java`
`@Service`. Thin wrapper around DAO; validates airport code exists.

---

#### [NEW] `service/FlightService.java` (interface)
#### [NEW] `service/FlightServiceImpl.java`
`@Service`. Key logic:
- `validateFlight`: `seatCapacity > 0`, model and carrier non-empty.
- All CRUD delegated to DAO after validation.

---

#### [NEW] `service/ScheduledFlightService.java` (interface)
#### [NEW] `service/ScheduledFlightServiceImpl.java`
`@Service`. Key logic:
- `validateScheduledFlight`: Arrival must be after departure. Source and destination airports must exist in DB and differ. Dates must be in the future.
- `viewScheduledFlights(Airport, Airport, LocalDate)`: Search by route and date.

---

#### [NEW] `service/BookingService.java` (interface)
#### [NEW] `service/BookingServiceImpl.java`
`@Service`. Key logic:
- `validateBooking`: `noOfPassengers ≤ availableSeats`. Booking date must be valid.
- `validatePassenger`: UIN must be exactly 12 digits. Age > 0. Name non-empty.
- `addBooking`: Validates, creates booking + passengers, decrements `available_seats`.
- `deleteBooking`: Cancels booking, restores seats.
- `modifyBooking`: Updates everything except `bookingId`.

---

### 6. Controller Layer (REST APIs)

All controllers use `@RestController` with `@RequestMapping` base paths. They delegate to service layer and return appropriate HTTP status codes.

#### [NEW] `controller/UserController.java`

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/users/register` | Register new customer |
| POST | `/api/users/login` | Login (returns user info) |
| GET | `/api/users/{id}` | View user by ID |
| GET | `/api/users` | View all users (admin) |
| PUT | `/api/users` | Update user |
| DELETE | `/api/users/{id}` | Delete user (admin) |

#### [NEW] `controller/FlightController.java`

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/flights` | Add flight (admin) |
| GET | `/api/flights/{flightNumber}` | View flight |
| GET | `/api/flights` | View all flights |
| PUT | `/api/flights` | Modify flight (admin) |
| DELETE | `/api/flights/{flightNumber}` | Delete flight (admin) |

#### [NEW] `controller/ScheduledFlightController.java`

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/scheduled-flights` | Schedule a flight (admin) |
| GET | `/api/scheduled-flights/search?source=X&dest=Y&date=Z` | Search by route + date |
| GET | `/api/scheduled-flights/{flightNumber}` | View by flight number |
| GET | `/api/scheduled-flights` | View all |
| PUT | `/api/scheduled-flights` | Modify scheduled flight (admin) |
| DELETE | `/api/scheduled-flights/{id}` | Delete (admin) |

#### [NEW] `controller/BookingController.java`

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/bookings` | Create booking |
| GET | `/api/bookings/{bookingId}` | View booking by ID |
| GET | `/api/bookings` | View all bookings |
| PUT | `/api/bookings` | Modify booking |
| DELETE | `/api/bookings/{bookingId}` | Cancel booking |

#### [NEW] `controller/AirportController.java`

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/airports` | View all airports |
| GET | `/api/airports/{code}` | View airport by code |

---

### 7. File Summary (35 new files, 2 modified)

```
src/main/java/com/example/FlightMgmtSys/
├── FlightMgmtSysApplication.java          (existing)
├── model/
│   ├── User.java                           [NEW]
│   ├── Airport.java                        [NEW]
│   ├── Flight.java                         [NEW]
│   ├── Schedule.java                       [NEW]
│   ├── ScheduledFlight.java                [NEW]
│   ├── Passenger.java                      [NEW]
│   └── Booking.java                        [NEW]
├── dao/
│   ├── UserDao.java                        [NEW]
│   ├── UserDaoImpl.java                    [NEW]
│   ├── AirportDao.java                     [NEW]
│   ├── AirportDaoImpl.java                 [NEW]
│   ├── FlightDao.java                      [NEW]
│   ├── FlightDaoImpl.java                  [NEW]
│   ├── ScheduledFlightDao.java             [NEW]
│   ├── ScheduledFlightDaoImpl.java         [NEW]
│   ├── BookingDao.java                     [NEW]
│   └── BookingDaoImpl.java                 [NEW]
├── service/
│   ├── UserService.java                    [NEW]
│   ├── UserServiceImpl.java                [NEW]
│   ├── AirportService.java                 [NEW]
│   ├── AirportServiceImpl.java             [NEW]
│   ├── FlightService.java                  [NEW]
│   ├── FlightServiceImpl.java              [NEW]
│   ├── ScheduledFlightService.java         [NEW]
│   ├── ScheduledFlightServiceImpl.java     [NEW]
│   ├── BookingService.java                 [NEW]
│   └── BookingServiceImpl.java             [NEW]
├── controller/
│   ├── UserController.java                 [NEW]
│   ├── FlightController.java              [NEW]
│   ├── ScheduledFlightController.java     [NEW]
│   ├── BookingController.java             [NEW]
│   └── AirportController.java            [NEW]
└── exception/
    ├── RecordNotFoundException.java        [NEW]
    ├── ValidationException.java           [NEW]
    └── GlobalExceptionHandler.java        [NEW]

pom.xml                                    [MODIFY]
application.properties                     [MODIFY]
```

---

## Verification Plan

### Automated Tests

```bash
# 1. Compile the project — ensures all classes, interfaces, and wiring compile cleanly
./mvnw compile

# 2. Start the application — ensures Spring context loads and DB connects
./mvnw spring-boot:run
```

### Manual Verification

After the app starts, test the full workflow using `curl` or Postman:

1. **Airports**: `GET /api/airports` → returns 8 seed airports
2. **Register user**: `POST /api/users/register` with customer JSON
3. **Login**: `POST /api/users/login` with credentials
4. **View flights**: `GET /api/flights` → returns 3 seed flights
5. **Search scheduled flights**: `GET /api/scheduled-flights/search?source=DEL&dest=BOM&date=2026-08-01`
6. **Create booking**: `POST /api/bookings` with passengers → verify seats decrement
7. **View booking**: `GET /api/bookings/{id}` → verify passenger list
8. **Cancel booking**: `DELETE /api/bookings/{id}` → verify seats restored
9. **Validation errors**: Send invalid phone (9 digits), invalid UIN (11 digits), overbooking → verify 400 responses
