import cron from 'node-cron'

const tasks = {}

// Runs every weekday (Monday through Friday) at 07:00:00 AM. It does not run on Saturday or Sunday.
cron.schedule('00 00 07 * * 1-5', () => {
  console.log('running a task every minute')
})

const onceAWeek = callback => {
  const task = cron.schedule('0 0 0 * * 7', () => {
    callback()
  })
  tasks[timeString] = task
}

const convertTimeToObject = time => {
  const timeArr = time.split(':')
  return {
    hour: timeArr[0],
    minute: timeArr[1]
  }
}

const weekday = (timeString, callback) => {
  console.log(`Scheduling a weekday message Time ${timeString}`)
  const time = convertTimeToObject(timeString)
  const task = cron.schedule(`0 ${time.minute} ${time.hour} * * 1-5`, () => {
    console.log('Excuting timeString task')
    callback()
  })
  tasks[timeString] = task
}

const cancel = time => {
  console.log(`Cancel a schedule message Time ${time}`)
  tasks[time].stop()
  delete tasks[time]
}

export default {
  onceAWeek,
  weekday,
  cancel
}
