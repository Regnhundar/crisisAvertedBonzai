import { sendResponse, sendError } from "../../responses/responses.js";
import db from "../../services/db.js";

export const handler = async (event) => {
    // To be continued...
    return {
        statusCode: 200,
        body: JSON.stringify({
            message: "UPDATE ORDER",
        }),
    };
};
