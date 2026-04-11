const mongoose = require("mongoose");
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
require('dotenv').config();

const Listing = require("../models/listing");
const geocodingClient = mbxGeocoding({ accessToken: process.env.MAP_TOKEN });

async function fixGeometry() {
    await mongoose.connect(process.env.DB_URL);
    console.log("Connected to DB");

    const listings = await Listing.find({
        $or: [
            { "geometry.coordinates": { $size: 0 } },
            { geometry: null },
            { geometry: { $exists: false } }
        ]
    });

    console.log(`Found ${listings.length} listings to fix`);

    for (let listing of listings) {
        try {
            const response = await geocodingClient.forwardGeocode({
                query: listing.location,
                limit: 1
            }).send();

            listing.geometry = response.body.features[0].geometry;
            await listing.save({ validateBeforeSave: false });
            console.log(`Fixed: ${listing.title}`);
        } catch (e) {
            console.log(`Failed: ${listing.title} - ${e.message}`);
        }
    }

    console.log("Done!");
    mongoose.connection.close();
}

fixGeometry();