package com.example.FlightMgmtSys.controller;

import com.example.FlightMgmtSys.model.Booking;
import com.example.FlightMgmtSys.service.BookingService;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigInteger;
import java.util.List;

/**
 * REST controller for Booking management.
 *
 * <p>All booking endpoints require authentication.
 * Both customers and administrators can perform booking operations.
 *
 * <ul>
 *   <li>POST   /api/bookings — create a new booking</li>
 *   <li>GET    /api/bookings/{bookingId} — view a booking by ID</li>
 *   <li>GET    /api/bookings — view all bookings</li>
 *   <li>PUT    /api/bookings — modify a booking</li>
 *   <li>DELETE /api/bookings/{bookingId} — cancel a booking</li>
 * </ul>
 */
@RestController
@RequestMapping("/api/bookings")
public class BookingController {

    private final BookingService bookingService;

    public BookingController(BookingService bookingService) {
        this.bookingService = bookingService;
    }

    /**
     * Create a new booking.
     * Expects a Booking JSON with nested User (userId), ScheduledFlight (scheduledFlightId),
     * noOfPassengers, and passengerList.
     * Ticket cost is auto-calculated by the service layer.
     */
    @PostMapping
    public ResponseEntity<Booking> addBooking(@RequestBody Booking booking) {
        Booking created = bookingService.addBooking(booking);
        return new ResponseEntity<>(created, HttpStatus.CREATED);
    }

    /**
     * View a booking by its booking ID.
     * Returns a list to match the spec signature.
     */
    @GetMapping("/{bookingId}")
    public ResponseEntity<List<Booking>> viewBooking(
            @PathVariable("bookingId") BigInteger bookingId) {
        return ResponseEntity.ok(bookingService.viewBooking(bookingId));
    }

    /**
     * View all bookings.
     */
    @GetMapping
    public ResponseEntity<List<Booking>> viewAllBookings() {
        return ResponseEntity.ok(bookingService.viewBooking());
    }

    /**
     * Modify a booking. All information except bookingId can be modified.
     */
    @PutMapping
    public ResponseEntity<Booking> modifyBooking(@RequestBody Booking booking) {
        return ResponseEntity.ok(bookingService.modifyBooking(booking));
    }

    /**
     * Cancel a booking. Restores available seats on the scheduled flight.
     */
    @DeleteMapping("/{bookingId}")
    public ResponseEntity<Void> deleteBooking(
            @PathVariable("bookingId") BigInteger bookingId) {
        bookingService.deleteBooking(bookingId);
        return ResponseEntity.noContent().build();
    }
}
