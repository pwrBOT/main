const mysql2 = require("mysql2");
const config = require(`../../config.json`);  
const chalk = require("chalk");

// DATABASE CONNECT 
const poolConfig = {
  host: config.powerbot_mysql_host,
  user: config.powerbot_mysql_user,
  password: config.powerbot_mysql_pw,
  database: config.powerbot_mysql_database,
};
const pool = mysql2.createPool(poolConfig);

const query = async function(query, params, limit = -1) {
  if (!pool) {
    throw new Error('no-db-pool');
  }

  if (limit !== -1 && !query.toLocaleLowerCase().includes('limit')) {
    query += ` LIMIT ${limit}`;
  }

  return new Promise(function(resolve) {
    try {
      pool?.query(query, params, (error, elements) => {
        if (error) {
          return resolve(null);
        }

        return resolve(elements);
      });
    } catch (e) {
      return resolve(null);
    }
  });
}

module.exports.pool = pool;
module.exports.query = query;