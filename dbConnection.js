const mysql = require('mysql2')
const connection = mysql.createConnection({
   host: 'mysql.hosting.nic.ru',
   user: 'h911249946_hard',
   password: 'qaZ134679',
   database: 'h911249946_test',
})
module.exports = connection
