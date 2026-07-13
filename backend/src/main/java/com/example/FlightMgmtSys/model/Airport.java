package com.example.FlightMgmtSys.model;

/**
 * Stores the details of an airport.
 * Airports are fixed and pre-loaded in the database.
 */
public class Airport {

    private String airportCode;
    private String airportName;
    private String airportLocation;

    public Airport() {
    }

    public Airport(String airportCode, String airportName, String airportLocation) {
        this.airportCode = airportCode;
        this.airportName = airportName;
        this.airportLocation = airportLocation;
    }

    // ---- Getters & Setters ----

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

    @Override
    public String toString() {
        return "Airport{" +
                "airportCode='" + airportCode + '\'' +
                ", airportName='" + airportName + '\'' +
                ", airportLocation='" + airportLocation + '\'' +
                '}';
    }
}
