package com.example.FlightMgmtSys.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

import java.math.BigDecimal;

/** Maps to the `scheduled_flight` table - a Flight running on a Schedule with price/vacancy. */
@Entity
@Table(name = "scheduled_flight")
public class ScheduledFlight {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "schedule_flight_id")
    private Long scheduleFlightId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "flight_number", nullable = false)
    private Flight flight;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "schedule_id", nullable = false)
    private Schedule schedule;

    @Column(name = "available_seats", nullable = false)
    private Integer availableSeats;

    @Column(name = "ticket_cost", nullable = false, precision = 10, scale = 2)
    private BigDecimal ticketCost;

    @Column(name = "schedule_flight_state", nullable = false, length = 20)
    private String scheduleFlightState; // ACTIVE, INACTIVE, COMPLETED

    protected ScheduledFlight() {
    }

    public Long getScheduleFlightId() {
        return scheduleFlightId;
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

    public String getScheduleFlightState() {
        return scheduleFlightState;
    }

    public void setScheduleFlightState(String scheduleFlightState) {
        this.scheduleFlightState = scheduleFlightState;
    }
}
