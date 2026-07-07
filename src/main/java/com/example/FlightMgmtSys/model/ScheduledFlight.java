package com.example.FlightMgmtSys.model;

import java.math.BigDecimal;
import java.math.BigInteger;

/**
 * Stores a flight that is scheduled along with its schedule and vacancy.
 */
public class ScheduledFlight {

    private BigInteger scheduledFlightId;
    private Flight flight;
    private Schedule schedule;
    private Integer availableSeats;
    private BigDecimal ticketCost;

    public ScheduledFlight() {
    }

    public ScheduledFlight(BigInteger scheduledFlightId, Flight flight, Schedule schedule,
                           Integer availableSeats, BigDecimal ticketCost) {
        this.scheduledFlightId = scheduledFlightId;
        this.flight = flight;
        this.schedule = schedule;
        this.availableSeats = availableSeats;
        this.ticketCost = ticketCost;
    }

    // ---- Getters & Setters ----

    public BigInteger getScheduledFlightId() {
        return scheduledFlightId;
    }

    public void setScheduledFlightId(BigInteger scheduledFlightId) {
        this.scheduledFlightId = scheduledFlightId;
    }

    public Flight getFlight() {
        return flight;
    }

    public void setFlight(Flight flight) {
        this.flight = flight;
    }

    public Schedule getSchedule() {
        return schedule;
    }

    public void setSchedule(Schedule schedule) {
        this.schedule = schedule;
    }

    public Integer getAvailableSeats() {
        return availableSeats;
    }

    public void setAvailableSeats(Integer availableSeats) {
        this.availableSeats = availableSeats;
    }

    public BigDecimal getTicketCost() {
        return ticketCost;
    }

    public void setTicketCost(BigDecimal ticketCost) {
        this.ticketCost = ticketCost;
    }

    @Override
    public String toString() {
        return "ScheduledFlight{" +
                "scheduledFlightId=" + scheduledFlightId +
                ", flight=" + flight +
                ", schedule=" + schedule +
                ", availableSeats=" + availableSeats +
                ", ticketCost=" + ticketCost +
                '}';
    }
}
