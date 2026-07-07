-- ============================================================
--   FLIGHT MANAGEMENT SYSTEM - MySQL Database Schema
-- ============================================================

CREATE DATABASE IF NOT EXISTS flight_management_db;
USE flight_management_db;

-- ============================================================
-- 1. AIRPORT TABLE
--    (No dependencies, so created first)
-- ============================================================
CREATE TABLE IF NOT EXISTS airport (
    airport_code        VARCHAR(10)     PRIMARY KEY,
    airport_name        VARCHAR(100)    NOT NULL,
    airport_location    VARCHAR(100)    NOT NULL
);

-- ============================================================
-- 2. USER TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS user (
    user_id         BIGINT          PRIMARY KEY AUTO_INCREMENT,
    user_type       VARCHAR(10)     NOT NULL
                    CHECK (user_type IN ('ADMIN', 'CUSTOMER')),
    user_name       VARCHAR(50)     NOT NULL UNIQUE,
    user_password   VARCHAR(255)    NOT NULL,               -- store hashed password
    user_phone      CHAR(10)        NOT NULL
                    CHECK (user_phone REGEXP '^[1-9][0-9]{9}$'),  -- 10 digits, no leading 0
    user_email      VARCHAR(100)    NOT NULL UNIQUE
                    CHECK (user_email REGEXP '^[a-zA-Z0-9][a-zA-Z0-9._+-]*@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$'),
    user_state      VARCHAR(20)     NOT NULL DEFAULT 'ACTIVE'
                    CHECK (user_state IN ('ACTIVE', 'INACTIVE'))
);

-- ============================================================
-- 3. FLIGHT TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS flight (
    flight_number   BIGINT          PRIMARY KEY AUTO_INCREMENT,
    flight_model    VARCHAR(50)     NOT NULL,
    carrier_name    VARCHAR(100)    NOT NULL,
    seat_capacity   INT             NOT NULL CHECK (seat_capacity > 0),
    flight_state    VARCHAR(20)     NOT NULL DEFAULT 'ACTIVE'
                    CHECK (flight_state IN ('ACTIVE', 'INACTIVE'))
);

-- ============================================================
-- 4. SCHEDULE TABLE
--    (Depends on: airport)
--
--    NOTE: MySQL does not allow CHECK constraints on columns
--    that are also used in a FOREIGN KEY referential action.
--    The "source <> destination" rule is enforced via a TRIGGER
--    below instead.  The arrival > departure rule is also a
--    TRIGGER because MySQL evaluates CHECKs before FK lookups,
--    making combined validation unreliable in older 8.x builds.
-- ============================================================
CREATE TABLE IF NOT EXISTS schedule (
    schedule_id             BIGINT          PRIMARY KEY AUTO_INCREMENT,
    source_airport          VARCHAR(10)     NOT NULL,
    destination_airport     VARCHAR(10)     NOT NULL,
    departure_date_time     DATETIME        NOT NULL,
    arrival_date_time       DATETIME        NOT NULL,

    -- arrival must be after departure (safe: no FK column involved)
    CHECK (arrival_date_time > departure_date_time),

    FOREIGN KEY (source_airport)
        REFERENCES airport(airport_code)
        ON UPDATE CASCADE ON DELETE RESTRICT,

    FOREIGN KEY (destination_airport)
        REFERENCES airport(airport_code)
        ON UPDATE CASCADE ON DELETE RESTRICT
);

-- Trigger: prevent same source and destination airport
DELIMITER $$
CREATE TRIGGER trg_schedule_src_dst_insert
BEFORE INSERT ON schedule
FOR EACH ROW
BEGIN
    IF NEW.source_airport = NEW.destination_airport THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Source and destination airports must be different.';
    END IF;
END$$

CREATE TRIGGER trg_schedule_src_dst_update
BEFORE UPDATE ON schedule
FOR EACH ROW
BEGIN
    IF NEW.source_airport = NEW.destination_airport THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Source and destination airports must be different.';
    END IF;
END$$
DELIMITER ;

-- ============================================================
-- 5. SCHEDULED_FLIGHT TABLE
--    (Depends on: flight, schedule)
-- ============================================================
CREATE TABLE IF NOT EXISTS scheduled_flight (
    schedule_flight_id      BIGINT          PRIMARY KEY AUTO_INCREMENT,
    flight_number           BIGINT          NOT NULL,
    schedule_id             BIGINT          NOT NULL,
    available_seats         INT             NOT NULL CHECK (available_seats >= 0),
    ticket_cost             DECIMAL(10, 2)  NOT NULL CHECK (ticket_cost > 0),
    schedule_flight_state   VARCHAR(20)     NOT NULL DEFAULT 'ACTIVE'
                            CHECK (schedule_flight_state IN ('ACTIVE', 'INACTIVE', 'COMPLETED')),

    FOREIGN KEY (flight_number)
        REFERENCES flight(flight_number)
        ON UPDATE CASCADE ON DELETE RESTRICT,

    FOREIGN KEY (schedule_id)
        REFERENCES schedule(schedule_id)
        ON UPDATE CASCADE ON DELETE RESTRICT
);

-- ============================================================
-- 6. BOOKING TABLE
--    (Depends on: user, scheduled_flight)
-- ============================================================
CREATE TABLE IF NOT EXISTS booking (
    booking_id          BIGINT          PRIMARY KEY AUTO_INCREMENT,
    user_id             BIGINT          NOT NULL,
    schedule_flight_id  BIGINT          NOT NULL,
    booking_date        DATE            NOT NULL DEFAULT (CURRENT_DATE),
    ticket_cost         DECIMAL(10, 2)  NOT NULL CHECK (ticket_cost > 0),
    passenger_count     INT             NOT NULL CHECK (passenger_count > 0),
    booking_state       VARCHAR(20)     NOT NULL DEFAULT 'CONFIRMED'
                        CHECK (booking_state IN ('CONFIRMED', 'CANCELLED', 'MODIFIED')),

    FOREIGN KEY (user_id)
        REFERENCES user(user_id)
        ON UPDATE CASCADE ON DELETE RESTRICT,

    FOREIGN KEY (schedule_flight_id)
        REFERENCES scheduled_flight(schedule_flight_id)
        ON UPDATE CASCADE ON DELETE RESTRICT
);

-- ============================================================
-- 7. PASSENGER TABLE
--    (Depends on: booking)
-- ============================================================
CREATE TABLE IF NOT EXISTS passenger (
    pnr_number          BIGINT          PRIMARY KEY AUTO_INCREMENT,
    booking_id          BIGINT          NOT NULL,
    passenger_name      VARCHAR(100)    NOT NULL,
    passenger_age       INT             NOT NULL CHECK (passenger_age > 0 AND passenger_age < 150),
    passenger_UIN       CHAR(12)        NOT NULL UNIQUE
                        CHECK (passenger_UIN REGEXP '^[0-9]{12}$'),    -- 12-digit Aadhaar
    luggage             DECIMAL(5, 2)   NOT NULL DEFAULT 0.00
                        CHECK (luggage >= 0),
    passenger_state     VARCHAR(20)     NOT NULL DEFAULT 'ACTIVE'
                        CHECK (passenger_state IN ('ACTIVE', 'CANCELLED')),

    FOREIGN KEY (booking_id)
        REFERENCES booking(booking_id)
        ON UPDATE CASCADE ON DELETE CASCADE
);


-- ============================================================
-- INDEXES  (speeds up the most common lookups)
-- ============================================================

-- Find bookings by user
CREATE INDEX idx_booking_user        ON booking(user_id);

-- Find bookings for a scheduled flight
CREATE INDEX idx_booking_sf          ON booking(schedule_flight_id);

-- Find passengers for a booking
CREATE INDEX idx_passenger_booking   ON passenger(booking_id);

-- Search scheduled flights by route + date
CREATE INDEX idx_sf_flight           ON scheduled_flight(flight_number);
CREATE INDEX idx_sf_schedule         ON scheduled_flight(schedule_id);
CREATE INDEX idx_schedule_src_dst    ON schedule(source_airport, destination_airport);
CREATE INDEX idx_schedule_departure  ON schedule(departure_date_time);


-- ============================================================
-- SAMPLE / SEED DATA
-- ============================================================

-- Airports (fixed list per assumptions in the spec)
INSERT INTO airport (airport_code, airport_name, airport_location) VALUES
    ('DEL', 'Indira Gandhi International Airport', 'New Delhi'),
    ('BOM', 'Chhatrapati Shivaji Maharaj International Airport', 'Mumbai'),
    ('BLR', 'Kempegowda International Airport', 'Bangalore'),
    ('MAA', 'Chennai International Airport', 'Chennai'),
    ('HYD', 'Rajiv Gandhi International Airport', 'Hyderabad'),
    ('CCU', 'Netaji Subhas Chandra Bose International Airport', 'Kolkata'),
    ('COK', 'Cochin International Airport', 'Kochi'),
    ('AMD', 'Sardar Vallabhbhai Patel International Airport', 'Ahmedabad');

-- Admin user (password should be hashed in real code; shown as plain text here)
INSERT INTO user (user_type, user_name, user_password, user_phone, user_email) VALUES
    ('ADMIN', 'admin', 'admin@123', '9999999999', 'admin@flightmgmt.com');

-- Sample flights
INSERT INTO flight (flight_model, carrier_name, seat_capacity) VALUES
    ('Boeing 737',  'IndiGo',    180),
    ('Airbus A320', 'Air India', 160),
    ('Boeing 777',  'SpiceJet',  200);

-- Sample schedule
INSERT INTO schedule (source_airport, destination_airport, departure_date_time, arrival_date_time) VALUES
    ('DEL', 'BOM', '2026-08-01 06:00:00', '2026-08-01 08:10:00'),
    ('BOM', 'BLR', '2026-08-01 10:00:00', '2026-08-01 11:30:00'),
    ('DEL', 'CCU', '2026-08-02 07:00:00', '2026-08-02 09:30:00');

-- Sample scheduled flights
INSERT INTO scheduled_flight (flight_number, schedule_id, available_seats, ticket_cost) VALUES
    (1, 1, 180, 4500.00),
    (2, 2, 160, 3200.00),
    (3, 3, 200, 5100.00);


-- ============================================================
-- USEFUL QUERIES (reference for your DAO layer)
-- ============================================================

-- 1. Search flights between two airports on a date (viewScheduledFlights)
-- SELECT sf.*, f.*, s.*, a1.*, a2.*
-- FROM scheduled_flight sf
-- JOIN flight f        ON sf.flight_number = f.flight_number
-- JOIN schedule s      ON sf.schedule_id   = s.schedule_id
-- JOIN airport a1      ON s.source_airport      = a1.airport_code
-- JOIN airport a2      ON s.destination_airport = a2.airport_code
-- WHERE s.source_airport      = 'DEL'
--   AND s.destination_airport = 'BOM'
--   AND DATE(s.departure_date_time) = '2026-08-01'
--   AND sf.available_seats > 0
--   AND sf.schedule_flight_state = 'ACTIVE';

-- 2. Get all bookings for a user (viewBooking by userId)
-- SELECT b.*, sf.*, f.*, s.*
-- FROM booking b
-- JOIN scheduled_flight sf ON b.schedule_flight_id = sf.schedule_flight_id
-- JOIN flight f            ON sf.flight_number = f.flight_number
-- JOIN schedule s          ON sf.schedule_id   = s.schedule_id
-- WHERE b.user_id = ?;

-- 3. Get passengers for a booking
-- SELECT * FROM passenger WHERE booking_id = ?;

-- 4. Cancel a booking (deleteBooking / cancel)
-- UPDATE booking    SET booking_state   = 'CANCELLED' WHERE booking_id = ?;
-- UPDATE passenger  SET passenger_state = 'CANCELLED' WHERE booking_id = ?;
-- UPDATE scheduled_flight
--    SET available_seats = available_seats + (SELECT passenger_count FROM booking WHERE booking_id = ?)
--  WHERE schedule_flight_id = (SELECT schedule_flight_id FROM booking WHERE booking_id = ?);
