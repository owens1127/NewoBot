const Discord = require('discord.js');
const config = require('../config.json');
const logs = require('../functions/logging');
const util = require('../functions/util');

/**
 * Handles DMs sent to NewoBot
 * @param {Discord.Client} client the connection to discord
 * @param message the message sent
 */
exports.run = (client, message) => {

    const data = {
        author: message.author
    }
    const embed = new Discord.MessageEmbed({
       title: `DM from ${message.author.tag}`
    });
    util.newoSignature(embed);

    if (message.content.length > 0) {
        data.content = message.content;
        embed.addField(`Message Content`, message.content);
    }

    const msgData = {
        embeds: [embed]
    };

    let files = [];
    message.attachments.forEach(attachment => {
        files.push(attachment.attachment);
    })

    console.log(`DM and ${files.length} attachments received from ${message.author.tag}: '${message.content}'`);

    if (message.attachments.size !== 0) {
        let str;
        message.attachments.forEach(a => {
            str += a.name + ', ';
        })
        str = str.substring(0, str.length - 2);
        embed.addField('Attachments', str);
        msgData.files = files;
        data.files = str;
    }

    client.users.cache.get(config.discord.ownerID).send(msgData)
        .then(() => console.log('Forwarded Newo the DM from ' + message.author.tag))
        .catch(logs.error);

    logs.logAction('DM received', data);
};
