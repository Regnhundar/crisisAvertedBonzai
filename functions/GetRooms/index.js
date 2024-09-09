import { sendResponse, sendError } from "../../responses/responses.js";
import db from "../../services/db.js";

export const handler = async (event) => {
    try {
        const { Items } = await db.scan({
            TableName: 'bonzaiRooms',
        });
        if (Items) {
            return sendResponse(200, { Items });
        } else {
            return sendError(404, { success: false, message: 'Rooms not found!' });
        }
    } catch (error) {
        return sendError(404, { success: false, message: error.message });
    }
};