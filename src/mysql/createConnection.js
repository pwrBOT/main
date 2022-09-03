const config = require(`../../config.json`);     
const mysql = require("mysql2");

// todo delete

module.exports = mysql.createConnection({
  host: config.powerbot_mysql_host,
  user: config.powerbot_mysql_user,
  password: config.powerbot_mysql_pw,
  database: config.powerbot_mysql_database,
})