const cron = require('node-cron')

const scheduler = (interval, time) => {
  console.log('interval', interval)
  console.log('time', time)

  // Runs every weekday (Monday through Friday) at 11:30:00 AM. It does not run on Saturday or Sunday.
  cron.schedule('00 00 07 * * 1-5', () => {
    console.log('running a task every minute')
  })

  const onceAWeek = (callback) => {
    cron.schedule('0 0 0 * * 7', () => {
      callback()
    })
  }

  return {
    onceAWeek
  }
}

export default scheduler
