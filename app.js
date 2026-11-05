


// 1. HTML ELEMENTS

const checkboxes = document.querySelectorAll(
    ".daily-section input[type='checkbox']"
);

const progressText = document.getElementById("progress");

const addTaskButton = document.getElementById("add-task-btn");
const customTaskInput = document.getElementById("custom-task-input");
const customTaskList = document.getElementById("custom-task-list");

const monthlyGoals = document.querySelectorAll(".monthly-goal");


// 2. STORAGE KEYS

const STORAGE_KEY = "myDailyResetHistory";
const REFLECTION_KEY = "myDailyResetReflection";
const CUSTOM_TASK_KEY = "myCustomTasks";
const CUSTOM_DATE_KEY = "myCustomTasksDate";

const dailyTaskCount = checkboxes.length;

const weeklyDays = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday"
];

const reflectionFields = [
    "went-well",
    "improve",
    "grateful"
];


// 3. GET DATE

function getDateKey(date = new Date()) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
}


// 4. CUSTOM TASKS

let customTasks = JSON.parse(
    localStorage.getItem(CUSTOM_TASK_KEY)
) || [];


// AUTOMATIC DAILY RESET

const customTaskDate = localStorage.getItem(CUSTOM_DATE_KEY);

if (customTaskDate !== getDateKey()) {

    customTasks.forEach(function(task) {
        task.completed = false;
    });

    localStorage.setItem(
        CUSTOM_TASK_KEY,
        JSON.stringify(customTasks)
    );

    localStorage.setItem(
        CUSTOM_DATE_KEY,
        getDateKey()
    );
}


// DISPLAY CUSTOM TASKS

function displayCustomTasks() {

    customTaskList.innerHTML = "";

    customTasks.forEach(function(task, index) {

        const label = document.createElement("label");
        const checkbox = document.createElement("input");
        const editButton = document.createElement("button");
        const deleteButton = document.createElement("button");

        checkbox.type = "checkbox";
        checkbox.checked = task.completed;

        checkbox.addEventListener("change", function() {

            task.completed = checkbox.checked;

            saveCustomTasks();
            displayCustomTasks();
        });


        // EDIT BUTTON

        editButton.textContent = "✏️";
        editButton.type = "button";

        editButton.addEventListener("click", function() {

            const newText = prompt(
                "Edit your task:",
                task.text
            );

            if (newText && newText.trim() !== "") {

                task.text = newText.trim();

                saveCustomTasks();
                displayCustomTasks();
            }
        });


        // DELETE BUTTON

        deleteButton.textContent = "🗑️";
        deleteButton.type = "button";

        deleteButton.addEventListener("click", function() {

            const confirmDelete = confirm(
                "Are you sure you want to delete this task?"
            );

            if (confirmDelete) {

                customTasks.splice(index, 1);

                saveCustomTasks();
                displayCustomTasks();
            }
        });


        label.appendChild(checkbox);
        label.append(" " + task.text);
        label.appendChild(editButton);
        label.appendChild(deleteButton);

        customTaskList.appendChild(label);
    });


    // CUSTOM TASK COUNTER

    const completedCount = customTasks.filter(
        task => task.completed
    ).length;

    const counter = document.getElementById("custom-task-count");

    if (counter) {
        counter.textContent =
            `${completedCount} / ${customTasks.length} Completed`;
    }
}


// SAVE CUSTOM TASKS

function saveCustomTasks() {

    localStorage.setItem(
        CUSTOM_TASK_KEY,
        JSON.stringify(customTasks)
    );

    localStorage.setItem(
        CUSTOM_DATE_KEY,
        getDateKey()
    );

    updateProgress();
}


// ADD CUSTOM TASK

addTaskButton.addEventListener("click", function() {

    const taskText = customTaskInput.value.trim();

    if (taskText === "") {
        alert("Please write a task first!");
        return;
    }

    customTasks.push({
        text: taskText,
        completed: false
    });

    saveCustomTasks();
    displayCustomTasks();

    customTaskInput.value = "";
});


// ENTER KEY

customTaskInput.addEventListener("keydown", function(event) {

    if (event.key === "Enter") {
        addTaskButton.click();
    }
});


// 5. GET TASK HISTORY

function getHistory() {

    return JSON.parse(
        localStorage.getItem(STORAGE_KEY)
    ) || {};
}


// 6. LOAD DAILY TASKS

function loadTasks() {

    const history = getHistory();
    const today = getDateKey();

    const savedTasks = history[today] || [];

    checkboxes.forEach(function(checkbox, index) {

        checkbox.checked = savedTasks[index] === true;
    });

    updateProgress();
}


// 7. SAVE DAILY TASKS

function saveTasks() {

    const history = getHistory();
    const today = getDateKey();

    history[today] = Array.from(checkboxes).map(
        checkbox => checkbox.checked
    );

    localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(history)
    );

    updateProgress();
    updateStreak();
    updateWeeklyProgress();
}


// 8. DAILY PROGRESS

function updateProgress() {

    const total = checkboxes.length + customTasks.length;

    const completedDaily = Array.from(checkboxes).filter(
        checkbox => checkbox.checked
    ).length;

    const completedCustom = customTasks.filter(
        task => task.completed
    ).length;

    const completed = completedDaily + completedCustom;

    const percentage = total === 0
        ? 0
        : Math.round((completed / total) * 100);

    progressText.textContent =
        `${completed} / ${total} Completed - ${percentage}%`;

    document.getElementById("daily-progress-bar").style.width =
        `${percentage}%`;
}


// 9. GET MONDAY

function getMonday(date) {

    const result = new Date(date);
    const day = result.getDay();

    const difference = day === 0 ? -6 : 1 - day;

    result.setDate(result.getDate() + difference);

    return result;
}


// 10. WEEKLY PROGRESS

function updateWeeklyProgress() {

    const history = getHistory();
    const monday = getMonday(new Date());

    let totalCompleted = 0;
    let totalPossible = 0;

    const todayIndex = (new Date().getDay() + 6) % 7;

    const dayCards = document.querySelectorAll(".day-card");

    weeklyDays.forEach(function(dayName, index) {

        const currentDate = new Date(monday);

        currentDate.setDate(monday.getDate() + index);

        const dateKey = getDateKey(currentDate);
        const savedTasks = history[dateKey] || [];

        const completed = savedTasks.filter(
            task => task === true
        ).length;

        const percentage = dailyTaskCount === 0
            ? 0
            : Math.round((completed / dailyTaskCount) * 100);

        if (index <= todayIndex) {

            totalCompleted += completed;
            totalPossible += dailyTaskCount;
        }

        if (dayCards[index]) {

            dayCards[index].querySelector("p").textContent =
                `${percentage}% Completed`;
        }
    });

    const weeklyPercentage = totalPossible === 0
        ? 0
        : Math.round((totalCompleted / totalPossible) * 100);

    document.getElementById("weekly-completed").textContent =
        `${totalCompleted} Tasks Completed`;

    document.getElementById("weekly-percentage").textContent =
        `${weeklyPercentage}% Weekly Progress`;
}


// 11. STREAK TRACKER

function updateStreak() {

    const history = getHistory();

    const today = new Date();
    const todayKey = getDateKey(today);

    const todayTasks = history[todayKey] || [];

    const todayComplete =
        dailyTaskCount > 0 &&
        todayTasks.length === dailyTaskCount &&
        todayTasks.every(task => task === true);

    let streak = 0;

    const checkDate = new Date(today);

    if (!todayComplete) {
        checkDate.setDate(checkDate.getDate() - 1);
    }

    while (true) {

        const dateKey = getDateKey(checkDate);
        const tasks = history[dateKey] || [];

        const completed =
            dailyTaskCount > 0 &&
            tasks.length === dailyTaskCount &&
            tasks.every(task => task === true);

        if (!completed) {
            break;
        }

        streak++;

        checkDate.setDate(checkDate.getDate() - 1);
    }

    document.getElementById("streak-count").textContent =
        `${streak} Days 🔥`;
}


// 12. DAILY REFLECTION

function getReflections() {

    return JSON.parse(
        localStorage.getItem(REFLECTION_KEY)
    ) || {};
}


// LOAD TODAY'S REFLECTION

function loadReflection() {

    const reflections = getReflections();
    const today = getDateKey();

    let todayReflection = reflections[today];

    if (!todayReflection) {

        todayReflection = {};

        reflectionFields.forEach(function(id) {

            todayReflection[id] =
                localStorage.getItem(id) || "";
        });

        reflections[today] = todayReflection;

        localStorage.setItem(
            REFLECTION_KEY,
            JSON.stringify(reflections)
        );
    }

    reflectionFields.forEach(function(id) {

        document.getElementById(id).value =
            todayReflection[id] || "";
    });
}


// SAVE TODAY'S REFLECTION

function saveReflection() {

    const reflections = getReflections();
    const today = getDateKey();

    if (!reflections[today]) {
        reflections[today] = {};
    }

    reflectionFields.forEach(function(id) {

        reflections[today][id] =
            document.getElementById(id).value;
    });

    localStorage.setItem(
        REFLECTION_KEY,
        JSON.stringify(reflections)
    );
}


// REFLECTION LISTENERS

reflectionFields.forEach(function(id) {

    document.getElementById(id).addEventListener(
        "input",
        saveReflection
    );
});


// DAILY CHECKBOX LISTENERS

checkboxes.forEach(function(checkbox) {

    checkbox.addEventListener("change", saveTasks);
});


// 13. MONTHLY GOALS

function saveMonthlyGoals() {

    const goals = [];

    monthlyGoals.forEach(function(goal) {

        goals.push(goal.checked);
    });

    localStorage.setItem(
        "myMonthlyGoals",
        JSON.stringify(goals)
    );

    updateMonthlyProgress();
}


function loadMonthlyGoals() {

    const savedGoals = JSON.parse(
        localStorage.getItem("myMonthlyGoals")
    ) || [];

    monthlyGoals.forEach(function(goal, index) {

        goal.checked = savedGoals[index] === true;
    });

    updateMonthlyProgress();
}


function updateMonthlyProgress() {

    const completed = Array.from(monthlyGoals).filter(
        goal => goal.checked
    ).length;

    document.getElementById("monthly-progress").textContent =
        `${completed} / ${monthlyGoals.length} Goals Completed`;

    const percentage = monthlyGoals.length === 0
        ? 0
        : (completed / monthlyGoals.length) * 100;

    document.getElementById("monthly-progress-bar").style.width =
        `${percentage}%`;
}


// MONTHLY GOAL LISTENERS

monthlyGoals.forEach(function(goal) {

    goal.addEventListener("change", saveMonthlyGoals);
});


// 14. CURRENT DATE

function showCurrentDate() {

    const today = new Date();

    const options = {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric"
    };

    document.getElementById("current-date").textContent =
        today.toLocaleDateString("en-US", options);
}


// 15. DAILY GREETING

function showGreeting() {

    const hour = new Date().getHours();

    let message;

    if (hour < 12) {
        message = "Good Morning ☀️";
    } else if (hour < 17) {
        message = "Good Afternoon 🌸";
    } else if (hour < 21) {
        message = "Good Evening 💗";
    } else {
        message = "Good Night 🌙";
    }

    document.getElementById("greeting").textContent =
        message + " Welcome to your Daily Reset!";
}


// 16. START APPLICATION

loadTasks();
loadReflection();
loadMonthlyGoals();

displayCustomTasks();

updateWeeklyProgress();
updateStreak();
updateProgress();

showCurrentDate();
showGreeting();

// Reset Today's Tasks
const resetButton = document.getElementById("reset-day-btn");

resetButton.addEventListener("click", function () {

    const confirmReset = confirm("Are you sure you want to reset today's tasks?");

    if (confirmReset) {

        checkboxes.forEach(function (checkbox) {
            checkbox.checked = false;
        });

        customTasks.forEach(function (task) {
            task.completed = false;
        });

        saveTasks();
        saveCustomTasks();
        displayCustomTasks();

        alert("Your daily tasks have been reset! 🌸");
    }

});

// Clear Daily Reflection
const resetReflectionButton = document.getElementById("reset-reflection-btn");

resetReflectionButton.addEventListener("click", function () {

    const confirmClear = confirm("Clear all your reflection notes?");

    if (confirmClear) {

        document.getElementById("went-well").value = "";
        document.getElementById("improve").value = "";
        document.getElementById("grateful").value = "";

        saveReflection();

        alert("Reflection cleared! 🌸");
    }

});

// Back to Top
const backToTopButton = document.getElementById("back-to-top");

backToTopButton.addEventListener("click", function () {
    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
});