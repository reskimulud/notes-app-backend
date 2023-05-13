const InvariantError = require('../../exceptions/InvariantError');

class AuthenticationsService {
  constructor(pool) {
    this._pool = pool;
  }

  async addRefreshToken(token) {
    const query = `INSERT INTO authentications VALUES('${token}')`;

    await this._pool.query(query);
  }

  async verifyRefreshToken(token) {
    const query = `SELECT token FROM authentications WHERE token = '${token}'`;

    const result = await this._pool.query(query);

    if (!result || result.length < 1 || result.affectedRows < 1) {
      throw new InvariantError('Refresh token tidak valid');
    }
  }

  async deleteRefreshToken(token) {
    await this.verifyRefreshToken(token);

    const query = `DELETE FROM authentications WHERE token = '${token}'`;

    await this._pool.query(query);
  }
}

module.exports = AuthenticationsService;
