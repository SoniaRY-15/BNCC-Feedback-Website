const express = require('express');
const { v4: uuidv4 } = require('uuid');
const store = require('./store');

const router = express.Router();

const DIVISIONS = ['LnT', 'EEO', 'PR', 'HRD', 'RnD'];
const STATUSES = ['open', 'in-review', 'resolved'];

function validateCreate(body) { //For input validation!!
    const errors = [];
    if (!body.name || typeof body.name !== 'string') errors.push('name is required (string)');
    if (!body.email || typeof body.email !== 'string') errors.push('email is required (string)');
    if (!body.eventName || typeof body.eventName !== 'string') errors.push('eventName is required (string)');
    if (!body.division || !DIVISIONS.includes(body.division)) errors.push(`division is required and must be one of: ${DIVISIONS.join(', ')}`);
    if (body.rating == null || !Number.isInteger(body.rating) || body.rating < 1 || body.rating > 5) errors.push('rating is required and must be integer 1..5');
    return errors;
}

router.post('/', async (req, res, next) => {
    try {
        const body = req.body || {};
        const errors = validateCreate(body);
        if (errors.length) return res.status(400).json({ errors });

        const now = new Date().toISOString();
        const item = {
            id: uuidv4(),
            name: body.name,
            email: body.email,
            eventName: body.eventName,
            division: body.division,
            rating: body.rating,
            comment: body.comment || '',
            suggestion: body.suggestion || '',
            createdAt: now,
            status: body.status && STATUSES.includes(body.status) ? body.status : 'open'
        };

        await store.create(item);
        res.status(201).json(item);
    } catch (err) {
        next(err);
    }
});

router.get('/', async (req, res, next) => {
    try {
        const qStatus = req.query.status;
        const qSearch = (req.query.search || '').toLowerCase();

        let arr = await store.getAll();

        if (qStatus) {
            arr = arr.filter((x) => x.status === qStatus);
        }

        if (qSearch) {
            arr = arr.filter((x) => {
                return (
                    String(x.name).toLowerCase().includes(qSearch) ||
                    String(x.email).toLowerCase().includes(qSearch) ||
                    String(x.eventName).toLowerCase().includes(qSearch) ||
                    String(x.comment).toLowerCase().includes(qSearch) ||
                    String(x.suggestion).toLowerCase().includes(qSearch)
                );
            });
        }

        arr.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        res.json(arr);
    } catch (err) {
        next(err);
    }
});

router.get('/:id', async (req, res, next) => {
    try {
        const item = await store.getById(req.params.id);
        if (!item) return res.status(404).json({ error: 'Not found' });
        res.json(item);
    } catch (err) {
        next(err);
    }
});

router.put('/:id', async (req, res, next) => {
    try {
        const body = req.body || {};
        const patch = {};

        if (body.name !== undefined) patch.name = body.name;
        if (body.email !== undefined) patch.email = body.email;
        if (body.eventName !== undefined) patch.eventName = body.eventName;
        if (body.division !== undefined) {
            if (!DIVISIONS.includes(body.division)) return res.status(400).json({ error: `division must be one of ${DIVISIONS.join(', ')}` });
            patch.division = body.division;
        }
        if (body.rating !== undefined) {
            if (!Number.isInteger(body.rating) || body.rating < 1 || body.rating > 5) return res.status(400).json({ error: 'rating must be integer 1..5' });
            patch.rating = body.rating;
        }
        if (body.comment !== undefined) patch.comment = body.comment;
        if (body.suggestion !== undefined) patch.suggestion = body.suggestion;
        if (body.status !== undefined) {
            if (!STATUSES.includes(body.status)) return res.status(400).json({ error: `status must be one of ${STATUSES.join(', ')}` });
            patch.status = body.status;
        }

        const updated = await store.update(req.params.id, patch);
        if (!updated) return res.status(404).json({ error: 'Not found' });
        res.json(updated);
    } catch (err) {
        next(err);
    }
});

router.delete('/:id', async (req, res, next) => {
    try {
        const ok = await store.remove(req.params.id);
        if (!ok) return res.status(404).json({ error: 'Not found' });
        res.json({ deleted: true });
    } catch (err) {
        next(err);
    }
});

module.exports = router;