import db from "../../services/db.js";
const bizLogic = (body, itemToUpdate) => {
    const error = new Error();

    const numberOfBeds = body.single + body.double * 2 + body.suite * 3;

    if (body.guests > numberOfBeds) {
        error.message = "Guests can't be a higher number then beds.";
        throw error;
    }

    const singlePrice = 500 * body.single;
    const doublePrice = 1000 * body.double;
    const suitePrice = 1500 * body.suite;
    const totalCostPerNight = singlePrice + doublePrice + suitePrice;

    const arrivalDate = new Date(body.arrival);
    const departureDate = new Date(body.departure);
    const lengthOfStay = (departureDate - arrivalDate) / (1000 * 60 * 60 * 24);

    const costOfStay = totalCostPerNight * lengthOfStay;

    return costOfStay;
};

const updateAvailability = async (rooms, oldItem) => {
    let freeSingleRooms;
    let freeDoubleRooms;
    let freeSuiteRooms;

    const error = new Error();

    if (rooms.single && rooms.single > 0) {
        const singleRooms = await db.get({
            TableName: "bonzaiRooms",
            Key: {
                roomType: "single",
            },
        });

        freeSingleRooms = singleRooms.Item.available;
        if (rooms.single > freeSingleRooms) {
            error.message = `You are trying to book ${rooms.single} rooms but there are only ${freeSingleRooms} availiable`;
            throw error;
        }
    }
    if (rooms.double && rooms.double > 0) {
        const doubleRooms = await db.get({
            TableName: "bonzaiRooms",
            Key: {
                roomType: "double",
            },
        });
        freeDoubleRooms = doubleRooms.Item.available;
        if (rooms.single > freeDoubleRooms) {
            error.message = `You are trying to book ${rooms.double} rooms but there are only ${freeDoubleRooms} availiable`;
            throw error;
        }
    }

    if (rooms.suite) {
        const suiteRooms = await db.get({
            TableName: "bonzaiRooms",
            Key: {
                roomType: "suite",
            },
        });
        freeSuiteRooms = suiteRooms.Item.available;
        if (rooms.single > freeSuiteRooms) {
            error.message = `You are trying to book ${rooms.suite} rooms but there are only ${freeSuiteRooms} availiable`;
            throw error;
        }
    }
};
export { bizLogic };
