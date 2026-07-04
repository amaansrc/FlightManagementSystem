package com.example.FlightMgmtSys.controller;

import com.example.FlightMgmtSys.entity.Airport;
import com.example.FlightMgmtSys.service.AirportService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/airports")
public class AirportController {

    private final AirportService airportService;

    public AirportController(AirportService airportService) {
        this.airportService = airportService;
    }

    /** US-014: View Airports. GET /api/airports */
    @GetMapping
    public List<Airport> viewAirports() {
        return airportService.viewAirport();
    }

    /** US-015: Airport Search. GET /api/airports/{airportCode} */
    @GetMapping("/{airportCode}")
    public Airport viewAirport(@PathVariable String airportCode) {
        return airportService.viewAirport(airportCode);
    }
}
