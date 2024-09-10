import { sendResponse, sendError } from "../../responses/responses.js";
import db from "../../services/db.js";

export const handler = async (event) => {
    const orderID = event.pathParameters.orderID;
    //Validerar att orderID är korrekt
    if (orderID.length !== 8) return sendError(400, { message: 'Invalid orderID.' });

    try {
        //Hämtar order baserat på orderID, vi tar reda på hur många rum som har beställts.
        const { Item } = await db.get({
            TableName: 'bonzaiOrders',
            Key: { orderID: orderID },
        });
        // Om inte beställning hittas returneras fel.
        if (!Item) {
            return sendError(404, { message: `Order ${orderID} not found.` });
        }


        if (Item.single > 0) {
            await updateAvailableRooms('single', Item.single);
        }
        if (Item.double > 0) {
            await updateAvailableRooms('double', Item.double)
        }
        if (Item.suite > 0) {
            await updateAvailableRooms('suite', Item.suite)
        }
        //Tar bort ordern från databasen.
        await db.delete({
            TableName: 'bonzaiOrders',
            Key: { orderID: orderID }
        });

        return sendResponse(200, { message: `Order ${orderID} deleted successfully.` });
    } catch (error) {
        return sendError(500, { message: error.message });
    }
};

async function updateAvailableRooms(roomType, roomAmount) {
    let oldState = await db.get({
        TableName: "bonzaiRooms",
        Key: {
            roomType: roomType
        }
    })
    //Updaterar antalet tillgängliga rum: (single, double, suite)
    await db.update({
        TableName: 'bonzaiRooms',
        Key: { roomType: roomType },
        UpdateExpression: 'SET available = :available',
        ExpressionAttributeValues: {
            ':available': oldState.Item.available + roomAmount,
        },
        ReturnValues: "ALL_NEW",
    });
}