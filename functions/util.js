const config = require('../config.json');
const Discord = require('discord.js')
const logs = require('./logging');
const xpFunctions = require('../modules/handleXP');

/**
 * Determines if a guild is one of Newo's special guild's with user roles
 * @param {Discord.Guild} guild The guild to evaluate
 * @returns true if the guild is special, false if not
 */
exports.isPremiumGuild = (guild) => {
    let foo = false;
    config.discord.guilds.forEach(g => {
            if (g.id === guild.id) {
                foo = g.premium;
            }
        }
    );
    return foo;
}

/**
 * Determines in this client is streaming
 * @param {Discord.Client} client the client connection to discord
 * @returns {boolean} true if streaming, false if not
 */
exports.streaming = (client) => {
    let live = false;
    client.user.presence.activities.forEach(activity => {
        if (activity.type === 'STREAMING') {
            live = true;
        }
    })
    return live;
}

/**
 * Attaches the signature to the embed
 * @param {Discord.MessageEmbed} embed
 */
exports.newoSignature = (embed) => {
    embed.footer = {
        text: '© 2022 Newo',
        iconURL: config.discord.iconURL
    };
    embed.timestamp = Date.now();
    embed.color = `0x2F69EC`;

}

/**
 * Finds the correct channel for the bot to put messages in
 * @param {Discord.Guild} guild the guild to resolve the output channel for
 * @returns {Discord.TextChannel | null} the resolved text channel or null if no channel
 */
exports.getOutputChannel = (guild) => {
    let out;
    config.discord.guilds.forEach(serverConfig => {
            if (serverConfig.id === guild.id) {
                if (serverConfig.genChannel !== null) {
                    guild.channels.cache.forEach(channel => {
                        if (channel.id === serverConfig.genChannel) {
                            out = channel;
                        }
                    });
                }
            }
        }
    );
    return out || null;
}
/**
 * Sends a leaderboard in discord
 * @param {'DAILY' | 'WEEKLY' | 'MONTHLY' | 'ALL TIME'} style the type of leaderboard
 * @param {Discord.MessageEmbed} embed the embed being created
 * @param {Discord.TextChannel} channel the channel to send the message in
 * @param {[{id: string, monthly: number, weekly: number, daily: number}]} data the data from
 * the database
 * @returns {{id: string, monthly: number, weekly: number, daily: number}} the person with the
 *     highest xp
 */
exports.sendLeaderboard = (style, embed, channel, data) => {
    console.log(`Generating a ${style} leaderboard embed in server ${channel.guild.name}...`);

    let category = style.toLowerCase();
    if (category === 'all time') {
        category = 'xp'
    }
    let sorted = data.sort((a, b) => (a[category] > b[category] ? -1 : 1))
        .filter(obj => (obj[category] !== 0));

    channel.guild.members.fetch().then(membersCache => {
        for (var i = 0; i < sorted.length && i < 10; i++) {
            if (membersCache.get(sorted[i].id) !== undefined) {
                let member = membersCache.get(sorted[i].id);
                embed.addField(`[${i + 1}]`,
                    member.toString()
                    + '\n\u200b' + `XP: ${sorted[i][category]}`
                    + '\n\u200b' + `Level: ${xpFunctions.getLevelObject(
                        sorted[i][category]).level}`,
                    true);
            } else {
                embed.addField(`[${i + 1}]`,
                    `<@${sorted[i].id}>` + '\n\u200b' + `XP: ${sorted[i][category]}`,
                    true);
            }
        }
        channel.send({embeds: [embed]})
            .then(() => {
                console.log(`Sent a ${style} Leaderboard Embed to server ${channel.guild.name}`);
                logs.logAction('Sent a Leaderboard Embed', {
                    kind: style,
                    server: channel.guild
                });
            })
            .catch(logs.error);
    })
        .catch(logs.error);
    return sorted[0];

}

/**
 * DMs a user a message and handles failures
 * @param {Discord.Message} message the message the bot is responding to
 * @param {Discord.MessageOptions} msgOptions the content of the message
 */
exports.dmUser = (message, msgOptions) => {
    message.author.send(msgOptions)
        .then(msg => console.log(
            `Private Messaged ${message.author.tag} ${msg.content}`))
        .catch(() => {
            console.log(`Failed to Private Message ${message.author.tag}`);
            console.log(`Attempting to Reply instead...`);
            message.channel.sendTyping();
            message.channel.send(msgOptions)
                .then(msg => {
                    console.log(`Sent Message: ` + msg.embeds);
                    logs.logAction('Sent Embed', {
                        channel: msg.channel.name,
                        embed: '!help embed'
                    });
                })
                .catch(logs.error);
        });
}

exports.months = ['January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'];

exports.days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', ' Saturday'];