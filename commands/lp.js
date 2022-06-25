const config = require('../config.json');
const Discord = require('discord.js');
const Connection = require('mysql/lib/Connection');
const Twitch = require('tmi.js');
const mysql = require('mysql');
const logs = require('../functions/logging');
const Destiny = require('../destiny-api/destiny-api');
const env = require('../local/vars.json');
const {destinyMembershipType} = require('node-destiny-2/lib/destiny-types');

/**
 * Handles a Discord command
 * @param {Discord.Client} client connection to discord
 * @param {Discord.Message} message the message the command is processed from
 * @param {String[]} args the arguments of the command
 * @param {Connection.prototype} database the connection to the database
 */
exports.discord = (client, message, args, database) => {
    const destiny = new Destiny({
        key: env.BUNGIE_API_KEY,
        oauthConfig: {
            id: env.BUNGIE_CLIENT_ID,
            secret: env.BUNGIE_SECRET
        }
    });

    if (args.length < 1) {
        return;
    }

    // get the id for a profile
    destiny.searchDestinyPlayerByBungieName(destinyMembershipType.All, args[0])
        .then((res) => {
            // if no user found
            if (!res.Response) {
                return message.channel.send(args[0] + ' does not exist.')
                    .then(msg => {
                        logs.logAction('Sent Message', {
                            content: msg.content, guild: msg.guild
                        })
                        console.log(`Sent message: ${msg.content}`)
                    })
                    .catch(console.error);
            }
            const id = res.Response[0].membershipId;
            // get the profile
            destiny.getProfile(destinyMembershipType.Steam, id, [100])
                .then(r => {
                    // send embed
                    const embed = new Discord.MessageEmbed();
                    embed.setTitle(
                        r.Response.profile.data.userInfo.displayName + ' Last Played Destiny 2');
                    embed.setTimestamp(new Date(r.Response.profile.data.dateLastPlayed));
                    // send message
                    message.channel.send({embeds: [embed]}).then(msg => {
                        logs.logAction('Sent Message', {
                            content: "Last Played Destiny 2 embed", guild: msg.guild
                        })
                        console.log(`Sent message: Last Played Destiny 2 embed`)
                    })
                        .catch(console.error);
                })
                .catch(console.error);
        })
        .catch(console.error);

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
};

exports.help = {
    description: 'test',
    usage: `${config.discord.prefix}test (Newo only)`
};
