const fs = require('fs').promises;
const path = require('path');

const FILE_PATH = process.env.FEEDBACK_FILE || path.join(__dirname, 'feedback.json');
const USE_IN_MEMORY = process.env.FILE_STORAGE === 'none';

console.log('store.js: FILE_PATH=', FILE_PATH, 'USE_IN_MEMORY=', USE_IN_MEMORY);

let memoryData = null;

async function ensureFile() {
    if (USE_IN_MEMORY) return;
    try {
        await fs.access(FILE_PATH);
    } catch (err) {
        // create file and parent dir klo ga ada/missing
        try {
            await fs.mkdir(path.dirname(FILE_PATH), { recursive: true });
        } catch (e) {
            // ignore
        }
        await fs.writeFile(FILE_PATH, '[]', 'utf8');
    }
}

async function readAll() {
    if (USE_IN_MEMORY) {
        memoryData = memoryData || [];
        return memoryData;
    }

    await ensureFile();
    try {
        const raw = await fs.readFile(FILE_PATH, 'utf8');
        return JSON.parse(raw || '[]');
    } catch (err) {
        console.error('store.js: failed to read/parse feedback file:', err);
        try {
            await fs.writeFile(FILE_PATH, '[]', 'utf8');
            console.log('store.js: reset feedback file to []');
        } catch (e) {
            console.error('store.js: failed to reset feedback file:', e);
        }
        return [];
    }
}

async function writeAll(arr) {
    if (USE_IN_MEMORY) {
        memoryData = arr;
        return;
    }
    await fs.writeFile(FILE_PATH, JSON.stringify(arr, null, 2), 'utf8');
}

module.exports = {
    async getAll() {
        return await readAll();
    },

    async getById(id) {
        const arr = await readAll();
        return arr.find((x) => String(x.id) === String(id));
    },

    async create(item) {
        const arr = await readAll();
        arr.push(item);
        await writeAll(arr);
        return item;
    },

    async update(id, patch) {
        const arr = await readAll();
        const idx = arr.findIndex((x) => String(x.id) === String(id));
        if (idx === -1) return null;
        const updated = { ...arr[idx], ...patch };
        arr[idx] = updated;
        await writeAll(arr);
        return updated;
    },

    async remove(id) {
        const arr = await readAll();
        const idx = arr.findIndex((x) => String(x.id) === String(id));
        if (idx === -1) return false;
        arr.splice(idx, 1);
        await writeAll(arr);
        return true;
    },

    async resetWith(seedArray) {
        await writeAll(seedArray || []);
    }
};