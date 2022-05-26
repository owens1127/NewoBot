const Discord = require('discord.js');
const morning_messages = require('../resources/morningMessages.json');
const logs = require('../functions/logging');
const config = require('../config.json');
const util = require('../functions/util');

/**
 * Sends good morning messages!
 * @param {Discord.Client} client the connection to discord
 */
exports.run = (client) => {
    console.log(`Sending good morning messages!`);

    client.guilds.cache.forEach(g => {
        let channel = util.getOutputChannel(g);
        if (channel === null) {
            return console.log(
                'Could not send good morning message to ' + g.name + ' because the channel'
                + 'was null');
        }

        const greeting = morning_messages.goodMorningGreetings[Math.floor(
            Math.random() * morning_messages.goodMorningGreetings.length)];
        const memo = morning_messages.goodMorningMemos[Math.floor(
            Math.random() * morning_messages.goodMorningMemos.length)];

        channel.send(greeting)
            .then(msg => {
                logs.logAction('Sent a Good Morning Greeting', {
                    greeting: greeting,
                    server: msg.guild
                });
                console.log('Good Morning greeting sent to ' + g.name);
            })
            .catch(() => console.log('Failed to send Good Morning greeting to ' + g.name));

        channel.send(memo)
            .then(msg => {
                logs.logAction('Sent a Good Morning Memo', {
                    memo: memo,
                    server: msg.guild
                });
                console.log('Good Morning memos sent to ' + g.name);
            })
            .catch(() => console.log('Failed to send Good Morning memos to ' + g.name));
    })

};
