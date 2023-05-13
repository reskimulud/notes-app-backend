module.exports = {
  up: `CREATE TABLE authentications
        (token TEXT NOT NULL)`,
  down: 'DROP TABLE authentications',
};
