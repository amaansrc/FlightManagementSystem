# Task List

## Phase 1 — Foundation
- [ ] Update `pom.xml` with JDBC, MySQL, validation dependencies
- [ ] Update `application.properties` with MySQL datasource config
- [ ] Create `exception/RecordNotFoundException.java`
- [ ] Create `exception/ValidationException.java`
- [ ] Create `exception/GlobalExceptionHandler.java`
- [ ] Create `model/User.java`
- [ ] Create `model/Airport.java`
- [ ] Create `model/Flight.java`
- [ ] Create `model/Schedule.java`
- [ ] Create `model/ScheduledFlight.java`
- [ ] Create `model/Passenger.java`
- [ ] Create `model/Booking.java`
- [ ] Compile to verify Phase 1

## Phase 2 — DAO Layer
- [ ] `dao/UserDao.java` + `dao/UserDaoImpl.java`
- [ ] `dao/AirportDao.java` + `dao/AirportDaoImpl.java`
- [ ] `dao/FlightDao.java` + `dao/FlightDaoImpl.java`
- [ ] `dao/ScheduledFlightDao.java` + `dao/ScheduledFlightDaoImpl.java`
- [ ] `dao/BookingDao.java` + `dao/BookingDaoImpl.java`

## Phase 3 — Service Layer
- [ ] `service/UserService.java` + `service/UserServiceImpl.java`
- [ ] `service/AirportService.java` + `service/AirportServiceImpl.java`
- [ ] `service/FlightService.java` + `service/FlightServiceImpl.java`
- [ ] `service/ScheduledFlightService.java` + `service/ScheduledFlightServiceImpl.java`
- [ ] `service/BookingService.java` + `service/BookingServiceImpl.java`

## Phase 4 — RBAC
- [ ] `annotation/AdminOnly.java`
- [ ] `interceptor/AuthInterceptor.java`
- [ ] `config/WebMvcConfig.java`

## Phase 5 — Controllers
- [ ] `controller/UserController.java`
- [ ] `controller/FlightController.java`
- [ ] `controller/ScheduledFlightController.java`
- [ ] `controller/BookingController.java`
- [ ] `controller/AirportController.java`

## Phase 6 — Verification
- [ ] Compile full project
- [ ] Boot application
- [ ] Test endpoints
