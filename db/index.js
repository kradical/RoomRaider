const { Pool } = require('pg');
const config = require('config');

const dbConfig = config.get('db');
const pool = new Pool(dbConfig);

module.exports = {
  query: (text, params, callback) => pool.query(text, params, callback),
}
