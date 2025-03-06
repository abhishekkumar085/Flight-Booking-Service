const { StatusCodes } = require('http-status-codes');
const { BookingService } = require('../services');

async function createBooking(req, res) {
  try {
    const response = await BookingService.createBooking({
      flightId: req.body.flightId,
      userId: req.body.userId,
      noOfSeats: req.body.noOfSeats,
    });
    return res.status(StatusCodes.CREATED).json({
      success: true,
      message: 'successfully created the resource',
      data: response,
      error: {},
    });
  } catch (error) {
    res.status(error.statusCode).json({
      success: false,
      message: error.message,
      data: {},
      error: error,
    });
  }
}
async function makePayment(req, res) {
  try {
    const response = await BookingService.makePayment({
      bookingId: req.body.bookingId,
      userId: req.body.userId,
      totalCost: req.body.totalCost,
    });
    return res.status(StatusCodes.CREATED).json({
      success: true,
      message: 'successfully created the resource',
      data: response,
      error: {},
    });
  } catch (error) {
    res.status(error.statusCode).json({
      success: false,
      message: error.message,
      data: {},
      error: error,
    });
  }
}

module.exports = {
  createBooking,
  makePayment,
};
