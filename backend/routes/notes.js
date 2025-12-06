// backend/routes/notes.js
const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Note = require('../models/note');
const authMiddleware = require('../middleware/auth'); // expects middleware to set req.user.userId

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log('Created uploads directory at', uploadsDir);
}

// Multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => {
    const safe = Date.now() + '-' + file.originalname.replace(/\s+/g, '_');
    cb(null, safe);
  }
});
const upload = multer({ storage, limits: { fileSize: 20 * 1024 * 1024 } });

// helper: extract tags from subject/category and filename/title
function extractTags({ title, originalName, subject, category }) {
  const tags = new Set();
  if (subject) tags.add(subject.trim().toLowerCase());
  if (category) tags.add(category.trim().toLowerCase());

  const combined = ((title || '') + ' ' + (originalName || '')).toLowerCase();
  const words = combined.replace(/[\W_]+/g, ' ').split(/\s+/).filter(w => w.length >= 3);
  words.slice(0, 8).forEach(w => tags.add(w));
  return Array.from(tags).slice(0, 12);
}

router.post('/upload', authMiddleware, upload.single('file'), async (req, res) => {
  try {
    // DEBUG: log incoming upload request info (safe)
    console.log('POST /api/notes/upload - headers:', {
      authorization: req.headers.authorization,
      'content-type': req.headers['content-type']
    });
    console.log('POST /api/notes/upload - body fields:', req.body);

    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

    const { title, subject, category } = req.body;
    const originalName = req.file.originalname;
    const filename = req.file.filename;
    const url = `/uploads/${filename}`;

    const tags = extractTags({ title, originalName, subject, category });

    const note = await Note.create({
      title: title || originalName,
      filename,
      originalName,
      url,
      subject: subject || '',
      category: category || '',
      tags,
      uploadedBy: req.user && req.user.userId ? req.user.userId : null
    });

    console.log('Upload saved to DB, id=', note._id);
    res.status(201).json({ note });
  } catch (err) {
    console.error('Upload error:', err);
    res.status(500).json({ error: 'Server error uploading file' });
  }
});

/**
 * GET /api/notes
 * Query params: subject, category, q, tags (comma sep), page, limit
 */
router.get('/', async (req, res) => {
  try {
    console.log('GET /api/notes req.query =', req.query);

    const { subject, category, q, tags, page = 1, limit = 50 } = req.query;
    const filter = {};

    function escapeRegExp(str) {
      return String(str).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }

    if (subject && String(subject).trim().toLowerCase() !== 'all') {
      const s = String(subject).trim();
      filter.subject = { $regex: `^${escapeRegExp(s)}$`, $options: 'i' };
    }

    if (category && String(category).trim().toLowerCase() !== 'all') {
      const c = String(category).trim();
      filter.category = { $regex: `^${escapeRegExp(c)}$`, $options: 'i' };
    }

    if (tags) {
      const tagsArr = String(tags).split(',').map(t => t.trim().toLowerCase()).filter(Boolean);
      if (tagsArr.length) filter.tags = { $all: tagsArr };
    }

    let query = Note.find(filter);

    if (q) {
      const rx = new RegExp(String(q).replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
      query = Note.find({
        ...filter,
        $or: [{ title: rx }, { originalName: rx }, { tags: rx }]
      });
    }

    const pageNum = Math.max(1, parseInt(page, 10));
    const lim = Math.max(1, parseInt(limit, 10));

    const total = await query.clone().countDocuments();
    const notes = await query
      .sort({ createdAt: -1 })
      .skip((pageNum - 1) * lim)
      .limit(lim)
      .lean();

    res.json({ notes, total, page: pageNum, limit: lim });
  } catch (err) {
    console.error('Notes GET error:', err);
    res.status(500).json({ error: 'Server error fetching notes' });
  }
});

/**
 * DELETE /api/notes/:id
 */
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const noteId = req.params.id;
    const note = await Note.findById(noteId);
    if (!note) return res.status(404).json({ error: 'Note not found' });

    const requesterId = req.user && req.user.userId ? String(req.user.userId) : null;
    const ownerId = note.uploadedBy ? String(note.uploadedBy) : null;

    if (ownerId && requesterId !== ownerId) {
      return res.status(403).json({ error: 'Forbidden: you can only delete your own uploads' });
    }

    const filepath = path.join(__dirname, '..', 'uploads', note.filename);
    fs.unlink(filepath, (unlinkErr) => {
      if (unlinkErr && unlinkErr.code !== 'ENOENT') {
        console.warn('Failed to delete file:', filepath, unlinkErr);
      }
    });

    await Note.deleteOne({ _id: noteId });
    res.json({ ok: true, message: 'Note deleted' });
  } catch (err) {
    console.error('Delete note error:', err);
    res.status(500).json({ error: 'Server error deleting note' });
  }
});

module.exports = router;
