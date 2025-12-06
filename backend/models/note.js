// backend/models/note.js
const mongoose = require('mongoose');

const NoteSchema = new mongoose.Schema({
  title: { type: String, required: true },
  filename: { type: String, required: true },
  originalName: { type: String },
  url: { type: String },
  subject: { type: String },
  category: { type: String },
  tags: [String],
  uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now }
});

// text index for searches on title + tags
NoteSchema.index({ title: 'text', tags: 'text' });

module.exports = mongoose.model('Note', NoteSchema);
