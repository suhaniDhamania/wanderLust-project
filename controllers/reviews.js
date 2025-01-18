
const Listing = require("../models/listing");
const Review = require("../models/review.js");

module.exports.createreview=async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id);
    if (!listing) {
      return res.status(404).send("Listing not found");
    }
    const { rating, comment } = req.body.reviews;
    const newReview = new Review({
      rating,
      comment,
    });
    newReview.author = req.user._id;
    console.log(newReview);
    listing.reviews.push(newReview);
    await newReview.save();
    await listing.save();
    req.flash("success", "new review create successfuly");
    res.redirect(`/Listing/${listing._id}`);
  }

  module.exports.reviewdelete=async (req, res) => {
    let { id, reviewId } = req.params;
    await Listing.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    await Review.findByIdAndDelete(reviewId);
    req.flash("success", "review delete successfuly");
    res.redirect(`/Listing/${id}`);
  }