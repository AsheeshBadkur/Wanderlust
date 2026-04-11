const express = require("express");
const router = express.Router({ mergeParams: true });
const Listing = require("../models/listing");
const Booking = require("../models/booking");
const wrapAsync = require("../utils/wrapAsync");
const { isLoggedIn } = require("../middleware");

// Show booking form
router.get("/new", isLoggedIn, wrapAsync(async (req, res) => {
  const { id } = req.params;
  const listing = await Listing.findById(id);
  if (!listing) {
    req.flash("error", "Listing not found");
    return res.redirect("/listings");
  }

  // Get all booked dates for this listing
  const bookings = await Booking.find({ listing: id });
  const bookedDates = bookings.map(b => ({
    checkIn: b.checkIn,
    checkOut: b.checkOut,
  }));

  res.render("bookings/new", { listing, bookedDates });
}));

// Create booking
router.post("/", isLoggedIn, wrapAsync(async (req, res) => {
  const { id } = req.params;
  const listing = await Listing.findById(id);
  if (!listing) {
    req.flash("error", "Listing not found");
    return res.redirect("/listings");
  }

  const { checkIn, checkOut, guests } = req.body;
  const newCheckIn = new Date(checkIn);
  const newCheckOut = new Date(checkOut);

  // Check for date conflicts
  const conflictingBooking = await Booking.findOne({
    listing: id,
    $or: [
      // new checkin falls inside an existing booking
      { checkIn: { $lte: newCheckIn }, checkOut: { $gte: newCheckIn } },
      // new checkout falls inside an existing booking
      { checkIn: { $lte: newCheckOut }, checkOut: { $gte: newCheckOut } },
      // new booking completely overlaps an existing booking
      { checkIn: { $gte: newCheckIn }, checkOut: { $lte: newCheckOut } },
    ],
  });

  if (conflictingBooking) {
    req.flash(
      "error",
      `These dates are not available! Already booked from 
      ${new Date(conflictingBooking.checkIn).toDateString()} 
      to ${new Date(conflictingBooking.checkOut).toDateString()}. 
      Please change your dates.`
    );
    return res.redirect(`/listings/${id}/bookings/new`);
  }

  const nights = Math.ceil(
    (newCheckOut - newCheckIn) / (1000 * 60 * 60 * 24)
  );
  const totalPrice = nights * listing.price;

  const booking = new Booking({
    listing: listing._id,
    user: req.user._id,
    checkIn,
    checkOut,
    guests,
    totalPrice,
  });
  await booking.save();

  req.flash("success", "Booking confirmed!");
  res.redirect(`/listings/${id}`);
}));

module.exports = router;