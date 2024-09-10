import { sendResponse, sendError } from "../../responses/responses.js";
import db from "../../services/db.js";

export const handler = async (event) => {
  try {
    const { Item } = await db.get({
      TableName: "bonzaiRooms",
      Key: {
        roomType: "single",
      },
    });

    if (!Item) {
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

      await db.batchWrite(params);

      return sendResponse(200, "Succesfully created hotel-rooms!");
    } else {
      return sendError(400, "Rooms already created!");
    }
  } catch (error) {
    return sendError(404, error.message);
  }
};
