const express = require('express');
const router=express.Router({mergeParams:true});
const wrapAsync=require("../utils/wrapAsync.js");
const {validateReview,isLoggedIn, isReviewOwner } = require('../middleware.js');
const controllers=require("../controllers/review.js");

//Post Review
router.post('/',isLoggedIn,validateReview,wrapAsync(controllers.createReview));
//delete route
router.delete('/:reviewId',isLoggedIn,isReviewOwner, wrapAsync(controllers.destroyReview));

module.exports=router;