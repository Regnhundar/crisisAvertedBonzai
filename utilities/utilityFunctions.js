import db from "../services/db.js";
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

const attemptReservation = async (rooms) => {
    let freeSingleRooms;
    let freeDoubleRooms;
    let freeSuiteRooms;

    if (rooms.single && rooms.single > 0) {
        freeSingleRooms = await checkRoomsAvailability("single", rooms.single);
    }
    if (rooms.double && rooms.double > 0) {
        freeDoubleRooms = await checkRoomsAvailability("double", rooms.double);
    }
    if (rooms.suite && rooms.suite > 0) {
        freeSuiteRooms = await checkRoomsAvailability("suite", rooms.suite);
    }
    if (freeSingleRooms) {
        await reserveRooms("single", freeSingleRooms, rooms.single);
    }
    if (freeDoubleRooms) {
        await reserveRooms("double", freeDoubleRooms, rooms.double);
    }
    if (freeSuiteRooms) {
        await reserveRooms("suite", freeSuiteRooms, rooms.suite);
    }
};

const checkRoomsAvailability = async (roomType, orderAmount) => {
    const checkRoom = await db.get({
        TableName: "bonzaiRooms",
        Key: {
            roomType: `${roomType}`,
        },
    });

    const freeRoomtypeAmount = checkRoom.Item.available;

    if (freeRoomtypeAmount < orderAmount) {
        throw new Error(`You are trying to book ${orderAmount} ${roomType} rooms but ${freeRoomtypeAmount} are available.`);
    }
    return freeRoomtypeAmount;
};

const reserveRooms = async (roomType, availableAmount, orderAmount) => {
    await db.update({
        TableName: "bonzaiRooms",
        Key: {
            roomType: `${roomType}`,
        },
        UpdateExpression: "SET available = :available",
        ExpressionAttributeValues: {
            ":available": availableAmount - orderAmount,
        },
        ReturnValues: "ALL_NEW",
    });
};

export { bizLogic, attemptReservation };
