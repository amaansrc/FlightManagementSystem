package com.example.FlightMgmtSys.dao;

import com.example.FlightMgmtSys.exception.RecordNotFoundException;
import com.example.FlightMgmtSys.model.Airport;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * JDBC-backed implementation of {@link AirportDao}.
 * Read-only — airports are fixed and pre-loaded in the database.
 */
@Repository
public class AirportDaoImpl implements AirportDao {

    private final JdbcTemplate jdbcTemplate;

    private static final RowMapper<Airport> AIRPORT_ROW_MAPPER = (rs, rowNum) -> {
        Airport airport = new Airport();
        airport.setAirportCode(rs.getString("airport_code"));
        airport.setAirportName(rs.getString("airport_name"));
        airport.setAirportLocation(rs.getString("airport_location"));
        return airport;
    };

    public AirportDaoImpl(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @Override
    public List<Airport> viewAirport() {
        String sql = "SELECT * FROM airport ORDER BY airport_code";
        return jdbcTemplate.query(sql, AIRPORT_ROW_MAPPER);
    }

    @Override
    public Airport viewAirport(String airportCode) {
        String sql = "SELECT * FROM airport WHERE airport_code = ?";
        List<Airport> airports = jdbcTemplate.query(sql, AIRPORT_ROW_MAPPER, airportCode);
        if (airports.isEmpty()) {
            throw new RecordNotFoundException("Airport", airportCode);
        }
        return airports.get(0);
    }
}
