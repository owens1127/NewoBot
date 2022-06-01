const config = require('../config.json');
const Discord = require('discord.js');
const logs = require('../functions/logging');

/**
 * Handles a Discord command
 * @param {Discord.Client} client connection to discord
 * @param {Discord.Message} message the message the command is processed from
 * @param {String[]} args the arguments of the command
 * @param {Connection} database the connection to the database
 */
exports.discord = (client, message, args, database) => {

    let person;
    if (message.mentions.users.size !== 0) {
        person = message.mentions.users.first();
    } else {
        person = message.author;
    }

    let m;
    if (person.avatarURL() === null) {
        m = `${person.tag} does not have a profile picture set.`
    } else {
        m = {
            content: `Here is ${person.tag}'s profile picture:`,
            files: [person.avatarURL({
                format: 'png',
                dynamic: true,
                size: 512
            })]
        }
    }
    message.channel.send(m)
        .then(msg => {
            logs.logAction('Sent Message', {
                content: msg.content, guild: msg.guild
            })
            console.log(`Sent message: ${msg.content}`)
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
    client.say(channel, `@${userstate.username}, that is a discord only command.`)
        .then(message => console.log(`Sent Twitch chat message: ${message}`))
        .catch(console.error);
};

exports.help = {
    description: 'sends a link for someone\'s url',
    usage: `${config.discord.prefix}pfp [user]`
};
