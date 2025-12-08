// Application State
const API_BASE = 'http://localhost:4000'; // change this in one place if port changes

let appState = {
  currentUser: null,
  authMode: 'login',
  activeTab: 'dashboard',
  currentCourse: null,

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

// Course-wise 4th semester subjects
const courseSubjects = {
  "Electronics and Communication Engineering": [
    "VLSI TECHNOLOGY",
    "DIGITAL COMMUNICATION",
    "AUTOMATIC CONTROL SYSTEMS",
    "ANTENNA AND WAVE PROPAGATION",
    "MICROCONTROLLERS AND EMBEDDED SYSTEMS",
    "MANAGEMENT CONCEPTS AND APPLICATIONS"
  ],
  "Electrical Engineering": [
    "ELECTRICAL MACHINES-I",
    "POWER ELECTRONICS-I",
    "ELECTRICAL MEASUREMENT & MEASURING INSTRUMENTS",
    "SIGNALS & SYSTEMS",
    "DIGITAL ELECTRONICS",
    "ENGINEERING ECONOMICS & INDUSTRIAL MANAGEMENT"
  ]
};

// Units / topics for each subject (used in syllabus section)
const syllabusData = {
  "VLSI TECHNOLOGY": [
    "Unit 1 – Introduction and basic fabrication steps",
    "Unit 2 – Oxidation, diffusion, ion implantation",
    "Unit 3 – Lithography and etching",
    "Unit 4 – Metallization and interconnects",
    "Unit 5 – CMOS process integration"
  ],
  "DIGITAL COMMUNICATION": [
    "Unit 1 – Sampling and PCM",
    "Unit 2 – Baseband digital transmission",
    "Unit 3 – Passband digital modulation",
    "Unit 4 – Error control coding basics",
    "Unit 5 – Performance over noisy channels"
  ],
  "AUTOMATIC CONTROL SYSTEMS": [
    "Unit 1 – Modelling of control systems",
    "Unit 2 – Time domain analysis",
    "Unit 3 – Root locus",
    "Unit 4 – Frequency response",
    "Unit 5 – State space analysis"
  ],
  "ANTENNA AND WAVE PROPAGATION": [
    "Unit 1 – Antenna fundamentals",
    "Unit 2 – Linear and array antennas",
    "Unit 3 – Aperture and microstrip antennas",
    "Unit 4 – Ground wave and sky wave propagation",
    "Unit 5 – Space wave and tropospheric propagation"
  ],
  "MICROCONTROLLERS AND EMBEDDED SYSTEMS": [
    "Unit 1 – Microcontroller architecture",
    "Unit 2 – Instruction set and programming",
    "Unit 3 – Timers, interrupts and I/O",
    "Unit 4 – Serial communication interfaces",
    "Unit 5 – Embedded system design basics"
  ],
  "MANAGEMENT CONCEPTS AND APPLICATIONS": [
    "Unit 1 – Basics of management",
    "Unit 2 – Planning and organizing",
    "Unit 3 – Staffing and directing",
    "Unit 4 – Controlling",
    "Unit 5 – Modern management practices"
  ],
  "ELECTRICAL MACHINES-I": [
    "Unit 1 – Magnetic circuits and transformers review",
    "Unit 2 – DC machines basics",
    "Unit 3 – DC motor characteristics and testing",
    "Unit 4 – Three-phase induction motor",
    "Unit 5 – Single-phase motors and applications"
  ],
  "POWER ELECTRONICS-I": [
    "Unit 1 – Power semiconductor devices",
    "Unit 2 – AC–DC converters (rectifiers)",
    "Unit 3 – DC–DC converters (choppers)",
    "Unit 4 – DC–AC inverters",
    "Unit 5 – AC voltage controllers"
  ],
  "ELECTRICAL MEASUREMENT & MEASURING INSTRUMENTS": [
    "Unit 1 – Measurement principles and errors",
    "Unit 2 – Analog indicating instruments",
    "Unit 3 – Bridges and potentiometers",
    "Unit 4 – Instrument transformers",
    "Unit 5 – Electronic measuring instruments"
  ],
  "SIGNALS & SYSTEMS": [
    "Unit 1 – Continuous-time signals and systems",
    "Unit 2 – Discrete-time signals and systems",
    "Unit 3 – Fourier series and transforms",
    "Unit 4 – Laplace and Z-transforms",
    "Unit 5 – Sampling and reconstruction"
  ],
  "DIGITAL ELECTRONICS": [
    "Unit 1 – Number systems and Boolean algebra",
    "Unit 2 – Combinational logic design",
    "Unit 3 – Sequential logic and flip-flops",
    "Unit 4 – Counters and shift registers",
    "Unit 5 – Logic families and memories"
  ],
  "ENGINEERING ECONOMICS & INDUSTRIAL MANAGEMENT": [
    "Unit 1 – Basics of engineering economics",
    "Unit 2 – Cost concepts and break-even analysis",
    "Unit 3 – Time value of money",
    "Unit 4 – Project evaluation techniques",
    "Unit 5 – Industrial management fundamentals"
  ]
};

function getCurrentCourse() {
  return appState.currentCourse || localStorage.getItem('course') || 'Electronics and Communication Engineering';
}

function getSubjectSelectionStorageKey(course) {
  return `syllabusSubjects_${course}`;
}

function loadSelectedSubjectsForCourse(course) {
  const key = getSubjectSelectionStorageKey(course);
  const saved = localStorage.getItem(key);
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length) return parsed;
    } catch (e) {}
  }
  return courseSubjects[course] ? [...courseSubjects[course]] : [];
}

function saveSelectedSubjectsForCourse(course, subjects) {
  const key = getSubjectSelectionStorageKey(course);
  localStorage.setItem(key, JSON.stringify(subjects));
}

function getCompletedTopicsKey(subject) {
  return `syllabusCompleted_${subject}`;
}

function loadCompletedTopics(subject) {
  const key = getCompletedTopicsKey(subject);
  const saved = localStorage.getItem(key);
  if (!saved) return [];
  try {
    const parsed = JSON.parse(saved);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    return [];
  }
}

function saveCompletedTopics(subject, topics) {
  const key = getCompletedTopicsKey(subject);
  localStorage.setItem(key, JSON.stringify(topics));
}

function populateSubjectDropdowns() {
  const course = getCurrentCourse();
  const subjects = loadSelectedSubjectsForCourse(course);

  const uploadSelect = document.getElementById('noteSubject');
  if (uploadSelect) {
    uploadSelect.innerHTML = '<option value="">Select Subject</option>' +
      subjects.map(s => `<option value="${s}">${s}</option>`).join('');
  }

  const notesFilter = document.getElementById('notesFilter');
  if (notesFilter) {
    const previous = notesFilter.value;
    notesFilter.innerHTML = '<option value="all">All Subjects</option>' +
      subjects.map(s => `<option value="${s}">${s}</option>`).join('');
    if (previous && Array.from(notesFilter.options).some(o => o.value === previous)) {
      notesFilter.value = previous;
    }
  }

  const assignmentSubject = document.getElementById('assignmentSubject');
  if (assignmentSubject) {
    assignmentSubject.innerHTML = '<option value="">Select Subject</option>' +
      subjects.map(s => `<option value="${s}">${s}</option>`).join('');
  }
}

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
    localStorage.setItem('course', course);

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

    const savedCourse = localStorage.getItem('course') || course || 'Electronics and Communication Engineering';
    appState.currentCourse = savedCourse;

    document.getElementById('userName').textContent = (data.user && data.user.name) ? data.user.name : 'Student';

    document.getElementById('authScreen').style.display = 'none';
    document.getElementById('appScreen').style.display = 'block';

    // Fetch server-backed notes and update UI/state
    await fetchAndRenderNotes();

    updateDashboard();
    initSyllabus();
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
  localStorage.removeItem('course');

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
  // basic stats
  document.getElementById('totalNotes').textContent = appState.notes.length;
  document.getElementById('pendingTasks').textContent =
    appState.assignments.filter(a => a.status === 'pending').length;

  // average attendance
  let totalAttendance = 0;
  let subjectsWithData = 0;

  // use the active subjects for the current course
  const activeSubjects = loadSelectedSubjectsForCourse(getCurrentCourse());
  activeSubjects.forEach(subject => {
    // make sure attendance object exists for this subject
    if (!appState.attendance[subject]) {
      appState.attendance[subject] = { attended: 0, total: 0, required: 75 };
    }

    const att = appState.attendance[subject];
    if (att.total > 0) {
      totalAttendance += (att.attended / att.total) * 100;
      subjectsWithData++;
    }
  });

  if (subjectsWithData > 0) {
    document.getElementById('avgAttendance').textContent =
      Math.round(totalAttendance / subjectsWithData) + '%';
  } else {
    document.getElementById('avgAttendance').textContent = '--';
  }

  // panels on the dashboard
  renderAttendanceAlerts();
  renderTaskAlerts();
  renderReminderAlerts();
  showTodayFocus(); // optional auto-refresh
}

function renderAttendanceAlerts() {
  const alertsContainer = document.getElementById('attendanceAlerts');
  if (!alertsContainer) return;

  const activeSubjects = loadSelectedSubjectsForCourse(getCurrentCourse());

  const shortAttendance = activeSubjects.filter(subject => {
    // ensure attendance entry exists
    if (!appState.attendance[subject]) {
      appState.attendance[subject] = { attended: 0, total: 0, required: 75 };
    }
    const att = appState.attendance[subject];
    return att.total > 0 && (att.attended / att.total) * 100 < att.required;
  });

  if (shortAttendance.length === 0) {
    alertsContainer.innerHTML =
      '<p style="color: #10b981;">All subjects meeting attendance requirements! 🎉</p>';
    return;
  }

  alertsContainer.innerHTML = shortAttendance
    .map(subject => {
      const att = appState.attendance[subject];
      const percentage = ((att.attended / att.total) * 100).toFixed(1);
      const needed = calculateClassesNeeded(
        att.attended,
        att.total,
        att.required
      );
      return `
        <div class="alert">
          <div class="alert-icon">⚠️</div>
          <div class="alert-content">
            <div class="alert-title">${subject}</div>
            <div class="alert-text">Current: ${percentage}% | Need ${needed} more classes</div>
          </div>
        </div>
      `;
    })
    .join('');
}
// TASK ALERTS – show which tasks are pending
function renderTaskAlerts() {
    const container = document.getElementById('taskAlerts');
    if (!container) return; // in case HTML not updated

    const pending = appState.assignments.filter(a => a.status === 'pending');

    if (pending.length === 0) {
        container.innerHTML = `
            <div class="alert-chip ok-chip">
                ✅ No pending tasks right now
            </div>
        `;
        return;
    }

    container.innerHTML = pending
        .map(a => {
            const days = getDaysFromToday(a.deadline);
            let whenText = '';
            if (days === 0) whenText = 'Due today';
            else if (days === 1) whenText = 'Due tomorrow';
            else if (typeof days === 'number')
                whenText = `Due in ${days} day${days === 1 ? '' : 's'}`;

            return `
                <div class="alert-chip warning-chip">
                    <strong>${escapeHtml(a.title)}</strong>
                    <span>(${escapeHtml(a.subject || 'General')})</span>
                    <span> • ${whenText || ''}</span>
                </div>
            `;
        })
        .join('');
}
// ALERTS & REMINDERS – combines low attendance + near / overdue tasks
function renderReminderAlerts() {
    const container = document.getElementById('reminderAlerts');
    if (!container) return;

    const reminders = [];

    // 1) Attendance-based reminders (reuse logic of "short attendance")
    appState.subjects.forEach(subject => {
        const att = appState.attendance[subject];
        if (att.total > 0) {
            const percentage = (att.attended / att.total) * 100;
            if (percentage < att.required) {
                const needed = calculateClassesNeeded(att.attended, att.total, att.required);
                reminders.push({
                    type: 'attendance',
                    message: `${subject}: Attend ${needed} more class${needed === 1 ? '' : 'es'} to reach ${att.required}%`
                });
            }
        }
    });

    // 2) Assignment / quiz reminders
    const now = new Date();
    appState.assignments.forEach(a => {
        const days = getDaysFromToday(a.deadline);
        if (days === null) return;

        // overdue or due soon
        if (days < 0 && a.status !== 'graded') {
            reminders.push({
                type: 'task-overdue',
                message: `${a.title} (${a.subject || 'General'}) was due ${Math.abs(days)} day${Math.abs(days) === 1 ? '' : 's'} ago`
            });
        } else if (days >= 0 && days <= 3 && a.status !== 'graded') {
            const whenText =
                days === 0 ? 'Due today' :
                days === 1 ? 'Due tomorrow' :
                `Due in ${days} days`;

            reminders.push({
                type: 'task-soon',
                message: `${a.title} (${a.subject || 'General'}) – ${whenText}`
            });
        }
    });

    if (reminders.length === 0) {
        container.innerHTML = `
            <div class="alert-chip ok-chip">
                🎉 No alerts or reminders right now
            </div>
        `;
        return;
    }

    container.innerHTML = reminders
        .map(r => {
            const icon =
                r.type === 'attendance' ? '📉' :
                r.type === 'task-overdue' ? '⏰' :
                '🔔';

            return `
                <div class="alert-chip ${r.type === 'task-overdue' ? 'danger-chip' : 'warning-chip'}">
                    <span>${icon}</span>
                    <span>${escapeHtml(r.message)}</span>
                </div>
            `;
        })
        .join('');
}

// TODAY'S FOCUS – subjects that have work due today or in next 3 days
function showTodayFocus() {
    const container = document.getElementById('todayFocus');
    if (!container) return;

    // pick assignments/quiz that are still not graded
    const focusAssignments = appState.assignments.filter(a => {
        const days = getDaysFromToday(a.deadline);
        return typeof days === 'number' && days >= 0 && days <= 3 && a.status !== 'graded';
    });

    if (focusAssignments.length === 0) {
        container.innerHTML = `
            <div class="alert-chip ok-chip">
                ✅ No urgent tasks in the next 3 days.
                You can revise weak topics or upload notes.
            </div>
        `;
        return;
    }

    // group by subject
    const bySubject = {};
    focusAssignments.forEach(a => {
        const subj = a.subject || 'General';
        if (!bySubject[subj]) bySubject[subj] = [];
        bySubject[subj].push(a);
    });

    const blocks = Object.keys(bySubject).map(subj => {
        const itemsHtml = bySubject[subj]
            .map(a => {
                const days = getDaysFromToday(a.deadline);
                const whenText =
                    days === 0 ? 'today' :
                    days === 1 ? 'tomorrow' :
                    `in ${days} days`;
                return `<li>${escapeHtml(a.title)} – due ${whenText}</li>`;
            })
            .join('');

        return `
            <div class="today-card">
                <div class="today-subject">${escapeHtml(subj)}</div>
                <ul class="today-list">
                    ${itemsHtml}
                </ul>
            </div>
        `;
    });

    container.innerHTML = blocks.join('');
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

// helper: difference in whole days between today and a given date string (yyyy-mm-dd)
function getDaysFromToday(dateStr) {
    if (!dateStr) return null;
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return null;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    d.setHours(0, 0, 0, 0);

    const diffMs = d.getTime() - today.getTime();
    return Math.round(diffMs / (1000 * 60 * 60 * 24));
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
function populateSyllabusSubjects() {
  const select = document.getElementById('syllabusSubjectSelect');
  if (!select) return;

  const course = getCurrentCourse();
  const selectedSubjects = loadSelectedSubjectsForCourse(course);

  select.innerHTML = '';

  if (!selectedSubjects.length) {
    const opt = document.createElement('option');
    opt.value = '';
    opt.textContent = 'No subjects configured';
    select.appendChild(opt);
    return;
  }

  selectedSubjects.forEach(sub => {
    const opt = document.createElement('option');
    opt.value = sub;
    opt.textContent = sub;
    select.appendChild(opt);
  });

   if (!select.value && selectedSubjects.length > 0) {
    select.value = selectedSubjects[0];
  }
  populateSubjectDropdowns();
}

function openSubjectManager() {
  const course = getCurrentCourse();
  const subjects = courseSubjects[course] || [];
  if (!subjects.length) {
    alert('No subjects configured for this course yet.');
    return;
  }

  const currentSelection = loadSelectedSubjectsForCourse(course);
  const modal = document.getElementById('manageSubjectsModal');
  const list = document.getElementById('manageSubjectsList');
  const label = document.getElementById('manageSubjectsCourseLabel');

  if (!modal || !list || !label) return;

  label.textContent = 'Available subjects for ' + course + ' (4th Sem):';

  list.innerHTML = subjects
    .map(subject => {
      const checked = currentSelection.includes(subject) ? 'checked' : '';
      return `
        <label class="manage-subject-row">
          <input type="checkbox" value="${subject.replace(/"/g, '&quot;')}" ${checked}>
          <span>${subject}</span>
        </label>
      `;
    })
    .join('');

  modal.style.display = 'flex';
}

function closeManageSubjectsModal() {
  const modal = document.getElementById('manageSubjectsModal');
  if (modal) modal.style.display = 'none';
}

function saveManageSubjects() {
  const course = getCurrentCourse();
  const modal = document.getElementById('manageSubjectsModal');
  const list = document.getElementById('manageSubjectsList');
  if (!modal || !list) return;

  const checked = Array.from(list.querySelectorAll('input[type="checkbox"]:checked')).map(i => i.value);
  if (!checked.length) {
    alert('At least one subject must be selected.');
    return;
  }

  saveSelectedSubjectsForCourse(course, checked);
  closeManageSubjectsModal();
  populateSyllabusSubjects();
  populateSubjectDropdowns();
  renderSyllabus();
  renderAttendance();
  updateDashboard();
}

function initSyllabus() {
  const savedCourse = localStorage.getItem('course');
  if (!appState.currentCourse) {
    appState.currentCourse = savedCourse || 'Electronics and Communication Engineering';
  }
  populateSyllabusSubjects();
  populateSubjectDropdowns();
  renderSyllabus();
  renderAttendance();
  updateDashboard();
}

function renderSyllabus() {
  const syllabusContainer = document.getElementById('syllabusContainer');
  const select = document.getElementById('syllabusSubjectSelect');
  if (!syllabusContainer || !select) return;

  const selectedSubject = select.value;
  if (!selectedSubject) {
    syllabusContainer.innerHTML = '<p style="color:#94a3b8;">Please select a subject.</p>';
    return;
  }

  const topics = syllabusData[selectedSubject];
  if (!topics || !topics.length) {
    syllabusContainer.innerHTML = `<p style="color:#94a3b8;">No syllabus data found for ${selectedSubject}.</p>`;
    return;
  }

  const completedTopics = loadCompletedTopics(selectedSubject);
  const completedCount = completedTopics.length;
  const totalCount = topics.length;
  const percent = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  let color = '#ef4444'; // red
  if (percent > 70) color = '#22c55e'; // green
  else if (percent > 30) color = '#eab308'; // yellow

  syllabusContainer.innerHTML = `
    <div class="card">
      <h3 class="card-title">${selectedSubject} - Units</h3>
      <div style="display: grid; gap: 12px;">
        ${topics
          .map((topic, index) => {
            const isCompleted = completedTopics.includes(topic);
            return `
              <div style="display: flex; align-items: center; gap: 12px; padding: 12px; background: ${
                isCompleted ? 'rgba(16, 185, 129, 0.1)' : '#0f172a'
              }; border-radius: 8px; border: 1px solid ${isCompleted ? '#10b981' : '#334155'};">
                <input type="checkbox"
                  id="topic-${index}"
                  ${isCompleted ? 'checked' : ''}
                  onchange="toggleTopic('${selectedSubject.replace(/'/g, "\\'")}', '${topic.replace(/'/g, "\\'")}')"
                  style="width: 20px; height: 20px; cursor: pointer;"
                />
                <label for="topic-${index}" style="flex: 1; cursor: pointer; color: ${
                  isCompleted ? '#34d399' : '#e2e8f0'
                }; font-weight: ${isCompleted ? '600' : '400'};">${topic}</label>
              </div>
            `;
          })
          .join('')}
      </div>
      <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #334155;">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <span style="color: #94a3b8;">Progress:</span>
          <span style="color: #f97316; font-weight: 700; font-size: 20px;">${completedCount}/${totalCount} Units</span>
        </div>
        <div class="progress-bar" style="margin-top: 12px;">
          <div class="progress-fill" style="width: ${percent}%; background: ${color};"></div>
        </div>
      </div>
    </div>
  `;
}

function toggleTopic(subject, topic) {
  const topics = loadCompletedTopics(subject);
  const idx = topics.indexOf(topic);
  if (idx > -1) topics.splice(idx, 1);
  else topics.push(topic);
  saveCompletedTopics(subject, topics);
  renderSyllabus();
}

function addCustomSubject() {
  const course = getCurrentCourse();
  let subjects = loadSelectedSubjectsForCourse(course);

  let name = prompt('Enter custom subject name:');
  if (!name) return;
  name = name.trim();
  if (!name) return;

  if (subjects.includes(name)) {
    alert('Subject already exists in your list.');
    return;
  }

  subjects.push(name);
  saveSelectedSubjectsForCourse(course, subjects);

  if (!appState.attendance[name]) {
    appState.attendance[name] = { attended: 0, total: 0, required: 75 };
  }

  populateSyllabusSubjects();
  populateSubjectDropdowns();
  renderSyllabus();
  renderAttendance();
  updateDashboard();
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
  updateDashboard();      // this will also refresh task alerts, reminders, today focus
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
  if (!appState.attendance[subject]) {
    appState.attendance[subject] = { attended: 0, total: 0, required: 75 };
  }
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
  const activeSubjects = loadSelectedSubjectsForCourse(getCurrentCourse());
  attendanceContainer.innerHTML = activeSubjects.map(subject => {
    if (!appState.attendance[subject]) {
      appState.attendance[subject] = { attended: 0, total: 0, required: 75 };
    }
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
    initSyllabus();
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