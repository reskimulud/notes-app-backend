module.exports = {
  up: `ALTER TABLE notes 
            ADD CONSTRAINT \`fk_notes.owner_users.id\`
            FOREIGN KEY (owner)
            REFERENCES users(id)
            ON DELETE CASCADE ON UPDATE RESTRICT`,
  down: '',
};
