// ===============================
// SUPABASE CONNECTION
// ===============================

const SUPABASE_URL = "https://qojjciucyunckzwfzylv.supabase.co";
const SUPABASE_KEY = "sb_publishable_3JKO6Ms3nEmrcT1U0QZnGA_Az5cKRgo";

const supabaseClient = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY
);

console.log("GymBuddy Supabase connected 🚀");
/* =========================================================
   GYMBUDDY - SCRIPT.JS
   STEP 5: Workout Tracker + Rest Timer + Workout Alarm
   ========================================================= */

"use strict";

/* =========================================================
   1. DEFAULT DATA
   ========================================================= */

const defaultData = {
    name: "User",
    age: "",
    height: "",
    weight: 72,
    goal: "muscle",
    goalWeight: 75,
    streak: 7,
    bestStreak: 14,
    workouts: 24,
    theme: "dark"
};

/* =========================================================
   2. LOCAL STORAGE DATA
   ========================================================= */

let gymData = JSON.parse(
    localStorage.getItem("gymBuddyData")
) || { ...defaultData };

let workoutHistory = JSON.parse(
    localStorage.getItem("gymBuddyWorkoutHistory")
) || [];

let weightHistory = JSON.parse(
    localStorage.getItem("gymBuddyWeightHistory")
) || [];

let alarmData = JSON.parse(
    localStorage.getItem("gymBuddyAlarm")
) || {
    enabled: false,
    time: "",
    daily: true,
    lastTriggered: ""
};

/* =========================================================
   3. GLOBAL VARIABLES
   ========================================================= */

let restTimerInterval = null;
let restSecondsLeft = 0;
let toastTimeout = null;

/* =========================================================
   4. SAVE FUNCTIONS
   ========================================================= */

function saveGymData() {
    localStorage.setItem(
        "gymBuddyData",
        JSON.stringify(gymData)
    );
}

function saveWorkoutHistory() {
    localStorage.setItem(
        "gymBuddyWorkoutHistory",
        JSON.stringify(workoutHistory)
    );
}

function saveWeightHistory() {
    localStorage.setItem(
        "gymBuddyWeightHistory",
        JSON.stringify(weightHistory)
    );
}

function saveAlarmData() {
    localStorage.setItem(
        "gymBuddyAlarm",
        JSON.stringify(alarmData)
    );
}

/* =========================================================
   5. HELPER FUNCTIONS
   ========================================================= */

function getTodayDate() {
    const now = new Date();

    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
}

function getReadableDate() {
    return new Date().toLocaleDateString(undefined, {
        day: "numeric",
        month: "short",
        year: "numeric"
    });
}

function formatTime12Hour(time) {
    if (!time) return "--:--";

    const [hours, minutes] = time.split(":");

    let hour = Number(hours);
    const ampm = hour >= 12 ? "PM" : "AM";

    hour = hour % 12;
    hour = hour || 12;

    return `${hour}:${minutes} ${ampm}`;
}

/* =========================================================
   6. TOAST
   ========================================================= */

function showToast(message) {
    const toast = document.getElementById("toast");

    if (!toast) return;

    toast.textContent = message;
    toast.classList.add("show");

    clearTimeout(toastTimeout);

    toastTimeout = setTimeout(() => {
        toast.classList.remove("show");
    }, 3000);
}

/* =========================================================
   7. PAGE NAVIGATION
   ========================================================= */

function showPage(pageId) {
    const pages = document.querySelectorAll(".page");

    pages.forEach(page => {
        page.classList.remove("active");
    });

    const selectedPage = document.getElementById(pageId);

    if (selectedPage) {
        selectedPage.classList.add("active");
    }

    document.querySelectorAll(".nav-item").forEach(item => {
        item.classList.remove("active");

        if (item.dataset.page === pageId) {
            item.classList.add("active");
        }
    });

    document.querySelectorAll(".mobile-nav-item").forEach(item => {
        item.classList.remove("active");

        if (item.dataset.page === pageId) {
            item.classList.add("active");
        }
    });

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}

function initNavigation() {
    document.querySelectorAll(".nav-item").forEach(item => {
        item.addEventListener("click", () => {
            const pageId = item.dataset.page;

            if (pageId) {
                showPage(pageId);
            }
        });
    });

    document.querySelectorAll(".mobile-nav-item").forEach(item => {
        item.addEventListener("click", () => {
            const pageId = item.dataset.page;

            if (pageId) {
                showPage(pageId);
            }
        });
    });
}

/* =========================================================
   8. DASHBOARD
   ========================================================= */

function updateDashboard() {
    const streakValue = document.getElementById("streakValue");
    const workoutCount = document.getElementById("workoutCount");
    const weightValue = document.getElementById("weightValue");
    const bestStreakValue = document.getElementById("bestStreakValue");

    const topbarUser = document.getElementById("topbarUser");
    const dashboardWeight = document.getElementById("dashboardWeight");
    const dashboardGoalWeight = document.getElementById("dashboardGoalWeight");

    if (streakValue) {
        streakValue.textContent = gymData.streak;
    }

    if (workoutCount) {
        workoutCount.textContent = gymData.workouts;
    }

    if (weightValue) {
        weightValue.textContent = `${gymData.weight || 0} kg`;
    }

    if (bestStreakValue) {
        bestStreakValue.textContent = gymData.bestStreak;
    }

    if (topbarUser) {
        topbarUser.textContent = gymData.name || "User";
    }

    if (dashboardWeight) {
        dashboardWeight.textContent = `${gymData.weight || 0} kg`;
    }

    if (dashboardGoalWeight) {
        dashboardGoalWeight.textContent =
            `${gymData.goalWeight || 75} kg`;
    }
}

/* =========================================================
   9. PROFILE
   ========================================================= */

function loadProfile() {
    const profileName = document.getElementById("profileName");
    const profileAge = document.getElementById("profileAge");
    const profileHeight = document.getElementById("profileHeight");
    const profileWeight = document.getElementById("profileWeight");
    const profileGoal = document.getElementById("profileGoal");

    if (profileName) {
        profileName.value = gymData.name || "";
    }

    if (profileAge) {
        profileAge.value = gymData.age || "";
    }

    if (profileHeight) {
        profileHeight.value = gymData.height || "";
    }

    if (profileWeight) {
        profileWeight.value = gymData.weight || "";
    }

    if (profileGoal) {
        profileGoal.value = gymData.goal || "muscle";
    }
}

function saveProfile() {
    const profileName = document.getElementById("profileName");
    const profileAge = document.getElementById("profileAge");
    const profileHeight = document.getElementById("profileHeight");
    const profileWeight = document.getElementById("profileWeight");
    const profileGoal = document.getElementById("profileGoal");

    if (profileName) {
        gymData.name = profileName.value.trim() || "User";
    }

    if (profileAge) {
        gymData.age = profileAge.value;
    }

    if (profileHeight) {
        gymData.height = profileHeight.value;
    }

    if (profileWeight) {
        const weight = Number(profileWeight.value);

        if (weight > 0) {
            gymData.weight = weight;
        }
    }

    if (profileGoal) {
        gymData.goal = profileGoal.value;
    }

    saveGymData();
    updateDashboard();
    updateProgressPage();

    showToast("Profile saved successfully ✅");
}

/* =========================================================
   10. WEIGHT UPDATE
   ========================================================= */

function updateWeight() {
    const newWeightInput = document.getElementById("newWeight");

    if (!newWeightInput) return;

    const value = Number(newWeightInput.value);

    if (!value || value <= 0) {
        showToast("Please enter a valid weight.");
        return;
    }

    gymData.weight = value;

    weightHistory.push({
        date: getTodayDate(),
        weight: value
    });

    saveGymData();
    saveWeightHistory();

    updateDashboard();
    updateProgressPage();

    newWeightInput.value = "";

    showToast("Weight updated successfully 💪");
}

/* =========================================================
   11. PROGRESS PAGE
   ========================================================= */

function updateProgressPage() {
    const currentWeight =
        document.getElementById("progressCurrentWeight");

    const goalWeight =
        document.getElementById("progressGoalWeight");

    const progressWorkoutCount =
        document.getElementById("progressWorkoutCount");

    if (currentWeight) {
        currentWeight.textContent =
            `${gymData.weight || 0} kg`;
    }

    if (goalWeight) {
        goalWeight.textContent =
            `${gymData.goalWeight || 75} kg`;
    }

    if (progressWorkoutCount) {
        progressWorkoutCount.textContent =
            gymData.workouts;
    }
}

/* =========================================================
   12. BMI CALCULATOR
   ========================================================= */

function calculateBMI() {
    const heightInput =
        document.getElementById("bmiHeight");

    const weightInput =
        document.getElementById("bmiWeight");

    const result =
        document.getElementById("bmiResult");

    if (!heightInput || !weightInput || !result) {
        return;
    }

    const height = Number(heightInput.value);
    const weight = Number(weightInput.value);

    if (!height || !weight || height <= 0 || weight <= 0) {
        result.textContent =
            "Please enter valid height and weight.";
        return;
    }

    const heightMeters = height / 100;

    const bmi =
        weight / (heightMeters * heightMeters);

    let category = "";

    if (bmi < 18.5) {
        category = "Underweight";
    } else if (bmi < 25) {
        category = "Normal";
    } else if (bmi < 30) {
        category = "Overweight";
    } else {
        category = "Obesity";
    }

    result.innerHTML = `
        <strong>${bmi.toFixed(1)}</strong>
        <span>${category}</span>
    `;
}

/* =========================================================
   13. WORKOUT DATE
   ========================================================= */

function updateWorkoutDate() {
    const workoutDate =
        document.getElementById("workoutDate");

    if (workoutDate) {
        workoutDate.textContent = getReadableDate();
    }
}

/* =========================================================
   14. WORKOUT TRACKER
   ========================================================= */

function initializeWorkoutTracker() {
    const exerciseCards =
        document.querySelectorAll(".exercise-card");

    const exerciseCount =
        document.getElementById("exerciseCount");

    if (exerciseCount) {
        exerciseCount.textContent =
            exerciseCards.length;
    }

    document.querySelectorAll(".set-done").forEach(button => {
        button.addEventListener("click", () => {
            const row = button.closest(".set-row");

            if (!row) return;

            const weightInput =
                row.querySelector(".weight-input");

            const repsInput =
                row.querySelector(".reps-input");

            const weight =
                Number(weightInput?.value || 0);

            const reps =
                Number(repsInput?.value || 0);

            if (!weight || !reps) {
                showToast(
                    "Weight aur reps enter karo pehle."
                );
                return;
            }

            button.classList.toggle("completed");

            if (button.classList.contains("completed")) {
                button.textContent = "✓";
                row.classList.add("completed");
            } else {
                button.textContent = "✓";
                row.classList.remove("completed");
            }

            updateCompletedSets();
            saveCurrentWorkout();
        });
    });

    document.querySelectorAll(
        ".weight-input, .reps-input"
    ).forEach(input => {
        input.addEventListener("input", () => {
            saveCurrentWorkout();
            updateCompletedSets();
        });
    });

    updateCompletedSets();
    loadTodayWorkout();
}

/* =========================================================
   15. COUNT COMPLETED SETS
   ========================================================= */

function updateCompletedSets() {
    const completedButtons =
        document.querySelectorAll(
            ".set-done.completed"
        );

    const completedSets =
        document.getElementById("completedSets");

    if (completedSets) {
        completedSets.textContent =
            completedButtons.length;
    }

    const totalSets =
        document.querySelectorAll(".set-row").length;

    const workoutStatus =
        document.getElementById("workoutStatus");

    if (workoutStatus) {
        if (completedButtons.length === 0) {
            workoutStatus.textContent = "Not Started";
        } else if (
            completedButtons.length < totalSets
        ) {
            workoutStatus.textContent = "In Progress";
        } else {
            workoutStatus.textContent = "Ready to Complete";
        }
    }
}

/* =========================================================
   16. SAVE CURRENT WORKOUT
   ========================================================= */

function saveCurrentWorkout() {
    const exercises = [];

    document.querySelectorAll(".exercise-card")
        .forEach((card, exerciseIndex) => {

            const titleElement =
                card.querySelector(".exercise-name, h3");

            const exerciseName =
                titleElement
                    ? titleElement.textContent.trim()
                    : `Exercise ${exerciseIndex + 1}`;

            const sets = [];

            card.querySelectorAll(".set-row")
                .forEach((row, setIndex) => {

                    const weight =
                        row.querySelector(".weight-input");

                    const reps =
                        row.querySelector(".reps-input");

                    const done =
                        row.querySelector(".set-done");

                    sets.push({
                        set: setIndex + 1,
                        weight: weight
                            ? weight.value
                            : "",
                        reps: reps
                            ? reps.value
                            : "",
                        completed:
                            done?.classList.contains(
                                "completed"
                            ) || false
                    });
                });

            exercises.push({
                name: exerciseName,
                sets
            });
        });

    const today = getTodayDate();

    let todayWorkout =
        workoutHistory.find(
            item => item.date === today
        );

    if (!todayWorkout) {
        todayWorkout = {
            date: today,
            completed: false,
            exercises
        };

        workoutHistory.push(todayWorkout);
    } else {
        todayWorkout.exercises = exercises;
    }

    saveWorkoutHistory();
}

/* =========================================================
   17. LOAD TODAY WORKOUT
   ========================================================= */

function loadTodayWorkout() {
    const today = getTodayDate();

    const todayWorkout =
        workoutHistory.find(
            item => item.date === today
        );

    if (!todayWorkout || !todayWorkout.exercises) {
        return;
    }

    const cards =
        document.querySelectorAll(".exercise-card");

    todayWorkout.exercises.forEach(
        (savedExercise, exerciseIndex) => {

            const card = cards[exerciseIndex];

            if (!card) return;

            const rows =
                card.querySelectorAll(".set-row");

            savedExercise.sets.forEach(
                (savedSet, setIndex) => {

                    const row = rows[setIndex];

                    if (!row) return;

                    const weight =
                        row.querySelector(".weight-input");

                    const reps =
                        row.querySelector(".reps-input");

                    const done =
                        row.querySelector(".set-done");

                    if (weight) {
                        weight.value =
                            savedSet.weight || "";
                    }

                    if (reps) {
                        reps.value =
                            savedSet.reps || "";
                    }

                    if (
                        done &&
                        savedSet.completed
                    ) {
                        done.classList.add("completed");
                        row.classList.add("completed");
                    }
                }
            );
        }
    );

    updateCompletedSets();
}

/* =========================================================
   18. COMPLETE WORKOUT
   ========================================================= */

function completeWorkout() {
    const today = getTodayDate();

    let todayWorkout =
        workoutHistory.find(
            item => item.date === today
        );

    if (todayWorkout?.completed) {
        showToast(
            "Today's workout already completed 🔥"
        );
        return;
    }

    saveCurrentWorkout();

    todayWorkout =
        workoutHistory.find(
            item => item.date === today
        );

    if (!todayWorkout) {
        todayWorkout = {
            date: today,
            completed: true,
            exercises: []
        };

        workoutHistory.push(todayWorkout);
    } else {
        todayWorkout.completed = true;
    }

    /* Increase workout count only once */
    gymData.workouts =
        Number(gymData.workouts || 0) + 1;

    /* Update streak */
    gymData.streak =
        Number(gymData.streak || 0) + 1;

    if (gymData.streak > gymData.bestStreak) {
        gymData.bestStreak =
            gymData.streak;
    }

    saveGymData();
    saveWorkoutHistory();

    updateDashboard();
    updateProgressPage();
    updateCompletedSets();

    const workoutStatus =
        document.getElementById("workoutStatus");

    if (workoutStatus) {
        workoutStatus.textContent =
            "Completed 🔥";
    }

    const button =
        document.getElementById("completeWorkoutBtn");

    if (button) {
        button.disabled = true;
        button.textContent =
            "✓ Workout Completed";
    }

    showToast(
        "Workout completed! Great job bro 🔥💪"
    );
}

/* =========================================================
   19. REST TIMER
   ========================================================= */

function startRestTimer(seconds) {
    clearInterval(restTimerInterval);

    restSecondsLeft = Number(seconds);

    updateRestTimerDisplay(
        restSecondsLeft
    );

    restTimerInterval =
        setInterval(() => {

            restSecondsLeft--;

            updateRestTimerDisplay(
                restSecondsLeft
            );

            if (restSecondsLeft <= 0) {

                clearInterval(
                    restTimerInterval
                );

                restTimerInterval = null;

                restSecondsLeft = 0;

                updateRestTimerDisplay(0);

                playAlarmSound();

                showToast(
                    "Rest finished! Get back to work 🔥"
                );

                sendRestNotification();
            }

        }, 1000);
}

function updateRestTimerDisplay(seconds) {
    const timer =
        document.getElementById("restTimer");

    if (!timer) return;

    const mins =
        Math.floor(seconds / 60);

    const secs =
        seconds % 60;

    timer.textContent =
        `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
}

function initializeRestTimer() {
    document.querySelectorAll(
        "[data-rest]"
    ).forEach(button => {

        button.addEventListener(
            "click",
            () => {

                const seconds =
                    Number(button.dataset.rest);

                startRestTimer(seconds);
            }
        );
    });
}

/* =========================================================
   20. AUDIO ALARM
   ========================================================= */

function playAlarmSound() {
    try {
        const AudioContext =
            window.AudioContext ||
            window.webkitAudioContext;

        if (!AudioContext) return;

        const audioContext =
            new AudioContext();

        const oscillator =
            audioContext.createOscillator();

        const gain =
            audioContext.createGain();

        oscillator.type = "sine";

        oscillator.frequency.value = 880;

        gain.gain.setValueAtTime(
            0.001,
            audioContext.currentTime
        );

        gain.gain.exponentialRampToValueAtTime(
            0.4,
            audioContext.currentTime + 0.05
        );

        gain.gain.exponentialRampToValueAtTime(
            0.001,
            audioContext.currentTime + 1
        );

        oscillator.connect(gain);
        gain.connect(audioContext.destination);

        oscillator.start();

        oscillator.stop(
            audioContext.currentTime + 1
        );

        setTimeout(() => {
            audioContext.close();
        }, 1500);

    } catch (error) {
        console.log(
            "Audio alarm unavailable:",
            error
        );
    }
}

/* =========================================================
   21. NOTIFICATION
   ========================================================= */

async function requestNotificationPermission() {
    if (!("Notification" in window)) {
        return;
    }

    if (Notification.permission === "default") {
        try {
            await Notification.requestPermission();
        } catch (error) {
            console.log(
                "Notification permission error:",
                error
            );
        }
    }
}

function sendRestNotification() {
    if (
        "Notification" in window &&
        Notification.permission === "granted"
    ) {
        new Notification(
            "GymBuddy Rest Timer 💪",
            {
                body:
                    "Rest finished! Time for your next set."
            }
        );
    }
}

/* =========================================================
   22. WORKOUT ALARM
   ========================================================= */

function initializeAlarm() {
    const alarmTime =
        document.getElementById("alarmTime");

    const dailyAlarm =
        document.getElementById("dailyAlarm");

    if (alarmTime) {
        alarmTime.value =
            alarmData.time || "";
    }

    if (dailyAlarm) {
        dailyAlarm.checked =
            alarmData.daily !== false;
    }

    updateAlarmUI();

    const setAlarmBtn =
        document.getElementById("setAlarmBtn");

    const removeAlarmBtn =
        document.getElementById("removeAlarmBtn");

    if (setAlarmBtn) {
        setAlarmBtn.addEventListener(
            "click",
            setWorkoutAlarm
        );
    }

    if (removeAlarmBtn) {
        removeAlarmBtn.addEventListener(
            "click",
            removeWorkoutAlarm
        );
    }

    setInterval(
        checkWorkoutAlarm,
        1000
    );
}

async function setWorkoutAlarm() {
    const alarmTime =
        document.getElementById("alarmTime");

    const dailyAlarm =
        document.getElementById("dailyAlarm");

    if (!alarmTime || !alarmTime.value) {
        showToast(
            "Please select alarm time."
        );
        return;
    }

    alarmData.enabled = true;

    alarmData.time =
        alarmTime.value;

    alarmData.daily =
        dailyAlarm
            ? dailyAlarm.checked
            : true;

    alarmData.lastTriggered = "";

    saveAlarmData();

    await requestNotificationPermission();

    updateAlarmUI();

    showToast(
        `Workout alarm set for ${formatTime12Hour(alarmData.time)} ⏰`
    );
}

function removeWorkoutAlarm() {
    alarmData.enabled = false;
    alarmData.time = "";
    alarmData.lastTriggered = "";

    saveAlarmData();

    updateAlarmUI();

    const alarmTime =
        document.getElementById("alarmTime");

    if (alarmTime) {
        alarmTime.value = "";
    }

    showToast(
        "Workout alarm removed."
    );
}

function updateAlarmUI() {
    const alarmStatus =
        document.getElementById("alarmStatus");

    const nextAlarmText =
        document.getElementById("nextAlarmText");

    if (!alarmStatus || !nextAlarmText) {
        return;
    }

    if (
        alarmData.enabled &&
        alarmData.time
    ) {
        alarmStatus.textContent =
            "Alarm Active";

        alarmStatus.classList.add("active");

        nextAlarmText.textContent =
            `Next alarm: ${formatTime12Hour(
                alarmData.time
            )}`;
    } else {
        alarmStatus.textContent =
            "No Alarm";

        alarmStatus.classList.remove("active");

        nextAlarmText.textContent =
            "No workout alarm set";
    }
}

/* =========================================================
   23. CHECK ALARM
   ========================================================= */

function checkWorkoutAlarm() {
    if (
        !alarmData.enabled ||
        !alarmData.time
    ) {
        return;
    }

    const now = new Date();

    const currentHours =
        String(now.getHours())
            .padStart(2, "0");

    const currentMinutes =
        String(now.getMinutes())
            .padStart(2, "0");

    const currentTime =
        `${currentHours}:${currentMinutes}`;

    const today =
        getTodayDate();

    if (
        currentTime === alarmData.time &&
        alarmData.lastTriggered !== today
    ) {
        triggerWorkoutAlarm();

        alarmData.lastTriggered =
            today;

        if (!alarmData.daily) {
            alarmData.enabled = false;
            alarmData.time = "";
        }

        saveAlarmData();

        updateAlarmUI();
    }
}

/* =========================================================
   24. TRIGGER WORKOUT ALARM
   ========================================================= */

function triggerWorkoutAlarm() {
    playAlarmSound();

    showToast(
        "⏰ Workout time! Let's get stronger 💪🔥"
    );

    if (
        "Notification" in window &&
        Notification.permission === "granted"
    ) {
        new Notification(
            "GymBuddy Workout Reminder 💪",
            {
                body:
                    "It's workout time! Let's get stronger."
            }
        );
    }

    /* Small vibration on supported phones */
    if ("vibrate" in navigator) {
        navigator.vibrate([
            300,
            150,
            300,
            150,
            500
        ]);
    }
}

/* =========================================================
   25. THEME
   ========================================================= */

function applyTheme() {
    if (gymData.theme === "light") {
        document.body.classList.add(
            "light-theme"
        );
    } else {
        document.body.classList.remove(
            "light-theme"
        );
    }

    updateThemeButton();
}

function updateThemeButton() {
    const themeToggle =
        document.getElementById("themeToggle");

    if (!themeToggle) return;

    if (gymData.theme === "light") {
        themeToggle.textContent =
            "🌙 Dark Mode";
    } else {
        themeToggle.textContent =
            "☀️ Light Mode";
    }
}

function toggleTheme() {
    if (gymData.theme === "dark") {
        gymData.theme = "light";
    } else {
        gymData.theme = "dark";
    }

    saveGymData();

    applyTheme();

    showToast(
        gymData.theme === "light"
            ? "Light mode enabled ☀️"
            : "Dark mode enabled 🌙"
    );
}

/* =========================================================
   26. CHECK COMPLETED WORKOUT BUTTON
   ========================================================= */

function updateWorkoutCompletionButton() {
    const button =
        document.getElementById(
            "completeWorkoutBtn"
        );

    if (!button) return;

    const today =
        getTodayDate();

    const todayWorkout =
        workoutHistory.find(
            item => item.date === today
        );

    if (todayWorkout?.completed) {
        button.disabled = true;

        button.textContent =
            "✓ Workout Completed";
    }
}

/* =========================================================
   27. BUTTON EVENT LISTENERS
   ========================================================= */

function initializeButtons() {

    const saveProfileBtn =
        document.getElementById(
            "saveProfileBtn"
        );

    if (saveProfileBtn) {
        saveProfileBtn.addEventListener(
            "click",
            saveProfile
        );
    }

    const updateWeightBtn =
        document.getElementById(
            "updateWeightBtn"
        );

    if (updateWeightBtn) {
        updateWeightBtn.addEventListener(
            "click",
            updateWeight
        );
    }

    const calculateBmiBtn =
        document.getElementById(
            "calculateBmiBtn"
        );

    if (calculateBmiBtn) {
        calculateBmiBtn.addEventListener(
            "click",
            calculateBMI
        );
    }

    const completeWorkoutBtn =
        document.getElementById(
            "completeWorkoutBtn"
        );

    if (completeWorkoutBtn) {
        completeWorkoutBtn.addEventListener(
            "click",
            completeWorkout
        );
    }

    const themeToggle =
        document.getElementById(
            "themeToggle"
        );

    if (themeToggle) {
        themeToggle.addEventListener(
            "click",
            toggleTheme
        );
    }
}

/* =========================================================
   28. INITIALIZE APP
   ========================================================= */

function initializeApp() {

    /* Theme */
    applyTheme();

    /* Navigation */
    initNavigation();

    /* Buttons */
    initializeButtons();

    /* Dashboard */
    updateDashboard();

    /* Profile */
    loadProfile();

    /* Progress */
    updateProgressPage();

    /* Workout */
    updateWorkoutDate();
    initializeWorkoutTracker();
    initializeRestTimer();
    updateWorkoutCompletionButton();

    /* Alarm */
    initializeAlarm();

    /* Default page */
    showPage("homePage");

    console.log(
        "GymBuddy initialized successfully 🚀"
    );
}

/* =========================================================
   29. START APP
   ========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    initializeApp
);
