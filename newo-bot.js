const env = process.env;
const mysql = require('mysql');
const discord = require('./discord-bot.js');
const twitch = require('./twitch-bot.js')
const logs = require('./functions/logging');
// START TIME
console.log(`Started ${new Date()}`);

// CONNECT TO DATABASE
let database = connectToDatabase();

// START BOTS
discord.run(env, database);
twitch.run(env, database);

/**
 * Connects to the database.
 * @returns {Connection.prototype} the connection to the database
 */
function connectToDatabase() {
    const url = env.CLEARDB_DATABASE_URL;
    const split = url.split(":");
    let databaseInfo = {
        host: "",
        user: "",
        password: "",
        database: ""
    }

    databaseInfo.user = split[1].substring(2)
    const split2 = split[2].split("@")
    databaseInfo.password = split2[0];
    const split3 = split2[1].split("/")
    databaseInfo.host = split3[0];
    databaseInfo.database = split3[1].split("?")[0];


    const database = mysql.createConnection(databaseInfo);

    try {
        database.connect();
        console.log('Connected to database');
    } catch (error) {
        console.error(error);
    }
    return database;
}

// handles errors
process.on('uncaughtException', err => {
    logs.error(err);
});
