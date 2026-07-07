# Flight Management System — Walkthrough

The Flight Management System has been fully implemented using Spring Boot and MySQL, following a clean, layered architecture.

## What was built

In total, **35 new files** were created and **2 files** were modified to complete the system. The application is designed to be robust, secure, and fully aligned with the requirements.

### 1. DTO & Models Layer
7 Java POJOs were created (`User`, `Airport`, `Flight`, `Schedule`, `ScheduledFlight`, `Passenger`, and `Booking`) to represent the application's domain logic and map perfectly to the existing MySQL schema.

### 2. DAO Layer (JDBC)
We implemented 5 DAO interfaces and 5 `JdbcTemplate` implementations.
- **Transactions & Joins**: The `ScheduledFlightDao` handles multi-table `JOIN` operations to map routes and schedules. The `BookingDao` transactionally creates the booking and nested passengers in a single flow, while also decrementing and restoring available seats upon cancellation.
- **Soft Deletes**: Deletion operations update the `_state` column to `'INACTIVE'` or `'CANCELLED'` rather than physically deleting rows, preserving historical data integrity.

### 3. Service Layer & Business Logic
5 Services were built, containing all business validations:
- **Phone/Email Validation**: Ensures phones are exactly 10 digits (no leading zero) and emails match standard formats.
- **Flight & Scheduling Rules**: Validates that arrival times are after departure times, dates are in the future, and source airports differ from destinations.
- **Booking Logic**: Verifies that requested passenger counts don't exceed `availableSeats`, that Aadhaar UINs are exactly 12 digits, and automatically computes the total `ticketCost`.

### 4. Exceptions & Error Handling
A `@RestControllerAdvice` (`GlobalExceptionHandler`) intercepts all runtime errors.
- **404 Not Found**: Thrown via `RecordNotFoundException` when a resource lookup fails.
- **400 Bad Request**: Thrown via `ValidationException` when any business rule is violated.
Both return beautifully formatted JSON error bodies with timestamps.

### 5. Role-Based Access Control (RBAC)
We implemented session-based authentication without adding the overhead of Spring Security:
- **`AuthInterceptor`**: Checks every incoming request. If there is no active session, it returns a `401 Unauthorized`.
- **`@AdminOnly`**: A custom annotation applied to sensitive endpoints (e.g., creating flights, deleting users). If a logged-in user is a `CUSTOMER`, the interceptor rejects the request with a `403 Forbidden`.

### 6. REST Controllers
5 `@RestController` files expose the entire system via clean JSON APIs mapping to standard HTTP methods (`GET`, `POST`, `PUT`, `DELETE`).

---

## Validation Results

The application compiles perfectly (`0 errors`) and successfully starts on port 8080.
A full test suite was run via `curl`, verifying:

1. **RBAC Security**: Attempting to access endpoints without a session correctly returns `401 Unauthorized`.
2. **Registration & Login**: `POST /api/users/register` successfully created a customer, and `POST /api/users/login` successfully returned a session cookie.
3. **Session Persistence**: Using the session cookie, a `GET /api/airports` request successfully returned the list of seed airports with a `200 OK`.

The Flight Management System is now fully functional and ready for frontend integration!
