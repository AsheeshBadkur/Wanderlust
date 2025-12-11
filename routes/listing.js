const express = require('express');
const router=express.Router();
const wrapAsync=require("../utils/wrapAsync.js");
const { isLoggedIn,isOwner,validateListing } = require('../middleware.js');
const controllers=require("../controllers/listing.js");
const multer=require("multer");
const {storage}=require("../cloudconfig.js");
const upload=multer({storage});

router.route('/')
.get(wrapAsync(controllers.index))//new route
.post(isLoggedIn,upload.single("listing[image]"),validateListing, wrapAsync(controllers.createListing));//create route

router.get('/new',isLoggedIn,controllers.newForm);

router.route('/:id')
.get(wrapAsync(controllers.showListing))//show route
.put(isLoggedIn,isOwner,upload.single("listing[image]"),validateListing,wrapAsync(controllers.updateListing))//update route
.delete(isLoggedIn,isOwner,wrapAsync(controllers.destroyListing));//delete route


//edit route
router.get('/:id/edit',isLoggedIn,isOwner,wrapAsync(controllers.editForm));
module.exports=router;