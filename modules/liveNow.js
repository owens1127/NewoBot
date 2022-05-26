const Discord = require('discord.js');
const request = require('snekfetch');
const config = require('../config.json');
const logs = require('../functions/logging');
const util = require('../functions/util');

/**
 * Checks if Newo is Live on twitch
 * @param {boolean} cached is Newo live already?
 * @param clientID the id of the client accessing the API
 * @param secret the client secret
 * @param discord_client the connection to discord
 */
exports.run = (cached, clientID, secret, discord_client) => {
    console.log('Checking if Newo is live...')

    const streamer = config.twitch.username;
    const channel = discord_client.channels.cache.get(config.discord.contentChannel);
    const postAPI = `https://id.twitch.tv/oauth2/token?client_id=${clientID}&client_secret=${secret}&grant_type=client_credentials`;
    const getAPI = `https://api.twitch.tv/helix/streams?user_login=${streamer}`;

    // Get Access Token
    request.post(postAPI).then(p => {
        let postResponse = p.body;

        // Retrieve Twitch Data
        request.get(getAPI, {
            headers: {
                'Client-ID': clientID,
                'Authorization': 'Bearer ' + postResponse.access_token
            }
        })
            .then(r => {
                let getResponse = r.body;

                // If Offline
                if (getResponse.data[0] === undefined) {
                    if (cached) {
                        console.log('Newo went offline');
                        discord_client.user.setActivity('Stream Ended', {type: 'PLAYING'});
                        logs.logAction('Set Activity', {
                            activity: 'Stream Ended',
                            type: 'PLAYING'
                        });
                        console.log('Updated Activity to Stream Ended')
                    } else {
                        console.log('Newo is still offline');
                    }
                }
                // If already posted
                else if (cached) {
                    console.log('Newo is already live');
                }

                // If just gone online
                else {
                    liveNow(getResponse.data[0], discord_client, channel, streamer);
                }
            }).catch(console.error);
    }).catch(console.error);
};

/**
 * Operations when Newo goes live
 * @param data data requested from the api
 * @param client the connection to discord
 * @param channel the channel to send the message
 * @param streamer the streamer's name
 */
function liveNow(data, client, channel, streamer) {
    console.log('Newo just went live!');
    let liveEmbed = new Discord.MessageEmbed({
        author: {
            name: 'Newo is now streaming',
            url: `https://twitch.tv/${data.user_login}`,
            icon_url: `https://avatar-resolver.vercel.app/twitch/${data.user_login}`
        },
        color: 9520895,
        url: `https://twitch.tv/${data.user_login}`,
        title: data.title,
        fields: [
            {name: ':joystick: Game', value: data.game_name, inline: true}
        ],
        image: {url: `https://static-cdn.jtvnw.net/previews-ttv/live_user_${data.user_login}-1920x1080.jpg`}
    });
    util.newoSignature(liveEmbed);

    channel.send(`🟣 **NEWO IS LIVE** 🟣\n${data.title}\n@everyone`, {embed: liveEmbed})
        .then(msg => {
            logs.logAction('Sent Live Announcement', {
                title: data.title
            });
            console.log('Sent message: ' + msg);
        })
        .catch(console.error);

    client.user.setActivity(`twitch.tv/${streamer}`,
        {url: `https://twitch.tv/${streamer}`, type: 'STREAMING'})
        .then(() => {
            logs.logAction('Set Activity', {
                activity: `twitch.tv/${streamer}`,
                type: 'STREAMING'
            });
            console.log('Updated Activity to STREAMING');
        })
        .catch(console.error);
}
