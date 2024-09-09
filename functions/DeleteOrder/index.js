import { sendResponse, sendError } from "../../responses/responses.js";
import db from "../../services/db.js";

export const handler = async (event) => {
    const orderID = event.pathParameters.orderID;
    try {
        await db.delete({
            TableName: 'bonzaiOrders',
            Key: { orderID: orderID },
            ConditionExpression: 'attribute_exists(orderID)'
        });
        return sendResponse(200, { message: `Order ${orderID} deleted successfully.` });
    } catch (error) {
        if (error.name === 'ConditionalCheckFailedException') {
            return sendError(404, `Order ${orderID} not found.`);
        }
        return sendError(404, { message: error.message });
    }
};


