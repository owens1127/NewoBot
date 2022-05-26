const Discord = require('discord.js');
const config = require('../config.json');
const logs = require('../functions/logging');
const xp_function = require('../functions/xp')
const util = require('../functions/util');
const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', ' Saturday'];
const months = ['January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'];

/**
 * Resets the daily xp for everyone
 * @param {Discord.Client} client the connection to discord
 * @param {Connection} database the connection to the database
 */
exports.daily = (client, database) => {
    console.log(`Resetting DAILY XP totals...`)
    client.guilds.cache.forEach(g => {
        const table = `xp_${g.id}`;
        database.query(`UPDATE ${table}
                        SET daily = 0
                        WHERE 1`, () => {
            if (err) {
                console.error(err);
            }
            logs.logAction('Reset XP', {
                leaderboard: 'daily'
            });
            console.log('Reset Daily leaderboards');

        });
    });
};

/**
 * Resets the weekly xp for everyone
 * @param {Discord.Client} client the connection to discord
 * @param {Connection} database the connection to the database
 */
exports.weekly = (client, database) => {
    console.log(`Resetting WEEKLY XP totals...`)

    const date = new Date();
    const date2 = new Date();

    date.setTime(date.getTime() - 24 * 60 * 60 * 1000);
    date2.setTime(date.getTime() - 6 * 24 * 60 * 60 * 1000);

    let endDate = months[date.getMonth()] + ' ' + date.getDate();
    let startDate = months[date2.getMonth()] + ' ' + date2.getDate();

    const guilds = client.guilds.cache;
    guilds.forEach(g => {
        const embed = new Discord.MessageEmbed({
            color: `0x2F69EC`,
            title: `Final Weekly XP Totals for the week of ${startDate} - ${endDate}`
        });

        util.newoSignature(embed);

        const channel = util.getOutputChannel(g);
        const table = `xp_${g.id}`;

        database.query(`SELECT *
                        FROM ${table}
                        WHERE 1`, (err, data) => {
            if (err) {
                console.error(err);
            }
            xp_function.sendLeaderboard('weekly', embed, channel, data);
        });

        database.query(`UPDATE ${table}
                        SET weekly = 0
                        WHERE 1`, (err) => {
            if (err) {
                console.error(err);
            } else {
                logs.logAction('Reset XP', {
                    leaderboard: 'weekly'
                });
                console.log('Reset Weekly leaderboards');
            }
        });
    });
};

/**
 * Resets the monthly xp for everyone
 * @param {Discord.Client} client the connection to discord
 * @param {Connection} database the connection to the database
 */
exports.monthly = (client, database) => {
    console.log(`Resetting MONTHLY XP totals...`);

    const date = new Date();
    date.setTime(date.getTime() - 24 * 60 * 60 * 1000);
    const month = months[date.getMonth()];

    client.guilds.cache.forEach(g => {
        const embed = new Discord.Embed({
            color: `0x2F69EC`,
            title: `Final Monthly XP Totals for the month of ${month}`
        });

        util.newoSignature(embed);

        const channel = util.getOutputChannel(g);
        const table = `xp_${g.id}`;

        database.query(`SELECT *
                        FROM ${table}
                        WHERE 1`, (err, data) => {
            if (err) {
                console.error(err);
            }
            let winner = xp_function.sendLeaderboard('monthly', embed, channel, data);
            channel.send(`Congratulations, ${channel.guild.members.cache.get(winner.id)},
            you topped the leaderboard this month with ${winner.monthly} xp!`)
                .then(msg => {
                    logs.logAction('Sent message', {
                        content: msg.content,
                        guild: msg.guild
                    });
                    console.log('Send message ' + msg);
                })
                .catch(console.error);
        });

        database.query(`UPDATE ${table}
                        SET monthly = 0
                        WHERE 1`, (err) => {
            if (err) {
                console.error(err);
            } else {
                logs.logAction('Reset XP', {
                    leaderboard: 'Monthly'
                });
                console.log('Reset Monthly leaderboards');
            }
        });
    });
};
