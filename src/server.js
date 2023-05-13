// mengimpor dotenv dan menjalankan konfigurasinya
require('dotenv').config();

const Hapi = require('@hapi/hapi');
const Jwt = require('@hapi/jwt');
const Inert = require('@hapi/inert');
const path = require('path');

// notes
const notes = require('./api/notes');
const NotesServicePg = require('./services/postgres/NotesService');
const NotesServiceMysql = require('./services/mysql/NotesService');
const NotesValidator = require('./validator/notes');

// users
const users = require('./api/users');
const UsersServicePg = require('./services/postgres/UsersService');
const UsersServiceMysql = require('./services/mysql/UsersService');
const UsersValidator = require('./validator/users');

// authentications
const authentications = require('./api/authentications');
const AuthenticationsServicePg = require('./services/postgres/AuthenticationsService');
const AuthenticationsServiceMysql = require('./services/mysql/AuthenticationsService');
const TokenManager = require('./tokenize/TokenManager');
const AuthenticationsValidator = require('./validator/authentications');

// collaborations
const collaborations = require('./api/collaborations');
const CollaborationsServicePg = require('./services/postgres/CollaborationsService');
const CollaborationsServiceMysql = require('./services/mysql/CollaborationsService');
const CollaborationsValidator = require('./validator/collaborations');

// exports
const _exports = require('./api/exports');
const ProducerService = require('./services/rabbitmq/ProducerService');
const ExportsValidator = require('./validator/exports');

// uploads
const uploads = require('./api/uploads');
const StorageService = require('./services/storage/StorageService');
const UploadsValidator = require('./validator/uploads');

// cache
const CacheService = require('./services/redis/CacheService');

// mysql
const MySQLDatabase = require('./conf/MySQLDatabase');

const init = async () => {
  let notesService;
  let usersService;
  let authenticationsService;
  let collaborationsService;

  const cacheService = new CacheService();

  // mendefinisikan service sesuai dengan kondisi
  if (process.env.USE_DB === 'mysql') {
    console.log('use mysql');
    const mysqlPool = new MySQLDatabase();
    collaborationsService = new CollaborationsServiceMysql(mysqlPool, cacheService);
    notesService = new NotesServiceMysql(mysqlPool, collaborationsService, cacheService);
    usersService = new UsersServiceMysql(mysqlPool);
    authenticationsService = new AuthenticationsServiceMysql(mysqlPool);
  } else {
    console.log('use postgres');
    collaborationsService = new CollaborationsServicePg(cacheService);
    notesService = new NotesServicePg(collaborationsService, cacheService);
    usersService = new UsersServicePg();
    authenticationsService = new AuthenticationsServicePg();
  }

  const storageService = new StorageService(path.resolve(__dirname, 'api/uploads/file/images'));

  const server = Hapi.server({
    port: process.env.PORT,
    host: process.env.HOST,
    routes: {
      cors: {
        origin: ['*'],
      },
    },
  });

  // registrasi plugin eksternal
  await server.register([
    {
      plugin: Jwt,
    },
    {
      plugin: Inert,
    },
  ]);

  // mendefinisikan strategy autentikasi jwt
  server.auth.strategy('notesapp_jwt', 'jwt', {
    keys: process.env.ACCESS_TOKEN_KEY,
    verify: {
      aud: false,
      iss: false,
      sub: false,
    },
    validate: (artifacts) => ({
      isValid: true,
      credentials: {
        id: artifacts.decoded.payload.id,
      },
    }),
  });

  await server.register([
    {
      plugin: notes,
      options: {
        service: notesService,
        validator: NotesValidator,
      },
    },
    {
      plugin: users,
      options: {
        service: usersService,
        validator: UsersValidator,
      },
    },
    {
      plugin: authentications,
      options: {
        authenticationsService,
        usersService,
        tokenManager: TokenManager,
        validator: AuthenticationsValidator,
      },
    },
    {
      plugin: collaborations,
      options: {
        collaborationsService,
        notesService,
        validator: CollaborationsValidator,
      },
    },
    {
      plugin: _exports,
      options: {
        service: ProducerService,
        validator: ExportsValidator,
      },
    },
    {
      plugin: uploads,
      options: {
        service: storageService,
        validator: UploadsValidator,
      },
    },
  ]);

  await server.start();
  console.log(`Server berjalan pada ${server.info.uri}`);
};

init();
