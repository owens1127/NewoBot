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
  if (message.author.id !== config.discord.ownerID) {
    return message.channel.send(
        'You do not have permission to execute this command.')
        .then(msg => {
          logs.logAction('Sent Message', {
            content: msg.content, guild: msg.guild
          })
          console.log(`Sent message: ${message.content}`)
        })
        .catch(console.error);
  }

    require(`modules/restart`).message(message);
};

/**
 * Handles a Twitch command
 * @param {Twitch.client.prototype} client connection to twitch
 * @param channel the twitch Channel of origin
 * @param userstate the userstate of origin
 * @param args the arguments of the command
 * @param database the connection to the database
 */
exports.twitch = (client, channel, userstate, args, database) => {
    client.say(channel, `@${userstate.username}, that is a discord only command.`)
        .then(message => console.log(`Sent Twitch chat message: ${message}`))
        .catch(console.error);
};

exports.help = {
    description: 'restarts the bot (Newo only)',
    usage: `${config.prefix}restart`
};
