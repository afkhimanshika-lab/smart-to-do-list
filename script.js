const taskInput = document.getElementById("taskInput");
const priority = document.getElementById("priority");
const addTaskButton = document.getElementById("addTaskButton");

const taskList = document.getElementById("taskList");
const emptyState = document.getElementById("emptyState");

const taskCount = document.getElementById("taskCount");
const progressValue = document.getElementById("progressValue");
const progressRing = document.querySelector(".progress-ring");

const clearCompleted = document.getElementById("clearCompleted");
const filterButtons = document.querySelectorAll(".filter");


let tasks = JSON.parse(localStorage.getItem("dailyTasks")) || [];

let currentFilter = "all";


/* Today's date */

const today = new Date();

document.getElementById("today").textContent =
    today.toLocaleDateString("en-IN", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric"
    });


/* Save everything in the browser */

function saveTasks() {

    localStorage.setItem(
        "dailyTasks",
        JSON.stringify(tasks)
    );
}


/* Add a new task */

function addTask() {

    const taskName = taskInput.value.trim();

    if (taskName === "") {

        taskInput.classList.add("shake");

        setTimeout(() => {
            taskInput.classList.remove("shake");
        }, 300);

        taskInput.focus();

        return;
    }


    const task = {

        id: Date.now(),

        name: taskName,

        priority: priority.value,

        completed: false

    };


    tasks.unshift(task);

    saveTasks();

    taskInput.value = "";

    priority.value = "normal";

    renderTasks();

    taskInput.focus();
}


/* Display tasks */

function renderTasks() {

    taskList.innerHTML = "";


    let visibleTasks = tasks;


    if (currentFilter === "active") {

        visibleTasks = tasks.filter(
            task => !task.completed
        );
    }


    if (currentFilter === "completed") {

        visibleTasks = tasks.filter(
            task => task.completed
        );
    }


    visibleTasks.forEach(task => {

        const taskElement = document.createElement("li");

        taskElement.classList.add("task");

        taskElement.classList.add(task.priority);


        if (task.completed) {
            taskElement.classList.add("completed");
        }


        /* Check button */

        const checkButton =
            document.createElement("button");

        checkButton.classList.add("check-button");

        checkButton.title = "Mark task as complete";


        checkButton.addEventListener(
            "click",
            () => toggleTask(task.id)
        );


        /* Task information */

        const info =
            document.createElement("div");

        info.classList.add("task-info");


        const name =
            document.createElement("div");

        name.classList.add("task-name");

        name.textContent = task.name;


        const badge =
            document.createElement("span");

        badge.classList.add("priority-badge");

        badge.textContent =
            task.priority + " priority";


        info.appendChild(name);

        info.appendChild(badge);


        /*
            Double-clicking the task allows
            the user to edit it.
        */

        name.addEventListener(
            "dblclick",
            () => editTask(task)
        );


        /* Delete button */

        const deleteButton =
            document.createElement("button");

        deleteButton.classList.add("delete-button");

        deleteButton.innerHTML = "×";

        deleteButton.title = "Delete task";


        deleteButton.addEventListener(
            "click",
            () => removeTask(taskElement, task.id)
        );


        /* Put everything together */

        taskElement.appendChild(checkButton);

        taskElement.appendChild(info);

        taskElement.appendChild(deleteButton);

        taskList.appendChild(taskElement);

    });


    updateScreen();
}


/* Complete / uncomplete */

function toggleTask(id) {

    const task = tasks.find(
        task => task.id === id
    );


    if (!task) {
        return;
    }


    task.completed = !task.completed;

    saveTasks();

    renderTasks();
}


/* Delete task with animation */

function removeTask(element, id) {

    element.classList.add("removing");


    setTimeout(() => {

        tasks = tasks.filter(
            task => task.id !== id
        );

        saveTasks();

        renderTasks();

    }, 350);
}


/* Edit task */

function editTask(task) {

    const newName = prompt(
        "Edit your task:",
        task.name
    );


    if (newName === null) {
        return;
    }


    const updatedName = newName.trim();


    if (updatedName === "") {
        return;
    }


    task.name = updatedName;

    saveTasks();

    renderTasks();
}


/* Clear completed tasks */

clearCompleted.addEventListener(
    "click",
    function () {

        const completedTasks =
            document.querySelectorAll(
                ".task.completed"
            );


        if (completedTasks.length === 0) {
            return;
        }


        completedTasks.forEach(
            task => task.classList.add("removing")
        );


        setTimeout(() => {

            tasks = tasks.filter(
                task => !task.completed
            );

            saveTasks();

            renderTasks();

        }, 350);

    }
);


/* Filter buttons */

filterButtons.forEach(button => {

    button.addEventListener(
        "click",
        function () {

            filterButtons.forEach(
                btn => btn.classList.remove("active")
            );


            button.classList.add("active");


            currentFilter =
                button.dataset.filter;


            renderTasks();

        }
    );

});


/* Add button */

addTaskButton.addEventListener(
    "click",
    addTask
);


/* Enter key */

taskInput.addEventListener(
    "keydown",
    function (event) {

        if (event.key === "Enter") {
            addTask();
        }

    }
);


/* Update counter and progress */

function updateScreen() {

    const total = tasks.length;

    const completed =
        tasks.filter(
            task => task.completed
        ).length;


    const percentage =
        total === 0
            ? 0
            : Math.round((completed / total) * 100);


    progressValue.textContent =
        percentage + "%";


    progressRing.style.background =
        `conic-gradient(
            #65734b ${percentage * 3.6}deg,
            #e1ddd4 ${percentage * 3.6}deg
        )`;


    if (total === 1) {
        taskCount.textContent = "1 task";
    } else {
        taskCount.textContent =
            `${total} tasks`;
    }


    if (total === 0) {

        emptyState.style.display = "flex";

    } else {

        emptyState.style.display = "none";
    }
}


/* First load */

renderTasks();