// ========================================
// Warstwa językowa
// ========================================

const TRANSLATIONS = {
    pl: {
        language_name: 'Polski', language_flag: '🇵🇱', html_lang: 'pl',
        app_title: 'Dziennik Treningowy', app_title_emoji: '🏋️ Dziennik Treningowy',
        btn_add_training: '+ Dodaj trening', btn_edit: '✎ Edytuj', btn_pdf: '⤓ PDF',
        btn_delete: '✕ Usuń', btn_filters: '🔍 Filtry', btn_data: '💾 Dane',
        btn_save: 'Zapisz', btn_cancel: 'Anuluj',
        btn_add_exercise: '+ Dodaj ćwiczenie', btn_delete_exercise_title: 'Usuń ćwiczenie',
        back_to_trainings: '← Powrót do treningów',
        data_bar_info: 'Eksportuj dane jako JSON, aby wykonać kopię zapasową lub przenieść między urządzeniami. Zaimportuj wcześniej wyeksportowany plik, aby przywrócić dane.',
        btn_export_json: '⬇ Eksportuj JSON', btn_import_json: '⬆ Importuj JSON',
        import_title: 'Importuj dane', import_warning: '⚠️ W jaki sposób chcesz zaimportować?',
        import_detail: 'Plik zawiera {fileCount} trening(ów). Aktualnie masz {currentCount} trening(ów).',
        btn_merge: 'Scal (zachowaj istniejące)', btn_replace: 'Zastąp wszystko',
        import_invalid_format: 'Nieprawidłowy format pliku.', import_read_error: 'Błąd odczytu pliku.',
        export_filename_prefix: 'dziennik_treningowy_kopia', pdf_filename_prefix: 'dziennik_treningowy', pdf_filename_suffix: 'treningow',
        filter_name: 'Nazwa', filter_name_placeholder: 'Szukaj nazwy...', filter_from: 'Od', filter_to: 'Do',
        btn_clear_filters: 'Wyczyść filtry', filter_type: 'Typ', filter_all_types: 'Wszystkie typy',
        filter_exercise: 'Ćwiczenie', filter_exercise_placeholder: 'Szukaj ćwiczenia...',
        selection_count: 'Zaznaczono: {count}', btn_clear_selection: 'Odznacz wszystko', select_all_title: 'Zaznacz wszystko',
        tooltip_pdf_disabled: 'Wybierz treningi do pobrania PDF', tooltip_pdf_enabled: 'Pobierz {count} trening(ów) jako PDF',
        tooltip_edit_disabled: 'Zaznacz dokładnie jeden trening do edycji', tooltip_edit_enabled: 'Edytuj zaznaczony trening',
        tooltip_delete_disabled: 'Wybierz treningi do usunięcia', tooltip_delete_enabled: 'Usuń {count} trening(ów)',
        th_name: 'Nazwa', th_date: 'Data', th_exercises: 'Ćw.', th_rating: 'Ocena', th_weight: 'Masa',
        th_type: 'Typ', th_exercise: 'Ćwiczenie', th_load: 'Obciążenie', th_total: 'Suma', th_order: '⇅',
        empty_no_trainings: 'Brak treningów. Kliknij „+ Dodaj trening", aby rozpocząć!',
        empty_no_filter_match: 'Żaden trening nie pasuje do filtrów.',
        empty_no_exercises: 'Brak ćwiczeń. Kliknij „+ Dodaj ćwiczenie", aby dodać!',
        empty_no_exercise_filter_match: 'Żadne ćwiczenie nie pasuje do filtrów.',
        modal_add_training: 'Dodaj trening', modal_edit_training: 'Edytuj trening',
        training_name_label: 'Nazwa treningu', training_name_placeholder: 'np. Dzień górnej partii',
        training_date_label: 'Data',
        training_weight_label: 'Masa ciała (kg)', training_weight_placeholder: 'np. 80.5',
        date_today: 'Dziś', date_yesterday: 'Wczoraj', date_days_ago: '{days} dni temu',
        avg_rating_label: 'Średnia ocena:', avg_no_data: 'Brak ocen',
        body_weight_label: 'Masa ciała:',
        confirm_delete_single: 'Czy na pewno chcesz usunąć ten trening?',
        confirm_delete_multiple: 'Czy na pewno chcesz usunąć {count} treningów?',
        confirm_delete_exercise: 'Czy na pewno chcesz usunąć to ćwiczenie?',
        select_type_placeholder: '-- Typ --', select_exercise_placeholder: '-- Ćwiczenie --',
        load_placeholder: 'np. 50kg',
        move_up_title: 'Przenieś w górę', move_down_title: 'Przenieś w dół',
        pdf_total_exercises: 'Liczba cwiczen', pdf_total_reps: 'Suma powtorzen',
        pdf_no_exercises: 'Brak cwiczen w tym treningu.', pdf_uncategorized: 'Bez kategorii',
        pdf_header_exercise: 'Cwiczenie', pdf_header_load: 'Obciazenie', pdf_header_total: 'Suma',
        pdf_body_weight: 'Masa ciala',
        pdf_footer: 'Dziennik Treningowy — Wygenerowano {date} — Strona {page} z {total}',
        date_locale: 'pl-PL',
        settings_title: '⚙ Ustawienia', settings_theme: 'Motyw', settings_language: 'Język',
        weight_unit: 'kg',

        category_chest: 'Klatka piersiowa', category_back: 'Plecy', category_shoulders: 'Barki',
        category_legs: 'Nogi', category_biceps: 'Biceps', category_triceps: 'Triceps',
        category_core: 'Brzuch', category_cardio: 'Kardio',

        ex_bench_press: 'Wyciskanie na ławce', ex_incline_bench_press: 'Wyciskanie na ławce skośnej',
        ex_decline_bench_press: 'Wyciskanie na ławce ujemnej', ex_dumbbell_fly: 'Rozpiętki z hantlami',
        ex_cable_crossover: 'Krzyżowanie linek', ex_push_up: 'Pompki', ex_chest_dip: 'Dipy na klatkę',
        ex_deadlift: 'Martwy ciąg', ex_pull_up: 'Podciąganie na drążku', ex_chin_up: 'Podciąganie podchwytem',
        ex_barbell_row: 'Wiosłowanie sztangą', ex_dumbbell_row: 'Wiosłowanie hantlem',
        ex_lat_pulldown: 'Ściąganie drążka wyciągu', ex_seated_cable_row: 'Wiosłowanie siedząc',
        ex_t_bar_row: 'Wiosłowanie T-bar', ex_overhead_press: 'Wyciskanie nad głowę',
        ex_dumbbell_shoulder_press: 'Wyciskanie hantli siedząc', ex_lateral_raise: 'Unoszenie hantli bokiem',
        ex_front_raise: 'Unoszenie hantli przodem', ex_rear_delt_fly: 'Odwodzenie hantli w opadzie',
        ex_arnold_press: 'Wyciskanie Arnolda', ex_upright_row: 'Wiosłowanie pionowe', ex_face_pull: 'Face pull',
        ex_squat: 'Przysiady', ex_front_squat: 'Przysiady przednie', ex_leg_press: 'Prasa nożna',
        ex_lunges: 'Wykroki', ex_romanian_deadlift: 'Martwy ciąg rumuński', ex_leg_extension: 'Prostowanie nóg',
        ex_leg_curl: 'Uginanie nóg', ex_calf_raise: 'Wspięcia na palce',
        ex_bulgarian_split_squat: 'Bułgarskie przysiady', ex_hip_thrust: 'Hip thrust',
        ex_bicep_curl: 'Uginanie ze sztangą', ex_hammer_curl: 'Uginanie młotkowe',
        ex_preacher_curl: 'Uginanie na modlitewniku', ex_concentration_curl: 'Uginanie w skupieniu',
        ex_incline_dumbbell_curl: 'Uginanie na ławce skośnej', ex_cable_curl: 'Uginanie na wyciągu',
        ex_tricep_dip: 'Dipy na triceps', ex_tricep_pushdown: 'Prostowanie na wyciągu',
        ex_overhead_tricep_extension: 'Prostowanie nad głową', ex_skull_crusher: 'Francuzy',
        ex_close_grip_bench_press: 'Wyciskanie wąskim chwytem', ex_tricep_kickback: 'Odrzuty',
        ex_plank: 'Plank', ex_crunch: 'Brzuszki', ex_russian_twist: 'Skręty rosyjskie',
        ex_leg_raise: 'Unoszenie nóg', ex_ab_wheel_rollout: 'Kółko do brzucha',
        ex_mountain_climber: 'Wspinaczka górska', ex_dead_bug: 'Martwy robak',
        ex_hanging_knee_raise: 'Unoszenie kolan w zwisie', ex_running: 'Bieganie',
        ex_cycling: 'Jazda na rowerze', ex_rowing: 'Wiosłowanie', ex_jump_rope: 'Skakanka',
        ex_elliptical: 'Orbitrek', ex_stair_climber: 'Wchodzenie po schodach',
        ex_swimming: 'Pływanie', ex_burpees: 'Burpees'
    },

    en: {
        language_name: 'English', language_flag: '🇬🇧', html_lang: 'en',
        app_title: 'Gym Tracker', app_title_emoji: '🏋️ Gym Tracker',
        btn_add_training: '+ Add Training', btn_edit: '✎ Edit', btn_pdf: '⤓ PDF',
        btn_delete: '✕ Delete', btn_filters: '🔍 Filters', btn_data: '💾 Data',
        btn_save: 'Save', btn_cancel: 'Cancel',
        btn_add_exercise: '+ Add Exercise', btn_delete_exercise_title: 'Delete exercise',
        back_to_trainings: '← Back to Trainings',
        data_bar_info: 'Export your data as JSON to back up or transfer between devices.',
        btn_export_json: '⬇ Export JSON', btn_import_json: '⬆ Import JSON',
        import_title: 'Import Data', import_warning: '⚠️ How would you like to import?',
        import_detail: 'File contains {fileCount} training(s). You currently have {currentCount} training(s).',
        btn_merge: 'Merge (keep existing)', btn_replace: 'Replace all',
        import_invalid_format: 'Invalid file format.', import_read_error: 'Error reading file.',
        export_filename_prefix: 'gym_tracker_backup', pdf_filename_prefix: 'gym_tracker', pdf_filename_suffix: 'trainings',
        filter_name: 'Name', filter_name_placeholder: 'Search name...', filter_from: 'From', filter_to: 'To',
        btn_clear_filters: 'Clear Filters', filter_type: 'Type', filter_all_types: 'All Types',
        filter_exercise: 'Exercise', filter_exercise_placeholder: 'Search exercise...',
        selection_count: 'Selected: {count}', btn_clear_selection: 'Clear selection', select_all_title: 'Select all',
        tooltip_pdf_disabled: 'Select trainings to download PDF', tooltip_pdf_enabled: 'Download {count} training(s) as PDF',
        tooltip_edit_disabled: 'Select exactly one training to edit', tooltip_edit_enabled: 'Edit selected training',
        tooltip_delete_disabled: 'Select trainings to delete', tooltip_delete_enabled: 'Delete {count} training(s)',
        th_name: 'Name', th_date: 'Date', th_exercises: 'Ex.', th_rating: 'Rating', th_weight: 'Weight',
        th_type: 'Type', th_exercise: 'Exercise', th_load: 'Load', th_total: 'Total', th_order: '⇅',
        empty_no_trainings: 'No trainings yet. Click "+ Add Training" to get started!',
        empty_no_filter_match: 'No trainings match your filters.',
        empty_no_exercises: 'No exercises yet. Click "+ Add Exercise" to add one!',
        empty_no_exercise_filter_match: 'No exercises match your filters.',
        modal_add_training: 'Add Training', modal_edit_training: 'Edit Training',
        training_name_label: 'Training Name', training_name_placeholder: 'e.g., Upper Body Day',
        training_date_label: 'Date',
        training_weight_label: 'Body Weight (kg)', training_weight_placeholder: 'e.g., 80.5',
        date_today: 'Today', date_yesterday: 'Yesterday', date_days_ago: '{days} days ago',
        avg_rating_label: 'Average Rating:', avg_no_data: 'No ratings yet',
        body_weight_label: 'Body Weight:',
        confirm_delete_single: 'Are you sure you want to delete this training?',
        confirm_delete_multiple: 'Are you sure you want to delete {count} trainings?',
        confirm_delete_exercise: 'Are you sure you want to delete this exercise?',
        select_type_placeholder: '-- Type --', select_exercise_placeholder: '-- Exercise --',
        load_placeholder: 'e.g., 50kg',
        move_up_title: 'Move up', move_down_title: 'Move down',
        pdf_total_exercises: 'Total exercises', pdf_total_reps: 'Total repetitions',
        pdf_no_exercises: 'No exercises recorded.', pdf_uncategorized: 'Uncategorized',
        pdf_header_exercise: 'Exercise', pdf_header_load: 'Load', pdf_header_total: 'Total',
        pdf_body_weight: 'Body weight',
        pdf_footer: 'Gym Tracker — Generated {date} — Page {page} of {total}',
        date_locale: 'en-US',
        settings_title: '⚙ Settings', settings_theme: 'Theme', settings_language: 'Language',
        weight_unit: 'kg',

        category_chest: 'Chest', category_back: 'Back', category_shoulders: 'Shoulders',
        category_legs: 'Legs', category_biceps: 'Biceps', category_triceps: 'Triceps',
        category_core: 'Core', category_cardio: 'Cardio',

        ex_bench_press: 'Bench Press', ex_incline_bench_press: 'Incline Bench Press',
        ex_decline_bench_press: 'Decline Bench Press', ex_dumbbell_fly: 'Dumbbell Fly',
        ex_cable_crossover: 'Cable Crossover', ex_push_up: 'Push-Up', ex_chest_dip: 'Chest Dip',
        ex_deadlift: 'Deadlift', ex_pull_up: 'Pull-Up', ex_chin_up: 'Chin-Up',
        ex_barbell_row: 'Barbell Row', ex_dumbbell_row: 'Dumbbell Row', ex_lat_pulldown: 'Lat Pulldown',
        ex_seated_cable_row: 'Seated Cable Row', ex_t_bar_row: 'T-Bar Row',
        ex_overhead_press: 'Overhead Press', ex_dumbbell_shoulder_press: 'Dumbbell Shoulder Press',
        ex_lateral_raise: 'Lateral Raise', ex_front_raise: 'Front Raise', ex_rear_delt_fly: 'Rear Delt Fly',
        ex_arnold_press: 'Arnold Press', ex_upright_row: 'Upright Row', ex_face_pull: 'Face Pull',
        ex_squat: 'Squat', ex_front_squat: 'Front Squat', ex_leg_press: 'Leg Press', ex_lunges: 'Lunges',
        ex_romanian_deadlift: 'Romanian Deadlift', ex_leg_extension: 'Leg Extension', ex_leg_curl: 'Leg Curl',
        ex_calf_raise: 'Calf Raise', ex_bulgarian_split_squat: 'Bulgarian Split Squat', ex_hip_thrust: 'Hip Thrust',
        ex_bicep_curl: 'Bicep Curl', ex_hammer_curl: 'Hammer Curl', ex_preacher_curl: 'Preacher Curl',
        ex_concentration_curl: 'Concentration Curl', ex_incline_dumbbell_curl: 'Incline Dumbbell Curl',
        ex_cable_curl: 'Cable Curl',
        ex_tricep_dip: 'Tricep Dip', ex_tricep_pushdown: 'Tricep Pushdown',
        ex_overhead_tricep_extension: 'Overhead Tricep Extension', ex_skull_crusher: 'Skull Crusher',
        ex_close_grip_bench_press: 'Close-Grip Bench Press', ex_tricep_kickback: 'Tricep Kickback',
        ex_plank: 'Plank', ex_crunch: 'Crunch', ex_russian_twist: 'Russian Twist',
        ex_leg_raise: 'Leg Raise', ex_ab_wheel_rollout: 'Ab Wheel Rollout',
        ex_mountain_climber: 'Mountain Climber', ex_dead_bug: 'Dead Bug',
        ex_hanging_knee_raise: 'Hanging Knee Raise', ex_running: 'Running', ex_cycling: 'Cycling',
        ex_rowing: 'Rowing', ex_jump_rope: 'Jump Rope', ex_elliptical: 'Elliptical',
        ex_stair_climber: 'Stair Climber', ex_swimming: 'Swimming', ex_burpees: 'Burpees'
    }
};

// ---- Wykrywanie języka ----
function detectLanguage() {
    if (CONFIG.LANGUAGE_STORAGE_KEY) { var s = localStorage.getItem(CONFIG.LANGUAGE_STORAGE_KEY); if (s && TRANSLATIONS[s]) return s; }
    if (CONFIG.LANGUAGE !== 'auto' && TRANSLATIONS[CONFIG.LANGUAGE]) return CONFIG.LANGUAGE;
    var langs = navigator.languages ? [].concat(navigator.languages) : [navigator.language || ''];
    for (var i = 0; i < langs.length; i++) { var f = langs[i].toLowerCase(); if (TRANSLATIONS[f]) return f; var b = f.split('-')[0]; if (TRANSLATIONS[b]) return b; }
    return CONFIG.FALLBACK_LANGUAGE;
}
var _activeLang = detectLanguage();
function getActiveLanguage() { return _activeLang; }
function setLanguage(code) { if (!TRANSLATIONS[code]) return; localStorage.setItem(CONFIG.LANGUAGE_STORAGE_KEY, code); window.location.reload(); }

function t(key, params) {
    var lang = TRANSLATIONS[_activeLang] || TRANSLATIONS[CONFIG.FALLBACK_LANGUAGE];
    var text = lang[key];
    if (text === undefined && _activeLang !== CONFIG.FALLBACK_LANGUAGE) { var fb = TRANSLATIONS[CONFIG.FALLBACK_LANGUAGE]; text = fb ? fb[key] : key; }
    if (text === undefined) text = key;
    if (params) Object.keys(params).forEach(function (p) { text = text.replace(new RegExp('\\{' + p + '\\}', 'g'), params[p]); });
    return text;
}
function tCategory(k) { return t('category_' + k); }
function tExercise(k) { return t('ex_' + k); }
function tDateHelper(offset) { if (offset === 0) return t('date_today'); if (offset === -1) return t('date_yesterday'); return t('date_days_ago', { days: Math.abs(offset) }); }
function getLocalizedExerciseData() { var r = {}; Object.keys(CONFIG.EXERCISE_DATA).forEach(function (ck) { r[tCategory(ck)] = CONFIG.EXERCISE_DATA[ck].map(function (ek) { return tExercise(ek); }); }); return r; }

(function () { var hl = t('html_lang'); if (hl && hl !== 'html_lang') document.documentElement.lang = hl; })();

// ---- Motyw ----
function detectTheme() {
    if (CONFIG.THEME_STORAGE_KEY) { var s = localStorage.getItem(CONFIG.THEME_STORAGE_KEY); if (s === 'light' || s === 'dark') return s; }
    if (CONFIG.THEME === 'light' || CONFIG.THEME === 'dark') return CONFIG.THEME;
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) return 'light';
    return 'dark';
}
function applyTheme(theme) { document.documentElement.setAttribute('data-theme', theme); localStorage.setItem(CONFIG.THEME_STORAGE_KEY, theme); }
function getActiveTheme() { return document.documentElement.getAttribute('data-theme') || 'dark'; }
applyTheme(detectTheme());