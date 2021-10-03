const DotEnv = require('dotenv')
const { App } = require('@slack/bolt')
const { fetchMiniatureEpiphanies } = require('./network')

DotEnv.config()

const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  socketMode: true, // enable to use socket mode
  appToken: process.env.APP_TOKEN
})

app.command("/enlighten", async ({ command, ack, say }) => {
  try {
    await ack()
    fetchMiniatureEpiphanies()
      .then(miniatureEpiphaniesDataString => {
        console.log('Loaded miniatureEpiphaniesData')
        const miniatureEpiphaniesData = JSON.parse(miniatureEpiphaniesDataString)
        const miniatureEpiphanies = miniatureEpiphaniesData.data.children
          .map(item => item.data.title)

        say(miniatureEpiphanies[0])
      }).catch((err) => {
        console.log(`error loading data: ${err}`)
      })
  } catch (error) {
    console.log("err")
    console.error(error)
  }
})

const start = async () => {
  const port = 3000

  await app.start(process.env.PORT || port)
  console.log(`⚡️ Slack Bolt app is running on port ${port}!`)
}

start()
