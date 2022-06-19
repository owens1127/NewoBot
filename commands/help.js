const Discord = require('discord.js');
const Connection = require('mysql/lib/Connection');
const config = require('../config.json');
const fs = require('fs');
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

    if (args[0]) {
        // specified command
        let cmdNameLower = args[0].toLowerCase()
        if (args[0].indexOf(config.discord.prefix) === 0) {
            cmdNameLower = args[0].slice(1, args[0].length).toLowerCase();
        }

        if (fs.existsSync(`./commands/${cmdNameLower}.js`)) {
            const command = require(`./${cmdNameLower}.js`);

            const embed = new Discord.MessageEmbed({
                title: `Help for command !${cmdNameLower}`,
                fields: [
                    {
                        name: 'Description',
                        value: command.help.description
                    },
                    {
                        name: 'Usage',
                        value: command.help.usage
                    }
                ]
            });
            util.newoSignature(embed);

            const msgOptions = {
                embeds: [embed]
            }
            dmUser(message, msgOptions)

        } else {
            message.channel.send(`\`${cmdNameLower}\` is not a valid command`)
                .then(msg => {
                    console.log(`Sent message: ${message.content}`);
                    logs.logAction('Sent Message', msg);
                })
                .catch(console.error);
        }

    } else {
        // all commands
        fs.readdir('./commands', (err, files) => {
            let cmdArray = files.filter(f => f.split('.').pop() === 'js').sort()
                .map(function (cmd) {
                    return cmd.slice(0, cmd.length - 3)
                }).map(x => [x]);

            const embeds = [];

            for (var i = 0; i < Math.floor(cmdArray.length / 25) + 1; i++) {
                embeds.push(new Discord.MessageEmbed({
                    title: `Newo Bot Commands - Page ${i + 1}/${Math.floor(cmdArray.length / 25)
                    + 1}`
                }));
                for (var j = 25 * i; (j < 25 * (i + 1)) && (j < cmdArray.length); j++) {
                    embeds[i].addField(
                        `**${cmdArray[j][0]}**`,
                        '*Description:* ' + `${require(
                            `./${cmdArray[j][0]}.js`).help.description}\n`
                        + '*Usage:* ' + `${require(`./${cmdArray[j][0]}.js`).help.usage}`);
                }
                util.newoSignature(embeds[i]);
            }
            console.log(`Help embeds created`);
            dmUser(message, {embeds: embeds});
        });
    }

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
    client.say(channel, `@${userstate.username}, that command is not yet supported on Twitch`)
        .then(message => console.log(`Sent Twitch chat message: ${message}`))
        .catch(console.error);
};

/**
 * DMs a user a message and handles failures
 * @param {Discord.Message} message the message the bot is responding to
 * @param {Discord.MessageOptions} msgOptions the content of the message
 */
function dmUser(message, msgOptions) {
    message.author.send(msgOptions)
        .then(() => console.log(
            `Private Messaged ${message.author.tag} response to !help`))
        .catch(() => {
            console.log(`Failed to Private Message ${message.author.tag}`);
            console.log(`Attempting to Reply instead...`);
            message.channel.send(msgOptions)
                .then(msg => {
                    console.log(`Sent Message: ` + msg.embeds);
                    logs.logAction('Sent Embed', {
                        channel: msg.channel.name,
                        embed: '!help embed'
                    });
                })
                .catch(console.error);
        });
}

exports.help = {
    description: 'This command.',
    usage: `${config.discord.prefix}help (command)`
};
