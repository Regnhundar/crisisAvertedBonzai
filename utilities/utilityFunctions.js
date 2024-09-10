import db from "../services/db.js";

const calculatePrice = (body) => {
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

const attemptReservation = async (body, oldOrder) => {
    checkAmountOfBeds(body);

    let freeSingleRooms;
    let freeDoubleRooms;
    let freeSuiteRooms;

    if (body.single && body.single > 0) {
        freeSingleRooms = await checkRoomsAvailability("single", body.single, oldOrder ? oldOrder.single : undefined);
    }
    if (body.double && body.double > 0) {
        freeDoubleRooms = await checkRoomsAvailability("double", body.double, oldOrder ? oldOrder.double : undefined);
    }
    if (body.suite && body.suite > 0) {
        freeSuiteRooms = await checkRoomsAvailability("suite", body.suite, oldOrder ? oldOrder.suite : undefined);
    }
    if (freeSingleRooms) {
        await reserveRooms("single", freeSingleRooms, body.single);
    }
    if (freeDoubleRooms) {
        await reserveRooms("double", freeDoubleRooms, body.double);
    }
    if (freeSuiteRooms) {
        await reserveRooms("suite", freeSuiteRooms, body.suite);
    }
};

const checkAmountOfBeds = (body) => {
    let numberOfBeds = body.single + body.double * 2 + body.suite * 3;
    if (body.guests > numberOfBeds) {
        throw new Error("Guests can't be a higher number then beds.");
    }
};

const checkRoomsAvailability = async (roomType, orderAmount, oldOrder) => {
    const checkRoom = await db.get({
        TableName: "bonzaiRooms",
        Key: {
            roomType: `${roomType}`,
        },
    });

    let freeRoomtypeAmount = checkRoom.Item.available;

    if (oldOrder && !isNaN(oldOrder)) {
        freeRoomtypeAmount += oldOrder;
    }
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

export { calculatePrice, attemptReservation };
