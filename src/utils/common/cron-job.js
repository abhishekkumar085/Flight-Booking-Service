const cron = require('node-cron');
const { BookingService } = require('../../services');

async function scheduleCrons() {
  cron.schedule('*/30 * * * * *', async () => {
    const response = await BookingService.cancelOldBookings();
    console.log('CRONRESPONSE', response);
  });
}

module.exports = scheduleCrons;
