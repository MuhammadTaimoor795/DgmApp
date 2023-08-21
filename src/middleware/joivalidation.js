const Joi = require("joi");
const { validation } = require("../utils/constants");

const validationSchema = (schema) => {
  return async (req, res, next) => {
    try {
      await schema.validateAsync(req.body);
      next();
    } catch (error) {
      const message = error.message.replace(/"/g, "");
      return res.status(422).json(validation(message));
    }
  };
};

// User Dragon Object

const schemas = {
  user: {
    login: Joi.object({
      phone: Joi.string()
        .pattern(/^\+\d{10,}$/) // Adjust the regular expression pattern as needed
        .required(),
      type: Joi.string().valid("vendor", "customer").required(),
    }),
    verifyOtp: Joi.object({
      otp: Joi.number().integer().min(1000).max(9999).required(),
    }),
    update: Joi.object({
      name: Joi.string().required(),
      email: Joi.string().email().required(),
      age: Joi.number().required(),
    }),
    invite: Joi.object({
      email: Joi.string().email().required(),
    }),
  },
};
module.exports = { validationSchema, schemas };
