const Discord = require('discord.js');
const Connection = require('mysql/lib/Connection');
const config = require('../config.json');
const util = require('../functions/util');

/**
 * Handles a Discord command
 * @param {Discord.Client} client connection to discord
 * @param {Discord.Message} message the message the command is processed from
 * @param {String[]} args the arguments of the command
 * @param {Connection.prototype} database the connection to the database
 */
exports.discord = (client, message, args, database) => {
    const table = `xp_${message.guild.id}`;

    console.log('Creating a leaderboard for ' + table);

    database.query(`SELECT *
                    FROM ${table}`, (err, data) => {
        if (err) {
            throw err;
        }

        const embed = new Discord.MessageEmbed();
        util.newoSignature(embed);

        if ((args[0]) && (args[0].toUpperCase() === 'DAILY')) {
            embed.setTitle(`${message.guild.name} Daily XP Rankings`);
            util.sendLeaderboard('DAILY', embed, message.channel, data);
        } else if ((args[0]) && (args[0].toUpperCase() === 'WEEKLY')) {
            embed.setTitle(`${message.guild.name} Weekly XP Rankings`);
            util.sendLeaderboard('WEEKLY', embed, message.channel, data);

        } else if ((args[0]) && args[0].toUpperCase() === 'MONTHLY') {
            const date = new Date();
            date.setTime(date.getTime() + config.global.timeHrOffset * 3600000);
            embed.setTitle(`${message.guild.name} ${util.months[date.getMonth()]} XP Rankings`);
            util.sendLeaderboard('MONTHLY', embed, message.channel, data);
        } else {
            embed.setTitle(`${message.guild.name} Lifetime XP Rankings`);
            util.sendLeaderboard('ALL TIME', embed, message.channel, data);
        }

    });

};

/**
 * Handles a Twitch command
 * @param {Discord.Client} client connection to discord
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
    description: 'Leaderboard command, leaving the 1st option blank will display the all time leaderboard',
    usage: `${config.discord.prefix}lb {daily | weekly | monthly}`
};
