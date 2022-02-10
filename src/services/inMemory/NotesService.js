const { nanoid } = require('nanoid');

class NotesService {
  constructor() {
    this._notes = [];
  }

  addNote({ title, tags, body }) {
    const id = nanoid(16);
    const createdAt = new Date().toISOString();
    const updateAt = createdAt;

    const newNote = {
      title,
      tags,
      body,
      id,
      createdAt,
      updateAt,
    };

    this._notes.push(newNote);

    const isSuccess = this._notes.filter((note) => note.id === id).length > 0;

    if (!isSuccess) {
      throw new Error('Catatan gagal ditambahkan!');
    }

    return id;
  }

  getNotes() {
    return this._notes;
  }

  getNoteById(id) {
    const note = this._notes.filter((n) => n.id === id)[0];

    if (!note) {
      throw new Error('Catatan tidak ditemukan!');
    }

    return note;
  }

  editNoteById(id, { title, tags, body }) {
    const index = this._notes.findIndex((note) => note.id === id);

    if (index === -1) {
      throw new Error('Gagal memperbarui catatan, ID tidak ditemukan!');
    }

    const updateAt = new Date().toISOString();

    this._notes[index] = {
      ...this._notes[index],
      title,
      tags,
      body,
      updateAt,
    };
  }

  deleteNoteById(id) {
    const index = this._notes.findIndex((note) => note.id === id);

    if (index === -1) {
      throw new Error('Catatan gagal dihaapus, ID tidak ditemukan');
    }

    this._notes.splice(index, 1);
  }
}

module.exports = NotesService;
