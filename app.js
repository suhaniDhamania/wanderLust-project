if (process.env.NODE_ENV != "production") {
  require("dotenv").config();
}

const express = require("express");
const app = express();
const mongoose = require("mongoose");
const Listing = require("./models/listing.js");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const wrapAsync = require("./utils/wrapasync.js");
const ExpressError = require("./utils/ExpressError.js");
const Review = require("./models/review.js");
const session = require("express-session");
const MongoStore = require('connect-mongo');
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const userRouter = require("./routes/user.js");
const User = require("./models/user.js");
const multer = require("multer");
const { storage } = require("./cloudConfig.js");
const upload = multer({ storage });

const {
  isLoggedin,
  isOwner,
  validateListing,
  validatereview,
  isReviewauthor,
} = require("./middlewares.js");

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.engine("ejs", ejsMate);
app.use(express.static(path.join(__dirname, "public")));



const dbUrl=process.env.ATLASDB_URL;

main()
  .then(() => {
    console.log("connected to DB");
  })
  .catch((err) => {
    console.log(err);
  });

async function main() {
  await mongoose.connect(dbUrl);
}


const store =MongoStore.create({
mongoUrl:dbUrl,
crypto:{
  secret:process.env.SECRET,
},
touchAfter:24*3600,
});


store.on("error",()=>{
  console.log("error in mongo session");
})

app.use( 
  session({
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: true,
    store,
    cookie: {
      expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
      maxAge: 7 * 24 * 60 * 60 * 1000,
      httpOnly: true,
    },
  })
);
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  res.locals.currUser = req.user;
  next();
});

const listingController = require("./controllers/listings.js");
const reviewController = require("./controllers/reviews.js");
//index route
app.get("/Listings", wrapAsync(listingController.index));

//new route
app.get("/Listings/new", isLoggedin, listingController.new);

//show route
app.get("/Listing/:id", wrapAsync(listingController.show));

//create route
app.post(
  "/Listings",
  isLoggedin,

  upload.single("listing[image]"),
  validateListing,
  wrapAsync(listingController.create)
);

//edit route
app.get(
  "/Listings/:id/edit",
  isLoggedin,
  wrapAsync(listingController.editform)
);

app.put(
  "/Listing/:id",
  isLoggedin,
  isOwner,
  upload.single("listing[image]"),
  validateListing,
  wrapAsync(listingController.edit)
);

//delete route
app.delete(
  "/Listing/:id",
  isLoggedin,
  isOwner,
  wrapAsync(listingController.delete)
);

//reviews
//post route
app.post(
  "/Listing/:id/reviews",
  validatereview,
  isLoggedin,
  wrapAsync(reviewController.createreview)
);

//delete route
app.delete(
  "/Listing/:id/reviews/:reviewId",
  isLoggedin,
  isReviewauthor,
  wrapAsync(reviewController.reviewdelete)
);

//user
app.use("/", userRouter);

app.all("*", (req, res, next) => {
  next(new ExpressError(404, "page not found"));
});

app.use((err, req, res, next) => {
  let { StatusCode = 500, message = "something went wrong" } = err;
  res.status(StatusCode).render("error.ejs", { message });
});

app.listen(8080, () => {
  console.log("server is listening to port 8080");
});
