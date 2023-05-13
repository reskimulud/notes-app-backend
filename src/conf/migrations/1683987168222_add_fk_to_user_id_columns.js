module.exports = {
  up: `ALTER TABLE collaborations 
            ADD CONSTRAINT \`fk_collaborations.user_id_users.id\`
            FOREIGN KEY (user_id)
            REFERENCES users(id)
            ON DELETE CASCADE ON UPDATE RESTRICT`,
  down: '',
};
