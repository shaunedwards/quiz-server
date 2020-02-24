const LdapStrategy = require('passport-ldapauth');

const getLDAPConfiguration = (req, callback) => {
  process.nextTick(() => {
    const options = {
      server: {
        url: 'ldap://ldap.dcs.aber.ac.uk',
        bindDN: `uid=${req.body.username},ou=People,dc=dcs,dc=aber,dc=ac,dc=uk`,
        bindCredentials: `${req.body.password}`,
        searchBase: 'dc=dcs,dc=aber,dc=ac,dc=uk',
        searchFilter: `uid=${req.body.username}`
      }
    }
    callback(null, options);
  });
}

module.exports = new LdapStrategy(getLDAPConfiguration);

// server: {
//   url: 'ldap://zflexldap.com',
//   bindDN: `uid=${req.body.username},ou=users,ou=guests,dc=zflexsoftware,dc=com`,
//   bindCredentials: `${req.body.password}`,
//   searchBase: 'dc=zflexsoftware,dc=com',
//   searchFilter: `uid=${req.body.username}`
// }