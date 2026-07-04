package com.example.FlightMgmtSys.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/** Request body for PUT /api/scheduled-flights/{id} (US-013). */
public class ScheduledFlightUpdateRequest {

    private Integer availableSeats;
    private BigDecimal ticketCost;
    private LocalDateTime departureDateTime;
    private LocalDateTime arrivalDateTime;
    private String scheduleFlightState;

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

    public LocalDateTime getDepartureDateTime() {
        return departureDateTime;
    }

    public void setDepartureDateTime(LocalDateTime departureDateTime) {
        this.departureDateTime = departureDateTime;
    }

    public LocalDateTime getArrivalDateTime() {
        return arrivalDateTime;
    }

    public void setArrivalDateTime(LocalDateTime arrivalDateTime) {
        this.arrivalDateTime = arrivalDateTime;
    }

    public String getScheduleFlightState() {
        return scheduleFlightState;
    }

    public void setScheduleFlightState(String scheduleFlightState) {
        this.scheduleFlightState = scheduleFlightState;
    }
}
