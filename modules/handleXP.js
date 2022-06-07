const Discord = require('discord.js');
const config = require('../config.json');
const logs = require('../functions/logging');
const util = require('../functions/util');

/**
 * Evaluates XP earned per message
 * @param {Discord.Client} client the connection to discord
 * @param {Discord.Message} message the message sent
 * @param {Connection} database the connection to the database
 */
exports.text = (client, message, database) => {

    const newTime = new Date().getTime();
    const table = `xp_${message.guild.id}`;

    database.query(`SELECT *
                    FROM ${table}
                    WHERE id = '${message.author.id}'`, (err, rows) => {
        if (err) {
            console.error(err);
        }
        if (rows[0] == undefined || rows[0] == null) {
            return require('./handleXP.js').new(message.member, database);
        }

        let genXp = generateXp(15, 25);

        let oldTime = rows[0].lastMessage;
        let diff = (newTime - oldTime);

        // If cool down over
        if (diff >= config.discord.xpCoolDownMs) {
            // update params
            let newData = {
                xp: rows[0].xp + genXp,
                daily: rows[0].daily + genXp,
                weekly: rows[0].weekly + genXp,
                monthly: rows[0].monthly + genXp,
                lastMessage: newTime
            };

            // check if level update
            const newLvl = require(`./handleXP.js`).getLevelObject(newData.xp).level;
            if (newLvl > require(`./handleXP.js`).getLevelObject(rows[0].xp).level) {
                sendLevelUpMsg(message.author, message.channel, newLvl);
            }

            let sql = `UPDATE ${table}
                       SET xp          = ${newData.xp},
                           daily       = ${newData.daily},
                           weekly      = ${newData.weekly},
                           monthly     = ${newData.monthly},
                           lastMessage = ${newData.lastMessage}
                       WHERE id = '${message.author.id}'`;

            database.query(sql, (err) => {
                if (err) {
                    throw err;
                }
                logs.logAction('Updated XP for User', {
                    source: 'Text XP',
                    user: message.author,
                    server: message.guild.name,
                    xp_gained: genXp
                });
                console.log(`Updated XP database in ${message.guild.name}`);
                console.log(
                    `${message.author.tag} earned ${genXp} in ${message.guild.name} by typing`);
            });

        }

    });
};

/**
 * Evaluates XP earned per minute in a voice channel. XP is not earned while deafened
 * or in the designated AFK channel
 * @param {Discord.Client} client the connection to discord
 * @param {Discord.VoiceState} oldVoiceState the old voice state of the suer
 * @param {Discord.VoiceState} newVoiceState the new voice state of the user
 * @param {Connection} database the connection to the database
 */
exports.voice = (client, oldVoiceState, newVoiceState, database) => {
    const guild = oldVoiceState.guild;
    const table = `xp_${guild.id}`;

    const oldState = {
        channelID: (oldVoiceState.channel !== null) ? oldVoiceState.channel.id : 'null',
        wasDeafened: oldVoiceState.deaf,
        wasInAFK: (oldVoiceState.channel !== null && guild.afkChannel !== null)
            ? (oldVoiceState.channel.id === guild.afkChannel.id) : false
    }

    const newState = {
        channelID: (newVoiceState.channel !== null) ? newVoiceState.channel.id : 'null',
        isDeafened: newVoiceState.deaf,
        inAFK: (newVoiceState.channel !== null && guild.afkChannel !== null)
            ? (newVoiceState.channel.id === guild.afkChannel.id) : false
    }

    let state = getVoiceXPState(oldState, newState);

    if (state == 0) {
        return;
    } else if (state === 1) {

        console.log(
            `Logging start time for voice channel XP for ${oldVoiceState.member.user.tag}...`);

        const time = Math.floor(new Date().getTime());
        database.query(`UPDATE ${table}
                        SET voiceStart = '${time}'
                        WHERE id = '${newVoiceState.member.id}'`, (err) => {
            if (err) {
                try {
                    console.log('New user detected in Voice');
                    require('./handleXP.js').new(oldVoiceState.member, database);
                } catch (err2) {
                    console.error(err);
                    console.error(err2);
                }
                return;
            }
            logs.logAction('User started earning XP', {
                user: newVoiceState.member,
                server: newVoiceState.guild.name,
                channel: newVoiceState.channel.name
            });
            console.log(`Updated XP database in ${newVoiceState.guild.name}`);
            console.log(`${newVoiceState.member.user.tag} starting earning XP`);
        });

    } else if (state === 2) {

        console.log(
            `UPDATING voice channel XP for ${newVoiceState.member.user.tag} in ${newVoiceState.guild.name}...`);
        database.query(`SELECT *
                        FROM ${table}
                        WHERE id = '${newVoiceState.member.id}'`, (err, data) => {
            if (err) {
                return console.error(err);
            }
            if (data[0] == undefined) {
                 try {
                    console.log('New user detected in Voice');
                    require('./handleXP.js').new(oldVoiceState.member, database);
                } catch (err2) {
                    console.error(err2);
                }
                return;
            }
            const time = Math.floor(new Date().getTime());
            const minutes = Math.floor((time - data[0].voiceStart) / 60000);

            let newXp = 0;
            for (var i = 0; i < minutes; i++) {
                newXp += generateXp(6, 10);
            }

            let newData = {
                xp: data[0].xp + newXp,
                daily: data[0].daily + newXp,
                weekly: data[0].weekly + newXp,
                monthly: data[0].monthly + newXp
            };

            const newLvl = require('./handleXP.js').getLevelObject(newData.xp).level;
            if (newLvl > require('./handleXP.js').getLevelObject(data[0].xp).level) {
                let channel = util.getOutputChannel(newVoiceState.guild);
                if (channel === null) {
                    console.log(`${newVoiceState.member.user} leveled up to level ${newLvl}`);
                } else {
                    sendLevelUpMsg(newVoiceState.member.user, channel, newLvl);
                }
            }

            console.log(
                `${oldVoiceState.member.user.tag} earned ${newXp} xp over ${minutes} minutes`);
            let sql = `UPDATE ${table}
                       SET xp      = ${newData.xp},
                           daily   = ${newData.daily},
                           weekly  = ${newData.weekly},
                           monthly = ${newData.monthly}
                       WHERE id = '${newVoiceState.member.id}'`;

            database.query(sql, (err) => {
                if (err) {
                    return console.error(err);
                }
                logs.logAction('Updated XP for user', {
                    source: 'Voice XP',
                    mins: minutes,
                    user: newVoiceState.member,
                    server: newVoiceState.guild.name,
                    xp_gained: newXp
                });
                console.log(`Updated XP database in ${newVoiceState.guild.name}`);
                console.log(
                    `${newVoiceState.member.user.tag} earned ${newXp} in ${newVoiceState.guild.name} in voice chat`);
            });
        });
    }
}

/**
 * Initializes a new member into the database
 * @param {Discord.GuildMember} member the user to enter
 * @param {Connection} database the database connection
 */
exports.new = (member, database) => {

    const table = `xp_${member.guild.id}`;

    database.query(`SELECT *
                    FROM ${table}
                    WHERE id = '${member.id}'`, (err, userArr) => {

        if (userArr.length < 1) {

            const newTime = new Date().getTime();
            let xp = generateXp(15, 25);

            let newData = {
                id: member.id,
                xp: xp,
                daily: xp,
                weekly: xp,
                monthly: xp,
                lastMessage: newTime,
                voiceStart: new Date().getTime()
            };

            const sql = `INSERT INTO ${table} (id, xp, daily, weekly, monthly, lastMessage, voiceStart)
                         VALUES (${newData.id}, ${newData.xp}, ${newData.daily},
                                 ${newData.weekly},
                                 ${newData.monthly}, ${newData.lastMessage},
                                 ${newData.voiceStart})`;

            database.query(sql, () => {
                if (err) {
                    throw err;
                }
                logs.logAction('User added to Database', {
                    user: member, server: member.guild.name
                });
                console.log(`User ${member.user.tag} added to Database`);
            });
        }
    });

};

/**
 * Calculates the level of the user
 * @param xp the current xp of the user
 * @returns {{level: number, progress: number}} the data about the level and progress towards
 *     the next
 */
exports.getLevelObject = (xp) => {
    var recurseXp = xp;
    var i = 0;
    while (recurseXp >= 0) {
        recurseXp -= (5 * Math.pow((i), 2) + 50 * (i) + 100);
        i++;
    }
    return {
        level: i - 1, progress: recurseXp + 5 * Math.pow((i - 1), 2) + 50 * (i - 1) + 100
    };
}

/**
 * Sends a level up message to a channel
 * @param {Discord.User} user the user leveling up
 * @param {Discord.TextChannel} channel the channel to send the message to
 * @param {number} level the new level of the user
 */
function sendLevelUpMsg(user, channel, level) {
    console.log(`${user} leveled up to level ${level}`);
    channel.send(`Level up, ${user.toString()}! You are now level ${level}!`)
        .then(msg => logs.logAction('Sent message', {
            content: msg.content, guild: msg.guild
        }))
        .catch(console.error);
}

/**
 * Generates an integer between min and max
 * @param min the min value to generate
 * @param max the max value to generate
 * @returns {number} the xp generate
 */
function generateXp(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 *
 * @param {{channelID: string, wasDeafened: boolean | null, wasInAFK: boolean}} oldState
 * @param {{channelID: string, isDeafened: boolean, inAFK: boolean}} newState
 * @returns {number} the outcome of the stateUpdate 0 if nothing, 1 if open, 2 if close
 */
function getVoiceXPState(oldState, newState) {

    let sameChannel = newState.channelID === oldState.channelID;
    let deafened;

    if (oldState.wasDeafened === null || oldState.wasDeafened === newState.isDeafened) {
        deafened = newState.isDeafened ? 'stayed deafened' : 'stayed listening';
    } else {
        deafened = newState.isDeafened ? 'deafened' : 'undeafened';
    }
    let toAfk;
    if (oldState.wasInAFK === newState.inAFK) {
        toAfk = oldState.wasInAFK ? 'still afk' : 'not afk'
    } else {
        toAfk = oldState.wasInAFK ? 'left afk' : 'joined afk'
    }

    if (toAfk === 'still afk') {
        // do nothing
        return 0;
    } else if (deafened === 'stayed deafened') {
        // do nothing
        return 0;
    } else if (sameChannel && deafened === 'stayed listening' && toAfk === 'not afk') {
        // nothing (literally nothing happened)
        return 0;
    } else if (!sameChannel && deafened === 'stayed listening' && toAfk === 'not afk') {
        /// depends
        if (oldState.channelID === 'null') {
            // start (joined vc from a nothing)
            return 1;
        } else if (newState.channelID === 'null') {
            // end (left vc to nothing)
            return 2;
        } else {
            return 0;
        }
    } else if (sameChannel && deafened === 'undeafened' && toAfk === 'not afk') {
        // start (undeafened in a public channel)
        return 1;
    } else if (!sameChannel && deafened === 'undeafened' && toAfk === 'not afk') {
        // start (undeafened while switching channels)
        return 1;
    } else if (sameChannel && deafened === 'deafened' && toAfk === 'not afk') {
        // end (deafened in the same channel)
        return 2;
    } else if (!sameChannel && deafened === 'deafened' && toAfk === 'not afk') {
        // end (deafened while switching channels)
        return 2;
    } else if (sameChannel && deafened === 'stayed listening' && toAfk === 'left afk') {
        // not possible (can't leave afk and be in the same channel)
        return 0;
    } else if (!sameChannel && deafened === 'stayed listening' && toAfk === 'left afk') {
        // depends
        if (newState.channelID !== 'null') {
            // start (left afk to a new channel)
            return 1;
        } else {
            return 0;
        }
    } else if (sameChannel && deafened === 'undeafened' && toAfk === 'left afk') {
        // not possible  (can't leave afk and be in the same channel)
        return 0;
    } else if (!sameChannel && deafened === 'undeafened' && toAfk === 'left afk') {
        // depends
        if (newState.channelID !== 'null') {
            // start (undeafened while leaving afk to a new channel)
            return 1;
        } else {
            return 0;
        }
    } else if (sameChannel && deafened === 'deafened' && toAfk === 'left afk') {
        // not possible  (can't leave afk and be in the same channel)
        return 0;
    } else if (!sameChannel && deafened === 'deafened' && toAfk === 'left afk') {
        // do nothing (deafened)
        return 0;
    } else if (sameChannel && deafened === 'stayed listening' && toAfk === 'joined afk') {
        // not possible (same channel and joined afk)
        return 0;
    } else if (!sameChannel && deafened === 'stayed listening' && toAfk === 'joined afk') {
        // depends
        if (oldState.channelID !== 'null') {
            // stop (joined afk from a normal channel)
            return 2;
        } else {
            return 0;
        }
    } else if (!sameChannel && deafened === 'undeafened' && toAfk === 'joined afk') {
        // do nothing (started deafened but now in afk)
        return 0;
    } else if (sameChannel && deafened === 'deafened' && toAfk === 'joined afk') {
        // not possible (same channel and joined afk)
        return 0;
    } else if (!sameChannel && deafened === 'deafened' && toAfk === 'joined afk') {
        // depends
        if (oldState.channelID !== 'null') {
            // stop (joined afk from a normal channel)
            return 2;
        } else {
            return 0;
        }
    } else {
        console.log('error...')
    }
}
