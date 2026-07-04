package com.example.FlightMgmtSys.service;

import com.example.FlightMgmtSys.dto.ScheduledFlightUpdateRequest;
import com.example.FlightMgmtSys.entity.ScheduledFlight;

import java.time.LocalDate;
import java.util.List;

public interface ScheduleFlightService {

    List<ScheduledFlight> viewScheduledFlights(String sourceAirportCode, String destinationAirportCode, LocalDate date);

    ScheduledFlight viewScheduledFlights(Long scheduleFlightId);

    List<ScheduledFlight> viewScheduledFlight();

    ScheduledFlight modifyScheduledFlight(Long scheduleFlightId, ScheduledFlightUpdateRequest request);
}
