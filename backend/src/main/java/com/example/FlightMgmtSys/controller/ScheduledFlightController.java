package com.example.FlightMgmtSys.controller;

import org.springframework.security.access.prepost.PreAuthorize;
import com.example.FlightMgmtSys.model.Airport;
import com.example.FlightMgmtSys.model.ScheduledFlight;
import com.example.FlightMgmtSys.service.ScheduledFlightService;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigInteger;
import java.time.LocalDate;
import java.util.List;

/**
 * REST controller for ScheduledFlight management.
 *
 * <p>
 * Authenticated endpoints (any logged-in user):
 * <ul>
 * <li>GET /api/scheduled-flights — view all scheduled flights</li>
 * <li>GET /api/scheduled-flights/{flightNumber} — view by flight number</li>
 * <li>GET /api/scheduled-flights/search?source=X&amp;dest=Y&amp;date=Z — search
 * by route and date</li>
 * </ul>
 *
 * <p>
 * Admin-only endpoints:
 * <ul>
 * <li>POST /api/scheduled-flights — schedule a new flight</li>
 * <li>PUT /api/scheduled-flights — modify a scheduled flight</li>
 * <li>DELETE /api/scheduled-flights/{id} — remove a scheduled flight</li>
 * </ul>
 */
@RestController
@RequestMapping("/api/scheduled-flights")
public class ScheduledFlightController {

    private final ScheduledFlightService scheduledFlightService;

    public ScheduledFlightController(ScheduledFlightService scheduledFlightService) {
        this.scheduledFlightService = scheduledFlightService;
    }

    /**
     * Schedule a new flight. Admin only.
     * Expects a full ScheduledFlight JSON with nested Flight and Schedule objects.
     */
    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping
    public ResponseEntity<ScheduledFlight> scheduleFlight(@RequestBody ScheduledFlight scheduledFlight) {
        ScheduledFlight created = scheduledFlightService.scheduleFlight(scheduledFlight);
        return new ResponseEntity<>(created, HttpStatus.CREATED);
    }

    /**
     * Search scheduled flights by source airport, destination airport, and date.
     * Example: GET
     * /api/scheduled-flights/search?source=DEL&dest=BOM&date=2026-08-01
     */
    @GetMapping("/search")
    public ResponseEntity<List<ScheduledFlight>> searchFlights(
            @RequestParam("source") String sourceCode,
            @RequestParam("dest") String destCode,
            @RequestParam("date") LocalDate date) {

        Airport source = new Airport();
        source.setAirportCode(sourceCode);

        Airport destination = new Airport();
        destination.setAirportCode(destCode);

        List<ScheduledFlight> results = scheduledFlightService
                .viewScheduledFlights(source, destination, date);
        return ResponseEntity.ok(results);
    }

    /**
     * View a scheduled flight by its ID.
     */
    @GetMapping("/{id}")
    public ResponseEntity<ScheduledFlight> viewById(
            @PathVariable("id") BigInteger id) {
        return ResponseEntity.ok(scheduledFlightService.viewScheduledFlights(id));
    }

    /**
     * View all scheduled flights.
     */
    @GetMapping
    public ResponseEntity<List<ScheduledFlight>> viewAllScheduledFlights() {
        return ResponseEntity.ok(scheduledFlightService.viewScheduledFlight());
    }

    /**
     * Modify a scheduled flight. Admin only.
     * Expects a ScheduledFlight JSON with scheduledFlightId and nested Flight,
     * Schedule, etc.
     */
    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping
    public ResponseEntity<ScheduledFlight> modifyScheduledFlight(
            @RequestBody ScheduledFlight scheduledFlight) {
        ScheduledFlight modified = scheduledFlightService.modifyScheduledFlight(scheduledFlight);
        return ResponseEntity.ok(modified);
    }

    /**
     * Delete a scheduled flight. Admin only.
     */
    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteScheduledFlight(@PathVariable("id") BigInteger id) {
        scheduledFlightService.deleteScheduledFlight(id);
        return ResponseEntity.noContent().build();
    }
}
