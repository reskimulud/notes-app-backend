const { nanoid } = require('nanoid');
const bcrypt = require('bcrypt');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');
const AuthenticationError = require('../../exceptions/AuthenticationError');

class UsersService {
  constructor(pool) {
    this._pool = pool;
  }

  async addUser({ username, password, fullname }) {
    await this.verifyNewUsername(username);
    const id = `user-${nanoid(16)}`;
    const hashedPassword = await bcrypt.hash(password, 10);
    const query = `INSERT INTO users VALUES('${id}', '${username}', '${hashedPassword}', '${fullname}')`;

    const result = await this._pool.query(query);

    if (!result.length) {
      throw new InvariantError('User gagal ditambahkan');
    }
    return result[0].id;
  }

  async verifyNewUsername(username) {
    const query = `SELECT username FROM users WHERE username = '${username}'`;

    const result = await this._pool.query(query);

    if (result.length > 0) {
      throw new InvariantError('Gagal menambahkan user. Username sudah digunakan.');
    }
  }

  async getUserById(userId) {
    const query = `SELECT id, username, fullname FROM users WHERE id = '${userId}'`;

    const result = await this._pool.query(query);

    if (!result.length) {
      throw new NotFoundError('User tidak ditemukan');
    }

    return result[0];
  }

  async verifyUserCredential(username, password) {
    const query = `SELECT id, password FROM users WHERE username = '${username}'`;

    const result = await this._pool.query(query);

    if (!result.length) {
      throw new AuthenticationError('Kredensial yang Anda berikan salah');
    }

    const { id, password: hashedPassword } = result[0];

    const match = await bcrypt.compare(password, hashedPassword);

    if (!match) {
      throw new AuthenticationError('Kredensial yang Anda berikan salah');
    }

    return id;
  }
}

module.exports = UsersService;
