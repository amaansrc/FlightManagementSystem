package com.example.FlightMgmtSys.controller;

import org.springframework.security.access.prepost.PreAuthorize;
import com.example.FlightMgmtSys.model.Flight;
import com.example.FlightMgmtSys.service.FlightService;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigInteger;
import java.util.List;

/**
 * REST controller for Flight management.
 *
 * <p>Authenticated endpoints (any logged-in user):
 * <ul>
 *   <li>GET /api/flights — view all flights</li>
 *   <li>GET /api/flights/{flightNumber} — view a specific flight</li>
 * </ul>
 *
 * <p>Admin-only endpoints:
 * <ul>
 *   <li>POST   /api/flights — add a new flight</li>
 *   <li>PUT    /api/flights — modify a flight</li>
 *   <li>DELETE /api/flights/{flightNumber} — remove a flight</li>
 * </ul>
 */
@RestController
@RequestMapping("/api/flights")
public class FlightController {

    private final FlightService flightService;

    public FlightController(FlightService flightService) {
        this.flightService = flightService;
    }

    /**
     * Add a new flight. Admin only.
     */
    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping
    public ResponseEntity<Flight> addFlight(@RequestBody Flight flight) {
        Flight created = flightService.addFlight(flight);
        return new ResponseEntity<>(created, HttpStatus.CREATED);
    }

    /**
     * View a flight by its flight number.
     */
    @GetMapping("/{flightNumber}")
    public ResponseEntity<Flight> viewFlight(@PathVariable("flightNumber") BigInteger flightNumber) {
        return ResponseEntity.ok(flightService.viewFlight(flightNumber));
    }

    /**
     * View all flights.
     */
    @GetMapping
    public ResponseEntity<List<Flight>> viewAllFlights() {
        return ResponseEntity.ok(flightService.viewFlight());
    }

    /**
     * Modify a flight. Admin only.
     */
    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping
    public ResponseEntity<Flight> modifyFlight(@RequestBody Flight flight) {
        return ResponseEntity.ok(flightService.modifyFlight(flight));
    }

    /**
     * Delete a flight. Admin only.
     */
    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/{flightNumber}")
    public ResponseEntity<Void> deleteFlight(@PathVariable("flightNumber") BigInteger flightNumber) {
        flightService.deleteFlight(flightNumber);
        return ResponseEntity.noContent().build();
    }
}
