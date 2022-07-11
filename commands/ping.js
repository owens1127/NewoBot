const config = require('../config.json');
const Discord = require('discord.js');
const Connection = require('mysql/lib/Connection');
const logs = require('../functions/logging');

/**
 * Handles a Discord command
 * @param {Discord.Client} client connection to discord
 * @param {Discord.Message} message the message the command is processed from
 * @param {String[]} args the arguments of the command
 * @param {Connection.prototype} database the connection to the database
 */
exports.discord = (client, message, args) => {
    message.channel.send('Ping?')
        .then(msg => {
            console.log(`Sent message: ${msg.content}`);
            logs.logAction('Sent Message', {
                message: msg.content
            });
            const oldMsg = msg.content;
            msg.edit(`Pong! Latency is ${msg.createdTimestamp
            - message.createdTimestamp}ms. API Latency is ${Math.round(client.ws.ping)}ms`)
                .then(edt => {
                    console.log(`Updated the content of a message to ${edt.content}`);
                    logs.logAction('Edited Message', {
                        old_message: oldMsg,
                        new_message: edt.content
                    });
                })
                .catch(logs.error);
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
    client.say(channel, 'Pong!')
        .then(message => console.log(`Sent Twitch chat message: ${message}`))
        .catch(logs.error);
};

exports.help = {
    description: 'Ping the bot',
    usage: `${config.discord.prefix}ping`
};
