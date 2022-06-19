const Discord = require('discord.js');
const Connection = require('mysql/lib/Connection');
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
    if (args.length < 1) {
        return message.channel.send(`${message.author}, you're missing 1 argument`)
            .then(msg => {
                logs.logAction('Sent Message', {
                    content: msg.content, guild: msg.guild
                })
                console.log(`Sent message: ${message.content}`)
            })
            .catch(console.error);
    }

    message.channel.send(
        `${message.author}, you have a ${chance()} percent chance at getting into ${args.join(
            ' ')}.`)
        .then(msg => {
            logs.logAction('Sent Message', {
                content: msg.content, guild: msg.guild
            })
            console.log(`Sent message: ${message.content}`)
        })
        .catch(console.error);
};

/**
 * Handles a Twitch command
 * @param {Discord.Client} client connection to discord
 * @param channel the twitch Channel of origin
 * @param userstate the userstate of origin
 * @param args the arguments of the command
 * @param database the connection to the database
 */
exports.twitch = (client, channel, userstate, args, database) => {
    if (args.length < 1) {
        return client.say(channel,
            `@${userstate.username}, you're missing 1 argument`)
            .then(message => console.log(`Sent Twitch chat message: ${message}`))
            .catch(console.error);
    }

    client.say(channel,
        `@${userstate.username}, you have a ${chance()} percent chance at getting into ${args.join(
            ' ')}.`)
        .then(message => console.log(`Sent Twitch chat message: ${message}`))
        .catch(console.error);
};

/**
 * Produces a chance between 0 and 100 (inclusive)
 * @returns {number} the chance
 */
function chance() {
    return Math.floor(Math.random() * 101)
}

exports.help = {
    description: "how likely you are getting into something",
    usage: `${config.discord.prefix}chanceme <thing>`
};
