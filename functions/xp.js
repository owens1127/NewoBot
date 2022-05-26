const config = require('../config.json');
const Discord = require('discord.js');
const logs = require('./logging');

/**
 * Sends a leaderboard in discord
 * @param {'DAILY' | 'WEEKLY' | 'MONTHLY' | 'ALL TIME'} style the type of leaderboard
 * @param {Discord.MessageEmbed} embed
 * @param channel
 * @param data
 * @returns {{id: string, monthly: number, weekly: number, daily: number}} the person with the
 *     highest xp
 */
exports.sendLeaderboard = (style, embed, channel, data) => {
    console.log(`Generating a ${style} leaderboard embed in server ${channel.guild.name}`);

    let category = style.toLowerCase();
    if (category === 'ALL TIME') {
        category = 'xp'
    }
    let sorted = data.sort((a, b) => (a[category] > b[category] ? -1 : 1))
        .filter(obj => (obj[category] !== 0));
    const membersCache = channel.guild.members.cache;

    for (var i = 0; i < sorted.length && i < 10; i++) {
        if (membersCache.get(sorted[i].id) !== undefined) {
            let user = membersCache.get(sorted[i].id).user;
            embed.addField(`${i + 1}. ${user.username}`, `**XP:** ${sorted[i][category]}`, false);
        }
    }

    channel.send({embeds: [embed]})
        .then(() => {
            console.log(`Sent a `${style}`Leaderboard Embed to server ' + channel.guild.name`);
            logs.logAction('Sent a Leaderboard Embed', {
                kind: style,
                server: channel.guild
            });
        })
        .catch(console.error);

    return sorted[0];
}