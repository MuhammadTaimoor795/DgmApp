const Joi = require("joi");

const rollRandwom = Joi.object({
    body: Joi.string().required(),
    bottom: Joi.string().required(),
    footwear: Joi.string().required(),
    top: Joi.string().required(),
    type: Joi.string().required(),

});

module.exports = rollRandwom;