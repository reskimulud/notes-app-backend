const routes = (handler) => [
  {
    method: 'POST',
    path: '/authentications',
    handler: handler.postAuthenticationHandler,
  },
  {
    metod: 'PUT',
    path: '/authentications',
    handler: handler.putAuthenticationHandler,
  },
  {
    method: 'DELETE',
    path: '/authentications',
    handler: handler.deleteAuthenticationHandler,
  },
];

module.exports = routes;
