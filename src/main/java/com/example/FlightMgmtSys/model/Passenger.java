package com.example.FlightMgmtSys.model;

import java.math.BigInteger;

/**
 * Stores all the details of a travelling passenger.
 */
public class Passenger {

    private BigInteger pnrNumber;
    private String passengerName;
    private Integer passengerAge;
    private BigInteger passengerUIN;   // 12-digit Aadhaar number
    private Double luggage;

    public Passenger() {
    }

    public Passenger(BigInteger pnrNumber, String passengerName, Integer passengerAge,
                     BigInteger passengerUIN, Double luggage) {
        this.pnrNumber = pnrNumber;
        this.passengerName = passengerName;
        this.passengerAge = passengerAge;
        this.passengerUIN = passengerUIN;
        this.luggage = luggage;
    }

    // ---- Getters & Setters ----

    public BigInteger getPnrNumber() {
        return pnrNumber;
    }

    public void setPnrNumber(BigInteger pnrNumber) {
        this.pnrNumber = pnrNumber;
    }

    public String getPassengerName() {
        return passengerName;
    }

    public void setPassengerName(String passengerName) {
        this.passengerName = passengerName;
    }

    public Integer getPassengerAge() {
        return passengerAge;
    }

    public void setPassengerAge(Integer passengerAge) {
        this.passengerAge = passengerAge;
    }

    public BigInteger getPassengerUIN() {
        return passengerUIN;
    }

    public void setPassengerUIN(BigInteger passengerUIN) {
        this.passengerUIN = passengerUIN;
    }

    public Double getLuggage() {
        return luggage;
    }

    public void setLuggage(Double luggage) {
        this.luggage = luggage;
    }

    @Override
    public String toString() {
        return "Passenger{" +
                "pnrNumber=" + pnrNumber +
                ", passengerName='" + passengerName + '\'' +
                ", passengerAge=" + passengerAge +
                ", passengerUIN=" + passengerUIN +
                ", luggage=" + luggage +
                '}';
    }
}
