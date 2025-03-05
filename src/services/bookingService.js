const { default: axios } = require('axios');
const db = require('../models');
const { BookingRepository } = require('../repositories');
const { FLIGHT_SERVICE } = require('../config/server-config');
const { StatusCodes } = require('http-status-codes');
const { AppError } = require('../utils');

const bookingRepository = new BookingRepository();

async function createBooking(data) {
  const transaction = await db.sequelize.transaction();
  try {
    const flight = await axios.get(
      `${FLIGHT_SERVICE}/api/v1/flight/${data.flightId}`
    );
    if (data.noOfSeats > flight.data.data.totalSeats) {
      throw new AppError('Not enough seats available', StatusCodes.BAD_REQUEST);
    }
    const totalBillingAmount = data.noOfSeats * flight.data.data.price;

    const bookingPayload = {
      ...data,
      totalCost: totalBillingAmount,
    };

    const booking = await bookingRepository.createBooking(
      bookingPayload,
      transaction
    );

    await axios.patch(
      `${FLIGHT_SERVICE}/api/v1/flight/${data.flightId}/seats`,
      {
        seats: data.noOfSeats,
      }
    );
    await transaction.commit();

    return booking;
  } catch (error) {
    await transaction.rollback();
    console.log(error);
    throw error;
  }
}

module.exports = {
  createBooking,
};
