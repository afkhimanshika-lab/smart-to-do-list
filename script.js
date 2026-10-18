
const taskInput = document.getElementById("taskInput");
const priority = document.getElementById("priority");
const addTaskButton = document.getElementById("addTaskButton");
const taskList = document.getElementById("taskList");
const emptyState = document.getElementById("emptyState");
const taskCount = document.getElementById("taskCount");
const progressValue = document.getElementById("progressValue");
const clearCompleted = document.getElementById("clearCompleted");
const filterButtons = document.querySelectorAll(".filter");

let tasks = JSON.parse(localStorage.getItem("dailyTasks")) || [];
let currentFilter = "all";

document.getElementById("today").textContent =
    new Date().toLocaleDateString("en-IN", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric"
    });

function saveTasks() {
    localStorage.setItem("dailyTasks", JSON.stringify(tasks));
}

function addTask() {
    const name = taskInput.value.trim();

    if (!name) {
        taskInput.focus();
        return;
    }

    tasks.unshift({
        id: Date.now(),
        name: name,
        priority: priority.value,
        completed: false
    });

    saveTasks();
    taskInput.value = "";
    priority.value = "normal";
    renderTasks();
    taskInput.focus();
}

function renderTasks() {
    taskList.innerHTML = "";

    const visibleTasks = tasks.filter(task => {
        if (currentFilter === "active") return !task.completed;
        if (currentFilter === "completed") return task.completed;
        return true;
    });

    visibleTasks.forEach(task => {
        const item = document.createElement("li");
        item.className = `task ${task.priority}`;

        if (task.completed) {
            item.classList.add("completed");
        }

        const checkButton = document.createElement("button");
        checkButton.className = "check-button";
        checkButton.title = "Mark as complete";
        checkButton.setAttribute("aria-label", "Toggle task completion");
        checkButton.addEventListener("click", () => {
            task.completed = !task.completed;
            saveTasks();
            renderTasks();
        });

        const info = document.createElement("div");
        info.className = "task-info";

        const name = document.createElement("div");
        name.className = "task-name";
        name.textContent = task.name;
        name.title = "Double-click to edit";

        name.addEventListener("dblclick", () => {
            const updatedName = prompt("Edit task:", task.name);

            if (updatedName && updatedName.trim()) {
                task.name = updatedName.trim();
                saveTasks();
                renderTasks();
            }
        });

        const badge = document.createElement("span");
        badge.className = "priority-badge";
        badge.textContent = task.priority + " priority";

        info.append(name, badge);

        const deleteButton = document.createElement("button");
        deleteButton.className = "delete-button";
        deleteButton.textContent = "×";
        deleteButton.title = "Delete task";
        deleteButton.setAttribute("aria-label", "Delete task");

        deleteButton.addEventListener("click", () => {
            tasks = tasks.filter(item => item.id !== task.id);
            saveTasks();
            renderTasks();
        });

        item.append(checkButton, info, deleteButton);
        taskList.appendChild(item);
    });

    updateScreen(visibleTasks.length);
}

function updateScreen(visibleCount) {
    const total = tasks.length;
    const completed = tasks.filter(task => task.completed).length;
    const percentage = total ? Math.round(completed / total * 100) : 0;

    progressValue.textContent = percentage + "%";
    taskCount.textContent = `${total} ${total === 1 ? "task" : "tasks"}`;

    emptyState.style.display = visibleCount === 0 ? "flex" : "none";

    if (visibleCount === 0) {
        emptyState.querySelector("h2").textContent =
            total === 0 ? "A little space to begin." : "Nothing here just yet.";

        emptyState.querySelector("p").textContent =
            total === 0
                ? "Add a task and take it from there."
                : "Try another filter to find your tasks.";
    }
}

addTaskButton.addEventListener("click", addTask);

taskInput.addEventListener("keydown", event => {
    if (event.key === "Enter") addTask();
});

filterButtons.forEach(button => {
    button.addEventListener("click", () => {
        filterButtons.forEach(item => item.classList.remove("active"));
        button.classList.add("active");

        currentFilter = button.dataset.filter;
        renderTasks();
    });
});

clearCompleted.addEventListener("click", () => {
    tasks = tasks.filter(task => !task.completed);
    saveTasks();
    renderTasks();
});

renderTasks();
