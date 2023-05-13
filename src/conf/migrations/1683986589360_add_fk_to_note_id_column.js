module.exports = {
  up: `ALTER TABLE collaborations 
            ADD CONSTRAINT \`fk_collaborations.note_id_notes.id\`
            FOREIGN KEY (note_id)
            REFERENCES notes(id)
            ON DELETE CASCADE ON UPDATE RESTRICT`,
  down: '',
};
