package com.example.FlightMgmtSys.dao;

import com.example.FlightMgmtSys.exception.RecordNotFoundException;
import com.example.FlightMgmtSys.model.Booking;
import com.example.FlightMgmtSys.model.Passenger;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.jdbc.support.GeneratedKeyHolder;
import org.springframework.jdbc.support.KeyHolder;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.math.BigInteger;
import java.sql.PreparedStatement;
import java.sql.Statement;
import java.time.LocalDate;
import java.util.List;

/**
 * JDBC-backed implementation of {@link BookingDao}.
 * Manages transactional inserts across booking and passenger tables.
 * Booking deletion is a soft-cancel (booking_state = 'CANCELLED') which
 * also restores available_seats on the scheduled flight.
 */
@Repository
public class BookingDaoImpl implements BookingDao {

    private final JdbcTemplate jdbcTemplate;
    private final UserDaoImpl userDao;
    private final ScheduledFlightDaoImpl scheduledFlightDao;

    private static final RowMapper<Passenger> PASSENGER_ROW_MAPPER = (rs, rowNum) -> {
        Passenger p = new Passenger();
        p.setPnrNumber(BigInteger.valueOf(rs.getLong("pnr_number")));
        p.setPassengerName(rs.getString("passenger_name"));
        p.setPassengerAge(rs.getInt("passenger_age"));
        p.setPassengerUIN(new BigInteger(rs.getString("passenger_UIN")));
        p.setLuggage(rs.getDouble("luggage"));
        return p;
    };

    public BookingDaoImpl(JdbcTemplate jdbcTemplate, UserDaoImpl userDao,
            ScheduledFlightDaoImpl scheduledFlightDao) {
        this.jdbcTemplate = jdbcTemplate;
        this.userDao = userDao;
        this.scheduledFlightDao = scheduledFlightDao;
    }

    @Override
    public Booking addBooking(Booking booking) {
        // 1. Insert the booking record
        String bookingSql = "INSERT INTO booking (user_id, schedule_flight_id, booking_date, "
                + "ticket_cost, passenger_count) VALUES (?, ?, ?, ?, ?)";

        KeyHolder keyHolder = new GeneratedKeyHolder();
        BigInteger userId = booking.getUserId().getUserId();
        BigInteger sfId = booking.getFlight().getScheduledFlightId();
        BigDecimal cost = booking.getTicketCost();
        int passengers = booking.getNoOfPassengers();
        LocalDate bookingDate = booking.getBookingDate() != null ? booking.getBookingDate() : LocalDate.now();

        jdbcTemplate.update(connection -> {
            PreparedStatement ps = connection.prepareStatement(bookingSql, Statement.RETURN_GENERATED_KEYS);
            ps.setLong(1, userId.longValue());
            ps.setLong(2, sfId.longValue());
            ps.setDate(3, java.sql.Date.valueOf(bookingDate));
            ps.setBigDecimal(4, cost);
            ps.setInt(5, passengers);
            return ps;
        }, keyHolder);

        BigInteger bookingId = BigInteger.valueOf(keyHolder.getKey().longValue());
        booking.setBookingId(bookingId);
        booking.setBookingDate(bookingDate);

        // 2. Insert each passenger
        if (booking.getPassengerList() != null) {
            for (Passenger p : booking.getPassengerList()) {
                insertPassenger(bookingId, p);
            }
        }

        // 3. Decrement available seats on the scheduled flight
        updateAvailableSeats(sfId, -passengers);

        return booking;
    }

    @Override
    public Booking modifyBooking(Booking booking) {
        // Get the original booking to restore seats
        List<Booking> originalList = viewBooking(booking.getBookingId());
        if (originalList.isEmpty()) {
            throw new RecordNotFoundException("Booking", booking.getBookingId());
        }
        Booking original = originalList.get(0);

        // Restore seats from the original booking
        updateAvailableSeats(original.getFlight().getScheduledFlightId(), original.getNoOfPassengers());

        // Update the booking record (everything except booking_id)
        String sql = "UPDATE booking SET user_id = ?, schedule_flight_id = ?, booking_date = ?, "
                + "ticket_cost = ?, passenger_count = ?, booking_state = 'MODIFIED' "
                + "WHERE booking_id = ?";
        jdbcTemplate.update(sql,
                booking.getUserId().getUserId().longValue(),
                booking.getFlight().getScheduledFlightId().longValue(),
                java.sql.Date.valueOf(booking.getBookingDate()),
                booking.getTicketCost(),
                booking.getNoOfPassengers(),
                booking.getBookingId().longValue());

        // Delete old passengers and insert new ones
        jdbcTemplate.update("DELETE FROM passenger WHERE booking_id = ?",
                booking.getBookingId().longValue());

        if (booking.getPassengerList() != null) {
            for (Passenger p : booking.getPassengerList()) {
                insertPassenger(booking.getBookingId(), p);
            }
        }

        // Decrement seats for the new booking
        updateAvailableSeats(booking.getFlight().getScheduledFlightId(), -booking.getNoOfPassengers());

        return booking;
    }

    @Override
    public List<Booking> viewBooking(BigInteger bookingId) {
        String sql = "SELECT * FROM booking WHERE booking_id = ? AND booking_state != 'CANCELLED'";
        List<Booking> bookings = jdbcTemplate.query(sql, getBookingRowMapper(), bookingId.longValue());
        if (bookings.isEmpty()) {
            throw new RecordNotFoundException("Booking", bookingId);
        }
        // Load passengers for each booking
        for (Booking b : bookings) {
            b.setPassengerList(loadPassengers(b.getBookingId()));
        }
        return bookings;
    }

    @Override
    public List<Booking> viewBooking() {
        String sql = "SELECT * FROM booking WHERE booking_state != 'CANCELLED'";
        List<Booking> bookings = jdbcTemplate.query(sql, getBookingRowMapper());
        for (Booking b : bookings) {
            b.setPassengerList(loadPassengers(b.getBookingId()));
        }
        return bookings;
    }

    @Override
    public void deleteBooking(BigInteger bookingId) {
        // Get the booking to restore seats
        List<Booking> bookings = viewBooking(bookingId);
        if (bookings.isEmpty()) {
            throw new RecordNotFoundException("Booking", bookingId);
        }
        Booking booking = bookings.get(0);

        // Soft-cancel the booking
        jdbcTemplate.update("UPDATE booking SET booking_state = 'CANCELLED' WHERE booking_id = ?",
                bookingId.longValue());

        // Cancel all passengers
        jdbcTemplate.update("UPDATE passenger SET passenger_state = 'CANCELLED' WHERE booking_id = ?",
                bookingId.longValue());

        // Restore available seats
        updateAvailableSeats(booking.getFlight().getScheduledFlightId(), booking.getNoOfPassengers());
    }

    // ---- Helper Methods ----

    private void insertPassenger(BigInteger bookingId, Passenger passenger) {
        String sql = "INSERT INTO passenger (booking_id, passenger_name, passenger_age, "
                + "passenger_UIN, luggage) VALUES (?, ?, ?, ?, ?)";

        KeyHolder keyHolder = new GeneratedKeyHolder();
        jdbcTemplate.update(connection -> {
            PreparedStatement ps = connection.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS);
            ps.setLong(1, bookingId.longValue());
            ps.setString(2, passenger.getPassengerName());
            ps.setInt(3, passenger.getPassengerAge());
            ps.setString(4, passenger.getPassengerUIN().toString());
            ps.setDouble(5, passenger.getLuggage() != null ? passenger.getLuggage() : 0.0);
            return ps;
        }, keyHolder);

        passenger.setPnrNumber(BigInteger.valueOf(keyHolder.getKey().longValue()));
    }

    private List<Passenger> loadPassengers(BigInteger bookingId) {
        String sql = "SELECT * FROM passenger WHERE booking_id = ? AND passenger_state = 'ACTIVE'";
        return jdbcTemplate.query(sql, PASSENGER_ROW_MAPPER, bookingId.longValue());
    }

    private void updateAvailableSeats(BigInteger scheduledFlightId, int delta) {
        String sql = "UPDATE scheduled_flight SET available_seats = available_seats + ? "
                + "WHERE schedule_flight_id = ?";
        jdbcTemplate.update(sql, delta, scheduledFlightId.longValue());
    }

    /**
     * Returns a RowMapper that builds a Booking with nested User and
     * ScheduledFlight
     * by delegating to their respective DAOs.
     */
    private RowMapper<Booking> getBookingRowMapper() {
        return (rs, rowNum) -> {
            Booking booking = new Booking();
            booking.setBookingId(BigInteger.valueOf(rs.getLong("booking_id")));
            booking.setBookingDate(rs.getDate("booking_date").toLocalDate());
            booking.setTicketCost(rs.getBigDecimal("ticket_cost"));
            booking.setNoOfPassengers(rs.getInt("passenger_count"));

            // Hydrate nested User
            BigInteger userId = BigInteger.valueOf(rs.getLong("user_id"));
            booking.setUserId(userDao.viewUser(userId));

            // Hydrate nested ScheduledFlight
            BigInteger sfId = BigInteger.valueOf(rs.getLong("schedule_flight_id"));
            booking.setFlight(scheduledFlightDao.viewScheduledFlightById(sfId));

            return booking;
        };
    }
}
