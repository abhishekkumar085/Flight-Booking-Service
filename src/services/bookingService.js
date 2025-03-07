const { default: axios } = require('axios');
const db = require('../models');
const { BookingRepository } = require('../repositories');
const { FLIGHT_SERVICE } = require('../config/server-config');
const { StatusCodes } = require('http-status-codes');
const { AppError } = require('../utils');

const { BOOKED, CANCELLED } = require('../utils/ENUM/enum').BOOKING_STATUS;

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

async function makePayment(data) {
  const transaction = await db.sequelize.transaction();
  try {
    const bookingDetails = await bookingRepository.get(
      data.bookingId,
      transaction
    );

    if (bookingDetails.status === CANCELLED) {
      throw new AppError('Booking time expired', StatusCodes.BAD_REQUEST);
    }

    const bookingTime = new Date(bookingDetails.createdAt);
    const currentTime = new Date();

    if (currentTime - bookingTime > 300000) {
      await cancelBooking(data.bookingId);
      throw new AppError('Booking time expired', StatusCodes.BAD_REQUEST);
    }
    if (bookingDetails.totalCost != data.totalCost) {
      throw new AppError('Invalid amount', StatusCodes.BAD_REQUEST);
    }

    if (bookingDetails.userId != data.userId) {
      throw new AppError(
        'The user corresponding to the booking doesnt match',
        StatusCodes.BAD_REQUEST
      );
    }

    await bookingRepository.update(
      data.bookingId,
      { status: BOOKED },
      transaction
    );

    await transaction.commit();
  } catch (error) {
    await transaction.rollback();
    console.log(error);
    throw error;
  }
}

async function cancelBooking(bookingId) {
  const transaction = await db.sequelize.transaction();
  try {
    const bookingDetails = await bookingRepository.get(bookingId, transaction);

    if (bookingDetails.status === CANCELLED) {
      await transaction.commit();
      return true;
    }

    await axios.patch(
      `${FLIGHT_SERVICE}/api/v1/flight/${bookingDetails.flightId}/seats`,
      {
        seats: bookingDetails.noOfSeats,
        dec: false,
      }
    );
    await bookingRepository.update(
      bookingId,
      { status: CANCELLED },
      transaction
    );
    await transaction.commit();
  } catch (error) {
    await transaction.rollback();
    console.log(error);
    throw error;
  }
}

async function cancelOldBookings() {
  try {
    console.log('Inside service');
    const time = new Date(Date.now() - 1000 * 300); // time 5 mins ago
    const response = await bookingRepository.cancelOldBookings(time);

    return response;
  } catch (error) {
    console.log(error);
  }
}

module.exports = {
  createBooking,
  makePayment,
  cancelOldBookings,
};
