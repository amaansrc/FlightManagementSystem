package com.example.FlightMgmtSys.model;

import java.math.BigInteger;
import java.time.LocalDateTime;

/**
 * Stores a flight schedule with source/destination airports and timings.
 */
public class Schedule {

    private BigInteger scheduleId;
    private Airport sourceAirport;
    private Airport destinationAirport;
    private LocalDateTime departureTime;
    private LocalDateTime arrivalTime;

    public Schedule() {
    }

    public Schedule(BigInteger scheduleId, Airport sourceAirport, Airport destinationAirport,
                    LocalDateTime departureTime, LocalDateTime arrivalTime) {
        this.scheduleId = scheduleId;
        this.sourceAirport = sourceAirport;
        this.destinationAirport = destinationAirport;
        this.departureTime = departureTime;
        this.arrivalTime = arrivalTime;
    }

    // ---- Getters & Setters ----

    public BigInteger getScheduleId() {
        return scheduleId;
    }

    public void setScheduleId(BigInteger scheduleId) {
        this.scheduleId = scheduleId;
    }

    public Airport getSourceAirport() {
        return sourceAirport;
    }

    public void setSourceAirport(Airport sourceAirport) {
        this.sourceAirport = sourceAirport;
    }

    public Airport getDestinationAirport() {
        return destinationAirport;
    }

    public void setDestinationAirport(Airport destinationAirport) {
        this.destinationAirport = destinationAirport;
    }

    public LocalDateTime getDepartureTime() {
        return departureTime;
    }

    public void setDepartureTime(LocalDateTime departureTime) {
        this.departureTime = departureTime;
    }

    public LocalDateTime getArrivalTime() {
        return arrivalTime;
    }

    public void setArrivalTime(LocalDateTime arrivalTime) {
        this.arrivalTime = arrivalTime;
    }

    @Override
    public String toString() {
        return "Schedule{" +
                "scheduleId=" + scheduleId +
                ", sourceAirport=" + sourceAirport +
                ", destinationAirport=" + destinationAirport +
                ", departureTime=" + departureTime +
                ", arrivalTime=" + arrivalTime +
                '}';
    }
}
