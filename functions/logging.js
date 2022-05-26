const Discord = require('discord.js');
const util = require('./util');
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
            embed.addField(field.toString(), data[field].toString());
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