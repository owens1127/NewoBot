const config = require('../config.json');
const logs = require('../functions/logging');

/**
 * Handles a Discord command
 * @param {Discord.Client} client connection to discord
 * @param {Discord.Message} message the message the command is processed from
 * @param {String[]} args the arguments of the command
 * @param {Connection.prototype} database the connection to the database
 */
exports.discord = (client, message, args, database) => {
    return message.channel.send(genMessage())
        .then(msg => {
            logs.logAction('Sent Message', {
                content: msg.content, guild: msg.guild
            })
            console.log(`Sent message: ${msg.content}`)
        })
        .catch(console.error);
};

exports.twitch = (client, channel, userstate, args, database) => {
    client.say(channel, genMessage())
        .then(message => console.log(`Sent Twitch chat message: ${message}`))
        .catch(console.error);
};

function genMessage() {
    if (Math.floor(Math.random() * 2) === 0) {
        return 'Heads'
    } else {
        return 'Tails';
    }
}

exports.help = {
    description: 'Flip a coin.',
    usage: `${config.prefix}flip`
};
