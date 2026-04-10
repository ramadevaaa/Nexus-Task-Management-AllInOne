const state = {
  tasks: [],
  links: [],
  sessions: 0,
  timerInterval: null,
  timerRunning: false,
  timerMode: 'focus',
  timerSeconds: 25 * 60,
  focusDuration: 25,
  breakDuration: 5,
  operatorName: 'OPERATOR',
  theme: 'dark',
  editingTaskId: null,
  streak: 0,
  lastActiveDate: null,
};

const save = (key, val) => localStorage.setItem('nexus_' + key, JSON.stringify(val));
const load = (key, fallback) => {
  try {
    const v = localStorage.getItem('nexus_' + key);
    return v !== null ? JSON.parse(v) : fallback;
  } catch { return fallback; }
};

function loadState() {
  state.tasks         = load('tasks', []);
  state.links         = load('links', []);
  state.sessions      = load('sessions', 0);
  state.focusDuration = load('focusDuration', 25);
  state.breakDuration = load('breakDuration', 5);
  state.operatorName  = load('operatorName', 'OPERATOR');
  state.theme         = load('theme', 'dark');
  state.streak        = load('streak', 0);
  state.lastActiveDate = load('lastActiveDate', null);
  state.timerSeconds  = state.focusDuration * 60;
}

const $  = id  => document.getElementById(id);
const $$ = sel => document.querySelectorAll(sel);

function updateClock() {
  const now = new Date();
  const h = String(now.getHours()).padStart(2, '0');
  const m = String(now.getMinutes()).padStart(2, '0');
  const s = String(now.getSeconds()).padStart(2, '0');

  $('greetingClock').textContent = `${h}:${m}:${s}`;
  $('topbarTime').textContent    = `${h}:${m}`;

  const days   = ['SUNDAY','MONDAY','TUESDAY','WEDNESDAY','THURSDAY','FRIDAY','SATURDAY'];
  const months = ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'];
  $('greetingDate').textContent = `${days[now.getDay()]} · ${now.getDate()} ${months[now.getMonth()]} ${now.getFullYear()}`;

  const hour = now.getHours();
  let greeting, badge;
  if      (hour >= 5  && hour < 12) { greeting = 'GOOD MORNING';   badge = 'MORNING';   }
  else if (hour >= 12 && hour < 17) { greeting = 'GOOD AFTERNOON'; badge = 'AFTERNOON'; }
  else if (hour >= 17 && hour < 21) { greeting = 'GOOD EVENING';   badge = 'EVENING';   }
  else                              { greeting = 'GOOD NIGHT';      badge = 'NIGHT';     }

  $('greetingText').textContent = greeting;
  $('greetingBadge').textContent = badge;
  $('greetingName').textContent  = state.operatorName.toUpperCase();

  const totalSecs = 24 * 3600;
  const elapsed   = hour * 3600 + now.getMinutes() * 60 + now.getSeconds();
  const pct       = (elapsed / totalSecs) * 100;
  $('dayProgress').style.width       = pct + '%';
  $('dayProgressLabel').textContent  = `Day progress — ${Math.round(pct)}%`;
}

const CIRCUMFERENCE = 2 * Math.PI * 88;

function updateTimerDisplay() {
  const m = Math.floor(state.timerSeconds / 60);
  const s = state.timerSeconds % 60;
  $('timerDigits').textContent = `${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;

  const total    = (state.timerMode === 'focus' ? state.focusDuration : state.breakDuration) * 60;
  const progress = state.timerSeconds / total;
  const offset   = CIRCUMFERENCE * (1 - progress);
  $('ringProgress').style.strokeDasharray  = CIRCUMFERENCE;
  $('ringProgress').style.strokeDashoffset = offset;
}

function startTimer() {
  if (state.timerRunning) {
    clearInterval(state.timerInterval);
    state.timerRunning = false;
    $('timerStart').textContent = '▶ RESUME';
    $('timerStatus').textContent = 'PAUSED';
    $('timerStart').classList.remove('running');
  } else {
    state.timerRunning = true;
    $('timerStart').textContent  = '⏸ PAUSE';
    $('timerStatus').textContent = state.timerMode === 'focus' ? 'FOCUSING' : 'BREAK';
    $('timerStart').classList.add('running');
    state.timerInterval = setInterval(() => {
      state.timerSeconds--;
      updateTimerDisplay();
      if (state.timerSeconds <= 0) {
        clearInterval(state.timerInterval);
        state.timerRunning = false;
        $('timerStart').textContent = '▶ START';
        $('timerStart').classList.remove('running');
        if (state.timerMode === 'focus') {
          state.sessions++;
          save('sessions', state.sessions);
          updateStats();
          renderSessionDots();
          $('timerStatus').textContent = 'SESSION DONE!';
        } else {
          $('timerStatus').textContent = 'BREAK DONE!';
        }
      }
    }, 1000);
  }
}

function resetTimer() {
  clearInterval(state.timerInterval);
  state.timerRunning   = false;
  state.timerSeconds   = (state.timerMode === 'focus' ? state.focusDuration : state.breakDuration) * 60;
  $('timerStart').textContent  = '▶ START';
  $('timerStatus').textContent = 'STANDBY';
  $('timerStart').classList.remove('running');
  updateTimerDisplay();
}

function setTimerMode(mode) {
  state.timerMode = mode;
  resetTimer();
  $$('.timer-tab').forEach(t => t.classList.toggle('active', t.dataset.mode === mode));
  $('ringProgress').style.stroke = mode === 'focus' ? 'var(--accent)' : 'var(--accent3)';
}

function renderSessionDots() {
  const wrap  = $('sessionDots');
  wrap.innerHTML = '';
  const count = Math.min(state.sessions % 4 || (state.sessions > 0 ? 4 : 0), 4);
  for (let i = 0; i < count; i++) {
    const d = document.createElement('div');
    d.className = 'session-dot';
    wrap.appendChild(d);
  }
}

let currentFilter = 'all';

function addTask() {
  const input = $('taskInput');
  const text  = input.value.trim();
  if (!text) return;
  state.tasks.unshift({ id: Date.now(), text, priority: $('taskPriority').value, done: false, createdAt: Date.now() });
  save('tasks', state.tasks);
  input.value = '';
  renderTasks();
  updateStats();
}

function toggleTask(id) {
  const task = state.tasks.find(t => t.id === id);
  if (task) { task.done = !task.done; save('tasks', state.tasks); renderTasks(); updateStats(); }
}

function deleteTask(id) {
  state.tasks = state.tasks.filter(t => t.id !== id);
  save('tasks', state.tasks);
  renderTasks();
  updateStats();
}

function openEditTask(id) {
  const task = state.tasks.find(t => t.id === id);
  if (!task) return;
  state.editingTaskId = id;
  $('editTaskInput').value    = task.text;
  $('editTaskPriority').value = task.priority;
  openModal('editTaskOverlay');
}

function confirmEditTask() {
  const task    = state.tasks.find(t => t.id === state.editingTaskId);
  const newText = $('editTaskInput').value.trim();
  if (!task || !newText) return;
  task.text     = newText;
  task.priority = $('editTaskPriority').value;
  save('tasks', state.tasks);
  closeModal('editTaskOverlay');
  renderTasks();
}

function clearDone() {
  state.tasks = state.tasks.filter(t => !t.done);
  save('tasks', state.tasks);
  renderTasks();
  updateStats();
}

function getFilteredTasks() {
  switch (currentFilter) {
    case 'active': return state.tasks.filter(t => !t.done);
    case 'done':   return state.tasks.filter(t => t.done);
    case 'high':   return state.tasks.filter(t => t.priority === 'high');
    default:       return state.tasks;
  }
}

function renderTasks() {
  const list     = $('taskList');
  const filtered = getFilteredTasks();
  list.innerHTML = '';

  filtered.length === 0
    ? $('taskEmpty').classList.add('visible')
    : $('taskEmpty').classList.remove('visible');

  filtered.forEach(task => {
    const li = document.createElement('li');
    li.className       = 'task-item' + (task.done ? ' done' : '');
    li.dataset.priority = task.priority;
    li.innerHTML = `
      <button class="task-check" aria-label="Toggle task">${task.done ? '✓' : ''}</button>
      <span class="task-text">${escapeHtml(task.text)}</span>
      <span class="task-priority-badge ${task.priority}">${task.priority.toUpperCase()}</span>
      <div class="task-actions">
        <button class="task-btn edit" aria-label="Edit task">✎</button>
        <button class="task-btn delete" aria-label="Delete task">✕</button>
      </div>
    `;
    li.querySelector('.task-check').addEventListener('click', () => toggleTask(task.id));
    li.querySelector('.task-btn.edit').addEventListener('click', () => openEditTask(task.id));
    li.querySelector('.task-btn.delete').addEventListener('click', () => deleteTask(task.id));
    list.appendChild(li);
  });

  $('tasksDone').textContent  = state.tasks.filter(t => t.done).length;
  $('tasksTotal').textContent = state.tasks.length;
}

function renderLinks() {
  const grid = $('linksGrid');
  grid.innerHTML = '';
  state.links.forEach((link, i) => {
    const el = document.createElement('div');
    el.className = 'link-item';
    el.innerHTML = `
      <span class="link-icon">${link.icon || '🔗'}</span>
      <span class="link-name">${escapeHtml(link.name)}</span>
      <button class="link-delete" aria-label="Delete link">✕</button>
    `;
    el.addEventListener('click', e => {
      if (!e.target.classList.contains('link-delete')) window.open(link.url, '_blank');
    });
    el.querySelector('.link-delete').addEventListener('click', e => {
      e.stopPropagation();
      state.links.splice(i, 1);
      save('links', state.links);
      renderLinks();
    });
    grid.appendChild(el);
  });
}

function addLink() {
  const name = $('linkName').value.trim();
  const url  = $('linkUrl').value.trim();
  const icon = $('linkIcon').value.trim() || '🔗';
  if (!name || !url) return;
  state.links.push({ name, url: url.startsWith('http') ? url : 'https://' + url, icon });
  save('links', state.links);
  renderLinks();
  closeModal('linkModalOverlay');
  $('linkName').value = $('linkUrl').value = $('linkIcon').value = '';
}

function updateStats() {
  const total = state.tasks.length;
  const done  = state.tasks.filter(t => t.done).length;
  const pct   = total > 0 ? Math.round((done / total) * 100) : 0;
  $('statTotal').textContent     = total;
  $('statCompleted').textContent = done;
  $('statSessions').textContent  = state.sessions;
  $('statStreak').textContent    = state.streak;
  $('completionPct').textContent = pct + '%';
  $('completionFill').style.width = pct + '%';
}

function updateStreak() {
  const today     = new Date().toDateString();
  const yesterday = new Date(Date.now() - 86400000).toDateString();
  if (state.lastActiveDate !== today) {
    state.streak = state.lastActiveDate === yesterday ? state.streak + 1 : 1;
    state.lastActiveDate = today;
    save('streak', state.streak);
    save('lastActiveDate', state.lastActiveDate);
  }
}

function openSettings() {
  $('operatorName').value = state.operatorName;
  $('pomoDuration').value = state.focusDuration;
  $('breakDuration').value = state.breakDuration;
  $('themeToggle').classList.toggle('light-mode', state.theme === 'light');
  $('settingsPanel').classList.add('open');
  $('settingsOverlay').classList.add('open');
}

function closeSettings() {
  $('settingsPanel').classList.remove('open');
  $('settingsOverlay').classList.remove('open');
}

function saveSettings() {
  state.operatorName  = $('operatorName').value.trim() || 'OPERATOR';
  state.focusDuration = Math.max(1, parseInt($('pomoDuration').value)  || 25);
  state.breakDuration = Math.max(1, parseInt($('breakDuration').value) || 5);
  save('operatorName', state.operatorName);
  save('focusDuration', state.focusDuration);
  save('breakDuration', state.breakDuration);
  save('theme', state.theme);
  resetTimer();
  updateClock();
  closeSettings();
}

function toggleTheme() {
  state.theme = state.theme === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', state.theme);
  $('themeToggle').classList.toggle('light-mode', state.theme === 'light');
}

function openModal(id)  { $(id).classList.add('open');    }
function closeModal(id) { $(id).classList.remove('open'); }

function escapeHtml(str) {
  return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function init() {
  loadState();
  document.documentElement.setAttribute('data-theme', state.theme);

  updateClock();
  setInterval(updateClock, 1000);

  updateTimerDisplay();
  renderSessionDots();
  renderTasks();
  updateStats();
  renderLinks();
  updateStreak();

  $('timerStart').addEventListener('click', startTimer);
  $('timerReset').addEventListener('click', resetTimer);
  $$('.timer-tab').forEach(tab => tab.addEventListener('click', () => setTimerMode(tab.dataset.mode)));

  $('addTaskBtn').addEventListener('click', addTask);
  $('taskInput').addEventListener('keydown', e => { if (e.key === 'Enter') addTask(); });
  $('clearDone').addEventListener('click', clearDone);
  $$('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      currentFilter = btn.dataset.filter;
      $$('.filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      renderTasks();
    });
  });

  $('closeEditTask').addEventListener('click',   () => closeModal('editTaskOverlay'));
  $('cancelEditTask').addEventListener('click',  () => closeModal('editTaskOverlay'));
  $('confirmEditTask').addEventListener('click', confirmEditTask);
  $('editTaskOverlay').addEventListener('click', e => { if (e.target === $('editTaskOverlay')) closeModal('editTaskOverlay'); });

  $('addLinkBtn').addEventListener('click',      () => openModal('linkModalOverlay'));
  $('closeLinkModal').addEventListener('click',  () => closeModal('linkModalOverlay'));
  $('cancelLinkModal').addEventListener('click', () => closeModal('linkModalOverlay'));
  $('confirmLinkModal').addEventListener('click', addLink);
  $('linkModalOverlay').addEventListener('click', e => { if (e.target === $('linkModalOverlay')) closeModal('linkModalOverlay'); });

  $('openSettings').addEventListener('click',  openSettings);
  $('closeSettings').addEventListener('click', closeSettings);
  $('settingsOverlay').addEventListener('click', closeSettings);
  $('saveSettings').addEventListener('click',  saveSettings);
  $('themeToggle').addEventListener('click',   toggleTheme);
}

document.addEventListener('DOMContentLoaded', init);
