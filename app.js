const DotEnv = require('dotenv')
const { App } = require('@slack/bolt')

DotEnv.config()

const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  socketMode: true, // enable the following to use socket mode
  appToken: process.env.APP_TOKEN
})

const start = async () => {
  const port = 3000

  // Start your app
  await app.start(process.env.PORT || port)
  console.log(`⚡️ Slack Bolt app is running on port ${port}!`)
}

start()
