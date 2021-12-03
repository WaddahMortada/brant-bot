import fs from 'fs'
import DotEnv from 'dotenv'
import { App } from '@slack/bolt'
import miniatureEpiphanies from '../../miniatureEpiphanies.json'
import { fetchMiniatureEpiphanies } from './network'
import Scheduler from './scheduler'
import filterKey from './nsfw-words.json'

DotEnv.config()

const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  socketMode: true, // enable to use socket mode
  appToken: process.env.APP_TOKEN
})

const addNewMiniatureEpiphanies = newMiniatureEpiphanies => {
  miniatureEpiphanies.new = miniatureEpiphanies.new.concat(newMiniatureEpiphanies)
  updateDB()
}

const archiveAMiniatureEpiphanies = () => {
  miniatureEpiphanies.archive.push(miniatureEpiphanies.new.shift())
  updateDB()
}

const updateDB = () => {
  fs.writeFile('../miniatureEpiphanies.json', JSON.stringify(miniatureEpiphanies, null, 2), 'utf8', (err) => {
    if (err) throw err
    console.log('Miniature Epiphanies DB has been updated!')
  })
}

const sanitiseMiniatureEpiphanies = miniatureEpiphaniesData => {
  const newMiniatureEpiphanies = miniatureEpiphaniesData.data.children
    .filter(item => !filterKey.words.some(word => item.data.title.toLowerCase().includes(word)))
    .filter(item => !miniatureEpiphanies.archive.includes(item.data.title))
    .filter(item => !miniatureEpiphanies.new.includes(item.data.title))
    .map(item => item.data.title)
  console.log(newMiniatureEpiphanies)
  return newMiniatureEpiphanies
}

const moreMoreMiniatureEpiphanies = () => {
  try {
    fetchMiniatureEpiphanies()
      .then(miniatureEpiphaniesDataString => {
        console.log('Loaded miniatureEpiphaniesData')
        const miniatureEpiphaniesData = JSON.parse(miniatureEpiphaniesDataString)
        const newMiniatureEpiphanies = sanitiseMiniatureEpiphanies(miniatureEpiphaniesData)
        if (newMiniatureEpiphanies.length) {
          addNewMiniatureEpiphanies(newMiniatureEpiphanies)
        }
      }).catch(err => {
        console.log(`Error loading data: {responseText: ${err.responseText}, status: ${err.status}}`)
      })
  } catch (error) {
    console.log('err')
    console.error(error)
  }
}

const enlighten = say => {
  console.log('enlighten')
  // TODO: call moreMoreMiniatureEpiphanies if there's no items in new miniatureEpiphanies
  say(miniatureEpiphanies.new[0])
  archiveAMiniatureEpiphanies()
}

// moreMoreMiniatureEpiphanies()

// Scheduler.onceAWeek(moreMoreMiniatureEpiphanies)

app.command('/enlighten', async ({ command, ack, say }) => {
  console.log('DB', miniatureEpiphanies)
  try {
    await ack()
    enlighten(say)
  } catch (error) {
    console.log('err')
    console.error(error)
  }
})

app.command('/schedule', async ({ command, ack, say, respond, body }) => {
  try {
    await ack()
    console.log(command)
    console.log(command.text)

    const time = command.text
    const timeFormat = /^([0-9]|0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$/ // HH:MM 24-hour format, optional leading 0
    let text, attachment

    if (time && timeFormat.test(time)) {
      Scheduler.weekday(time, enlighten)
      text = `An enlighten message have been scheduled everyday during weekday at ${time}\nTo cancel this scheduled message, use the /cancel slash command with the same time value you used for this`
      // attachment = 'To cancel this scheduled message, use the /cancel slash command with the same time value you used for this'
    } else {
      text = 'How to use /schedule'
      attachments = 'To schedule a weekday recurring enlighten message, pass a Time value [hh:mm] in 24 hour formate. Example: 08:30 or 21:55'
    }

    respond({
      "response_type": "ephemeral",
      "text": text,
      "attachments": [
        {
          "text": attachment
        }
      ]
    })
  } catch (error) {
    console.log('err')
    console.error(error)
  }
})

const start = async () => {
  const port = 3000

  await app.start(process.env.PORT || port)
  console.log(`⚡️ Slack Bolt app is running on port ${port}!`)
}

start()
