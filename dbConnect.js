async function conn() {
   const mysql = require('mysql2/promise')
   const connection = await mysql.createConnection({
      host: 'mysql.hosting.nic.ru',
      user: 'h911249946_hard',
      password: 'qaZ134679',
      database: 'h911249946_test',
   })
   return connection
}

function connect() {
   const mysql = require('mysql2')
   const connection = mysql.createConnection({
      host: 'mysql.hosting.nic.ru',
      user: 'h911249946_hard',
      password: 'qaZ134679',
      database: 'h911249946_test',
   })
   return connection
}

module.exports = {
   asyncConnect: conn,
   connection: connect,
}
