package com.example.FlightMgmtSys.model;

import java.math.BigDecimal;
import java.math.BigInteger;
import java.time.LocalDate;
import java.util.List;

/**
 * Stores the details of a booking made by a particular user.
 * Every booking stores a list of passengers travelling in it
 * as well as the scheduled flight details.
 */
public class Booking {

    private BigInteger bookingId;
    private User userId;
    private LocalDate bookingDate;
    private List<Passenger> passengerList;
    private BigDecimal ticketCost;
    private ScheduledFlight flight;
    private Integer noOfPassengers;

    public Booking() {
    }

    public Booking(BigInteger bookingId, User userId, LocalDate bookingDate,
                   List<Passenger> passengerList, BigDecimal ticketCost,
                   ScheduledFlight flight, Integer noOfPassengers) {
        this.bookingId = bookingId;
        this.userId = userId;
        this.bookingDate = bookingDate;
        this.passengerList = passengerList;
        this.ticketCost = ticketCost;
        this.flight = flight;
        this.noOfPassengers = noOfPassengers;
    }

    // ---- Getters & Setters ----

    public BigInteger getBookingId() {
        return bookingId;
    }

    public void setBookingId(BigInteger bookingId) {
        this.bookingId = bookingId;
    }

    public User getUserId() {
        return userId;
    }

    public void setUserId(User userId) {
        this.userId = userId;
    }

    public LocalDate getBookingDate() {
        return bookingDate;
    }

    public void setBookingDate(LocalDate bookingDate) {
        this.bookingDate = bookingDate;
    }

    public List<Passenger> getPassengerList() {
        return passengerList;
    }

    public void setPassengerList(List<Passenger> passengerList) {
        this.passengerList = passengerList;
    }

    public BigDecimal getTicketCost() {
        return ticketCost;
    }

    public void setTicketCost(BigDecimal ticketCost) {
        this.ticketCost = ticketCost;
    }

    public ScheduledFlight getFlight() {
        return flight;
    }

    public void setFlight(ScheduledFlight flight) {
        this.flight = flight;
    }

    public Integer getNoOfPassengers() {
        return noOfPassengers;
    }

    public void setNoOfPassengers(Integer noOfPassengers) {
        this.noOfPassengers = noOfPassengers;
    }

    @Override
    public String toString() {
        return "Booking{" +
                "bookingId=" + bookingId +
                ", userId=" + userId +
                ", bookingDate=" + bookingDate +
                ", ticketCost=" + ticketCost +
                ", noOfPassengers=" + noOfPassengers +
                ", flight=" + flight +
                '}';
    }
}
