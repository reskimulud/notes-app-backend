const migration = require('mysql-migrations');
const MySQLDatabase = require('./MySQLDatabase');

const mySQLDatabase = new MySQLDatabase();

migration.init(mySQLDatabase.connection, `${__dirname}/migrations`);
