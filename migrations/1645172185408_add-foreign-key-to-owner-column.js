/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = (pgm) => {
  // create new user
  pgm.sql("INSERT INTO users(id, username, password, fullname) VALUES ('old_notes', 'old_notes', 'old_notes', 'old_notes')");

  // chanege value of owner on note where owner is NULL
  pgm.sql("UPDATE notes SET owner = 'old_notes' WHERE owner IS NULL");

  // gives owner column constraint foreign key to id column from table users
  pgm.addConstraint('notes', 'fk_notes.owner_users.id', 'FOREIGN KEY (owner) REFERENCES users(id) ON DELETE CASCADE');
};

exports.down = (pgm) => {
  // drop constraint fk_notes.owner_users.id from table notes
  pgm.dropConstraint('notes', 'fk_notes.owner_users.id');

  // change owner value on note where owner is 'old_notes' to NULL
  pgm.sql("UPDATE notes SET owner = NULL WHERE owner = 'old_notes'");

  // delete new user
  pgm.sql("DELETE FROM users WHERE id = 'old_notes'");
};
