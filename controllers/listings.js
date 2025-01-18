const Listing = require("../models/listing");


module.exports.index = async (req, res) => {
  const allListings = await Listing.find({});
  // console.log(allListings);
  res.render("listings/index.ejs", { allListings });
};


module.exports.new = (req, res) => {
    res.render("listings/new.ejs");
  };

module.exports.show = async (req, res, next) => {
  let { id } = req.params;
  //console.log(id);
  const listing = await Listing.findById(id)
    .populate({ path: "reviews", populate: { path: "author" } })
    .populate("owner");
  if (!listing) {
    req.flash("error", "listing does not exists");
  }
  //console.log(listing);
  res.render("listings/show.ejs", { listing });
};

module.exports.create = async (req, res)=>{
  let url= req.file.path;
 let filename=req.file.filename;
 //console.log(url,"..",filename);
 let { title, image, description, price, location, country } =
  req.body.listing;
 let newlisting = new Listing({
  title: title,
  description: description,
  image: {
    url: image,
  },
  price: price,
  location: location,
  country: country,
 });
 newlisting.owner = req.user._id;
 newlisting.image= {url,filename};
 await newlisting.save();
 console.log(newlisting);
req.flash("success", "new listing create successfuly");
res.redirect("/Listings");
};

module.exports.editform = async (req, res) => {
  let { id } = req.params;
  const listing = await Listing.findById(id);
  let originalImageUrl=listing.image.url;
  originalImageUrl=originalImageUrl.replace("/upload","/upload/h_300,w_250");
  res.render("listings/edit.ejs", { listing ,originalImageUrl});
};

module.exports.edit = async (req, res, next) => {

  let { id } = req.params;
  let { title, description, image, price, location, country } =
    req.body.listing;
  let updatelisting = await Listing.findByIdAndUpdate(
    id,
    {
      title: title,
      description: description,
      image: {
        url: image,
      },
      price: price,
      location: location,
      country: country,
    },
    { runValidators: true, new: true }
  );
  if(typeof req.file !== "undefined"){
    let url= req.file.path;
    let filename=req.file.filename;
    updatelisting.image={url,filename};
    await  updatelisting.save();
  }
  req.flash("success", "listing update successfully");
  console.log(updatelisting);
  res.redirect(`/Listing/${id}`);
};

module.exports.delete = async (req, res, next) => {
  const { id } = req.params;
  const deletedListing = await Listing.findByIdAndDelete(id);
  console.log(`Deleted Listing:`, deletedListing);
  req.flash("success", " listing delete successfuly");
  res.redirect("/Listings");

};
