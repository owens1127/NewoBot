const config = require('../config.json');
const Discord = require('discord.js')
const logs = require('./logging');

/**
 * Determines if a guild is one of Newo's special guild's with user roles
 * @param {Discord.Guild} guild The guild to evaluate
 * @returns true if the guild is special, false if not
 */
exports.isPremiumGuild = (guild) => {
    config.discord.guilds.forEach(g => {
            if (g.id === guild.id) {
                return g.premium;
            }
        }
    );
    return false;
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
 * @returns {Discord.TextChannel} the resolved text channel
 */
exports.getOutputChannel = (guild) => {
    let found = null;
    config.discord.guilds.forEach(serverConfig => {
            if (serverConfig.id === guild.id) {
                guild.channels.cache.forEach(channel => {
                    if (channel.id === serverConfig.genChannel) {
                        found = channel;
                    }
                });
            }
        }
    );
    return found;
}
/**
 * Sends a leaderboard in discord
 * @param {'DAILY' | 'WEEKLY' | 'MONTHLY' | 'ALL TIME'} style the type of leaderboard
 * @param {Discord.MessageEmbed} embed
 * @param channel
 * @param data
 * @returns {{id: string, monthly: number, weekly: number, daily: number}} the person with the
 *     highest xp
 */
exports.sendLeaderboard = async (style, embed, channel, data) => {
    console.log(`Generating a ${style} leaderboard embed in server ${channel.guild.name}`);

    let category = style.toLowerCase();
    if (category === 'all time') {
        category = 'xp'
    }
    let sorted = data.sort((a, b) => (a[category] > b[category] ? -1 : 1))
        .filter(obj => (obj[category] !== 0));

    await channel.guild.members.fetch().then(membersCache => {
        for (var i = 0; i < sorted.length && i < 10; i++) {
            if (membersCache.get(sorted[i].id) !== undefined) {
                let user = membersCache.get(sorted[i].id).user;
                embed.addField(`${i + 1}. ${user}`, `XP: ${sorted[i][category]}`,
                    false);
            } else {
                embed.addField(`${i + 1}. ${sorted[i].id}`, `XP: ${sorted[i][category]}`,
                    false);
            }
        }
    })
        .catch(console.error);

    channel.send({embeds: [embed]})
        .then(() => {
            console.log(`Sent a ${style} Leaderboard Embed to server ${channel.guild.name}`);
            logs.logAction('Sent a Leaderboard Embed', {
                kind: style,
                server: channel.guild
            });
        })
        .catch(console.error);

    return sorted[0];
}

exports.months = ['January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'];

exports.days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', ' Saturday'];
