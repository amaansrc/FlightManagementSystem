package com.example.FlightMgmtSys.dao;

import com.example.FlightMgmtSys.model.Flight;

import java.math.BigInteger;
import java.util.List;

/**
 * Data Access Object interface for Flight entity.
 */
public interface FlightDao {

    Flight addFlight(Flight flight);

    Flight modifyFlight(Flight flight);

    Flight viewFlight(BigInteger flightNumber);

    List<Flight> viewFlight();

    void deleteFlight(BigInteger flightNumber);
}
