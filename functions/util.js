const config = require('../config.json');
const Discord = require('discord.js')

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
