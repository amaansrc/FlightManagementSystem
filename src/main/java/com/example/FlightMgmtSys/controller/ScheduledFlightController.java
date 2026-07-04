package com.example.FlightMgmtSys.controller;

import com.example.FlightMgmtSys.dto.ScheduledFlightUpdateRequest;
import com.example.FlightMgmtSys.entity.ScheduledFlight;
import com.example.FlightMgmtSys.service.ScheduleFlightService;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/scheduled-flights")
public class ScheduledFlightController {

    private final ScheduleFlightService scheduleFlightService;

    public ScheduledFlightController(ScheduleFlightService scheduleFlightService) {
        this.scheduleFlightService = scheduleFlightService;
    }

    /**
     * US-012: View Scheduled Flights.
     * GET /api/scheduled-flights                              -> all scheduled flights
     * GET /api/scheduled-flights?source=DEL&destination=BOM&date=2026-08-01 -> route search
     */
    @GetMapping
    public List<ScheduledFlight> viewScheduledFlights(
            @RequestParam(required = false) String source,
            @RequestParam(required = false) String destination,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {

        if (source != null || destination != null || date != null) {
            return scheduleFlightService.viewScheduledFlights(source, destination, date);
        }
        return scheduleFlightService.viewScheduledFlight();
    }

    /** US-012: View a single scheduled flight. GET /api/scheduled-flights/{id} */
    @GetMapping("/{scheduleFlightId}")
    public ScheduledFlight viewScheduledFlight(@PathVariable Long scheduleFlightId) {
        return scheduleFlightService.viewScheduledFlights(scheduleFlightId);
    }

    /** US-013: Modify Scheduled Flight. PUT /api/scheduled-flights/{id} */
    @PutMapping("/{scheduleFlightId}")
    public ScheduledFlight modifyScheduledFlight(@PathVariable Long scheduleFlightId,
                                                  @RequestBody ScheduledFlightUpdateRequest request) {
        return scheduleFlightService.modifyScheduledFlight(scheduleFlightId, request);
    }
}
