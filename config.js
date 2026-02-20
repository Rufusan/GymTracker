// ========================================
// Konfiguracja aplikacji
// ========================================

const CONFIG = {
    // Klucz localStorage
    STORAGE_KEY: 'gymTracker_trainings',

    // Klucz localStorage dla preferencji języka (null = auto)
    LANGUAGE_STORAGE_KEY: 'gymTracker_language',

    // Wersja danych (dla importu/eksportu)
    DATA_VERSION: 1,

    // Maksymalna liczba serii na ćwiczenie
    MAX_SERIES: 6,

    // Maksymalna liczba gwiazdek oceny
    MAX_STARS: 5,

    // Język: 'auto', 'pl', 'en'
    // 'auto' = wykryj z przeglądarki, z fallbackiem na 'en'
    LANGUAGE: 'auto',

    // Języki dostępne w aplikacji
    AVAILABLE_LANGUAGES: ['pl', 'en'],

    // Domyślny język fallback (gdy język przeglądarki nie jest obsługiwany)
    FALLBACK_LANGUAGE: 'en',

    // Domyślne sortowanie listy treningów
    DEFAULT_SORT_COLUMN: 'date',
    DEFAULT_SORT_DIRECTION: 'desc',

    // Pomocniki daty — ile przycisków i jakie offsety (w dniach)
    DATE_HELPERS: [
        { offset: 0 },
        { offset: -1 },
        { offset: -2 },
        { offset: -3 },
        { offset: -7 },
    ],

    // Orientacja PDF: 'portrait' lub 'landscape'
    PDF_ORIENTATION: 'landscape',

    // Kolory PDF
    PDF_HEADER_COLOR: [35, 134, 54],
    PDF_ALT_ROW_COLOR: [245, 245, 245],

    // Kategorie i ćwiczenia (klucze — tłumaczone przez lang.js)
    EXERCISE_DATA: {
        'chest': [
            'bench_press', 'incline_bench_press', 'decline_bench_press',
            'dumbbell_fly', 'cable_crossover', 'push_up', 'chest_dip'
        ],
        'back': [
            'deadlift', 'pull_up', 'chin_up', 'barbell_row',
            'dumbbell_row', 'lat_pulldown', 'seated_cable_row', 't_bar_row'
        ],
        'shoulders': [
            'overhead_press', 'dumbbell_shoulder_press', 'lateral_raise',
            'front_raise', 'rear_delt_fly', 'arnold_press', 'upright_row', 'face_pull'
        ],
        'legs': [
            'squat', 'front_squat', 'leg_press', 'lunges',
            'romanian_deadlift', 'leg_extension', 'leg_curl',
            'calf_raise', 'bulgarian_split_squat', 'hip_thrust'
        ],
        'arms': [
            'bicep_curl', 'hammer_curl', 'preacher_curl', 'tricep_dip',
            'tricep_pushdown', 'overhead_tricep_extension', 'skull_crusher', 'concentration_curl'
        ],
        'core': [
            'plank', 'crunch', 'russian_twist', 'leg_raise',
            'ab_wheel_rollout', 'mountain_climber', 'dead_bug', 'hanging_knee_raise'
        ],
        'cardio': [
            'running', 'cycling', 'rowing', 'jump_rope',
            'elliptical', 'stair_climber', 'swimming', 'burpees'
        ]
    }
};