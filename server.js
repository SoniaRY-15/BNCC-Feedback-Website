const path = require('path');
const fs = require('fs');
const express = require('express');
const cors = require('cors');
const feedbackRouter = require('./route.js');

const app = express();
const PORT = process.env.PORT || 4000; //open localhost:4000

app.use(cors());
app.use(express.json());

// Frontend open dari folder "public" --> Put every front end files there
const publicDir = path.join(__dirname, 'public');
app.use(express.static(publicDir));

// API routes!!
app.use('/api/feedback', feedbackRouter);

// health thingy?
app.get('/health', (req, res) => {
    res.json({ status: 'ok' }); //yea this works?
});

// SPA fallback: only run for non-API requests 
app.use((req, res, next) => {
    if (req.path.startsWith('/api') || req.path === '/health') return next();
    const indexPath = path.join(publicDir, 'index.html');
    fs.access(indexPath, fs.constants.R_OK, (err) => {
        if (err) return res.status(404).json({ error: 'Not Found', detail: 'index.html missing in public/' }); //If the index.html isnt in the 'public' folder... should i not use a folder?
        res.sendFile(indexPath);
    });
});

// error handler
app.use((err, req, res, next) => {
    console.error('Unhandled error:', err && err.stack ? err.stack : err);
    res.status(500).json({ error: 'Internal Server Error' });
});

app.listen(PORT, () => {
    console.log(`BNCC Feedback API + frontend listening on http://localhost:${PORT}`);
});