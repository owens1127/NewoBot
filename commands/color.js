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
exports.discord = (client, message, args, database) => {

    if (util.isPremiumGuild(message.guild)) {
        return message.channel.send(
            'This command is only available in select servers')
            .then(msg => {
                logs.logAction('Sent Message', {
                    content: msg.content, guild: msg.guild
                })
                console.log(`Sent message: ${msg.content}`)
            })
            .catch(console.error);
    }

    if (!args[0]) {
        return message.channel.send(
            'Please select a color here: <https://htmlcolorcodes.com/color-picker/>. Then, you may type \`!color #URCODE\`')
            .then(msg => {
                logs.logAction('Sent Message', {
                    content: msg.content, guild: msg.guild
                })
                console.log(`Sent message: ${message.content}`)
            })
            .catch(console.error);
    }

    const member = message.member;
    console.log('Editing color for ' + member.id + '...');

    if (args[0].toLowerCase() === 'random') {
        changeColor(Math.floor(Math.random() * 16777215).toString(16), member);
    } else if (args[0].toLowerCase() === 'def' || args[0].toLowerCase() === 'default') {
        changeColor('000000', member);
    } else {
        try {
            changeColor(args[0].toUpperCase(), member);
        } catch (err) {
            message.channel.send(
                'The code you entered did not match the correct format. You can select a color here: <https://htmlcolorcodes.com/color-picker/>')
                .then(msg => {
                    logs.logAction('Sent Message', {
                        content: msg.content, guild: msg.guild
                    })
                    console.log(`Sent message: ${message.content}`)
                })
                .catch(console.error);
        }
    }

    /**
     * Changes the color of a user
     * @param {Discord.ColorResolvable | String} color the color to set the color to
     * @param {Discord.GuildMember} member the member to assign the color to
     * @throws {TypeError} if the color cannot be resolved
     */
    function changeColor(color, member) {
        require('../modules/roleColor').change(member,
            DiscordUtil.resolveColor(color));

    }
}

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
    description: 'Get a custom role color in discord',
    usage: `${config.discord.prefix}color <#HEXCODE | default | random>`
};
