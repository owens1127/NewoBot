const Discord = require('discord.js');
const util = require('./util');
const logs = require('./logging');
const config = require('../config.json');
/*
* This channel is assigned a value when the bot runs
*/
let channel;

/**
 * Stores the channel for logging
 * @param {Discord.TextChannel} chan the channel used for logging
 */
exports.channel = (chan) => {
    channel = chan;
}

/**
 * Logs an action in the logs channel in Newo's Test Server
 * @param {String} action A description of the action being logged
 * @param {Object} data Any relevant information relating to the action
 */
exports.logAction = (action, data) => {

    const embed = new Discord.MessageEmbed();
    embed.setTitle(action);
    util.newoSignature(embed);

    const fields = Object.keys(data);
    try {
        fields.forEach((field) => {
            embed.addField(field.toString(), data[field].toString().substring(0, 1024));
        });
    } catch (err) {
        console.error(err);
    }

    try {
        channel.send({embeds: [embed]});
    } catch (error) {
        console.log('Error sending log ' + action + data);
    }

}

/**
 * Logs an error in the logs channel in Newo's Test Server
 * @param {Error} err the error emitted
 */
exports.error = (err) => {
    console.error(err);

    const embed = new Discord.MessageEmbed();
    util.newoSignature(embed);
    embed.setTitle('App Error');
    embed.setColor('#ff4747');

    if (err.name) {
        embed.addField('error', err.name);
    }
    if (err.message) {
        embed.addField('message', err.message.substring(0, 1000));
    }
    if (err.stack) {
        embed.addField('stack', err.stack.substring(0, 1000));
    }

    channel.send({
        content: `\<@${config.discord.ownerID}\>`,
        embeds: [embed]
    });

    setTimeout(() => {
        process.exit(1);
    }, 2000);
}