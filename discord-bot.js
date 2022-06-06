const {Client, Intents} = require('discord.js');
const Discord = require('discord.js');
const config = require('./config.json');
const logs = require('./functions/logging');
const util = require('./functions/util')

/**
 * Runs the discord bot
 * @param {Object} env the environment variables
 * @param {Connection} db the connection to the database
 */
exports.run = (env, db) => {
    const discord_client = new Client({
        allowedMentions: {parse: ['users', 'roles']},
        partials: ['CHANNEL'],
        intents: ['GUILDS', 'GUILD_MESSAGES', 'GUILD_MEMBERS', 'GUILD_VOICE_STATES',
            'GUILD_PRESENCES', 'DIRECT_MESSAGES', 'DIRECT_MESSAGE_TYPING']
    });

    // ON DISCORD READY
    discord_client.on('ready', async () => {

        // Log Channel
        logs.channel(await discord_client.channels.fetch(config.discord.logChannelID));

        console.log(`Logged into Discord with ${discord_client.user.tag}`);
        logs.logAction('Went online', {
            time: Date.now()
        });

        discord_client.user.setActivity('Just restarted', {type: 'PLAYING'});
        logs.logAction('Set Activity', {
            activity: 'Just restarted',
            type: 'PLAYING'
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
            user: member.user,
            guild: member.guild
        });

        // Create a new entry in the database for the new user
        ('./modules/handleXP.js').new(member, db);

        const outputChannel = util.getOutputChannel(member.guild);
        outputChannel.send(`Welcome ${member} to ${member.guild.name}!`)
            .then(msg => logs.logAction('Sent message', {
                content: msg.content,
                guild: msg.guild
            }))
            .catch(console.error);

        if (util.isPremiumGuild(member.guild)) {
            require('./modules/roleColor.js').new(member);
        }
    });

// USER LEAVES SERVER
    discord_client.on('guildMemberRemove', member => {
        logs.logAction('User Leave', {
            user: member,
            guild: member.guild
        });

        if (util.isPremiumGuild(member.guild)) {
            require('modules/roleColor.js').delete(discord_client, member, member.guild);
        }

    });

// VOICE CHANNEL UPDATE
    discord_client.on('voiceStateUpdate', (oldVoiceState, newVoiceState) => {
        if (oldVoiceState.member.user.bot) {
            return;
        }

        require(`./modules/handleXP.js`).voice(discord_client, oldVoiceState, newVoiceState, db);
    });

// ERROR
    discord_client.on('error', console.error);

    // LOGIN

    discord_client.login(env.DISCORD_TOKEN)
        .then(() => console.log('READY'))
        .catch(console.error);
}
