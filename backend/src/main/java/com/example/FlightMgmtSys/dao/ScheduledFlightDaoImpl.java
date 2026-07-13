package com.example.FlightMgmtSys.dao;

import com.example.FlightMgmtSys.exception.RecordNotFoundException;
import com.example.FlightMgmtSys.model.Airport;
import com.example.FlightMgmtSys.model.Flight;
import com.example.FlightMgmtSys.model.Schedule;
import com.example.FlightMgmtSys.model.ScheduledFlight;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.jdbc.support.GeneratedKeyHolder;
import org.springframework.jdbc.support.KeyHolder;
import org.springframework.stereotype.Repository;

import java.math.BigInteger;
import java.sql.PreparedStatement;
import java.sql.Statement;
import java.time.LocalDate;
import java.util.List;

/**
 * JDBC-backed implementation of {@link ScheduledFlightDao}.
 * Performs multi-table JOINs across scheduled_flight, flight, schedule, and
 * airport.
 */
@Repository
public class ScheduledFlightDaoImpl implements ScheduledFlightDao {

    private final JdbcTemplate jdbcTemplate;

    /**
     * Base SELECT with all JOINs needed to hydrate a full ScheduledFlight object.
     */
    private static final String BASE_SELECT = "SELECT sf.schedule_flight_id, sf.available_seats, sf.ticket_cost, "
            + "  f.flight_number, f.flight_model, f.carrier_name, f.seat_capacity, "
            + "  s.schedule_id, s.departure_date_time, s.arrival_date_time, "
            + "  a1.airport_code AS src_code, a1.airport_name AS src_name, a1.airport_location AS src_location, "
            + "  a2.airport_code AS dst_code, a2.airport_name AS dst_name, a2.airport_location AS dst_location "
            + "FROM scheduled_flight sf "
            + "JOIN flight f   ON sf.flight_number = f.flight_number "
            + "JOIN schedule s ON sf.schedule_id   = s.schedule_id "
            + "JOIN airport a1 ON s.source_airport      = a1.airport_code "
            + "JOIN airport a2 ON s.destination_airport  = a2.airport_code ";

    /**
     * RowMapper that builds a fully hydrated ScheduledFlight with nested objects.
     */
    private static final RowMapper<ScheduledFlight> SF_ROW_MAPPER = (rs, rowNum) -> {
        // Source airport
        Airport source = new Airport();
        source.setAirportCode(rs.getString("src_code"));
        source.setAirportName(rs.getString("src_name"));
        source.setAirportLocation(rs.getString("src_location"));

        // Destination airport
        Airport destination = new Airport();
        destination.setAirportCode(rs.getString("dst_code"));
        destination.setAirportName(rs.getString("dst_name"));
        destination.setAirportLocation(rs.getString("dst_location"));

        // Schedule
        Schedule schedule = new Schedule();
        schedule.setScheduleId(BigInteger.valueOf(rs.getLong("schedule_id")));
        schedule.setSourceAirport(source);
        schedule.setDestinationAirport(destination);
        schedule.setDepartureTime(rs.getTimestamp("departure_date_time").toLocalDateTime());
        schedule.setArrivalTime(rs.getTimestamp("arrival_date_time").toLocalDateTime());

        // Flight
        Flight flight = new Flight();
        flight.setFlightNumber(BigInteger.valueOf(rs.getLong("flight_number")));
        flight.setFlightModel(rs.getString("flight_model"));
        flight.setCarrierName(rs.getString("carrier_name"));
        flight.setSeatCapacity(rs.getInt("seat_capacity"));

        // Scheduled flight
        ScheduledFlight sf = new ScheduledFlight();
        sf.setScheduledFlightId(BigInteger.valueOf(rs.getLong("schedule_flight_id")));
        sf.setFlight(flight);
        sf.setSchedule(schedule);
        sf.setAvailableSeats(rs.getInt("available_seats"));
        sf.setTicketCost(rs.getBigDecimal("ticket_cost"));

        return sf;
    };

    public ScheduledFlightDaoImpl(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @Override
    public ScheduledFlight scheduleFlight(ScheduledFlight scheduledFlight) {
        // First, insert the schedule
        String scheduleSql = "INSERT INTO schedule (source_airport, destination_airport, "
                + "departure_date_time, arrival_date_time) VALUES (?, ?, ?, ?)";
        KeyHolder scheduleKeyHolder = new GeneratedKeyHolder();
        Schedule sch = scheduledFlight.getSchedule();
        jdbcTemplate.update(connection -> {
            PreparedStatement ps = connection.prepareStatement(scheduleSql, Statement.RETURN_GENERATED_KEYS);
            ps.setString(1, sch.getSourceAirport().getAirportCode());
            ps.setString(2, sch.getDestinationAirport().getAirportCode());
            ps.setTimestamp(3, java.sql.Timestamp.valueOf(sch.getDepartureTime()));
            ps.setTimestamp(4, java.sql.Timestamp.valueOf(sch.getArrivalTime()));
            return ps;
        }, scheduleKeyHolder);
        sch.setScheduleId(BigInteger.valueOf(scheduleKeyHolder.getKey().longValue()));

        // Then, insert the scheduled_flight
        String sfSql = "INSERT INTO scheduled_flight (flight_number, schedule_id, available_seats, ticket_cost) "
                + "VALUES (?, ?, ?, ?)";
        KeyHolder sfKeyHolder = new GeneratedKeyHolder();
        jdbcTemplate.update(connection -> {
            PreparedStatement ps = connection.prepareStatement(sfSql, Statement.RETURN_GENERATED_KEYS);
            ps.setLong(1, scheduledFlight.getFlight().getFlightNumber().longValue());
            ps.setLong(2, sch.getScheduleId().longValue());
            ps.setInt(3, scheduledFlight.getAvailableSeats());
            ps.setBigDecimal(4, scheduledFlight.getTicketCost());
            return ps;
        }, sfKeyHolder);
        scheduledFlight.setScheduledFlightId(BigInteger.valueOf(sfKeyHolder.getKey().longValue()));

        return scheduledFlight;
    }

    @Override
    public List<ScheduledFlight> viewScheduledFlights(Airport source, Airport destination, LocalDate date) {
        String sql = BASE_SELECT
                + "WHERE s.source_airport = ? "
                + "  AND s.destination_airport = ? "
                + "  AND DATE(s.departure_date_time) = ? "
                + "  AND sf.schedule_flight_state = 'ACTIVE' "
                + "  AND sf.available_seats > 0";
        return jdbcTemplate.query(sql, SF_ROW_MAPPER,
                source.getAirportCode(), destination.getAirportCode(), date.toString());
    }

    @Override
    public ScheduledFlight viewScheduledFlights(BigInteger flightNumber) {
        String sql = BASE_SELECT
                + "WHERE sf.flight_number = ? AND sf.schedule_flight_state = 'ACTIVE'";
        List<ScheduledFlight> list = jdbcTemplate.query(sql, SF_ROW_MAPPER, flightNumber.longValue());
        if (list.isEmpty()) {
            throw new RecordNotFoundException("ScheduledFlight with flight number", flightNumber);
        }
        return list.get(0);
    }

    @Override
    public List<ScheduledFlight> viewScheduledFlight() {
        String sql = BASE_SELECT + "WHERE sf.schedule_flight_state = 'ACTIVE'";
        return jdbcTemplate.query(sql, SF_ROW_MAPPER);
    }

    @Override
    public ScheduledFlight modifyScheduledFlight(Flight flight, Schedule schedule, int availableSeats) {
        // Update the schedule
        String updateScheduleSql = "UPDATE schedule SET source_airport = ?, destination_airport = ?, "
                + "departure_date_time = ?, arrival_date_time = ? WHERE schedule_id = ?";
        jdbcTemplate.update(updateScheduleSql,
                schedule.getSourceAirport().getAirportCode(),
                schedule.getDestinationAirport().getAirportCode(),
                java.sql.Timestamp.valueOf(schedule.getDepartureTime()),
                java.sql.Timestamp.valueOf(schedule.getArrivalTime()),
                schedule.getScheduleId().longValue());

        // Update the scheduled_flight
        String updateSfSql = "UPDATE scheduled_flight SET available_seats = ? "
                + "WHERE flight_number = ? AND schedule_id = ? AND schedule_flight_state = 'ACTIVE'";
        int rows = jdbcTemplate.update(updateSfSql,
                availableSeats,
                flight.getFlightNumber().longValue(),
                schedule.getScheduleId().longValue());

        if (rows == 0) {
            throw new RecordNotFoundException("ScheduledFlight with flight number", flight.getFlightNumber());
        }

        // Return the updated scheduled flight
        return viewScheduledFlights(flight.getFlightNumber());
    }

    @Override
    public void deleteScheduledFlight(BigInteger scheduledFlightId) {
        String sql = "UPDATE scheduled_flight SET schedule_flight_state = 'INACTIVE' "
                + "WHERE schedule_flight_id = ? AND schedule_flight_state = 'ACTIVE'";
        int rows = jdbcTemplate.update(sql, scheduledFlightId.longValue());
        if (rows == 0) {
            throw new RecordNotFoundException("ScheduledFlight", scheduledFlightId);
        }
    }

    /**
     * Retrieves a scheduled flight by its primary key (schedule_flight_id).
     * Used internally by BookingDaoImpl.
     */
    public ScheduledFlight viewScheduledFlightById(BigInteger scheduledFlightId) {
        String sql = BASE_SELECT + "WHERE sf.schedule_flight_id = ? AND sf.schedule_flight_state = 'ACTIVE'";
        List<ScheduledFlight> list = jdbcTemplate.query(sql, SF_ROW_MAPPER, scheduledFlightId.longValue());
        if (list.isEmpty()) {
            throw new RecordNotFoundException("ScheduledFlight", scheduledFlightId);
        }
        return list.get(0);
    }
}
