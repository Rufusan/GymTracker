// ========================================
// Gym Tracker - Shared Application Logic
// ========================================

const EXERCISE_DATA = {
    'Chest': [
        'Bench Press', 'Incline Bench Press', 'Decline Bench Press',
        'Dumbbell Fly', 'Cable Crossover', 'Push-Up', 'Chest Dip'
    ],
    'Back': [
        'Deadlift', 'Pull-Up', 'Chin-Up', 'Barbell Row',
        'Dumbbell Row', 'Lat Pulldown', 'Seated Cable Row', 'T-Bar Row'
    ],
    'Shoulders': [
        'Overhead Press', 'Dumbbell Shoulder Press', 'Lateral Raise',
        'Front Raise', 'Rear Delt Fly', 'Arnold Press', 'Upright Row', 'Face Pull'
    ],
    'Legs': [
        'Squat', 'Front Squat', 'Leg Press', 'Lunges',
        'Romanian Deadlift', 'Leg Extension', 'Leg Curl',
        'Calf Raise', 'Bulgarian Split Squat', 'Hip Thrust'
    ],
    'Arms': [
        'Bicep Curl', 'Hammer Curl', 'Preacher Curl', 'Tricep Dip',
        'Tricep Pushdown', 'Overhead Tricep Extension', 'Skull Crusher', 'Concentration Curl'
    ],
    'Core': [
        'Plank', 'Crunch', 'Russian Twist', 'Leg Raise',
        'Ab Wheel Rollout', 'Mountain Climber', 'Dead Bug', 'Hanging Knee Raise'
    ],
    'Cardio': [
        'Running', 'Cycling', 'Rowing', 'Jump Rope',
        'Elliptical', 'Stair Climber', 'Swimming', 'Burpees'
    ]
};

const MAX_SERIES = 6;
const MAX_STARS = 5;
const DATA_VERSION = 1;

// ========================================
// LocalStorage helpers
// ========================================

const STORAGE_KEY = 'gymTracker_trainings';

function getTrainings() {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
}

function saveTrainings(trainings) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(trainings));
}

function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substring(2, 8);
}

// ========================================
// Training CRUD
// ========================================

function addTraining(name, date) {
    const trainings = getTrainings();
    const training = {
        id: generateId(),
        name: name,
        date: date,
        exercises: []
    };
    trainings.push(training);
    saveTrainings(trainings);
    return training;
}

function updateTraining(id, updates) {
    const trainings = getTrainings();
    const index = trainings.findIndex(t => t.id === id);
    if (index !== -1) {
        trainings[index] = { ...trainings[index], ...updates };
        saveTrainings(trainings);
    }
}

function deleteTraining(id) {
    const trainings = getTrainings().filter(t => t.id !== id);
    saveTrainings(trainings);
}

// ========================================
// Exercise CRUD
// ========================================

function addExercise(trainingId, exercise) {
    const trainings = getTrainings();
    const training = trainings.find(t => t.id === trainingId);
    if (training) {
        exercise.series = normalizeSeries(exercise.series);
        if (exercise.rating === undefined) exercise.rating = 0;
        training.exercises.push(exercise);
        saveTrainings(trainings);
    }
}

function updateExercise(trainingId, exerciseIndex, updatedExercise) {
    const trainings = getTrainings();
    const training = trainings.find(t => t.id === trainingId);
    if (training && training.exercises[exerciseIndex]) {
        updatedExercise.series = normalizeSeries(updatedExercise.series);
        training.exercises[exerciseIndex] = updatedExercise;
        saveTrainings(trainings);
    }
}

function deleteExercise(trainingId, exerciseIndex) {
    const trainings = getTrainings();
    const training = trainings.find(t => t.id === trainingId);
    if (training) {
        training.exercises.splice(exerciseIndex, 1);
        saveTrainings(trainings);
    }
}

function normalizeSeries(series) {
    const result = [];
    for (let i = 0; i < MAX_SERIES; i++) {
        const val = series && series[i] !== undefined && series[i] !== null && series[i] !== '' ? series[i] : null;
        result.push(val);
    }
    return result;
}

// ========================================
// Rating helpers
// ========================================

function getAverageRating(training) {
    if (!training || !training.exercises || training.exercises.length === 0) return 0;
    const rated = training.exercises.filter(ex => (ex.rating || 0) > 0);
    if (rated.length === 0) return 0;
    const sum = rated.reduce((acc, ex) => acc + (ex.rating || 0), 0);
    return sum / rated.length;
}

function renderStarsReadonly(rating) {
    let html = '<span class="star-rating-readonly">';
    for (let i = 1; i <= MAX_STARS; i++) {
        if (rating >= i) {
            html += '<span class="star-ro star-full">★</span>';
        } else if (rating >= i - 0.5) {
            html += '<span class="star-ro star-half">★</span>';
        } else {
            html += '<span class="star-ro star-empty">★</span>';
        }
    }
    html += '</span>';
    return html;
}

function renderStarsText(rating) {
    let text = '';
    for (let i = 1; i <= MAX_STARS; i++) {
        text += rating >= i ? '★' : '☆';
    }
    return text;
}

// ========================================
// Import / Export
// ========================================

/**
 * Export all training data as a JSON string.
 */
function exportData() {
    const trainings = getTrainings();
    const exportObj = {
        version: DATA_VERSION,
        exportedAt: new Date().toISOString(),
        trainings: trainings
    };
    return JSON.stringify(exportObj, null, 2);
}

/**
 * Import training data.
 * @param {Array} trainings - Array of training objects to import.
 * @param {string} mode - 'merge' to add to existing, 'replace' to overwrite.
 */
function importData(trainings, mode) {
    if (mode === 'replace') {
        // Ensure every training has an id
        trainings.forEach(t => {
            if (!t.id) t.id = generateId();
            if (!Array.isArray(t.exercises)) t.exercises = [];
            t.exercises.forEach(ex => {
                ex.series = normalizeSeries(ex.series);
                if (ex.rating === undefined) ex.rating = 0;
            });
        });
        saveTrainings(trainings);
    } else if (mode === 'merge') {
        const existing = getTrainings();
        const existingIds = new Set(existing.map(t => t.id));

        trainings.forEach(t => {
            if (!t.id) t.id = generateId();
            if (!Array.isArray(t.exercises)) t.exercises = [];
            t.exercises.forEach(ex => {
                ex.series = normalizeSeries(ex.series);
                if (ex.rating === undefined) ex.rating = 0;
            });

            // If ID already exists, skip (don't overwrite)
            if (existingIds.has(t.id)) return;

            // Check for duplicate by name + date
            const isDuplicate = existing.some(e => e.name === t.name && e.date === t.date);
            if (!isDuplicate) {
                existing.push(t);
                existingIds.add(t.id);
            }
        });

        saveTrainings(existing);
    }
}