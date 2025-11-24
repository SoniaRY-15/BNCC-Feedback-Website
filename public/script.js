const API_URL = '/api/feedback';

let allFeedbacks = [];
let currentRating = 5;
let editingId = null;

document.addEventListener('DOMContentLoaded', () => {
    // Set default rating
    selectRating(5);
});

function showView(viewName) {
    document.querySelectorAll('.view').forEach(view => {
        view.classList.remove('active');
    });

    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.remove('active');
    });

    if (viewName === 'form') {
        document.getElementById('formView').classList.add('active');
        document.getElementById('btnForm').classList.add('active');
    } else {
        document.getElementById('adminView').classList.add('active');
        document.getElementById('btnAdmin').classList.add('active');
        loadFeedbacks();
    }
}

function selectRating(rating) {
    currentRating = rating;

    document.querySelectorAll('.rating-btn').forEach(btn => {
        btn.classList.remove('active');
    });

    document.querySelector(`[data-rating="${rating}"]`).classList.add('active');
}

async function submitFeedback() {
    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim();
    const eventName = document.getElementById('eventName').value.trim();
    const division = document.getElementById('division').value;
    const comment = document.getElementById('comment').value.trim();
    const suggestion = document.getElementById('suggestion').value.trim();

    if (!name || !email || !eventName || !division) {
        alert('Mohon lengkapi semua field yang wajib diisi!');
        return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        alert('Format email tidak valid!');
        return;
    }

    const feedbackData = {
        name,
        email,
        eventName,
        division,
        rating: currentRating,
        comment,
        suggestion
    };

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(feedbackData)
        });

        if (response.ok) {
            alert('Feedback berhasil dikirim! Terima kasih atas partisipasi Anda.');
            clearForm();
        } else {
            const error = await response.json();
            alert('Gagal mengirim feedback: ' + (error.message || 'Unknown error'));
        }
    } catch (error) {
        console.error('Error submitting feedback:', error);
        alert('Terjadi kesalahan saat mengirim feedback. Pastikan backend server sudah berjalan.');
    }
}

function clearForm() {
    document.getElementById('name').value = '';
    document.getElementById('email').value = '';
    document.getElementById('eventName').value = '';
    document.getElementById('division').value = '';
    document.getElementById('comment').value = '';
    document.getElementById('suggestion').value = '';
    selectRating(5);
}

async function loadFeedbacks() {
    const loadingSpinner = document.getElementById('loadingSpinner');
    const emptyState = document.getElementById('emptyState');
    const feedbackList = document.getElementById('feedbackList');

    loadingSpinner.style.display = 'block';
    emptyState.style.display = 'none';
    feedbackList.innerHTML = '';

    try {
        const response = await fetch(API_URL);
        if (response.ok) {
            allFeedbacks = await response.json();
            loadingSpinner.style.display = 'none';

            if (allFeedbacks.length === 0) {
                emptyState.style.display = 'block';
            } else {
                renderFeedbacks(allFeedbacks);
            }
        } else {
            throw new Error('Failed to fetch feedbacks');
        }
    } catch (error) {
        console.error('Error loading feedbacks:', error);
        loadingSpinner.style.display = 'none';
        emptyState.style.display = 'block';
        emptyState.innerHTML = '<p>Gagal memuat data. Pastikan backend server sudah berjalan.</p>';
    }
}

function renderFeedbacks(feedbacks) {
    const feedbackList = document.getElementById('feedbackList');
    feedbackList.innerHTML = '';

    if (feedbacks.length === 0) {
        document.getElementById('emptyState').style.display = 'block';
        return;
    }

    document.getElementById('emptyState').style.display = 'none';

    feedbacks.forEach(feedback => {
        const feedbackItem = createFeedbackItem(feedback);
        feedbackList.appendChild(feedbackItem);
    });
}

function createFeedbackItem(feedback) {
    const div = document.createElement('div');
    div.className = 'feedback-item';
    div.id = `feedback-${feedback.id}`;

    if (editingId === feedback.id) {
        div.innerHTML = createEditForm(feedback);
    } else {
        div.innerHTML = createFeedbackDisplay(feedback);
    }

    return div;
}

function createFeedbackDisplay(feedback) {
    const statusClass = `status-${feedback.status}`;
    const statusIcon = getStatusIcon(feedback.status);
    const stars = '⭐'.repeat(feedback.rating);
    const date = new Date(feedback.createdAt).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    });

    return `
        <div class="feedback-header">
            <div class="feedback-user">
                <h3>${feedback.name}</h3>
                <p>${feedback.email}</p>
            </div>
            <span class="status-badge ${statusClass}">
                ${statusIcon} ${feedback.status}
            </span>
        </div>
        
        <div class="feedback-details">
            <div class="detail-item">
                <p>Event</p>
                <p>${feedback.eventName}</p>
            </div>
            <div class="detail-item">
                <p>Divisi</p>
                <p>${feedback.division}</p>
            </div>
            <div class="detail-item">
                <p>Rating</p>
                <p>${stars}</p>
            </div>
            <div class="detail-item">
                <p>Tanggal</p>
                <p>${date}</p>
            </div>
        </div>
        
        ${feedback.comment ? `
            <div class="feedback-text">
                <p>Komentar:</p>
                <p>${feedback.comment}</p>
            </div>
        ` : ''}
        
        ${feedback.suggestion ? `
            <div class="feedback-text">
                <p>Saran:</p>
                <p>${feedback.suggestion}</p>
            </div>
        ` : ''}
        
        <div class="feedback-actions">
            <button class="btn-action btn-edit" onclick="editFeedback('${feedback.id}')">
                ✏️ Edit
            </button>
            <button class="btn-action btn-delete" onclick="deleteFeedback('${feedback.id}')">
                🗑️ Hapus
            </button>
        </div>
    `;
}

function createEditForm(feedback) {
    return `
        <div class="edit-form">
            <div>
                <label>Event Name</label>
                <input type="text" id="edit-eventName" value="${feedback.eventName}">
            </div>
            
            <div>
                <label>Division</label>
                <select id="edit-division">
                    <option value="LnT" ${feedback.division === 'LnT' ? 'selected' : ''}>LnT</option>
                    <option value="EEO" ${feedback.division === 'EEO' ? 'selected' : ''}>EEO</option>
                    <option value="PR" ${feedback.division === 'PR' ? 'selected' : ''}>PR</option>
                    <option value="HRD" ${feedback.division === 'HRD' ? 'selected' : ''}>HRD</option>
                    <option value="RnD" ${feedback.division === 'RnD' ? 'selected' : ''}>RnD</option>
                </select>
            </div>
            
            <div>
                <label>Rating: <span id="edit-rating-display">${feedback.rating}</span></label>
                <div class="rating-container">
                    <button type="button" class="rating-btn ${feedback.rating === 1 ? 'active' : ''}" onclick="updateEditRating(1)">1</button>
                    <button type="button" class="rating-btn ${feedback.rating === 2 ? 'active' : ''}" onclick="updateEditRating(2)">2</button>
                    <button type="button" class="rating-btn ${feedback.rating === 3 ? 'active' : ''}" onclick="updateEditRating(3)">3</button>
                    <button type="button" class="rating-btn ${feedback.rating === 4 ? 'active' : ''}" onclick="updateEditRating(4)">4</button>
                    <button type="button" class="rating-btn ${feedback.rating === 5 ? 'active' : ''}" onclick="updateEditRating(5)">5</button>
                </div>
            </div>
            
            <div>
                <label>Comment</label>
                <textarea id="edit-comment" rows="3">${feedback.comment || ''}</textarea>
            </div>
            
            <div>
                <label>Suggestion</label>
                <textarea id="edit-suggestion" rows="3">${feedback.suggestion || ''}</textarea>
            </div>
            
            <div>
                <label>Status</label>
                <select id="edit-status">
                    <option value="open" ${feedback.status === 'open' ? 'selected' : ''}>Open</option>
                    <option value="in-review" ${feedback.status === 'in-review' ? 'selected' : ''}>In Review</option>
                    <option value="resolved" ${feedback.status === 'resolved' ? 'selected' : ''}>Resolved</option>
                </select>
            </div>
            
            <div class="feedback-actions">
                <button class="btn-action btn-save" onclick="saveFeedback('${feedback.id}')">
                    💾 Simpan
                </button>
                <button class="btn-action btn-cancel" onclick="cancelEdit()">
                    ❌ Batal
                </button>
            </div>
        </div>
    `;
}

function getStatusIcon(status) {
    switch (status) {
        case 'resolved': return '✅';
        case 'in-review': return '⏰';
        default: return '🔵';
    }
}

function editFeedback(id) {
    editingId = id;
    const feedback = allFeedbacks.find(f => f.id === id);
    if (feedback) {
        const feedbackItem = document.getElementById(`feedback-${id}`);
        feedbackItem.innerHTML = createEditForm(feedback);
    }
}

let editRating = 5;
function updateEditRating(rating) {
    editRating = rating;
    document.getElementById('edit-rating-display').textContent = rating;

    // Update visual state
    const container = event.target.parentElement;
    container.querySelectorAll('.rating-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');
}

async function saveFeedback(id) {
    const eventName = document.getElementById('edit-eventName').value.trim();
    const division = document.getElementById('edit-division').value;
    const rating = editRating;
    const comment = document.getElementById('edit-comment').value.trim();
    const suggestion = document.getElementById('edit-suggestion').value.trim();
    const status = document.getElementById('edit-status').value;

    if (!eventName || !division) {
        alert('Event Name dan Division wajib diisi!');
        return;
    }

    const updateData = {
        eventName,
        division,
        rating,
        comment,
        suggestion,
        status
    };

    try {
        const response = await fetch(`${API_URL}/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(updateData)
        });

        if (response.ok) {
            alert('Feedback berhasil diupdate!');
            editingId = null;
            loadFeedbacks();
        } else {
            alert('Gagal mengupdate feedback');
        }
    } catch (error) {
        console.error('Error updating feedback:', error);
        alert('Terjadi kesalahan saat mengupdate feedback');
    }
}

function cancelEdit() {
    editingId = null;
    loadFeedbacks();
}

// Delete Feedback
async function deleteFeedback(id) {
    if (!confirm('Yakin ingin menghapus feedback ini?')) {
        return;
    }

    try {
        const response = await fetch(`${API_URL}/${id}`, {
            method: 'DELETE'
        });

        if (response.ok) {
            alert('Feedback berhasil dihapus');
            loadFeedbacks();
        } else {
            alert('Gagal menghapus feedback');
        }
    } catch (error) {
        console.error('Error deleting feedback:', error);
        alert('Terjadi kesalahan saat menghapus feedback');
    }
}

function filterFeedbacks() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const statusFilter = document.getElementById('statusFilter').value;

    const filtered = allFeedbacks.filter(feedback => {
        const matchesSearch =
            feedback.name.toLowerCase().includes(searchTerm) ||
            feedback.email.toLowerCase().includes(searchTerm) ||
            feedback.eventName.toLowerCase().includes(searchTerm);

        const matchesStatus = statusFilter === 'all' || feedback.status === statusFilter;

        return matchesSearch && matchesStatus;
    });

    renderFeedbacks(filtered);
}
