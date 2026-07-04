package com.example.FlightMgmtSys.repository;

import com.example.FlightMgmtSys.entity.ScheduledFlight;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;

public interface ScheduledFlightRepository extends JpaRepository<ScheduledFlight, Long> {

    // US-012: search flights between two airports on a given date, only ACTIVE ones with seats left.
    @Query("SELECT sf FROM ScheduledFlight sf " +
           "WHERE sf.schedule.sourceAirport.airportCode = :source " +
           "  AND sf.schedule.destinationAirport.airportCode = :destination " +
           "  AND FUNCTION('DATE', sf.schedule.departureDateTime) = :date " +
           "  AND sf.availableSeats > 0 " +
           "  AND sf.scheduleFlightState = 'ACTIVE' " +
           "ORDER BY sf.schedule.departureDateTime")
    List<ScheduledFlight> searchByRouteAndDate(@Param("source") String source,
                                                @Param("destination") String destination,
                                                @Param("date") LocalDate date);
}
