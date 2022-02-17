const ClientError = require('../../exceptions/ClientError');

class AuthenticationsHandler {
  constructor(authenticationsService, userService, tokenManager, validator) {
    this._authenticationsService = authenticationsService;
    this._userService = userService;
    this._tokenManager = tokenManager;
    this._validator = validator;

    this.postAuthenticationHandler = this.postAuthenticationHandler.bind(this);
    this.putAuthenticationHandler = this.putAuthenticationHandler.bind(this);
    this.deleteAuthenticationHandler = this.deleteAuthenticationHandler.bind(this);
  }

  async postAuthenticationHandler(request, h) {
    try {
      this._validator.validatePostAuthenticationPayload(request.payload);

      const { username, password } = request.payload;
      const id = await this._userService.verifyUserCredential(username, password);

      const accessToken = this._tokenManager.generateAccessToken({ id });
      const refreshToken = this._tokenManager.generateRefreshToken({ id });

      await this._authenticationsService.addRefreshToken(refreshToken);

      const response = h.response({
        status: 'success',
        message: 'Authentication berhasil ditambahkan',
        data: {
          accessToken,
          refreshToken,
        },
      });
      response.code(201);
      return response;
    } catch (err) {
      if (err instanceof ClientError) {
        const response = h.response({
          status: 'fail',
          message: err.message,
        });
        response.code(err.statusCode);
        return response;
      }

      const response = h.response({
        status: 'error',
        message: 'Maaf, terjadi kegagalan pada server kami',
      });
      response.code(500);
      return response;
    }
  }

  async putAuthenticationHandler(request, h) {
    try {
      this._validator.putAuthenticationPayload(request.payload);

      const { refreshToken } = request.payload;
      await this._authenticationsService.verifyRefreshToken(refreshToken);

      const { id } = this._tokenManager.verifyRefreshToken(refreshToken);

      const accessToken = this._tokenManager.generateAccessToken({ id });

      return {
        statue: 'success',
        message: 'Access Token berhasil diperbarui',
        data: {
          accessToken,
        },
      };
    } catch (err) {
      if (err instanceof ClientError) {
        const response = h.response({
          status: 'fail',
          message: err.message,
        });
        response.code(err.statusCode);
        return response;
      }

      const response = h.response({
        status: 'error',
        message: 'Maaf, terjadi kegagalan pada server kami',
      });
      response.code(500);
      return response;
    }
  }

  async deleteAuthenticationHandler(request, h) {
    try {
      this._validator.validateDeleteAuthenticationPayload(request.payload);

      const { refreshToken } = request.payload;
      await this._authenticationsService.verifyRefreshToken(refreshToken);
      await this._authenticationsService.deleteRefreshToken(refreshToken);

      return {
        status: 'success',
        message: 'Refresh token berhasil dihapus',
      };
    } catch (err) {
      if (err instanceof ClientError) {
        const response = h.response({
          status: 'fail',
          message: err.message,
        });
        response.code(err.statusCode);
        return response;
      }

      const response = h.response({
        status: 'error',
        message: 'Maaf, terjadi kegagalan pada server kami',
      });
      response.code(500);
      return response;
    }
  }
}

module.exports = AuthenticationsHandler;
