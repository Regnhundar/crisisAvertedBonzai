import { orderSchema } from "../../models/bodySchema.js";
import { sendResponse, sendError } from "../../responses/responses.js";
import db from "../../services/db.js";
import { v4 as uuid } from "uuid";
import { calculatePrice, attemptReservation } from "../../utilities/utilityFunctions.js";

export const handler = async (event) => {
    try {
        // Parsa och destrukturera body
        const body = JSON.parse(event.body);
        // 'single', 'double' och 'suite' får ett default-värde för att garantera att de inte är NaN. Om body håller annat värde så tar de värdet från body.
        const { name, email, guests, single = 0, double = 0, suite = 0, arrival, departure } = body;
        // Eftersom 'single', 'double' och 'suite' har defaultvärde så är de alltid med. Men för att göra en rumsbokning måste någon vara ändrad.
        if (single === 0 && double === 0 && suite === 0) {
            return sendError(400, "You need to book either a 'single', 'double' or 'suite' room to make an order");
        }

        //Skickar alla properties till JOI-schema för validering. Detta garanterar att vår databas håller värden vi kan använda.
        const { error } = orderSchema.validate(body);
        if (error) {
            return sendError(400, error.details[0].message);
        }
        // Anropar attemptReservation och skickar med props som behöver kontrolleras.
        await attemptReservation({ guests, single, double, suite });

        // Generara ett orderID
        const orderID = uuid().substring(0, 8);
        // Skickar variabler till funktionen som räknar ut totalpriset.
        const price = calculatePrice({
            single,
            double,
            suite,
            arrival,
            departure,
        });
        // Gör ett objekt som skall föras in i databasen.
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
        // Lägger in objektet i databasen.
        await db.put({
            TableName: "bonzaiOrders",
            Item: orderData,
        });
        // Skickar svar till användaren.
        return sendResponse(200, {
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
