const {Client, Intents} = require('discord.js');
const Discord = require('discord.js');
const Connection = require('mysql/lib/Connection');
const config = require('./config.json');
const logs = require('./functions/logging');
const util = require('./functions/util')
const {isPremiumGuild} = require('./functions/util');

/**
 * Runs the discord bot
 * @param {Connection.prototype} db the connection to the database
 */
exports.run = (db) => {
    const discord_client = new Client({
        allowedMentions: {parse: ['users', 'roles']},
        partials: ['CHANNEL'],
        intents: ['GUILDS', 'GUILD_MESSAGES', 'GUILD_MEMBERS', 'GUILD_VOICE_STATES',
            'GUILD_PRESENCES', 'DIRECT_MESSAGES', 'DIRECT_MESSAGE_TYPING']
    });

    const env = process.env;

    // ON DISCORD READY
    discord_client.on('ready', async () => {

        // Log Channel
        logs.channel(await discord_client.channels.fetch(config.discord.logChannelID));

        console.log(`Logged into Discord with ${discord_client.user.tag}`);
        logs.logAction('Went online', {
            time: Date.now()
        });

        discord_client.user.setActivity('the service come online', {type: 'WATCHING'});
        logs.logAction('Set Activity', {
            activity: 'the service come online', type: 'WATCHING'
        });

        // TIMERS
        console.log('Starting Discord timers...')
        require('./modules/timers.js').discord(env, discord_client, db);

        logs.logAction('Started Timers', {
            time: Date.now()
        });
    });

    // ON MESSAGE
    discord_client.on('messageCreate', message => {
        if (message.author.bot || message.system) {
            return;
        }

        // Handle DMs
        if (message.guild === null) {
            return require('./modules/handleDM.js').run(discord_client, message);
        }
        // Handle the XP
        else {
            require('./modules/handleXP.js').text(discord_client, message, db);
        }

        // Handle Commands
        if (message.content.indexOf(config.discord.prefix) === 0) {
            require('./modules/handleCommand').discord(discord_client, message, db);
        }
    });

    // USER JOINS SERVER
    discord_client.on('guildMemberAdd', member => {
        if (member.user.bot) {
            return;
        }
        logs.logAction('User Join', {
            user: member.user, guild: member.guild
        });

        // Create a new entry in the database for the new user
        require('./modules/handleXP.js').new(member, db);

        if (isPremiumGuild(member.guild)) {

            const outputChannel = util.getOutputChannel(member.guild);
            if (!outputChannel) {
                return console.log('Could not send good morning message to ' + member.guild.name);
            }
            outputChannel.send(`Welcome ${member} to ${member.guild.name}!`)
                .then(msg => logs.logAction('Sent message', {
                    content: msg.content, guild: msg.guild
                }))
                .catch(logs.error);

            require('./modules/roleColor.js').new(member);
        }
    });

// USER LEAVES SERVER
    discord_client.on('guildMemberRemove', member => {
        if (member.user.bot) return;

        logs.logAction('User Leave', {
            user: member, guild: member.guild
        });

        if (util.isPremiumGuild(member.guild)) {
            require('./modules/roleColor.js').userLeave(discord_client, member, member.guild);
        }
        const thirtyDays = 1000 * 60 * 60 * 24 * 30;
        require('./modules/handleXP').conditionalDelete(discord_client, member, db, {minXP: 200, recency: thirtyDays});

    });

// VOICE CHANNEL UPDATE
    discord_client.on('voiceStateUpdate', (oldVoiceState, newVoiceState) => {
        if (oldVoiceState.member.user.bot) {
            return;
        }

        require(`./modules/handleXP.js`).voice(discord_client, oldVoiceState, newVoiceState, db);
    });

// ERROR
    discord_client.on('error', logs.error);

// LOGIN

    discord_client.login(env.DISCORD_TOKEN)
        .then(() => console.log('READY'))
        .catch(console.error);
}


