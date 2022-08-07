const config = require('../config.json');
const Discord = require('discord.js');
const Connection = require('mysql/lib/Connection');
const Twitch = require('tmi.js');
const mysql = require('mysql');
const logs = require('../functions/logging');

/**
 * Handles a Discord command
 * @param {Discord.Client} client connection to discord
 * @param {Discord.Message} message the message the command is processed from
 * @param {String[]} args the arguments of the command
 * @param {Connection.prototype} database the connection to the database
 */
exports.discord = async (client, message, args, database) => {
        if (message.author.id !== config.discord.ownerID) {
        return message.channel.send(
            'You do not have permission to execute this command.')
            .then(msg => {
                logs.logAction('Sent Message', {
                    content: msg.content, guild: msg.guild
                })
                console.log(`Sent message: ${message.content}`)
            })
            .catch(logs.error);
    }

    let output;
    let response;
    const input = args.join(' ')
    console.log(`Evaluating ${input}...`);

    try {
        output = eval(input);
        if (output === null) {
            response = 'null'
        } else if (output === undefined) {
            response = 'undefined'
        } else if (typeof output === 'object' && typeof output.then === 'function') {
            response = `Executed \`${input}\``;
        } else {
            const str = require('util').inspect(output);
            console.log(`${input} evaluates to ${str}`);
            response = str;
        }
    } catch (e) {
        response = e.toString();
    }

    while (response.length > 0) {
        let sub = response.substring(0, 1994);
        message.channel.send('```' + sub + '```')
            .then(msg => {
                logs.logAction('Sent Message', {
                    content: msg.content, guild: msg.guild
                })
                console.log(`Sent message: ${msg.content}`)
            })
            .catch(logs.error);
        response = response.substring(1994);
    }

};

/**
 * Handles a Twitch command
 * @param {Twitch.client.prototype} client connection to twitch
 * @param channel the twitch Channel of origin
 * @param userstate the userstate of origin
 * @param args the arguments of the command
 * @param database the connection to the database
 */
exports.twitch = async (client, channel, userstate, args, database) => {
    if (userstate.username !== 'newox') {
        return client.say(channel,
            'You do not have permission to execute this command.')
            .then(message => console.log(`Sent Twitch chat message: ${message}`))
            .catch(logs.error);
    }

    var msg;
    var x;
    var input = args.join(' ')
    try {
        console.log(`Evaluating ${input}...`);
        x = eval(input);
        console.log(`'${input}' evaluates to: ${x}`);
        msg = x.toString();
    } catch (e) {
        console.log(e);
        msg = `Sorry ${userstate.username}, I can't do that :/`
    }

    client.say(channel, msg)
        .then(message => console.log(`Sent Twitch chat message: ${message}`))
        .catch(logs.error);
};

exports.help = {
    description: 'super powerful command',
    usage: `${config.discord.prefix}eval (Newo only)`
};
