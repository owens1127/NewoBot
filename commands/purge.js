const config = require('../config.json');
const Discord = require('discord.js');
const Connection = require('mysql/lib/Connection');
const util = require('../functions/util');
const logs = require('../functions/logging');
const DiscordUtil = require('discord.js/src/util/Util')

/**
 * Handles a Discord command
 * @param {Discord.Client} client connection to discord
 * @param {Discord.Message} message the message the command is processed from
 * @param {String[]} args the arguments of the command
 * @param {Connection.prototype} database the connection to the database
 */
exports.discord = async (client, message, args, database) => {

    if (!message.member.permissions.has(Discord.Permissions.FLAGS.MANAGE_MESSAGES)) {
        return message.channel.send(
            'This command requires the MANAGE_MESSAGES permission')
            .then(msg => {
                logs.logAction('Sent Message', {
                    content: msg.content, guild: msg.guild
                })
                console.log(`Sent message: ${message.content}`)
            })
            .catch(logs.error);
    }

    const deleteCount = parseInt(args[0], 10) + 1;

    if (!deleteCount || deleteCount < 2 || deleteCount > 100) {
        return message.reply(
            'Please provide a number between 1 and 99 for the number of messages to delete')
            .then(msg => {
                logs.logAction('Sent Message', {
                    content: msg.content, guild: msg.guild
                })
                console.log(`Sent message: ${message.content}`)
            })
            .catch(logs.error);
    }

    const fetched = await message.channel.messages.fetch({limit: deleteCount});
    console.log(`Fetched ${fetched.size} messages in ${message.channel.name}`);
    message.channel.bulkDelete(fetched)
        .then(msgs => {
            console.log(`Deleted ${msgs.size} messages in ${message.channel.name}`);
            util.dmUser(message,{
                content: `Deleted ${msgs.size - 1} messages in ${message.guild}`
            });
        })
        .catch(error => {
            console.log(`Couldn't delete ${fetched.size} messages because of: ${error}`);
            message.reply(`Couldn't delete ${fetched.size} messages because of: ${error}`)
                .then(() => console.log(
                    `Sent a reply to ${message.author.tag}: 'Couldn't delete all messages because of: ${error}'`))
                .catch(logs.error);
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
exports.twitch = (client, channel, userstate, args, database) => {
    client.say(channel, `@${userstate.username}, that is a discord only command.`)
        .then(message => console.log(`Sent Twitch chat message: ${message}`))
        .catch(logs.error);
};

exports.help = {
    description: 'Purge a lot of messages (Mod+).',
    usage: `${config.discord.prefix}purge <amount>`
};
