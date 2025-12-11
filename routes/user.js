const express = require('express');
const router=express.Router();
const wrapAsync = require('../utils/wrapAsync');
const passport = require("passport");
const { saveRedirectUrl } = require('../middleware.js');
const controllers=require("../controllers/user.js");

router.route('/signup')
.get((controllers.renderSignupForm))
.post(wrapAsync(controllers.signup));

router.route('/login')
.get((controllers.renderLoginForm))
.post(
  saveRedirectUrl,
  passport.authenticate("local",{failureFlash:true
  ,failureRedirect:"/login"}),
   (controllers.login));

router.get("/logout",(controllers.logout));


module.exports=router;