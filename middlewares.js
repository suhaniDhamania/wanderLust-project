const Listing = require("./models/listing.js");
const ExpressError = require("./utils/ExpressError.js");
const { listingSchema,reviewSchema} = require("./utils/schema.js");
const Review = require("./models/review.js");

module.exports.isLoggedin=(req,res,next)=>{
  console.log(req.path, "..", req.originalUrl);
    if(!req.isAuthenticated()){
        //console.log(req.user);
        req.session.redirectUrl=req.originalUrl;
        req.flash("error","you must be logged in!");
        res.redirect("/login");
      }
      next();
}
module.exports.saveRedirectUrl=(req,res,next)=>{
  if(req.session.redirectUrl){
    res.locals.redirectUrl=req.session.redirectUrl;
  }
  next();
}

module.exports.isOwner=async(req,res,next)=>{
  let { id } = req.params;
   let listing=await Listing.findById(id);
    //console.log(listing.owner , res.locals.currUser);
    if (res.locals.currUser && !listing.owner.equals(res.locals.currUser._id)) { 
      req.flash("error","you dont have permission this action!");
    return  res.redirect(`/Listing/${id}`);
    }
    next();
};


module.exports.isReviewauthor=async(req,res,next)=>{
  let { id,reviewId } = req.params;
   let review=await Review.findById(reviewId);
   // console.log(review.author , res.locals.currUser);
    if (res.locals.currUser && !review.author.equals(res.locals.currUser._id))  { 
      req.flash("error","you dont have permission this action!");
      return res.redirect(`/Listing/${id}`);
    }
    next();
};


module.exports.validateListing=(req,res,next)=>{
  let {error}= listingSchema.validate(req.body);
if(error){
  let errMsg=error.details.map((el)=>el.message).join(",");
throw new ExpressError(400,errMsg);
}else{
  next();
}
};



module.exports.validatereview=((res,req,next)=>{
  let {error}=reviewSchema.validate(req.body);
  console.log(error);
  if(error){
let errMsg=error.details.map((el)=>el.message).join(",");
throw new ExpressError(400,errMsg)
  }else{
    next();
  }
});
 