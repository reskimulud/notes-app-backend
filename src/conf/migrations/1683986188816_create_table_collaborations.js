module.exports = {
  up: `CREATE TABLE collaborations (
          id VARCHAR(50) NOT NULL,
          note_id VARCHAR(50) NOT NULL,
          user_id VARCHAR(50) NOT NULL,
          PRIMARY KEY (id),
          UNIQUE(note_id, user_id))`,
  down: 'DROP TABLE collaborations',
};
