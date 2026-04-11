const express = require("express");
const router = express.Router();
const Booking = require("../models/booking");
const Listing = require("../models/listing");
const { isLoggedIn } = require("../middleware");
const wrapAsync = require("../utils/wrapAsync");

// Middleware to check owner role
const isOwner = (req, res, next) => {
  if (req.user && req.user.role === "owner") return next();
  req.flash("error", "Access denied. Owner accounts only.");
  return res.redirect("/listings");
};

// Owner bookings dashboard
router.get("/bookings", isLoggedIn, isOwner, wrapAsync(async (req, res) => {
  
  // First find all listings that belong to this owner
  const myListings = await Listing.find({ owner: req.user._id });
  const myListingIds = myListings.map(l => l._id);

  // Then find all bookings for those listings
  const bookings = await Booking.find({ listing: { $in: myListingIds } })
    .populate("listing")
    .populate("user")
    .sort({ createdAt: -1 });

  res.render("owner/bookings", { bookings });
}));

module.exports = router;