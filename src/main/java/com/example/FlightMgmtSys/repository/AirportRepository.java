package com.example.FlightMgmtSys.repository;

import com.example.FlightMgmtSys.entity.Airport;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AirportRepository extends JpaRepository<Airport, String> {
    // findById(String airportCode) and findAll() come free from JpaRepository —
    // that covers US-014 (view all) and US-015 (lookup by code).
}
