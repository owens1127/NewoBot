const promiseRequest = require('node-destiny-2/lib/async-https');
const promisePostRequest = require('./https');
const formatJson = require('node-destiny-2/lib/format-json');
const Destiny2API = require('node-destiny-2');
const https = require('https');

class EnhancedDestiny2API extends Destiny2API {
    /**
     * Returns list of memberships tied to account.
     * @param {number} membershipType enum of values for specifying platform
     * @param {string} bungieName
     */
    searchDestinyPlayerByBungieName(membershipType, bungieName) {
        this.options.path = `${this.path}/SearchDestinyPlayerByBungieName/${membershipType}/`;
        this.options.path = this.options.path.split(' ').join('%20');
        this.options.method = 'POST';
        if (!bungieName.includes('#')) {
            return new Promise((resolve, reject) => {
                reject(new TypeError('The Bungie Name was not formatted correctly: (Name#0000)'));
            });
        }
        const displayName = bungieName.split('#');
        const data = {
            displayName: displayName[0],
            displayNameCode: displayName[1]
        }
        return promisePostRequest(data, this.options).then(res => formatJson(res));
    }
}

module.exports = EnhancedDestiny2API;

