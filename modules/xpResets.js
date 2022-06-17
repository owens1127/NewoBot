const Discord = require('discord.js');
const logs = require('../functions/logging');
const util = require('../functions/util');

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
                        WHERE 1`, (err) => {
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

    let endDate = util.months[date.getMonth()] + ' ' + date.getDate();
    let startDate = util.months[date2.getMonth()] + ' ' + date2.getDate();

    const guilds = client.guilds.cache;
    guilds.forEach(g => {
        const embed = new Discord.MessageEmbed({
            color: `0x2F69EC`,
            title: `${startDate} - ${endDate} XP Leaderboards`
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
            util.sendLeaderboard('WEEKLY', embed, channel, data);
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
    const month = util.months[date.getMonth()];

    client.guilds.cache.forEach(g => {
        const embed = new Discord.Embed({
            color: `0x2F69EC`,
            title: `Final ${month} XP Totals`
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
            let winner = util.sendLeaderboard('MONTHLY', embed, channel, data);
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
