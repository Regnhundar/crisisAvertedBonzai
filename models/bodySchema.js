import Joi from "joi";

const orderSchema = Joi.object({
    name: Joi.string().required().messages({
        "string.base": "'name' must be a string",
        "any.required": "'name' is required",
    }),
    email: Joi.string().email().required().messages({
        "string.email": "'email' must be a valid email address",
        "any.required": "'email' is required",
    }),
    guests: Joi.number().min(1).max(36).strict().required().messages({
        "number.base": "'guests' must be a number",
        "number.min": "'guests' must at least be 1",
        "number.max": "'guests' can't be higher than 36",
        "any.required": "'guests' is required",
    }),
    single: Joi.number().max(8).strict().messages({
        "number.base": "'single' must be a number",
        "number.max": "'single' can't be higher than 8",
    }),
    double: Joi.number().max(8).strict().messages({
        "number.base": "'double' must be a number",
        "number.max": "'double' can't be higher than 8",
    }),
    suite: Joi.number().max(4).strict().messages({
        "number.base": "'suite' must be a number",
        "number.max": "'suite' can't be higher than 4",
    }),
    arrival: Joi.date().required().messages({
        "date.base": "'arrival' must be a valid date.",
        "any.required": "'arrival' date is required.",
    }),
    departure: Joi.date().greater(Joi.ref("arrival")).required().messages({
        "date.base": "'departure' must be a valid date.",
        "date.greater": "'departure' date must be greater than 'arrival' date.",
        "any.required": "'departure' date is required.",
    }),
})
    .or("single", "double", "suite")
    .messages({
        "object.missing": "At least one of 'single', 'double', or 'suite' must be provided.",
    })
    .unknown(false)
    .messages({
        "object.unknown": "Unknown properties are not allowed.",
    });

export { orderSchema };
