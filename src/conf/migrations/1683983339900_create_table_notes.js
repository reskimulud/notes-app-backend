module.exports = {
  up: `CREATE TABLE notes (
          id VARCHAR(50) NOT NULL,
          title TEXT NOT NULL,
          body TEXT NOT NULL,
          tags TEXT NOT NULL,
          created_at TEXT NOT NULL,
          updated_at TEXT NOT NULL,
          owner VARCHAR(50) NOT NULL,
          PRIMARY KEY (id))`,
  down: 'DROP TABLE notes',
};
