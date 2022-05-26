const request = require('snekfetch');
const Discord = require('discord.js');
const config = require('../config.json');
const logs = require('../functions/logging');

/**
 * Restarts the bot from a command
 * @param {Discord.Message} message the message used to restart the bot
 * @param {{HEROKU_TOKEN: string}} env the environment variable passed in
 */
exports.message = (message, env) => {
    const token = env.HEROKU_TOKEN;

    console.log(`!restart command initiated. Restarting Bot.`);
    message.channel.send(`Rebooting...`)
        .then(msg => {
            logs.logAction('Sent message', {
                content: msg.content,
                guild: msg.guild
            });
            console.log('Sent message: ' + msg);
        })
        .catch(console.error);
    restart(token);
};

/**
 * Restarts the bot
 * @param token the token required to restart the bot
 */
function restart(token) {
    const url = 'https://api.heroku.com/apps/' + config.global.appname + '/dynos/';
    logs.logAction('Restarting...', {
        time: new Date()
    })
    request.delete(url, {
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/vnd.heroku+json; version=3',
            'Authorization': 'Bearer ' + token
        }
    })
        .catch(console.error);
}
