let tasks = [];

function addTask() {
  const taskInput = document.getElementById('taskInput');
  const priority = document.getElementById('priority').value;
  const dueDate = document.getElementById('dueDate').value;
  const text = taskInput.value.trim();

  if (!text) return;

  tasks.push({
    text,
    completed: false,
    priority,
    dueDate,
    id: Date.now()
  });

  taskInput.value = '';
  dueDate.value = '';
  renderTasks();
  scheduleReminder();
}

function renderTasks() {
  const taskList = document.getElementById('taskList');
  taskList.innerHTML = '';

  // Sort by due date
  tasks.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));

  tasks.forEach((task, index) => {
    const li = document.createElement('li');
    li.className = task.priority;
    li.setAttribute('draggable', 'true');
    li.dataset.index = index;

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = task.completed;
    checkbox.onchange = () => toggleComplete(index);

    const span = document.createElement('span');
    span.textContent = `${task.text} — ${task.dueDate ? new Date(task.dueDate).toLocaleString() : ''}`;
    if (task.completed) span.style.textDecoration = 'line-through';

    const editBtn = document.createElement('button');
    editBtn.textContent = '✏️';
    editBtn.onclick = () => editTask(index);

    const delBtn = document.createElement('button');
    delBtn.textContent = '🗑️';
    delBtn.onclick = () => deleteTask(index);

    const controls = document.createElement('div');
    controls.className = 'task-controls';
    controls.appendChild(editBtn);
    controls.appendChild(delBtn);

    const taskInfo = document.createElement('div');
    taskInfo.className = 'task-info';
    taskInfo.appendChild(span);

    li.appendChild(checkbox);
    li.appendChild(taskInfo);
    li.appendChild(controls);
    taskList.appendChild(li);
  });

  updateProgress();
  enableDragDrop();
}

function toggleComplete(index) {
  tasks[index].completed = !tasks[index].completed;
  renderTasks();
  if (tasks[index].completed) showQuote();
}

function editTask(index) {
  const newText = prompt("Edit your task:", tasks[index].text);
  if (newText !== null) {
    tasks[index].text = newText.trim();
    renderTasks();
  }
}

function deleteTask(index) {
  tasks.splice(index, 1);
  renderTasks();
}

function showQuote() {
  const quotes = [
    "Great job! 🎉",
    "One step closer to your goals!",
    "You’re doing amazing!",
    "Keep up the great work!",
  ];
  const quoteBox = document.getElementById("quoteBox");
  quoteBox.textContent = quotes[Math.floor(Math.random() * quotes.length)];
}

function toggleDarkMode() {
  document.body.classList.toggle('dark');
}

function updateProgress() {
  const progressFill = document.getElementById('progressFill');
  const total = tasks.length;
  const completed = tasks.filter(t => t.completed).length;
  const percent = total ? Math.round((completed / total) * 100) : 0;

  progressFill.style.width = `${percent}%`;

  if (percent >= 90) progressFill.style.backgroundColor = 'green';
  else if (percent >= 60) progressFill.style.backgroundColor = 'orange';
  else progressFill.style.backgroundColor = 'red';
}

function enableDragDrop() {
  const listItems = document.querySelectorAll('#taskList li');
  let draggedItem;

  listItems.forEach(item => {
    item.addEventListener('dragstart', () => {
      draggedItem = item;
    });

    item.addEventListener('dragover', e => {
      e.preventDefault();
    });

    item.addEventListener('drop', () => {
      const fromIndex = +draggedItem.dataset.index;
      const toIndex = +item.dataset.index;

      const movedItem = tasks.splice(fromIndex, 1)[0];
      tasks.splice(toIndex, 0, movedItem);
      renderTasks();
    });
  });
}

function scheduleReminder() {
  if (!("Notification" in window)) return;
  if (Notification.permission !== "granted") Notification.requestPermission();

  tasks.forEach(task => {
    if (!task.dueDate || task.completed) return;

    const time = new Date(task.dueDate) - new Date();
    if (time > 0 && time < 3600000) {
      setTimeout(() => {
        if (!task.completed) {
          new Notification("Task Reminder", { body: task.text });
          document.getElementById("alertSound").play();
        }
      }, time);
    }
  });
}

renderTasks();
