import db from "../services/db.js";

const calculatePrice = (body) => {
    // Räknar först ut dygnskostnad för enskilda rummen.
    const singlePrice = 500 * body.single;
    const doublePrice = 1000 * body.double;
    const suitePrice = 1500 * body.suite;
    // Totalsumma för beställda rum per natt.
    const totalCostPerNight = singlePrice + doublePrice + suitePrice;
    // Skickar in datumen i datum-objekt. Får tillbaka millisekunder som har passerat från 1970.
    const arrivalDate = new Date(body.arrival);
    const departureDate = new Date(body.departure);
    // Konverterar millisekunder till dygn.
    const lengthOfStay = (departureDate - arrivalDate) / (1000 * 60 * 60 * 24);
    // Kostnad per dygn gånger antal dygn som man ska stanna.
    const costOfStay = totalCostPerNight * lengthOfStay;
    // returnerar totalkostnad
    return costOfStay;
};

const attemptReservation = async (body, oldOrder) => {
    // Anropar funktion som kollar att antal gäster inte överstiger antal tillgängliga sängar i beställningen. Om gäster > sängar kastas ett fel.
    checkAmountOfBeds(body);
    // Nedanstående kod kan vara 2 "for of" loopar men kan göra koden mer svårförstålig.
    // Pga scope skapas variablerna utanför blocken.
    let freeSingleRooms;
    let freeDoubleRooms;
    let freeSuiteRooms;

    if (body.single && body.single > 0) {
        // Värdet sätts på variabeln "freeSingleRooms" till det värde som checkRoomsAvailability returnerar.
        // OldOrder används bara om du ska uppdatera en beställning. Ej testad.
        freeSingleRooms = await checkRoomsAvailability("single", body.single, oldOrder ? oldOrder.single : undefined);
    }
    if (body.double && body.double > 0) {
        freeDoubleRooms = await checkRoomsAvailability("double", body.double, oldOrder ? oldOrder.double : undefined);
    }
    if (body.suite && body.suite > 0) {
        freeSuiteRooms = await checkRoomsAvailability("suite", body.suite, oldOrder ? oldOrder.suite : undefined);
    }
    // Om variabeln är "truthy" dvs är definierad (i det här fallet en siffra)
    if (freeSingleRooms) {
        // Skickar med vilken typ, hur många som finns lediga och hur många som ska beställas.
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
    // Antal beställda rum av en typ multipliceras med hur många sängar som finns i rumtypen
    let numberOfBeds = body.single + body.double * 2 + body.suite * 3;
    if (body.guests > numberOfBeds) {
        throw new Error("Guests can't be a higher number then beds.");
    }
};

const checkRoomsAvailability = async (roomType, orderAmount, oldOrder) => {
    // Anropar bonzaiRooms för att se hur många rum som finns av "roomType" (dvs single, double eller suite)
    const checkRoom = await db.get({
        TableName: "bonzaiRooms",
        Key: {
            roomType: `${roomType}`,
        },
    });
    // Sparar antal rum i en variabel
    let freeRoomtypeAmount = checkRoom.Item.available;
    // Kollar om oldOrder, dvs om det ska göras en uppdatering, är med och är en siffra.
    if (oldOrder && !isNaN(oldOrder)) {
        // Om den är med så måste de beställda rummen räknas med i de lediga rummen.
        freeRoomtypeAmount += oldOrder;
    }
    // Om antal lediga rum är mindre än antal beställda rum kastas ett fel.
    if (freeRoomtypeAmount < orderAmount) {
        throw new Error(`You are trying to book ${orderAmount} ${roomType} rooms but ${freeRoomtypeAmount} are available.`);
    }
    // Antal lediga rum returneras.
    return freeRoomtypeAmount;
};

const reserveRooms = async (roomType, availableAmount, orderAmount) => {
    // Uppdaterar antal lediga rum i bonzaiRooms.
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
