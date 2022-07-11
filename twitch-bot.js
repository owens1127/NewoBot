const Twitch = require('tmi.js');
const config = require("./config.json");

exports.run = (config, db) => {

    const twitch_client = new Twitch.client({
        connection: {
            secure: true,
            reconnect: true
        },
        identity: {
            username: 'NewoRobot',
            password: process.env.TWITCH_TOKEN
        },
        channels: ['newoX']
    });


    twitch_client.on('connected', (addr, port) => {
        console.log(`Logged into Twitch on port ${port}`);
        console.log("Twitch is Online");
    });


    twitch_client.on('message', async (channel, userstate, message, self) => {
        if (self) {
            return;
        }
        if (message.indexOf(config.prefix) === 0) {
            require(`modules/handleCommand`)
                .twitch(twitch_client, channel, userstate, message, database);
        }
    });

    twitch_client.on('error', console.error);

// LOGIN

    twitch_client.connect();
}