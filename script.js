document.addEventListener('DOMContentLoaded', () => {
  // Initial default tasks
  let tasks = JSON.parse(localStorage.getItem('taskflow_tasks') || 'null') || [
    { id: '1', title: 'Connect OpenAI & Gemini endpoints', priority: 'high', status: 'done' },
    { id: '2', title: 'Implement live preview & code panel', priority: 'high', status: 'in-progress' },
    { id: '3', title: 'Add custom primary color & font switchers', priority: 'medium', status: 'in-progress' },
    { id: '4', title: 'Add full project ZIP download', priority: 'low', status: 'todo' }
  ];

  // DOM Elements
  const modal = document.getElementById('task-modal');
  const openModalBtn = document.getElementById('new-task-btn');
  const closeModalBtn = document.getElementById('close-modal-btn');
  const cancelModalBtn = document.getElementById('cancel-task-btn');
  const taskForm = document.getElementById('task-form');
  const timerDisplay = document.getElementById('timer-display');
  const toggleTimerBtn = document.getElementById('toggle-timer-btn');

  // Render cards
  function render() {
    const lists = {
      todo: document.getElementById('list-todo'),
      'in-progress': document.getElementById('list-in-progress'),
      done: document.getElementById('list-done')
    };

    Object.values(lists).forEach(el => el.innerHTML = '');

    tasks.forEach(task => {
      const card = document.createElement('div');
      card.className = 'task-card';
      card.innerHTML = `
        <div class="card-top">
          <span class="priority-tag ${task.priority}">${task.priority}</span>
          <button class="icon-btn delete-btn" data-id="${task.id}" title="Delete task"><i data-lucide="trash-2" style="width:14px;height:14px"></i></button>
        </div>
        <div class="card-title">${escapeHtml(task.title)}</div>
        <div class="card-actions">
          <div class="move-buttons">
            ${task.status !== 'todo' ? `<button class="btn-sm move-btn" data-id="${task.id}" data-to="todo">← Todo</button>` : ''}
            ${task.status !== 'in-progress' ? `<button class="btn-sm move-btn" data-id="${task.id}" data-to="in-progress">In Progress</button>` : ''}
            ${task.status !== 'done' ? `<button class="btn-sm move-btn" data-id="${task.id}" data-to="done">Done →</button>` : ''}
          </div>
        </div>
      `;
      lists[task.status]?.appendChild(card);
    });

    // Update metrics
    const total = tasks.length;
    const done = tasks.filter(t => t.status === 'done').length;
    const progress = total > 0 ? Math.round((done / total) * 100) : 0;

    document.getElementById('total-count').textContent = total;
    document.getElementById('done-count').textContent = done;
    document.getElementById('progress-percent').textContent = `${progress}%`;

    document.getElementById('count-todo').textContent = tasks.filter(t => t.status === 'todo').length;
    document.getElementById('count-in-progress').textContent = tasks.filter(t => t.status === 'in-progress').length;
    document.getElementById('count-done').textContent = done;

    // Save
    localStorage.setItem('taskflow_tasks', JSON.stringify(tasks));

    // Refresh icons
    if (window.lucide) {
      window.lucide.createIcons();
    }
  }

  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  // Event delegation
  document.addEventListener('click', (e) => {
    const deleteBtn = e.target.closest('.delete-btn');
    if (deleteBtn) {
      const id = deleteBtn.getAttribute('data-id');
      tasks = tasks.filter(t => t.id !== id);
      render();
      return;
    }

    const moveBtn = e.target.closest('.move-btn');
    if (moveBtn) {
      const id = moveBtn.getAttribute('data-id');
      const targetStatus = moveBtn.getAttribute('data-to');
      const task = tasks.find(t => t.id === id);
      if (task) {
        task.status = targetStatus;
        render();
      }
    }
  });

  // Modal handlers
  openModalBtn.addEventListener('click', () => modal.classList.remove('hidden'));
  closeModalBtn.addEventListener('click', () => modal.classList.add('hidden'));
  cancelModalBtn.addEventListener('click', () => modal.classList.add('hidden'));

  taskForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const title = document.getElementById('task-title-input').value.trim();
    const priority = document.getElementById('task-priority-select').value;
    const status = document.getElementById('task-column-select').value;

    if (title) {
      tasks.push({
        id: Date.now().toString(),
        title,
        priority,
        status
      });
      document.getElementById('task-title-input').value = '';
      modal.classList.add('hidden');
      render();
    }
  });

  // Pomodoro Focus Timer
  let timerSeconds = 25 * 60;
  let timerInterval = null;

  function updateTimerText() {
    const m = Math.floor(timerSeconds / 60).toString().padStart(2, '0');
    const s = (timerSeconds % 60).toString().padStart(2, '0');
    timerDisplay.textContent = `${m}:${s}`;
  }

  toggleTimerBtn.addEventListener('click', () => {
    if (timerInterval) {
      clearInterval(timerInterval);
      timerInterval = null;
      toggleTimerBtn.innerHTML = '<i data-lucide="play"></i>';
    } else {
      timerInterval = setInterval(() => {
        if (timerSeconds > 0) {
          timerSeconds--;
          updateTimerText();
        } else {
          clearInterval(timerInterval);
          timerInterval = null;
          alert('Pomodoro focus cycle completed! Take a 5-minute break.');
          timerSeconds = 25 * 60;
          updateTimerText();
          toggleTimerBtn.innerHTML = '<i data-lucide="play"></i>';
        }
      }, 1000);
      toggleTimerBtn.innerHTML = '<i data-lucide="pause"></i>';
    }
    if (window.lucide) window.lucide.createIcons();
  });

  render();
  console.log('TaskFlow Agile Board initialized successfully.');
});