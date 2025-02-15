const { Booking } = require('../models');
const CrudRepository = require('./crudRepository');

class BookingRepository extends CrudRepository {
  constructor() {
    super(Booking);
  }
}
module.exports = BookingRepository;
