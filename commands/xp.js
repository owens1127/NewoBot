const Discord = require('discord.js');
const Connection = require('mysql/lib/Connection');
const config = require('../config.json');
const logs = require('../functions/logging');
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
    let target;
    if (message.mentions.members.first()) {
        target = message.mentions.members.first().user;
    } else {
        target = message.author;
    }

    database.query(`SELECT *
               FROM ${table}
               WHERE id = '${target.id}'`, (err, rows) => {
        if (err) {
            throw err;
        }
        console.log(`Loading XP data for ${table} WHERE id = \'${target.id}\'`)

        if (target.bot || !rows[0]) {
            return message.channel.send(target.username + ' has not earned any XP')
                .then(msg => {
                    console.log(`Sent message: ${msg.content}`);
                    logs.logAction('Sent Message', {
                        message: msg.content,
                        channel: msg.channel,
                        server: msg.guild
                    });
                })
                .catch(console.error);
        }

        const xp = rows[0].xp;
        const lvlObj = require(`../modules/handleXP`).getLevelObject(xp);
        const lvl = lvlObj.level;
        const progress = lvlObj.progress;
        const xpToNextLvl = 5 * Math.pow((lvl), 2) + 50 * (lvl) + 100;

        var progString = '';
        var i;
        for (i = 0; i < Math.floor(progress / xpToNextLvl * 10); i++) {
            progString = progString + '🔵';
        }
        for (var j = i; j < 10; j++) {
            progString = progString + '⚫';
        }

        const embed = new Discord.MessageEmbed({
            title: `XP for ${target.username}`,
            fields: [
                {
                    name: 'XP',
                    value: xp.toString()
                },
                {
                    name: 'Level',
                    value: lvl.toString()
                },
                {
                    name: 'XP to Next Level',
                    value: `${progress} / ${xpToNextLvl}\n${progString}`
                }
            ]
        });
        embed.setThumbnail(target.avatarURL({format: 'png', size: 256}));
        util.newoSignature(embed);

        message.channel.send({embeds: [embed]})
            .then(() => {
                console.log(`Sent message: XP embed`);
                logs.logAction('Sent XP Embed', {
                    user: message.author,
                    server: message.guild
                });
            })
            .catch(console.error);
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
    description: 'XP tracker',
    usage: `${config.discord.prefix}xp (user)`
};
