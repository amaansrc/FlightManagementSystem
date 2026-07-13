package com.example.FlightMgmtSys.dao;

import com.example.FlightMgmtSys.exception.RecordNotFoundException;
import com.example.FlightMgmtSys.model.Flight;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.jdbc.support.GeneratedKeyHolder;
import org.springframework.jdbc.support.KeyHolder;
import org.springframework.stereotype.Repository;

import java.math.BigInteger;
import java.sql.PreparedStatement;
import java.sql.Statement;
import java.util.List;

/**
 * JDBC-backed implementation of {@link FlightDao}.
 * Uses soft-delete (flight_state = 'INACTIVE') rather than physical deletion.
 */
@Repository
public class FlightDaoImpl implements FlightDao {

    private final JdbcTemplate jdbcTemplate;

    private static final RowMapper<Flight> FLIGHT_ROW_MAPPER = (rs, rowNum) -> {
        Flight flight = new Flight();
        flight.setFlightNumber(BigInteger.valueOf(rs.getLong("flight_number")));
        flight.setFlightModel(rs.getString("flight_model"));
        flight.setCarrierName(rs.getString("carrier_name"));
        flight.setSeatCapacity(rs.getInt("seat_capacity"));
        return flight;
    };

    public FlightDaoImpl(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @Override
    public Flight addFlight(Flight flight) {
        String sql = "INSERT INTO flight (flight_model, carrier_name, seat_capacity) VALUES (?, ?, ?)";

        KeyHolder keyHolder = new GeneratedKeyHolder();
        jdbcTemplate.update(connection -> {
            PreparedStatement ps = connection.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS);
            ps.setString(1, flight.getFlightModel());
            ps.setString(2, flight.getCarrierName());
            ps.setInt(3, flight.getSeatCapacity());
            return ps;
        }, keyHolder);

        flight.setFlightNumber(BigInteger.valueOf(keyHolder.getKey().longValue()));
        return flight;
    }

    @Override
    public Flight modifyFlight(Flight flight) {
        String sql = "UPDATE flight SET flight_model = ?, carrier_name = ?, seat_capacity = ? "
                   + "WHERE flight_number = ? AND flight_state = 'ACTIVE'";
        int rows = jdbcTemplate.update(sql,
                flight.getFlightModel(),
                flight.getCarrierName(),
                flight.getSeatCapacity(),
                flight.getFlightNumber().longValue());

        if (rows == 0) {
            throw new RecordNotFoundException("Flight", flight.getFlightNumber());
        }
        return flight;
    }

    @Override
    public Flight viewFlight(BigInteger flightNumber) {
        String sql = "SELECT * FROM flight WHERE flight_number = ? AND flight_state = 'ACTIVE'";
        List<Flight> flights = jdbcTemplate.query(sql, FLIGHT_ROW_MAPPER, flightNumber.longValue());
        if (flights.isEmpty()) {
            throw new RecordNotFoundException("Flight", flightNumber);
        }
        return flights.get(0);
    }

    @Override
    public List<Flight> viewFlight() {
        String sql = "SELECT * FROM flight WHERE flight_state = 'ACTIVE'";
        return jdbcTemplate.query(sql, FLIGHT_ROW_MAPPER);
    }

    @Override
    public void deleteFlight(BigInteger flightNumber) {
        String sql = "UPDATE flight SET flight_state = 'INACTIVE' WHERE flight_number = ? AND flight_state = 'ACTIVE'";
        int rows = jdbcTemplate.update(sql, flightNumber.longValue());
        if (rows == 0) {
            throw new RecordNotFoundException("Flight", flightNumber);
        }
    }
}
