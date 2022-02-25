const routes = (handler) => [
  {
    method: 'POST',
    path: '/exports/notes',
    handler: handler.postExportNotesHandler,
    options: {
      auth: 'notesapp_jwt',
    },
  },
];

module.exports = routes;
