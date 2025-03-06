const { StatusCodes } = require('http-status-codes');
const { Booking } = require('../models');
const { AppError } = require('../utils');
const CrudRepository = require('./crudRepository');

class BookingRepository extends CrudRepository {
  constructor() {
    super(Booking);
  }

  async createBooking(data, transaction) {
    const response = await Booking.create(data, { transaction: transaction });
    return response;
  }

  async get(data, transaction) {
    const response = await Booking.findByPk(data, { transaction: transaction });
    if (!response) {
      throw new AppError('Not able to found resource', StatusCodes.NOT_FOUND);
    }
    return response;
  }
  async update(id, data, transaction) {
    try {
      const [updatedRows] = await this.model.update(
        data,
        {
          where: { id: id },
        },
        { transaction: transaction }
      );

      if (updatedRows === 0) {
        throw new AppError(
          `Record with ID ${id} not found or not updated`,
          StatusCodes.NOT_FOUND
        );
      }

      const updatedData = await this.model.findByPk(id);

      return updatedData;
    } catch (error) {
      Logger.error(`Error in CRUD repo: Update - ${error.message}`);
      console.log(error);
      if (error.name === 'SequelizeUniqueConstraintError') {
        throw new AppError(
          'The value you entered is already in use or conflicts with existing data. Please try a different one.',
          StatusCodes.CONFLICT
        );
      }
      throw error;
    }
  }

  // cancel old booking
  async cancelOldBookings(timestamp) {
    console.log('in repo');
    const response = await Booking.update(
      { status: CANCELLED },
      {
        where: {
          [Op.and]: [
            {
              createdAt: {
                [Op.lt]: timestamp,
              },
            },
            {
              status: {
                [Op.ne]: BOOKED,
              },
            },
            {
              status: {
                [Op.ne]: CANCELLED,
              },
            },
          ],
        },
      }
    );
    return response;
  }
}
module.exports = BookingRepository;
