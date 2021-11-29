import fs from 'fs'
import DotEnv from 'dotenv'
import { App } from '@slack/bolt'
import miniatureEpiphanies from '../../miniatureEpiphanies.json'
import { fetchMiniatureEpiphanies } from './network'

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
        if (newMiniatureEpiphanies.length)
          addNewMiniatureEpiphanies(newMiniatureEpiphanies)
      }).catch((err) => {
        console.log(`error loading data: ${err}`)
      })
  } catch (error) {
    console.log('err')
    console.error(error)
  }
}

moreMoreMiniatureEpiphanies()

app.command('/enlighten', async ({ command, ack, say }) => {
  console.log('DB', miniatureEpiphanies)
  try {
    await ack()
    // TODO: call moreMoreMiniatureEpiphanies if there's no items in new miniatureEpiphanies
    say(miniatureEpiphanies.new[0])
    archiveAMiniatureEpiphanies()
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
    // respond({
    //   "response_type": "ephemeral",
    //   "text": "Sorry, slash commando, that didn't work. Please try again."
    // })
    respond({
      "response_type": "ephemeral",
      "text": "How to use /schedule",
      "attachments": [
        {
          "text": "To schedule a recurring enlighten message, pass an Interval (daily, weekly, monthly or yearly) and Time (hh:mm). Example: daily 08:30"
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
