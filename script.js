const state = {
    date: new Date().toDateString(),
    mainFocus: '',
    tasks: [
        { text: '', completed: false }
    ],
    water: 0,
    mood: '',
    notes: ''
};

// Load from LocalStorage
function loadState() {
    const saved = localStorage.getItem('aura_bento_state');
    if (saved) {
        const parsed = JSON.parse(saved);
        // Check if it's a new day
        if (parsed.date !== new Date().toDateString()) {
            // Reset daily items but keep structure
            state.date = new Date().toDateString();
            state.mainFocus = '';
            state.tasks = [{ text: '', completed: false }];
            state.water = 0;
            state.mood = '';
            state.notes = '';
            saveState();
        } else {
            Object.assign(state, parsed);
        }
    }
    render();
}

// Save to LocalStorage
function saveState() {
    localStorage.setItem('aura_bento_state', JSON.stringify(state));
}

function render() {
    // Date
    document.getElementById('current-date').textContent = state.date;

    // Main Focus
    document.getElementById('main-focus-input').value = state.mainFocus;

    // Tasks
    const taskContainer = document.getElementById('small-tasks-container');
    taskContainer.innerHTML = '';
    state.tasks.forEach((task, index) => {
        const div = document.createElement('div');
        div.className = `task-item ${task.completed ? 'completed' : ''}`;
        div.innerHTML = `
            <input type="checkbox" ${task.completed ? 'checked' : ''} data-index="${index}">
            <input type="text" value="${task.text}" placeholder="Task..." data-index="${index}">
            <button class="remove-task" data-index="${index}" style="background:none; border:none; color:var(--accent); cursor:pointer; font-size:0.8rem; opacity:0.4;">✕</button>
        `;
        taskContainer.appendChild(div);
    });

    // Water
    document.getElementById('water-count').textContent = state.water;
    const glassContainer = document.getElementById('glass-container');
    glassContainer.innerHTML = '';
    for (let i = 0; i < Math.max(8, state.water); i++) {
        const glass = document.createElement('div');
        glass.className = `glass-icon ${i < state.water ? 'filled' : ''}`;
        glassContainer.appendChild(glass);
    }

    // Mood
    document.querySelectorAll('.mood-btn').forEach(btn => {
        btn.classList.toggle('selected', btn.dataset.mood === state.mood);
    });

    // Notes
    document.getElementById('notes-input').value = state.notes;
}

// Event Listeners
document.getElementById('main-focus-input').addEventListener('input', (e) => {
    state.mainFocus = e.target.value;
    saveState();
});

document.getElementById('add-task-btn').addEventListener('click', () => {
    state.tasks.push({ text: '', completed: false });
    render();
    saveState();
});

document.getElementById('small-tasks-container').addEventListener('click', (e) => {
    if (e.target.classList.contains('remove-task')) {
        const index = parseInt(e.target.dataset.index);
        state.tasks.splice(index, 1);
        render();
        saveState();
    }
});

document.getElementById('small-tasks-container').addEventListener('input', (e) => {
    const index = e.target.dataset.index;
    if (e.target.type === 'checkbox') {
        state.tasks[index].completed = e.target.checked;
        e.target.parentElement.classList.toggle('completed', e.target.checked);
    } else if (e.target.type === 'text') {
        state.tasks[index].text = e.target.value;
    }
    saveState();
});

document.getElementById('water-plus').addEventListener('click', () => {
    state.water++;
    render();
    saveState();
});

document.getElementById('water-minus').addEventListener('click', () => {
    if (state.water > 0) state.water--;
    render();
    saveState();
});

document.querySelectorAll('.mood-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        state.mood = btn.dataset.mood;
        document.querySelectorAll('.mood-btn').forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
        saveState();
    });
});

document.getElementById('notes-input').addEventListener('input', (e) => {
    state.notes = e.target.value;
    saveState();
});

// Initial Load
loadState();

// Midnight Check: If they leave the tab open, check every minute if the date changed
setInterval(() => {
    if (state.date !== new Date().toDateString()) {
        loadState(); // This will trigger the reset logic automatically
    }
}, 60000);
