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
    guests: Joi.number().integer().min(1).max(36).strict().required().messages({
        "number.base": "'guests' must be a number",
        "number.integer": "'guests' can't have decimals",
        "number.min": "'guests' must at least be 1",
        "number.max": "'guests' can't be higher than 36",
        "any.required": "'guests' is required",
    }),
    single: Joi.number().integer().max(8).strict().optional().messages({
        "number.base": "'single' must be a number",
        "number.integer": "'single' can't have decimals",
        "number.max": "'single' can't be higher than 8",
    }),
    double: Joi.number().integer().max(8).strict().optional().messages({
        "number.base": "'double' must be a number",
        "number.integer": "'double' can't have decimals",
        "number.max": "'double' can't be higher than 8",
    }),
    suite: Joi.number().integer().max(4).strict().optional().messages({
        "number.base": "'suite' must be a number",
        "number.integer": "'suite' can't have decimals",
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
    .unknown(false)
    .messages({
        "object.unknown": "Unknown properties are not allowed.",
    });

const updateOrderSchema = Joi.object({
    guests: Joi.number().integer().min(1).max(36).strict().optional().messages({
        "number.base": "'guests' must be a number",
        "number.integer": "'guests' can't have decimals",
        "number.min": "'guests' must be at least 1",
        "number.max": "'guests' must be at most 36",
    }),
    single: Joi.number().integer().max(8).strict().optional().messages({
        "number.base": "'single' must be a number",
        "number.integer": "'single' can't have decimals",
        "number.max": "'single' must be at most 8",
    }),
    double: Joi.number().integer().max(8).strict().optional().messages({
        "number.base": "'double' must be a number",
        "number.integer": "'double' can't have decimals",
        "number.max": "'double' must be at most 8",
    }),
    suite: Joi.number().integer().max(4).strict().optional().messages({
        "number.base": "'suite' must be a number",
        "number.integer": "'suite' can't have decimals",
        "number.max": "'suite' must be at most 4",
    }),
    arrival: Joi.date().iso().optional().messages({
        "date.base": "'arrival' must be a valid date.",
    }),
    departure: Joi.date().iso().greater(Joi.ref("arrival")).optional().messages({
        "date.base": "'departure' must be a valid date.",
        "date.greater": "'departure' date must be greater than 'arrival' date.",
        "any.required": "'departure' date is required.",
    }),
})
    .or("guests", "single", "double", "suite", "arrival", "departure")
    .messages({
        "object.missing": "At least one of 'guests', 'single', 'double', 'suite', 'arrival', 'departure' must be provided.",
        "object.min": "Must include at least one property",
    })
    .min(1)
    .unknown(false)
    .messages({
        "object.unknown": "Unknown properties are not allowed.",
    });

// Dummy data och hur man använder scheman i funktionerna.

// const data = {};

// const { error } = updateOrderSchema.validate(data);

// if (error) {
//     console.log("Validation error:", error.details[0].message);

//     // return sendError(400, error.details[0].message);
// }

export { orderSchema, updateOrderSchema };
