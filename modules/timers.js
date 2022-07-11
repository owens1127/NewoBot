const Discord = require('discord.js');
const config = require('../config.json');
const util = require('../functions/util');
const logs = require('../functions/logging');

exports.discord = (env, client, database) => {

    // Fetch Members Every 3 Minutes
    setInterval(() => {
        let guilds = client.guilds.cache;
        guilds.forEach(g => {
            g.members.fetch()
                .catch(logs.error);
        });
    }, 180000);

    // RECONNECT CONNECTION TO DATABASE EVERY 30s
    setInterval(() => {
        // console.log(`Refreshing database connection...`);
        database.query('SELECT 1');
    }, 30 * 1000);

    // DATE CHECKER
    setInterval(() => {

        let date = new Date()
        date.setTime(date.getTime() + config.global.timeHrOffset * 3600000); // apply offset;

        const minutes = date.getMinutes();
        if (minutes !== 0) {
            return;
        }

        const hour = date.getHours();
        const dayOfWeek = date.getDay();
        const dayOfMonth = date.getDate();

        const xpResets = require('./xpResets');

        if (hour === 9) {
            // MORNING
            require('./goodMorning').run(client);
        } else if (hour === 0) {
            // NEW DAY
            xpResets.daily(client, database);
        }
        if (dayOfWeek === 0 && hour === 0) {
            // NEW WEEK
            xpResets.weekly(client, database);
        }
        if (dayOfMonth === 1 && hour === 0) {
            // NEW MONTH
            xpResets.monthly(client, database);
        }
        if (dayOfWeek === 5 && hour === 10) {
            // FRIDAY MORNING
            sendFridayMessage(client);
        }

    }, 60 * 1000); // (1 minute)

    // Status Update
    var minutesSinceCrash = 0;
    setInterval(() => {
        minutesSinceCrash++;
        if (!util.streaming(client)) {
            client.user.setActivity(
                `over the anemone for ${minutesSinceCrash} minutes without drowning`,
                {type: 'WATCHING'});
        }

    }, 60 * 1000); // (1 minute)

    // Color Verification
    setInterval(() => {
        console.log(`Verifying all color roles are properly applied...`);
        const roleColor = require(`./roleColor.js`);

        setTimeout(() => {
            client.guilds.cache.forEach(g => {
                if (util.isPremiumGuild(g)) {
                    roleColor.verify(g);
                }
            });
        }, 1000);

        console.log(`All color roles now applied correctly.`);
        logs.logAction('Verified Color Roles', {});
    }, 6 * 60 * 60 * 1000); // (6 hours)

    // LIVE ON TWITCH
    setInterval(() => {
        let cached = util.streaming(client);
        setTimeout(() => {
            require(`./twitch`).run(cached, env.TWITCH_CLIENT_ID, env.TWITCH_SECRET, client);
        }, 3000);

    }, 60000); // (1 minute)

    // YOUTUBE VIDEOS
    setInterval(() => {
        require(`./youtube`).run(env.YOUTUBE_API, client);
    }, 15 * 60000); // (15 minutes)

};

/**
 * Send a morning message every Friday.
 * @param client
 */
function sendFridayMessage(client) {
    client.guilds.cache.forEach(g => {
        if (util.isPremiumGuild(g)) {
            let channel = util.getOutputChannel(g);
            channel.send({
                files: ['https://cdn.discordapp.com/attachments/591094670789050375/893598265549918248/PrHZc7VO8DLyoTvC.mp4']
            }).then(() => {
                console.log('Sent Friday sailor message to ' + g.name);
            })
                .catch(logs.error);
        }
    });
    logs.logAction('Sent Friday Messages', {
        serverCount: client.guilds.cache.size
    })
}


