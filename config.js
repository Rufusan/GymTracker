const CONFIG = {
    STORAGE_KEY: 'gymTracker_trainings',
    LANGUAGE_STORAGE_KEY: 'gymTracker_language',
    THEME_STORAGE_KEY: 'gymTracker_theme',
    CUSTOM_EXERCISES_KEY: 'gymTracker_customExercises',
    DATA_VERSION: 1,
    MAX_SERIES: 6,
    MAX_STARS: 5,
    LANGUAGE: 'auto',
    AVAILABLE_LANGUAGES: ['pl', 'en'],
    FALLBACK_LANGUAGE: 'en',
    THEME: 'auto',
    DEFAULT_SORT_COLUMN: 'date',
    DEFAULT_SORT_DIRECTION: 'desc',
    PDF_ORIENTATION: 'landscape',
    PDF_HEADER_COLOR: [35, 134, 54],
    PDF_ALT_ROW_COLOR: [245, 245, 245],
    EXERCISE_DATA: {
        'chest': ['bench_press', 'incline_bench_press', 'decline_bench_press', 'dumbbell_fly', 'cable_crossover', 'push_up', 'chest_dip'],
        'back': ['deadlift', 'pull_up', 'chin_up', 'barbell_row', 'dumbbell_row', 'lat_pulldown', 'seated_cable_row', 't_bar_row'],
        'shoulders': ['overhead_press', 'dumbbell_shoulder_press', 'lateral_raise', 'front_raise', 'rear_delt_fly', 'arnold_press', 'upright_row', 'face_pull'],
        'legs': ['squat', 'front_squat', 'leg_press', 'lunges', 'romanian_deadlift', 'leg_extension', 'leg_curl', 'calf_raise', 'bulgarian_split_squat', 'hip_thrust'],
        'biceps': ['bicep_curl', 'hammer_curl', 'preacher_curl', 'concentration_curl', 'incline_dumbbell_curl', 'cable_curl'],
        'triceps': ['tricep_dip', 'tricep_pushdown', 'overhead_tricep_extension', 'skull_crusher', 'close_grip_bench_press', 'tricep_kickback'],
        'core': ['plank', 'crunch', 'russian_twist', 'leg_raise', 'ab_wheel_rollout', 'mountain_climber', 'dead_bug', 'hanging_knee_raise'],
        'cardio': ['running', 'cycling', 'rowing', 'jump_rope', 'elliptical', 'stair_climber', 'swimming', 'burpees']
    }
};

function getCustomExercises() {
    var d = localStorage.getItem(CONFIG.CUSTOM_EXERCISES_KEY);
    return d ? JSON.parse(d) : {};
}
function saveCustomExercises(data) {
    localStorage.setItem(CONFIG.CUSTOM_EXERCISES_KEY, JSON.stringify(data));
}
function addCustomExercise(categoryKey, exerciseName) {
    var custom = getCustomExercises();
    if (!custom[categoryKey]) custom[categoryKey] = [];
    if (custom[categoryKey].indexOf(exerciseName) === -1) {
        custom[categoryKey].push(exerciseName);
        saveCustomExercises(custom);
    }
}
function removeCustomExercise(categoryKey, exerciseName) {
    var custom = getCustomExercises();
    if (!custom[categoryKey]) return;
    custom[categoryKey] = custom[categoryKey].filter(function (n) { return n !== exerciseName; });
    if (!custom[categoryKey].length) delete custom[categoryKey];
    saveCustomExercises(custom);
}