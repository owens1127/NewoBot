const https = require('https');

/**
 * This function  wraps promise in function with callback,
 * this makes it easier to reuse similar code over and over.
 * @param {Object} data Data to post
 * @param {Object} options Https request options
 * @return {Promise} A promise based on the the success of the http request.
 */
const promisePostRequest = (data, options) => {
    const dataString = JSON.stringify(data);
    return new Promise((resolve, reject) => {
        const req = https.request(options, res => {
            resolve(res);
        }).on('error', err => {
            reject(err.message);
        }).on('data',
            console.log)
        req.write(dataString);
        req.end();
    });
};

module.exports = promisePostRequest;