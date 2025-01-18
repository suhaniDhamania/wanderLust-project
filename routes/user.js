const express = require("express");
const router = express.Router();
const User = require("../models/user.js");
const wrapasync = require("../utils/wrapasync.js");
const passport=require("passport");
const LocalStrategy=require("passport-local");
const {saveRedirectUrl}=require("../middlewares.js");
const userController=require("../controllers/Users.js")

router.route("/signup").
get( userController.signupform)
.post(
  wrapasync(userController.signup)
);

router.route("/login")
.get( userController.loginform)
.post(saveRedirectUrl,
  passport.authenticate("local", {
    failureRedirect:"/login", 
    failureFlash: true,
  }),
  userController.login
);

router.get("/logout",userController.logout)
module.exports = router;
