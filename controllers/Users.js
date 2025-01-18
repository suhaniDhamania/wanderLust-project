const User = require("../models/user.js");

module.exports.signupform=(req, res) => {
    res.render("users/signup.ejs");
  };

  module.exports.signup=async (req, res,next) => {
    try {
      let { username, email, password } = req.body;
      const newuser = new User({
        email,
        username,
      });
      const registereduser = await User.register(newuser, password);
      console.log(registereduser);

req.login(registereduser,(err)=>{
  if(err){
    return next(err);
  }else{
    req.flash("success","welcome to wanderLust");
    res.redirect("/Listings");
  }
});
    } catch (e) {
      req.flash("error", e.message);
      res.redirect("/signup");
    }
  };

  module.exports.loginform=(req, res) => {
    res.render("users/login.ejs");
  };


  module.exports.login=async (req, res) => {
    req.flash("success","Welcome to wanderLust! you are logged in.");
    let redirectUrl=res.locals.redirectUrl || "/Listings"
    res.redirect(redirectUrl);
  };

  module.exports.logout=(req,res,next)=>{
    req.logout((err)=>{
      if(err){
        return next(err);
      }
      req.flash("success","you are logged out!");
      res.redirect("/Listings");
    })
  };