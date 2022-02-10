const routes = require('./routes');
const NoteHandler = require('./handler');

module.exports = {
  name: 'notes',
  version: '1.0.0',
  register: async (server, { service, validator }) => {
    const noteHandler = new NoteHandler(service, validator);
    server.route(routes(noteHandler));
  },
};
