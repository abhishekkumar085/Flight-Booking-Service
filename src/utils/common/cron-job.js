const cron = require('node-cron');

function scheduleCrons() {
  cron.schedule('*/5 * * * * *', () => {
    console.log('running a task every minute');
  });
}

module.exports = scheduleCrons;
