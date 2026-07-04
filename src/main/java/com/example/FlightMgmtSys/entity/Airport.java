package com.example.FlightMgmtSys.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

/** Maps to the `airport` table (flight_management_schema.sql). */
@Entity
@Table(name = "airport")
public class Airport {

    @Id
    @Column(name = "airport_code", length = 10)
    private String airportCode;

    @Column(name = "airport_name", nullable = false, length = 100)
    private String airportName;

    @Column(name = "airport_location", nullable = false, length = 100)
    private String airportLocation;

    protected Airport() {
        // JPA requires a no-arg constructor
    }

    public Airport(String airportCode, String airportName, String airportLocation) {
        this.airportCode = airportCode;
        this.airportName = airportName;
        this.airportLocation = airportLocation;
    }

    public String getAirportCode() {
        return airportCode;
    }

    public void setAirportCode(String airportCode) {
        this.airportCode = airportCode;
    }

    public String getAirportName() {
        return airportName;
    }

    public void setAirportName(String airportName) {
        this.airportName = airportName;
    }

    public String getAirportLocation() {
        return airportLocation;
    }

    public void setAirportLocation(String airportLocation) {
        this.airportLocation = airportLocation;
    }
}
