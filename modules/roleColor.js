const Discord = require('discord.js');
const config = require('../config.json');
const logs = require('../functions/logging');

/**
 * Deletes a special role when a user leaves the server
 * @param {Discord.Client} client the discord connection
 * @param {Discord.GuildMember} member the user who left
 * @param {Discord.Guild} guild the guild the user left
 */
exports.userLeave = (client, member, guild) => {
    const roleToDelete = guild.roles.cache.find(role => role.name === member.id);
    if (roleToDelete === undefined) {
        return;
    }

    roleToDelete.delete('User left the server')
        .then(deleted => {
            logs.logAction('Deleted User Role', {
                reason: 'User left the server', userID: deleted.name, server: deleted.guild
            });
            console.log('Deleted role ' + deleted.name);
        })
        .catch(logs.error);
};

/**
 * Verifies all roles are properly applied in a guild
 * @param {Discord.Guild} guild the server to verify
 */
exports.verify = (guild) => {
    console.log('Verifying color roles...');

    // all roles named like an ID
    const roles = guild.roles.cache.filter(role => {
        role.name.match(/\d{18}/g)
    });

    roles.forEach(role => {
        let roleMembers = role.members;
        // no one has the role
        if (roleMembers.size === 0) {
            role.delete('Extraneous role color')
                .then(deleted => {
                    logs.logAction('Deleted User Role', {
                        reason: 'Extraneous role color', userID: deleted.name, server: deleted.guild
                    });
                    console.log('Deleted role ' + deleted.name);
                })
                .catch(logs.error);
        } else {
            roleMembers.forEach(member => {
                // not supposed to have this role
                if (member.id !== role.name) {
                    member.roles.remove(role, 'This role was not made for this user')
                        .then(member => {
                            logs.logAction('Removed role from user', {
                                reason: 'This role was not made for this user',
                                userID: member.id,
                                server: member.guild
                            });
                            console.log(
                                `Removed role ${role.name} from user ${member.user.tag} (${member.id})`);
                        })
                        .catch(logs.error);
                }
            });
        }
    });

    // all members in the server
    const members = guild.members.cache.filter(guildMember => !guildMember.user.bot);

    members.forEach(member => {
        let colorRole = member.roles.cache.find(r => r.name === member.id);
        if (colorRole === undefined) {
            createRole(member, `0x${Math.floor(Math.random() * 16777215).toString(16)}`, 'Verify');
        } else {
            colorRole.edit({
                permissions: guild.roles.everyone.permissions
            }, 'verify')
                .catch(err => {
                    console.log(err)
                });
        }
    });
};

/**
 * Creates a new special role for a user
 * @param {Discord.GuildMember} member the user to create a role for
 */
exports.new = (member) => {
    createRole(member, `0x${Math.floor(Math.random() * 16777215).toString(16)}`, 'New Member');
};

/**
 * Changes the color of a user
 * @param {Discord.GuildMember} member the user whose role is changed
 * @param {Discord.ColorResolvable | undefined} color the color to change the role to
 */
exports.change = (member, color) => {
    let role = member.guild.roles.cache.find(role => role.name === member.id);

    role.edit({
        color: color
    }, '!color command')
        .then(updated => {
            logs.logAction('Edited Role Color', {
                color: color, userID: member.id, server: member.guild
            });
            console.log(`Edited role color for ${member.user.tag} to ${updated.color}`)
        })
        .catch(err => {
            console.log(err)
        });
}

/**
 * Creates a special for the user
 * @param {Discord.GuildMember} member the user to apply the role to
 * @param {string} color the color of the role
 * @param {String} reason the reason for the making of the role
 * @returns {Discord.Role} the role created
 */
function createRole(member, color, reason) {
    member.guild.roles.create({
        name: member.id,
        color: color,
        hoist: false,
        mentionable: false,
        reason: reason,
        permissions: member.guild.roles.everyone.permissions
    })
        .then(r => {
            logs.logAction('Created role', {
                name: r.name, reason: reason, server: r.guild
            });
            console.log('Created role ' + r.name);
            member.roles.add(r, reason)
                .then(u => {
                    logs.logAction('Added role to user', {
                        user: u, reason: reason, server: r.guild
                    });
                    console.log(`Added role ${r.name} to user ${member.user.tag} (${member.id})`);
                })
                .catch(logs.error);
            return r;
        })
        .catch(logs.error);
}
