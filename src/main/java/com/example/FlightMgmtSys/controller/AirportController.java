package com.example.FlightMgmtSys.controller;

import com.example.FlightMgmtSys.model.Airport;
import com.example.FlightMgmtSys.service.AirportService;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST controller for Airport operations.
 * All airports are read-only (fixed and pre-loaded in the database).
 * Any authenticated user can view airports.
 */
@RestController
@RequestMapping("/api/airports")
public class AirportController {

    private final AirportService airportService;

    public AirportController(AirportService airportService) {
        this.airportService = airportService;
    }

    /**
     * View all airports.
     */
    @GetMapping
    public ResponseEntity<List<Airport>> viewAllAirports() {
        return ResponseEntity.ok(airportService.viewAirport());
    }

    /**
     * View a single airport by its airport code.
     */
    @GetMapping("/{code}")
    public ResponseEntity<Airport> viewAirport(@PathVariable("code") String code) {
        return ResponseEntity.ok(airportService.viewAirport(code));
    }
}
