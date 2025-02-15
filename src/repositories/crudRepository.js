const { StatusCodes } = require('http-status-codes');
const { Logger } = require('../config');
const { AppError } = require('../utils');

class CrudRepository {
  constructor(model) {
    this.model = model;
  }

  // create
  async create(data) {
    const response = await this.model.create(data);
    return response;
  }
  // delete by id
  async destroy(data) {
    try {
      const response = await this.model.destroy({
        where: {
          id: data,
        },
      });
      if (!response) {
        throw new AppError(
          `Record with ID ${data} not found!`,
          StatusCodes.NOT_FOUND
        );
      }
      return response;
    } catch (error) {
      Logger.error('something went wrong in crude repo : destroy');
      throw new AppError(error.message, StatusCodes.INTERNAL_SERVER_ERROR);
    }
  }

  async get(data) {
    try {
      const response = await this.model.findByPk(data);
      if (!response) {
        throw new AppError(
          `Record with ID ${data} not found!`,
          StatusCodes.NOT_FOUND
        );
      }
      return response;
    } catch (error) {
      console.log("From crudRepository!",error)
      Logger.error(`Error in crud repo : get - ${error.message}`);
      throw error;
    }
  }

  async getAll() {
    try {
      const response = await this.model.findAll();
      return response;
    } catch (error) {
      Logger.error('something went wrong in crude repo : GETALL');
      throw new AppError(error.message, StatusCodes.INTERNAL_SERVER_ERROR);
    }
  }

  async update(id, data) {
    try {
      const [updatedRows] = await this.model.update(data, {
        where: { id: id },
      });

      if (updatedRows === 0) {
        throw new AppError(
          `Record with ID ${id} not found or not updated`,
          StatusCodes.NOT_FOUND
        );
      }

      const updatedData = await this.model.findByPk(id); // Fetch updated data

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
}

module.exports = CrudRepository;
