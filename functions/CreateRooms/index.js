import { sendResponse, sendError } from "../../responses/responses.js";
import db from "../../services/db.js";

export const handler = async (event) => {
    try {
        // Gör ett GET-anrop för att se om single-rummet existerar.
        const { Item } = await db.get({
            TableName: "bonzaiRooms",
            Key: {
                roomType: "single",
            },
        });
        // OM item inte exister. Dvs single room existerar inte.
        if (!Item) {
            // Skapar en array med putRequests. Den håller information om alla items som ska in i bonzaiRooms.
            const rooms = [
                {
                    PutRequest: {
                        Item: {
                            roomType: "single",
                            available: 8,
                            beds: 1,
                            price: 500,
                        },
                    },
                },
                {
                    PutRequest: {
                        Item: {
                            roomType: "double",
                            available: 8,
                            beds: 2,
                            price: 1000,
                        },
                    },
                },
                {
                    PutRequest: {
                        Item: {
                            roomType: "suite",
                            available: 4,
                            beds: 3,
                            price: 1500,
                        },
                    },
                },
            ];

            const params = {
                RequestItems: {
                    bonzaiRooms: rooms,
                },
            };
            // Skickar in parametrarna för att göra en batchWrite. Batchwrite kan göra 25 saker (GET, PUT eller DELETE. Update går inte.) i ett anrop.
            await db.batchWrite(params);

            return sendResponse(200, "Succesfully created hotel-rooms!");
        } else {
            return sendError(400, "Rooms already created!");
        }
    } catch (error) {
        return sendError(404, error.message);
    }
};
