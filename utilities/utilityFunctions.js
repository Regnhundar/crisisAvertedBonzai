const bizLogic = (body, itemToUpdate) => {
    const error = new Error();

    const numberOfBeds = body.single + body.double * 2 + body.suite * 3;

    if (body.guests > numberOfBeds) {
        error.msg = "Guests can't be a higher number then beds.";
        throw error.msg;
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

export { bizLogic };
