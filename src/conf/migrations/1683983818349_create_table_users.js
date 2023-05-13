module.exports = {
  up: `CREATE TABLE users (
          id VARCHAR(50) NOT NULL,
          username VARCHAR(50) NOT NULL,
          password TEXT NOT NULL,
          fullname TEXT NOT NULL,
          PRIMARY KEY (id))`,
  down: 'DROP TABLE users',
};
