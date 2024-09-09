import { orderSchema } from "../../models/bodySchema.js";
import { sendResponse, sendError } from "../../responses/responses.js";
import db from "../../services/db.js";

export const handler = async (event) => {
    return {
        statusCode: 200,
        body: JSON.stringify({
            message: "POST ORDER",
        }),
    };
};
