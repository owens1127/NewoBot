const config = require('../config.json');
const logs = require('../functions/logging');
const Discord = require('discord.js');
const Connection = require('mysql/lib/Connection')

/**
 * Handles a Discord command
 * @param {Discord.Client} client connection to discord
 * @param {Discord.Message} message the message the command is processed from
 * @param {String[]} args the arguments of the command
 * @param {Connection.prototype} database the connection to the database
 */
exports.discord = async (client, message, args, database) => {
    let parrot = args.join(' ');
    message.channel.send(parrot)
        .then(msg => {
            logs.logAction('Parroted Message', {
                channel: msg.channel.name,
                content: msg.content
            });
            console.log(`Echoed message from ${message.author.tag}: ${msg.content}`)
        })
        .catch(console.error);

    await message.delete().catch(console.error);
    console.log(`Deleted original message after echoing`);

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
    var parrot = args.join(' ');

    client.say(channel, parrot)
        .then(message => {
            logs.logAction('Parroted Message', {
                channel: channel,
                content: message
            });
            console.log(`Echoed message from ${userstate.username}: ${message}`);
        })
        .catch(console.error);
};

exports.help = {
    description: 'Make the bot repeat some stuff.',
    usage: `${config.discord.prefix}say <message>`
};
