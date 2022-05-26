const env = process.env;
const mysql = require('mysql');
const discord = require('./discord-bot.js');
const twitch = require('./twitch-bot.js')

// START TIME
console.log(`Started ${new Date()}`);

// CONNECT TO DATABASE
const database = mysql.createConnection({
    host: env.DATABASE_HOST,
    user: env.DATABASE_USER,
    password: env.DATABASE_PASSWORD,
    database: env.DATABASE
});

try {
    database.connect();
    console.log('Connected to database');
} catch (error) {
    console.error(error);
}

// START BOTS
discord.run(env, database);
twitch.run(env, database);
