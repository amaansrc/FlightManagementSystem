package com.example.FlightMgmtSys.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

/**
 * Maps to the `flight` table.
 * OWNERSHIP NOTE: full CRUD for this entity (US-008/009/010) belongs to
 * Shashank Kumar. This minimal version exists only so ScheduledFlight (my
 * class) can compile and join against it. Replace with his version when he
 * pushes his branch — just keep the field/column names in sync.
 */
@Entity
@Table(name = "flight")
public class Flight {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "flight_number")
    private Long flightNumber;

    @Column(name = "flight_model", nullable = false, length = 50)
    private String flightModel;

    @Column(name = "carrier_name", nullable = false, length = 100)
    private String carrierName;

    @Column(name = "seat_capacity", nullable = false)
    private Integer seatCapacity;

    @Column(name = "flight_state", nullable = false, length = 20)
    private String flightState;

    protected Flight() {
    }

    public Long getFlightNumber() {
        return flightNumber;
    }

    public String getFlightModel() {
        return flightModel;
    }

    public String getCarrierName() {
        return carrierName;
    }

    public Integer getSeatCapacity() {
        return seatCapacity;
    }

    public String getFlightState() {
        return flightState;
    }
}
