const config = require('../config.json');
const Discord = require('discord.js');
const Connection = require('mysql/lib/Connection');
const Twitch = require('tmi.js');
const mysql = require('mysql');
const logs = require('../functions/logging');
const fs = require('fs');

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

    const query = args.join(' ');
    database.query(query, (err, res) => {
        if (err) {
            message.channel.send(err.message)
                .then(msg => {
                    logs.logAction('Sent Message', {
                        content: msg.content, guild: msg.guild
                    })
                    console.log(`Sent message: ${msg.content}`)
                })
                .catch(logs.error);
        } else if (res.message) {
            console.log(res)
            message.channel.send(res.message.substring(1))
                .then(msg => {
                    logs.logAction('Sent Message', {
                        content: msg.content, guild: msg.guild
                    })
                    console.log(`Sent message: ${msg.content}`)
                })
                .catch(logs.error);
        } else {
            const json = JSON.stringify(res, null, ' ');
            console.log(
                database.config)
            const date = new Date();
            const name = 'temp_query';
            const path = `./resources/${name}.txt`
            fs.writeFile(path, json, 'utf8', (error) => {
                if (error) {
                    logs.error(error);
                }
            });
            message.channel.send({
                files: [{
                    attachment: path,
                    name: 'Database Snapshot ' + date.toString()
                }]
            })
                .then(msg => {
                    console.log(msg);
                    let attachments = [];
                    msg.attachments.forEach((a) => {
                        attachments.push(a.name + " " + a.url)
                    })
                    logs.logAction('Sent Message', {
                        attachments: attachments.toString(),
                        guild: msg.guild
                    })
                    _deleteFile(path);
                })
                .catch(e => {
                    _deleteFile(path);
                    logs.error(e);
                });
        }
    });

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

/**
 * Deletes a file at a specified path
 * @param {string} path
 * @private
 */
function _deleteFile(path) {
    fs.unlink(path,(error) => {
        if (error) {
            logs.error(error);
        }
    });
}

exports.help = {
    description: 'super powerful command',
    usage: `${config.discord.prefix}eval (Newo only)`
};
