const config = require('../config.json');
const Discord = require('discord.js');
const Connection = require('mysql/lib/Connection');
const logs = require('../functions/logging');

// This is a prank command to 'pull someone's IP' (random);

/**
 * Handles a Discord command
 * @param {Discord.Client} client connection to discord
 * @param {Discord.Message} message the message the command is processed from
 * @param {String[]} args the arguments of the command
 * @param {Connection.prototype} database the connection to the database
 */
exports.discord = (client, message, args, database) => {
    message.channel.sendTyping();
    let person;
    if (message.mentions.users.size !== 0) {
        person = message.mentions.users.first();
    } else {
        person = message.author;
    }

    const vals = new Array(4);
    vals.map(() => {
        return Math.floor(Math.random() * 256);
    })
    const m = `${person}'s IP: \`${vals.join('.')}\``;

    message.channel.send(m)
        .then(msg => {
            logs.logAction('Sent Message', {
                content: msg.content, guild: msg.guild
            })
            console.log(`Sent message: ${msg.content}`)
        })
        .catch(logs.error);


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
        .catch(logs.error);
};

exports.help = {
    description: 'sends a link for someone\'s url',
    usage: `${config.discord.prefix}ip [user]`
};
