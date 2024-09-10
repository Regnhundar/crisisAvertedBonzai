import { orderSchema } from "../../models/bodySchema.js";
import { sendResponse, sendError } from "../../responses/responses.js";
import db from "../../services/db.js";
import { v4 as uuid } from "uuid";
import { calculatePrice, attemptReservation } from "../../utilities/utilityFunctions.js";

export const handler = async (event) => {
    try {
        // Parsa och destrukturera body
        const body = JSON.parse(event.body);
        const { name, email, guests, single = 0, double = 0, suite = 0, arrival, departure } = body;

        if (single === 0 && double === 0 && suite === 0) {
            return sendError(400, "You need to book either a 'single', 'double' or 'suite' room to make an order");
        }
        const { error } = orderSchema.validate(body);
        if (error) {
            return sendError(400, error.details[0].message);
        }

        await attemptReservation({ guests, single, double, suite });

        // Generara ett orderID
        const orderID = uuid().substring(0, 8);

        const price = calculatePrice({
            single,
            double,
            suite,
            arrival,
            departure,
        });

        const orderData = {
            orderID,
            name,
            email,
            guests,
            single,
            double,
            suite,
            price,
            arrival,
            departure,
        };

        await db.put({
            TableName: "bonzaiOrders",
            Item: orderData,
        });

        return sendResponse(200, {
            success: true,
            bookingNumber: orderID,
            guests,
            rooms: {
                single,
                double,
                suite,
            },
            totalAmount: price,
            arrival: arrival,
            departure: departure,
            guestName: name,
        });
    } catch (error) {
        return sendError(400, error.message);
    }
};
