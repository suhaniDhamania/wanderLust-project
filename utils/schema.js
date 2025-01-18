const Joi = require('joi');

module.exports.listingSchema = Joi.object({
    listing : Joi.object({
        title : Joi.string().required(),
        description : Joi.string().required(),
        price : Joi.number().required().min(0),
        location : Joi.string().required(),
        country : Joi.string().required(),
        image : Joi.string().allow("", null),
    }).required(),
}); 


module.exports.reviewSchema=Joi.object({
    reviews:Joi.object({
        rating : Joi.string().required().min(0).max(5),
        comment : Joi.string().required(),
    }).required(),
})
