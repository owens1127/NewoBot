const Discord = require('discord.js');
const request = require('snekfetch');
const config = require('../config.json');
const logs = require('../functions/logging');

/**
 * Check for new youtube videos and post them in the content channel
 * @param key api key
 * @param client connection to discord
 */
exports.run = (key, client) => {
    console.log('Fetching YoutTube API data...')
    const channel = client.channels.cache.get(config.discord.contentChannel);
    console.log(channel)
    const ytid = config.youtube.channelID;
    const fetchCount = 5;

    request.get(
        `https://youtube.googleapis.com/youtube/v3/activities?part=snippet%2CcontentDetails&channelId=${ytid}&maxResults=${fetchCount}&key=${key}`)
        .then(r => {
            let items = r.body.items
            let filtered = items.filter(i => i.snippet.type === 'upload' && recentUpload(
                Date.parse(i.snippet.publishedAt)));
            filtered.forEach(v => {
                let id = v.contentDetails.upload.videoId
                let url = `youtu.be/${id}`;
                console.log(`Retrieved YouTube Video ${url}`);
                logs.logAction('Retrieved YouTube Video', {
                    title: v.snippet.title,
                    url: url
                });
                channel.send(
                    `❗️**NEW YOUTUBE VIDEO**❗️\n${v.snippet.title}\n${url}\n@everyone`)
                    .then(msg => {
                        console.log('Sent message ' + msg);
                        logs.logAction('Sent New YT Video Embed', {
                            title: v.snippet.title,
                            url: url
                        });
                    })

                    .catch(console.error);
            });
        })
        .catch(console.error);
};

/**
 * Determines if a video is less than 15 minutes old given a timestamp
 * @param {Number} ms the milliseconds of the current time
 * @returns {boolean} true if the video is uploaded within 15 minutes
 */
function recentUpload(ms) {
    return (new Date().getTime() - ms) <= 15 * 60 * 1000;
}
