const Discord = require('discord.js');
const Connection = require('mysql/lib/Connection');
const config = require('../config.json');
const fs = require('fs');
const logs = require('../functions/logging');

/**
 * Runs a discord command
 * @param {Discord.Client} client the discord connection
 * @param {Discord.Message} message the message the user sent
 * @param {Connection.prototype} database the database connection
 */
exports.discord = (client, message, database) => {

    const args = getArgs(message.content);
    const command = getCommand(args);

    const path = `./commands/${command}.js`;

    if (fs.existsSync(path)) {
        console.log(
            `Attempting to process \'${command}\' sent by user \'${message.author.tag}\' in \'${(!message.guild)
                ? 'Direct Messages' : `discord/${message.guild.name}`}\'...`)
        try {
            let cmdFile = require(`../commands/${command}.js`);
            console.log(`Running command \'${command}\'.`);
            try {
                cmdFile.discord(client, message, args, database);
                message.react(config.discord.reactEmoji).catch(err => {
                    console.log(
                        `Failed to react to command '${config.discord.prefix}${command}' with error: ${err.message}`);
                });
                logs.logAction('Processed Command', {
                    command: command,
                    args: '[' + args.join() + ']',
                    type: 'Discord'
                });
                console.log(`Processed Command \'${command}\' sent in ${message.guild.name} by user ${message.author.tag}`);
            } catch (error) {
                console.log(`Error processing Discord command \'${command}\'.`);
                logs.error(error);
            }
        } catch (error) {
            logs.error(error);
        }
    }
};

/**
 * Runs a Twitch command
 * @param {twitch.client} client the connection to twitch
 * @param {twitch.channel} channel the channel where the command was written
 * @param {twitch.userstate} userstate the user initiating the command
 * @param {twitch.message} message the message attached to the command
 * @param {Connection.prototype} database the connection to the database
 */
exports.twitch = (client, channel, userstate, message, database) => {
    const args = getArgs(message);
    const command = getCommand(args);

    const path = `../commands/${command}.js`;

    if (fs.existsSync(path)) {
        console.log(
            `Attempting to process \'${command}\' sent by user \'${userstate.username}\' in \'twitch/${channel}\'...`);
        try {
            let cmdFile = require(`../commands/${command}.js`);
            console.log(`Running command \'${command}\'.`);
            try {
                cmdFile.twitch(client, channel, userstate, message, database);
                logs.logAction('Processed Command', {
                    command: command,
                    args: '(' + args.join(', ') + ')',
                    type: 'Twitch'
                })
            } catch (error) {
                console.log(`Could not process Discord command \'${command}\'.`);
                logs.logAction('Failed to Process Command', {
                    command: command,
                    args: '(' + args.join() + ')',
                    type: 'Twitch'
                })
                console.log(error);
            }
        } catch (error) {
            logs.error(error);
        }
    }
};

/**
 * Returns the arguments in a command message split by spaces
 * @param content the content of the message
 * @returns {string[]} the arguments split
 */
function getArgs(content) {
    return content.slice(config.discord.prefix.length).trim().split(/ +/g);
}

/**
 * Returns the command at the start of a message
 * @param args all the arguments of a message
 * @returns {string} the command word
 */
function getCommand(args) {
    return args.shift().toLowerCase();
}
