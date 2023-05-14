const { nanoid } = require('nanoid');
const InvariantError = require('../../exceptions/InvariantError');

class CollaborationsService {
  constructor(pool, cacheService) {
    this._pool = pool;
    this._cacheService = cacheService;
  }

  async addCollaboration(noteId, userId) {
    const id = `collab-${nanoid(16)}`;

    const query = `INSERT INTO collaborations 
                    VALUES(
                      '${id}',
                      '${noteId}',
                      ${userId}
                    )`;

    const result = await this._pool.query(query);

    if (!result || result.length < 1 || result.affectedRows < 1) {
      throw new InvariantError('Kolaborasi gagal ditambahkan');
    }

    if (process.env.USE_CACHE === 'true') {
      await this._cacheService.delete(`notes:${userId}`);
    }
    return id;
  }

  async deleteCollaboration(noteId, userId) {
    const query = `DELETE FROM collaborations
                    WHERE note_id = '${noteId}' AND user_id = '${userId}'`;

    const result = await this._pool.query(query);

    if (!result || result.length < 1 || result.affectedRows < 1) {
      throw new InvariantError('Kolaborasi gagal dihapus');
    }

    await this._cacheService.delete(`notes:${userId}`);
  }

  async verifyCollaborator(noteId, userId) {
    const query = `SELECT * FROM collaborations
                    WHERE note_id = '${noteId}' AND user_id = '${userId}'`;

    const result = await this._pool.query(query);

    if (!result || result.length < 1 || result.affectedRows < 1) {
      throw new InvariantError('Kolaborasi gagal diverifikasi');
    }
  }
}

module.exports = CollaborationsService;
