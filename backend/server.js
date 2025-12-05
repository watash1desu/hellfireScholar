require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');


const authRoutes = require('./routes/auth');


const app = express();
app.use(cors());
app.use(express.json());


// Routes
app.use('/api/auth', authRoutes);
app.get('/ping', (req, res) => res.json({ ok: true, msg: 'Server is running' }));


const PORT = process.env.PORT || 5000;


mongoose.connect(process.env.MONGO_URI, {
useNewUrlParser: true,
useUnifiedTopology: true,
})
.then(() => {
console.log('Connected to MongoDB');
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
})
.catch(err => {
console.error('MongoDB connection error:', err.message || err);
});