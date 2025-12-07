// Application State
const API_BASE = 'http://localhost:4000'; // change this in one place if port changes

let appState = {
  currentUser: null,
  authMode: 'login',
  activeTab: 'dashboard',

  // Predefined subjects
  subjects: ['MICROPROCESSORS AND ITS APPLICATIONS', 'ELECTROMAGNETIC THEORY', 'SIGNALS AND SYSTEMS', 'SOLID STATE DEVICES AND CIRCUITS'],

  // Data stores
  notes: [],
  assignments: [],

  // Attendance data per subject
  attendance: {
    'MICROPROCESSORS AND ITS APPLICATIONS': { attended: 0, total: 0, required: 75 },
    'ELECTROMAGNETIC THEORY': { attended: 0, total: 0, required: 75 },
    'SIGNALS AND SYSTEMS': { attended: 0, total: 0, required: 75 },
    'SOLID STATE DEVICES AND CIRCUITS': { attended: 0, total: 0, required: 75 },
  },

  // Syllabus data per subject
  syllabus: {
    'MICROPROCESSORS AND ITS APPLICATIONS': {
      topics: [
        'ARCHITECTURE OF A 16-BIT MICROPROCESSOR', 'CPU MODULE', 'INTERRUPT HANDLING', 'INTERFACING EXTERNAL DEVICES', 'INTRODUCTION TO PENTIUM'
      ],
      completed: []
    },
    'ELECTROMAGNETIC THEORY': {
      topics: [
        'CO-ORDINATE SYSTEM', 'TIME VARYING ELECTROMAGNETIC FIELDS', 'LINE WAVE PROPAGATION', 'TRANSMISSION LINES',
        'WAVEGUIDES', 'COMPUTATIONAL ELECTROMAGNETICS'
      ],
      completed: []
    },
    'SIGNALS AND SYSTEMS': {
      topics: [
        'SIGNALS AND THEIR REPRESENTATION', 'LINEAR TIME-INVARIANT (LTI) SYSTEMS', 'FOURIER SERIES REPRESENTATION', 'FOURIER TRANSFORMS',
        'LAPLACE TRANSFORMS', 'Z-TRANSFORMS', 'SAMPLING'
      ],
      completed: []
    },
    'SOLID STATE DEVICES AND CIRCUITS': {
      topics: [
        'BIPOLAR JUNCTION TRANSISTOR', 'MOSFET', 'FEEDBACK AMPLIFIERS', 'OSCILLATORS',
        'POWER AMPLIFIERS'
      ],
      completed: []
    }
  }
};

async function fetchAndRenderUser() {
  const token = localStorage.getItem('token');
  if (!token) return null;

  try {
    const res = await fetch(API_BASE + '/api/auth/me', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + token
      }
    });

    if (!res.ok) {
      if (res.status === 401 || res.status === 403) {
        localStorage.removeItem('token');
        localStorage.removeItem('userName');
      }
      return null;
    }

    const json = await res.json();
    const user = json.user || null;

    appState.currentUser = user;
    const topName = document.getElementById('userName');
    if (topName) topName.textContent = user?.name || 'Student';

    const sidebarName = document.getElementById('sidebarName');
    if (sidebarName) sidebarName.textContent = user?.name || '';

    const sidebarEmail = document.getElementById('sidebarEmail');
    if (sidebarEmail) sidebarEmail.textContent = user?.email || '';

    return user;
  } catch (err) {
    console.error('fetchAndRenderUser error', err);
    return null;
  }
}

// AUTHENTICATION FUNCTIONS
function switchAuthMode(mode) {
  appState.authMode = mode;

  const tabs = document.querySelectorAll('.auth-tab');
  tabs.forEach(tab => tab.classList.remove('active'));
  // if called from a click event the event is passed; if not, skip (safe)
  try { if (event && event.target) event.target.classList.add('active'); } catch (e) {}

  const registerFields = document.getElementById('registerFields');
  const buttonText = document.getElementById('authButtonText');

  if (mode === 'register') {
    registerFields.style.display = 'block';
    buttonText.textContent = 'Create Account';
  } else {
    registerFields.style.display = 'none';
    buttonText.textContent = 'Login';
  }
}

async function handleAuth() {
  const email = document.getElementById('authEmail').value.trim();
  const password = document.getElementById('authPassword').value;
  const name = document.getElementById('registerName') ? document.getElementById('registerName').value.trim() : '';
  const course = document.getElementById('registerCourse') ? document.getElementById('registerCourse').value : '';

  if (!email || !password) {
    alert('Please fill in all fields');
    return;
  }

  let endpoint = '';
  let body = {};

  if (appState.authMode === 'register') {
    if (!name) return alert('Please enter your name');
    if (!course) return alert('Please select your course');

    endpoint = API_BASE + '/api/auth/register';
    body = { name, email, password };
  } else {
    endpoint = API_BASE + '/api/auth/login';
    body = { email, password };
  }

  try {
    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      alert(data.error || data.message || 'Authentication failed');
      return;
    }

    if (data.token) localStorage.setItem("token", data.token);

    if (data.user) {
      appState.currentUser = data.user;
      localStorage.setItem('userName', data.user.name || '');
      localStorage.setItem('userId', data.user.id || data.user._id || '');
    }

    document.getElementById('userName').textContent = (data.user && data.user.name) ? data.user.name : 'Student';

    document.getElementById('authScreen').style.display = 'none';
    document.getElementById('appScreen').style.display = 'block';

    // Fetch server-backed notes and update UI/state
    await fetchAndRenderNotes();

    updateDashboard();
    renderSyllabus();
    renderAssignments();
    renderAttendance();

  } catch (err) {
    console.error('Auth network error:', err);
    alert("Network error. Check backend is running and CORS is configured.");
  }
}

function logout() {
  appState.currentUser = null;
  localStorage.removeItem('token');
  localStorage.removeItem('userName');
  localStorage.removeItem('userId');

  const authScreen = document.getElementById('authScreen');
  const appScreen = document.getElementById('appScreen');

  appScreen.style.display = 'none';
  authScreen.style.display = 'flex';

  document.getElementById('authEmail').value = '';
  document.getElementById('authPassword').value = '';
  if (document.getElementById('registerName')) document.getElementById('registerName').value = '';
  if (document.getElementById('registerCourse')) document.getElementById('registerCourse').value = '';
  document.getElementById('userName').textContent = 'Student';
}

// NAVIGATION
function switchTab(tabName, ev) {
  appState.activeTab = tabName;

  const navItems = document.querySelectorAll('.nav-item');
  navItems.forEach(item => item.classList.remove('active'));

  // Try to use event target first
  let clicked = null;
  if (ev && ev.target) {
    clicked = ev.target.closest('.nav-item');
  }
  // Fallback: find by data-tab attribute
  if (!clicked) {
    clicked = document.querySelector(`.nav-item[data-tab="${tabName}"]`);
  }
  if (clicked) clicked.classList.add('active');

  const sections = document.querySelectorAll('.content-section');
  sections.forEach(section => section.classList.remove('active'));
  const targetSection = document.getElementById(tabName);
  if (targetSection) targetSection.classList.add('active');

  if (tabName === 'notes') {
    fetchAndRenderNotes();
  }
}

// MODAL FUNCTIONS
function openModal(modalType) {
  const modalId = modalType + 'Modal';
  document.getElementById(modalId).classList.add('active');

  if (modalType === 'addAssignment') {
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('assignmentDeadline').value = today;
  }
}

function closeModal(modalType) {
  const modalId = modalType + 'Modal';
  document.getElementById(modalId).classList.remove('active');
}

// Mark assignment status UI behavior
document.addEventListener('DOMContentLoaded', () => {
  const statusSelect = document.getElementById('assignmentStatus');
  if (statusSelect) {
    statusSelect.addEventListener('change', function () {
      const marksField = document.getElementById('marksField');
      if (this.value === 'graded') marksField.style.display = 'block';
      else marksField.style.display = 'none';
    });
  }
});

// DASHBOARD FUNCTIONS
function updateDashboard() {
  document.getElementById('totalNotes').textContent = appState.notes.length;
  document.getElementById('pendingTasks').textContent = appState.assignments.filter(a => a.status === 'pending').length;

  let totalAttendance = 0;
  let subjectsWithData = 0;

  appState.subjects.forEach(subject => {
    const att = appState.attendance[subject];
    if (att.total > 0) {
      totalAttendance += (att.attended / att.total) * 100;
      subjectsWithData++;
    }
  });

  if (subjectsWithData > 0) {
    document.getElementById('avgAttendance').textContent = Math.round(totalAttendance / subjectsWithData) + '%';
  } else {
    document.getElementById('avgAttendance').textContent = '--';
  }

  renderAttendanceAlerts();
}

function renderAttendanceAlerts() {
  const alertsContainer = document.getElementById('attendanceAlerts');

  const shortAttendance = appState.subjects.filter(subject => {
    const att = appState.attendance[subject];
    return att.total > 0 && (att.attended / att.total) * 100 < att.required;
  });

  if (shortAttendance.length === 0) {
    alertsContainer.innerHTML = '<p style="color: #10b981;">All subjects meeting attendance requirements! 🎉</p>';
    return;
  }

  alertsContainer.innerHTML = shortAttendance.map(subject => {
    const att = appState.attendance[subject];
    const percentage = ((att.attended / att.total) * 100).toFixed(1);
    const needed = calculateClassesNeeded(att.attended, att.total, att.required);
    return `
      <div class="alert">
        <div class="alert-icon">⚠️</div>
        <div class="alert-content">
          <div class="alert-title">${subject}</div>
          <div class="alert-text">Current: ${percentage}% | Need ${needed} more classes</div>
        </div>
      </div>
    `;
  }).join('');
}

// NOTES FUNCTIONS
async function uploadNoteBackend() {
  const titleEl = document.getElementById('noteTitle');
  const subjectEl = document.getElementById('noteSubject');
  const categoryEl = document.getElementById('noteCategory');
  const fileEl = document.getElementById('noteFile');
  const uploadBtn = document.querySelector('#uploadNoteModal .btn-primary') || null;

  const title = titleEl ? titleEl.value.trim() : '';
  const subject = subjectEl ? subjectEl.value : '';
  const category = categoryEl ? categoryEl.value : '';
  const file = fileEl && fileEl.files ? fileEl.files[0] : null;

  if (!title || !subject || !category || !file) {
    alert("Please fill in all fields");
    return;
  }

  if (uploadBtn) { uploadBtn.disabled = true; uploadBtn.style.opacity = '0.6'; uploadBtn.textContent = 'Uploading...'; }

  const formData = new FormData();
  formData.append("title", title);
  formData.append("subject", subject);
  formData.append("category", category);
  formData.append("file", file);

  try {
    const token = localStorage.getItem("token") || '';
    console.log('upload - token present?', !!token);

    const postResponse = await fetch(API_BASE + "/api/notes/upload", {
      method: "POST",
      headers: { "Authorization": `Bearer ${token}` },
      body: formData
    });

    const text = await postResponse.text().catch(() => '');
    let json = {};
    try { json = text ? JSON.parse(text) : {}; } catch (e) { json = { rawText: text }; }

    console.log('POST /api/notes/upload response status:', postResponse.status, 'body:', json);

    if (!postResponse.ok) {
      const errMsg = json.error || json.message || `Upload failed (status ${postResponse.status})`;
      alert(errMsg);
      return;
    }

    alert("Upload successful!");

  } catch (err) {
    console.error('Network or fetch error during upload:', err);
    alert("Network error during upload");
    return;
  } finally {
    if (uploadBtn) { uploadBtn.disabled = false; uploadBtn.style.opacity = ''; uploadBtn.textContent = 'Upload'; }
  }

  // refresh notes and keep user on notes tab
  try {
    await fetchAndRenderNotes();
    closeModal("uploadNote");
    if (titleEl) titleEl.value = '';
    if (fileEl) fileEl.value = '';
  } catch (err) {
    console.error('Error when refreshing notes after upload:', err);
    alert('Upload succeeded but failed to refresh notes list. Check console / server.');
  }
}

// call this whenever you want to refresh notes from backend
async function fetchAndRenderNotes(page = 1, limit = 50) {
  const subjectRaw = document.getElementById('notesFilter') ? document.getElementById('notesFilter').value : 'all';
  const subjectFilter = subjectRaw ? subjectRaw.trim() : 'all';

  const typeFilterElement = document.getElementById('notesTypeFilter');
  const categoryRaw = typeFilterElement ? typeFilterElement.value : 'all';
  const categoryFilter = categoryRaw ? categoryRaw.trim() : 'all';

  const params = new URLSearchParams();
  if (subjectFilter && subjectFilter.toLowerCase() !== 'all') params.append('subject', subjectFilter);
  if (categoryFilter && categoryFilter.toLowerCase() !== 'all') params.append('category', categoryFilter);
  params.append('page', page);
  params.append('limit', limit);

  try {
    const token = localStorage.getItem('token') || '';
    const res = await fetch(API_BASE + '/api/notes?' + params.toString(), {
      headers: { 'Authorization': 'Bearer ' + token }
    });
    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      console.error('Failed to fetch notes', data);
      appState.notes = [];
      renderNotesUI();
      return;
    }

    appState.notes = (data.notes || []).map(n => ({
      id: n._id,
      title: n.title,
      subject: n.subject,
      category: n.category,
      fileName: n.originalName,
      uploadDate: n.createdAt ? new Date(n.createdAt).toLocaleDateString() : '',
      url: (n.url && n.url.startsWith('/')) ? (API_BASE + n.url) : n.url,
      tags: n.tags || [],
      uploadedBy: n.uploadedBy || null
    }));

    renderNotesUI();
    updateDashboard();
  } catch (err) {
    console.error('Error fetching notes:', err);
    appState.notes = [];
    renderNotesUI();
  }
}

// Renders notes from appState.notes into #notesGrid
function renderNotesUI() {
  const notesGrid = document.getElementById('notesGrid');
  if (!appState.notes || appState.notes.length === 0) {
    notesGrid.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">📄</div>
        <p style="font-size: 18px; color: #94a3b8; margin-bottom: 8px;">No notes found</p>
        <p style="color: #64748b; font-size: 14px;">Upload notes to get started</p>
      </div>`;
    return;
  }

  const loggedInId = (function () {
    const u = appState.currentUser || {};
    return String(u.id || u._id || u.userId || localStorage.getItem('userId') || '');
  })();

  notesGrid.innerHTML = appState.notes.map(note => {
    const ownerId = note.uploadedBy ? String(note.uploadedBy) : null;
    const canDelete = ownerId && loggedInId && ownerId === loggedInId;

    const safeTitle = escapeHtml(note.title || note.fileName || 'Untitled');
    const safeSubject = escapeHtml(note.subject || '');
    const safeCategory = escapeHtml(note.category || '');
    const safeDate = escapeHtml(note.uploadDate || '');
    const safeUrl = note.url ? escapeHtml(note.url) : '#';

    const tagsHtml = (note.tags || []).slice(0, 6)
      .map(t => `<span class="badge badge-blue" style="margin-right:6px;">${escapeHtml(t)}</span>`)
      .join('');

    return `
      <div class="note-card" onclick="openNote('${safeUrl}')" style="cursor:pointer;">
        <div class="note-header">
          <div>
            <div class="note-title">${safeTitle}</div>
            <div class="note-subject">${safeSubject}</div>
            <div class="note-tags" style="margin-top:6px;">
              ${tagsHtml}
            </div>
          </div>
          <span class="badge badge-orange badge-square">${safeCategory}</span>
        </div>

        <div
          class="note-footer"
          style="display:flex;justify-content:space-between;align-items:center;color:#94a3b8;font-size:14px;margin-top:12px;"
        >
          <span>${safeDate}</span>
          <div>
            ${ canDelete ? `<button onclick="event.stopPropagation(); deleteNoteBackend('${escapeHtml(note.id)}')"
              style="background:#b91c1c;border:1px solid #ef4444;color:#ffffff;cursor:pointer;font-size:14px;border-radius:999px;padding:6px 12px;">
              Delete
            </button>` : '' }
          </div>
        </div>
      </div>
    `;
  }).join('');
}

// small helper to avoid HTML injection
function escapeHtml(str = '') {
  return String(str).replace(/[&<>"'`=\/]/g, function (s) {
    return ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;','/':'&#x2F;','`':'&#x60;','=':'&#x3D;' })[s];
  });
}

function openNote(url) {
  if (!url || url === '#') return;
  window.open(url, '_blank');
}

async function deleteNoteBackend(noteId) {
  if (!confirm('Delete this note?')) return;

  const index = appState.notes.findIndex(n => String(n.id) === String(noteId));
  if (index === -1) return alert('Note not found in UI');

  const backupNote = appState.notes[index];

  // optimistic UI update
  appState.notes.splice(index, 1);
  renderNotesUI();
  updateDashboard();

  const token = localStorage.getItem('token') || '';

  try {
    const res = await fetch(API_BASE + '/api/notes/' + encodeURIComponent(noteId), {
      method: 'DELETE',
      headers: { 'Authorization': 'Bearer ' + token }
    });

    if (!res.ok) {
      appState.notes.splice(index, 0, backupNote);
      renderNotesUI();
      updateDashboard();
      const data = await res.json().catch(() => ({}));
      alert(data.error || 'Delete failed on server');
      return;
    }

    // success — keep removed
  } catch (err) {
    appState.notes.splice(index, 0, backupNote);
    renderNotesUI();
    updateDashboard();
    console.error('Network error while deleting note:', err);
    alert('Network error while deleting note. Try again.');
  }
}

// SYLLABUS FUNCTIONS
function renderSyllabus() {
  const syllabusContainer = document.getElementById('syllabusContainer');
  const selectedSubject = document.getElementById('syllabusSubjectSelect').value;
  const subjectData = appState.syllabus[selectedSubject];

  syllabusContainer.innerHTML = `
    <div class="card">
      <h3 class="card-title">${selectedSubject} - Topics</h3>
      <div style="display: grid; gap: 12px;">
        ${subjectData.topics.map((topic, index) => {
          const isCompleted = subjectData.completed.includes(topic);
          return `
            <div style="display: flex; align-items: center; gap: 12px; padding: 12px; background: ${isCompleted ? 'rgba(16, 185, 129, 0.1)' : '#0f172a'}; border-radius: 8px; border: 1px solid ${isCompleted ? '#10b981' : '#334155'};">
              <input type="checkbox" id="topic-${index}" ${isCompleted ? 'checked' : ''} onchange="toggleTopic('${selectedSubject}', '${topic}')" style="width: 20px; height: 20px; cursor: pointer;" />
              <label for="topic-${index}" style="flex: 1; cursor: pointer; color: ${isCompleted ? '#34d399' : '#e2e8f0'}; font-weight: ${isCompleted ? '600' : '400'};">${topic}</label>
            </div>
          `;
        }).join('')}
      </div>
      <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #334155;">
        <div style="display: flex; justify-content: between; align-items: center;">
          <span style="color: #94a3b8;">Progress:</span>
          <span style="color: #f97316; font-weight: 700; font-size: 20px;">${subjectData.completed.length}/${subjectData.topics.length} Topics</span>
        </div>
        <div class="progress-bar" style="margin-top: 12px;">
          ${(() => {
              const percent = (subjectData.completed.length / subjectData.topics.length) * 100;
              let color = '#ef4444'; // red default
              if (percent > 70) color = '#22c55e'; // green
              else if (percent > 30) color = '#eab308'; // yellow
              return `<div class="progress-fill" style="width: ${percent}%; background: ${color};"></div>`;
          })()}
        </div>
      </div>
    </div>
  `;
}

function toggleTopic(subject, topic) {
  const subjectData = appState.syllabus[subject];
  const index = subjectData.completed.indexOf(topic);
  if (index > -1) subjectData.completed.splice(index, 1);
  else subjectData.completed.push(topic);
  renderSyllabus();
}

// ASSIGNMENTS FUNCTIONS
function addAssignment() {
  const title = document.getElementById('assignmentTitle').value;
  const subject = document.getElementById('assignmentSubject').value;
  const deadline = document.getElementById('assignmentDeadline').value;
  const status = document.getElementById('assignmentStatus').value;
  const marks = document.getElementById('assignmentMarks').value;

  if (!title || !deadline) {
    alert('Please fill in all required fields');
    return;
  }

  const newAssignment = { id: Date.now(), title, subject, deadline, status, marks: status === 'graded' && marks ? parseInt(marks) : null };
  appState.assignments.push(newAssignment);

  document.getElementById('assignmentTitle').value = '';
  document.getElementById('assignmentDeadline').value = '';
  document.getElementById('assignmentStatus').value = 'pending';
  document.getElementById('assignmentMarks').value = '';
  document.getElementById('marksField').style.display = 'none';

  closeModal('addAssignment');
  renderAssignments();
  updateDashboard();
}

function renderAssignments() {
  const assignmentsContainer = document.getElementById('assignmentsContainer');
  if (appState.assignments.length === 0) {
    assignmentsContainer.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">✅</div>
        <p style="font-size: 18px; color: #94a3b8; margin-bottom: 8px;">No assignments yet</p>
        <p style="color: #64748b; font-size: 14px;">Click "Add Assignment" to track your coursework</p>
      </div>`;
    return;
  }

  assignmentsContainer.innerHTML = appState.assignments.map(assignment => {
    const statusClass = assignment.status === 'pending' ? 'badge-yellow' : assignment.status === 'submitted' ? 'badge-blue' : 'badge-green';
    const statusText = assignment.status.charAt(0).toUpperCase() + assignment.status.slice(1);
    return `
      <div class="card">
        <div class="assignment-header">
          <div class="assignment-info">
            <div class="assignment-title">${assignment.title}</div>
            <div style="color: #94a3b8; margin-bottom: 8px;">${assignment.subject}</div>
            <div style="color: #64748b; font-size: 14px;">Deadline: ${new Date(assignment.deadline).toLocaleDateString()}</div>
          </div>
          <div style="text-align: right; display: flex; flex-direction: column; align-items: flex-end; gap: 8px;">
            <span class="badge ${statusClass}">${statusText}</span>
            ${assignment.marks !== null ? `<div class="assignment-marks">${assignment.marks}/100</div>` : ''}
            <button onclick="deleteAssignment(${assignment.id})" style="background: none; border: none; color: #ef4444; cursor: pointer; font-size: 18px;">Delete</button>
          </div>
        </div>
      </div>`;
  }).join('');
}

function deleteAssignment(assignmentId) {
  if (confirm('Are you sure you want to delete this assignment?')) {
    appState.assignments = appState.assignments.filter(a => a.id !== assignmentId);
    renderAssignments();
    updateDashboard();
  }
}

// ATTENDANCE FUNCTIONS
function markAttendance(subject, status) {
  const att = appState.attendance[subject];
  att.total++;
  if (status === 'present') att.attended++;
  renderAttendance();
  updateDashboard();
}

function calculateClassesNeeded(attended, total, required) {
  const currentPercentage = (attended / total) * 100;
  if (currentPercentage >= required) return 0;
  return Math.ceil((required * total - 100 * attended) / (100 - required));
}

function renderAttendance() {
  const attendanceContainer = document.getElementById('attendanceContainer');
  attendanceContainer.innerHTML = appState.subjects.map(subject => {
    const att = appState.attendance[subject];
    const percentage = att.total > 0 ? ((att.attended / att.total) * 100).toFixed(1) : '--';
    const isShort = att.total > 0 && (att.attended / att.total) * 100 < att.required;
    const needed = att.total > 0 ? calculateClassesNeeded(att.attended, att.total, att.required) : 0;
    return `
      <div class="attendance-subject-card">
        <div class="attendance-header">
          <h3 class="attendance-subject-title">${subject}</h3>
          <div class="attendance-buttons">
            <button class="btn-present" onclick="markAttendance('${subject}', 'present')">✓ Present</button>
            <button class="btn-absent" onclick="markAttendance('${subject}', 'absent')">✗ Absent</button>
          </div>
        </div>
        <div class="attendance-details">
          <div class="attendance-left"><p style="color: #94a3b8; margin-bottom: 8px;">${att.attended} / ${att.total} classes attended</p></div>
          <div class="attendance-right">
            <div class="attendance-percentage ${isShort ? 'red' : (att.total > 0 ? 'green' : '')}" style="color: ${att.total === 0 ? '#94a3b8' : ''};">${percentage}${att.total > 0 ? '%' : ''}</div>
            <p style="color: #94a3b8; font-size: 14px;">Required: ${att.required}%</p>
          </div>
        </div>
        ${att.total > 0 ? `<div class="progress-bar"><div class="progress-fill ${isShort ? 'red' : 'green'}" style="width: ${Math.min(percentage, 100)}%"></div></div>` : ''}
        ${isShort ? `<div class="alert" style="margin-top: 12px;"><div class="alert-icon">⚠️</div><div class="alert-content"><p class="alert-text">Attend ${needed} more ${needed === 1 ? 'class' : 'classes'} to meet minimum requirement</p></div></div>` : ''}
      </div>`;
  }).join('');
}

window.addEventListener('DOMContentLoaded', async () => {
  const authScreen = document.getElementById('authScreen');
  const appScreen = document.getElementById('appScreen');

  authScreen.style.display = 'flex';
  appScreen.style.display = 'none';

  const user = await fetchAndRenderUser();
  if (user) {
    authScreen.style.display = 'none';
    appScreen.style.display = 'block';
    updateDashboard();
    await fetchAndRenderNotes();
    renderSyllabus();
    renderAssignments();
    renderAttendance();
  }

  // add data-tab attributes fallback for nav if not present (optional safety)
  document.querySelectorAll('.nav-item').forEach(item => {
    if (!item.dataset.tab) {
      const text = (item.innerText || '').trim().toLowerCase();
      if (text.includes('note')) item.dataset.tab = 'notes';
      else if (text.includes('dashboard')) item.dataset.tab = 'dashboard';
      else if (text.includes('syllabus')) item.dataset.tab = 'syllabus';
      else if (text.includes('assignment')) item.dataset.tab = 'assignments';
      else if (text.includes('attendance')) item.dataset.tab = 'attendance';
    }
  });

  console.log('🔥 Hellfire Scholar - Subject-wise Edition initialized! 📚');
});