package com.example.FlightMgmtSys.dao;

import com.example.FlightMgmtSys.model.Airport;
import com.example.FlightMgmtSys.model.Flight;
import com.example.FlightMgmtSys.model.Schedule;
import com.example.FlightMgmtSys.model.ScheduledFlight;

import java.math.BigInteger;
import java.time.LocalDate;
import java.util.List;

/**
 * Data Access Object interface for ScheduledFlight entity.
 */
public interface ScheduledFlightDao {

    ScheduledFlight scheduleFlight(ScheduledFlight scheduledFlight);

    List<ScheduledFlight> viewScheduledFlights(Airport source, Airport destination, LocalDate date);

    ScheduledFlight viewScheduledFlights(BigInteger scheduledFlightId);

    List<ScheduledFlight> viewScheduledFlight();

    ScheduledFlight modifyScheduledFlight(ScheduledFlight scheduledFlight);

    void deleteScheduledFlight(BigInteger scheduledFlightId);
}
