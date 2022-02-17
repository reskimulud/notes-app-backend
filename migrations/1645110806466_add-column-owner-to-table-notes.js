/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = (pgm) => {
  pgm.addColumns('notes', {
    owner: {
      type: 'varchar(50)',
    },
  });
};

exports.down = (pgm) => {
  pgm.dropColumns('notes', 'owner');
};
