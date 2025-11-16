let tasks = {};

function init() {
    loadTasks();
    setupEvents();
    setTodayDate();
    render();
}

function setupEvents() {
    document.getElementById('addBtn').addEventListener('click', addTask);
    document.getElementById('taskInput').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') addTask();
    });
}

function setTodayDate() {
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('dateInput').value = today;
}

function addTask() {
    const input = document.getElementById('taskInput');
    const dateInput = document.getElementById('dateInput');
    const taskText = input.value.trim();
    const dateValue = dateInput.value;
    
    if (!taskText) {
        alert('Please enter a task');
        return;
    }
    
    if (!dateValue) {
        alert('Please select a date');
        return;
    }
    
    const dateKey = new Date(dateValue).toDateString();
    
    if (!tasks[dateKey]) {
        tasks[dateKey] = {
            date: new Date(dateValue),
            items: []
        };
    }
    
    tasks[dateKey].items.push({
        id: Date.now(),
        text: taskText,
        completed: false
    });
    
    input.value = '';
    save();
    render();
}

function toggleTask(dateKey, taskId) {
    const task = tasks[dateKey].items.find(t => t.id === taskId);
    if (task) {
        task.completed = !task.completed;
        save();
        render();
    }
}

function deleteTask(dateKey, taskId) {
    tasks[dateKey].items = tasks[dateKey].items.filter(t => t.id !== taskId);
    if (tasks[dateKey].items.length === 0) {
        delete tasks[dateKey];
    }
    save();
    render();
}

function deleteDay(dateKey) {
    delete tasks[dateKey];
    save();
    render();
}

function addTaskToDay(dateKey) {
    const taskText = prompt('Enter task name:');
    if (taskText && taskText.trim()) {
        tasks[dateKey].items.push({
            id: Date.now(),
            text: taskText.trim(),
            completed: false
        });
        save();
        render();
    }
}

function render() {
    const container = document.getElementById('taskList');
    container.innerHTML = '';
    
    const sorted = Object.keys(tasks).sort((a, b) => new Date(a) - new Date(b));
    
    if (sorted.length === 0) {
        container.innerHTML = '<div class="empty-state">No tasks yet!</div>';
        updateStats();
        return;
    }
    
    sorted.forEach(dateKey => {
        const day = tasks[dateKey];
        const section = document.createElement('div');
        section.className = 'day-section';
        
        const date = new Date(day.date);
        const dayName = date.toLocaleDateString('en-US', { weekday: 'long' });
        const dateStr = date.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' });
        const taskCount = day.items.length;
        
        section.innerHTML = `
            <div class="day-header">
                <div class="day-info">
                    <span class="day-name">${dayName}</span>
                    <span class="day-date">${dateStr}</span>
                    <span>|</span>
                    <span class="day-count">${taskCount} ${taskCount === 1 ? 'task' : 'tasks'}</span>
                </div>
                <div class="day-buttons">
                    <button class="delete-day" onclick="deleteDay('${dateKey}')">delete day</button>
                    <button class="add-task" onclick="addTaskToDay('${dateKey}')">+ task</button>
                </div>
            </div>
        `;
        
        day.items.forEach(task => {
            const taskDiv = document.createElement('div');
            taskDiv.className = `task-item ${task.completed ? 'completed' : ''}`;
            taskDiv.innerHTML = `
                <input type="checkbox" class="task-checkbox" ${task.completed ? 'checked' : ''} 
                       onchange="toggleTask('${dateKey}', ${task.id})">
                <span class="task-text">${task.text}</span>
                <button class="delete-task" onclick="deleteTask('${dateKey}', ${task.id})">delete</button>
            `;
            section.appendChild(taskDiv);
        });
        
        container.appendChild(section);
    });
    
    updateStats();
}

function updateStats() {
    const days = Object.keys(tasks).length;
    const total = Object.values(tasks).reduce((sum, day) => sum + day.items.length, 0);
    document.getElementById('statsText').textContent = `${days} ${days === 1 ? 'day' : 'days'} | ${total} ${total === 1 ? 'task' : 'tasks'}`;
}

function save() {
    const data = {};
    Object.keys(tasks).forEach(key => {
        data[key] = {
            date: tasks[key].date.toISOString(),
            items: tasks[key].items
        };
    });
    localStorage.setItem('tasks', JSON.stringify(data));
}

function loadTasks() {
    const saved = localStorage.getItem('tasks');
    if (saved) {
        const data = JSON.parse(saved);
        Object.keys(data).forEach(key => {
            tasks[key] = {
                date: new Date(data[key].date),
                items: data[key].items
            };
        });
    }
}

init();
