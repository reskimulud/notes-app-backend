const { nanoid } = require('nanoid');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');
const AuthorizationError = require('../../exceptions/AuthorizationError');
const { mapDBToModel } = require('../../utils');

class NotesService {
  constructor(pool, collaborationService, cacheService) {
    this._pool = pool;
    this._collaborationService = collaborationService;
    this._cacheService = cacheService;
  }

  async addNote({
    title, body, tags, owner,
  }) {
    const id = nanoid(16);
    const createdAt = new Date().toISOString();
    const updatedAt = createdAt;

    const query = `INSERT INTO notes 
                    VALUES(
                      '${id}',
                      '${title}',
                      '${body}',
                      '${tags}',
                      '${createdAt}',
                      '${updatedAt}',
                      '${owner}'
                    )`;

    const result = await this._pool.query(query);

    if (result.affectedRows < 1) {
      throw new InvariantError('Catatan gagal ditambahkan');
    }

    if (process.env.USE_CACHE === 'true') {
      await this._cacheService.delete(`notes:${owner}`);
    }

    return id;
  }

  async getNotes(owner) {
    try {
      if (process.env.USE_CACHE === 'true') {
        const result = await this._cacheService.get(`notes:${owner}`);
        return JSON.parse(result);
      }
      throw new Error('Cache not found');
    } catch (error) {
      const query = `SELECT notes.* FROM notes
      LEFT JOIN collaborations ON collaborations.note_id = notes.id
      WHERE notes.owner = '${owner}' OR collaborations.user_id = '${owner}'
      GROUP BY notes.id
      ORDER BY updated_at DESC`;

      const result = await this._pool.query(query);
      const mappeddResult = result.map(mapDBToModel);

      if (process.env.USE_CACHE === 'true') {
        await this._cacheService.set(`notes:${owner}`, JSON.stringify(mappeddResult));
      }

      return mappeddResult;
    }
  }

  async getNoteById(id) {
    const query = `SELECT notes.*, users.username
    FROM notes
    LEFT JOIN users ON users.id = notes.owner
    WHERE notes.id = '${id}'`;

    const result = await this._pool.query(query);

    if (!result || result.length < 1 || result.affectedRows < 1) {
      throw new NotFoundError('Catatan tidak ditemukan');
    }

    return result.map(mapDBToModel)[0];
  }

  async editNoteById(id, { title, body, tags }) {
    const updatedAt = new Date().toISOString();
    const query = `UPDATE notes 
                    SET title = '${title}',
                      body = '${body}',
                      tags = '${tags}',
                      updated_at = '${updatedAt}'
                    WHERE id = '${id}'`;

    const result = await this._pool.query(query);

    if (!result || result.length < 1 || result.affectedRows < 1) {
      throw new NotFoundError('Gagal memperbarui catatan. Id tidak ditemukan');
    }

    const query2 = `SELECT owner FROM notes WHERE id = '${id}'`;
    const result2 = await this._pool.query(query2);

    const { owner } = result2[0];
    if (process.env.USE_CACHE === 'true') {
      await this._cacheService.delete(`notes:${owner}`);
    }
  }

  async deleteNoteById(id) {
    const query2 = `SELECT owner FROM notes WHERE id = '${id}'`;
    const result2 = await this._pool.query(query2);

    const query = `DELETE FROM notes WHERE id = '${id}'`;

    const result = await this._pool.query(query);

    if (!result || result.length < 1 || result.affectedRows < 1) {
      throw new NotFoundError('Catatan gagal dihapus. Id tidak ditemukan');
    }

    const { owner } = result2[0];
    if (process.env.USE_CACHE === 'true') {
      await this._cacheService.delete(`notes:${owner}`);
    }
  }

  async verifyNoteOwner(id, owner) {
    const query = `SELECT * FROM notes WHERE id = '${id}'`;
    const result = await this._pool.query(query);
    if (!result || result.length < 1 || result.affectedRows < 1) {
      throw new NotFoundError('Catatan tidak ditemukan');
    }
    const note = result[0];
    if (note.owner !== owner) {
      throw new AuthorizationError('Anda tidak berhak mengakses resource ini');
    }
  }

  async verifyNoteAccess(noteId, userId) {
    try {
      await this.verifyNoteOwner(noteId, userId);
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }
      try {
        await this._collaborationService.verifyCollaborator(noteId, userId);
      } catch {
        throw error;
      }
    }
  }

  async getUsersByUsername(username) {
    const query = `SELECT id, username, fullname FROM users WHERE username LIKE '%${username}%'`;
    const result = await this._pool.query(query);
    return result;
  }
}

module.exports = NotesService;
