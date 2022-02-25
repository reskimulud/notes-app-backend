const routes = (handler) => [
  {
    method: 'POST',
    path: '/upload/images',
    handler: handler.postUploadImageHandler,
    options: {
      payload: {
        allow: 'multipart/form-data',
        output: 'stream',
        multipart: true,
      },
    },
  },
];

module.exports = routes;
