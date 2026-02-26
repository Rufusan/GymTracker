// ========================================
// Dziennik Treningowy - Logika
// ========================================

// ---- LocalStorage ----
function getTrainings() { const d = localStorage.getItem(CONFIG.STORAGE_KEY); return d ? JSON.parse(d) : []; }
function saveTrainings(ts) { localStorage.setItem(CONFIG.STORAGE_KEY, JSON.stringify(ts)); }
function generateId() { return Date.now().toString(36) + Math.random().toString(36).substring(2, 8); }

// ---- CRUD Treningów ----
function addTraining(name, date) {
    const ts = getTrainings();
    const tr = { id: generateId(), name, date, exercises: [] };
    ts.push(tr); saveTrainings(ts); return tr;
}
function updateTraining(id, u) {
    const ts = getTrainings();
    const i = ts.findIndex(x => x.id === id);
    if (i !== -1) { ts[i] = { ...ts[i], ...u }; saveTrainings(ts); }
}
function deleteTraining(id) { saveTrainings(getTrainings().filter(x => x.id !== id)); }

// ---- CRUD Ćwiczeń ----
function addExercise(tid, ex) {
    const ts = getTrainings();
    const tr = ts.find(x => x.id === tid);
    if (tr) {
        ex.series = normalizeSeries(ex.series);
        if (ex.rating === undefined) ex.rating = 0;
        if (ex.load === undefined) ex.load = '';
        tr.exercises.push(ex); saveTrainings(ts);
    }
}
function deleteExercise(tid, idx) {
    const ts = getTrainings();
    const tr = ts.find(x => x.id === tid);
    if (tr) { tr.exercises.splice(idx, 1); saveTrainings(ts); }
}
function normalizeSeries(s) {
    const r = [];
    for (let i = 0; i < CONFIG.MAX_SERIES; i++) {
        r.push(s && s[i] !== undefined && s[i] !== null && s[i] !== '' ? s[i] : null);
    }
    return r;
}

// ---- Oceny ----
function getAverageRating(tr) {
    if (!tr || !tr.exercises || !tr.exercises.length) return 0;
    const r = tr.exercises.filter(e => (e.rating || 0) > 0);
    if (!r.length) return 0;
    return r.reduce((a, e) => a + (e.rating || 0), 0) / r.length;
}
function renderStarsReadonly(rating) {
    let h = '<span class="star-rating-readonly">';
    for (let i = 1; i <= CONFIG.MAX_STARS; i++) {
        if (rating >= i) h += '<span class="star-ro star-full">★</span>';
        else if (rating >= i - 0.5) h += '<span class="star-ro star-half">★</span>';
        else h += '<span class="star-ro star-empty">★</span>';
    }
    return h + '</span>';
}

// ---- Suma powtórzeń ----
function getTotalReps(ex) {
    const s = ex.series || [];
    let tot = 0;
    for (let i = 0; i < CONFIG.MAX_SERIES; i++) {
        if (s[i] != null && !isNaN(s[i])) tot += s[i];
    }
    return tot;
}

// ---- Import/Eksport ----
function exportData() {
    return JSON.stringify({
        version: CONFIG.DATA_VERSION,
        exportedAt: new Date().toISOString(),
        trainings: getTrainings()
    }, null, 2);
}
function importData(data, mode) {
    const norm = x => {
        if (!x.id) x.id = generateId();
        if (!Array.isArray(x.exercises)) x.exercises = [];
        x.exercises.forEach(e => {
            e.series = normalizeSeries(e.series);
            if (e.rating === undefined) e.rating = 0;
            if (e.load === undefined) e.load = '';
        });
    };
    if (mode === 'replace') {
        data.forEach(norm);
        saveTrainings(data);
    } else {
        const ex = getTrainings();
        const ids = new Set(ex.map(x => x.id));
        data.forEach(x => {
            norm(x);
            if (ids.has(x.id) || ex.some(e => e.name === x.name && e.date === x.date)) return;
            ex.push(x); ids.add(x.id);
        });
        saveTrainings(ex);
    }
}

// ---- Pomocniki ----
function escapeHtml(s) {
    const d = document.createElement('div');
    d.textContent = s || '';
    return d.innerHTML;
}
function dateLocale() { return t('date_locale'); }

// ---- Service Worker ----
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js').catch(() => {});
}

// ========================================
// Ustawienia
// ========================================

function initSettings() {
    const toggleBtn = document.getElementById('settingsToggleBtn');
    const overlay = document.getElementById('settingsOverlay');
    const closeBtn = document.getElementById('settingsCloseBtn');
    const langSwitcher = document.getElementById('langSwitcher');
    if (!toggleBtn || !overlay) return;

    // Tłumaczenia panelu
    document.getElementById('settingsTitle').textContent = t('settings_title');
    document.getElementById('settingsThemeLabel').textContent = t('settings_theme');
    document.getElementById('settingsLangLabel').textContent = t('settings_language');

    // Otwórz / zamknij
    function openSettings() { overlay.classList.add('open'); }
    function closeSettings() { overlay.classList.remove('open'); }

    toggleBtn.addEventListener('click', openSettings);
    closeBtn.addEventListener('click', closeSettings);
    overlay.addEventListener('click', function (e) {
        if (e.target === overlay) closeSettings();
    });
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && overlay.classList.contains('open')) closeSettings();
    });

    // ---- Motyw ----
    var btnLight = document.getElementById('themeBtnLight');
    var btnDark = document.getElementById('themeBtnDark');

    function updateThemeButtons() {
        var active = getActiveTheme();
        btnLight.classList.toggle('active', active === 'light');
        btnDark.classList.toggle('active', active === 'dark');
    }

    btnLight.addEventListener('click', function () {
        applyTheme('light');
        updateThemeButtons();
    });
    btnDark.addEventListener('click', function () {
        applyTheme('dark');
        updateThemeButtons();
    });
    updateThemeButtons();

    // ---- Język ----
    var activeLang = getActiveLanguage();
    langSwitcher.innerHTML = '';
    CONFIG.AVAILABLE_LANGUAGES.forEach(function (code) {
        var lang = TRANSLATIONS[code];
        if (!lang) return;
        var btn = document.createElement('button');
        btn.className = 'lang-btn';
        if (code === activeLang) btn.classList.add('active');
        btn.innerHTML = '<span class="lang-btn-flag">' + lang.language_flag + '</span>';
        btn.title = lang.language_name;
        btn.addEventListener('click', function () {
            if (code !== activeLang) setLanguage(code);
        });
        langSwitcher.appendChild(btn);
    });
}

// ========================================
// Inicjalizacja
// ========================================

document.addEventListener('DOMContentLoaded', function () {
    initSettings();
    if (document.getElementById('trainingsBody')) initIndexPage();
    if (document.getElementById('exercisesBody')) initTrainingPage();
});

// ========================================
// STRONA GŁÓWNA
// ========================================

function initIndexPage() {
    var EXDATA = getLocalizedExerciseData();

    var trainingsBody = document.getElementById('trainingsBody');
    var trainingModal = document.getElementById('trainingModal');
    var trainingForm = document.getElementById('trainingForm');
    var trainingModalTitle = document.getElementById('trainingModalTitle');
    var nameInput = document.getElementById('trainingName');
    var dateInput = document.getElementById('trainingDate');
    var emptyMsg = document.getElementById('emptyMessage');
    var filterName = document.getElementById('filterName');
    var filterDateFrom = document.getElementById('filterDateFrom');
    var filterDateTo = document.getElementById('filterDateTo');
    var filtersBar = document.getElementById('filtersBar');
    var toggleFiltersBtn = document.getElementById('toggleFiltersBtn');
    var selectAllCb = document.getElementById('selectAllCheckbox');
    var selToolbar = document.getElementById('selectionToolbar');
    var selCountEl = document.getElementById('selectionCount');
    var pdfBtn = document.getElementById('downloadPdfBtn');
    var editBtn = document.getElementById('editSelectedBtn');
    var delBtn = document.getElementById('deleteSelectedBtn');
    var clrSelBtn = document.getElementById('clearSelectionBtn');
    var dataBar = document.getElementById('dataBar');
    var toggleDataBtn = document.getElementById('toggleDataBtn');
    var importModal = document.getElementById('importModal');
    var importDetail = document.getElementById('importDetail');
    var importFileInput = document.getElementById('importFileInput');

    var editingId = null;
    var pendingImport = null;
    var sortCol = CONFIG.DEFAULT_SORT_COLUMN;
    var sortDir = CONFIG.DEFAULT_SORT_DIRECTION;
    var selected = new Set();

    // ---- Tłumaczenia ----
    document.title = t('app_title');
    document.querySelector('h1').textContent = t('app_title_emoji');
    document.getElementById('addTrainingBtn').textContent = t('btn_add_training');
    editBtn.innerHTML = t('btn_edit');
    pdfBtn.innerHTML = t('btn_pdf');
    delBtn.innerHTML = t('btn_delete');
    toggleFiltersBtn.textContent = t('btn_filters');
    toggleDataBtn.textContent = t('btn_data');
    document.querySelector('.data-bar-info').textContent = t('data_bar_info');
    document.getElementById('exportJsonBtn').textContent = t('btn_export_json');
    document.getElementById('importJsonBtn').textContent = t('btn_import_json');
    document.querySelector('#filtersBar label[for="filterName"]').textContent = t('filter_name');
    filterName.placeholder = t('filter_name_placeholder');
    document.querySelector('#filtersBar label[for="filterDateFrom"]').textContent = t('filter_from');
    document.querySelector('#filtersBar label[for="filterDateTo"]').textContent = t('filter_to');
    document.getElementById('clearFiltersBtn').textContent = t('btn_clear_filters');
    clrSelBtn.textContent = t('btn_clear_selection');
    selectAllCb.title = t('select_all_title');
    document.getElementById('cancelTrainingBtn').textContent = t('btn_cancel');
    document.querySelector('#trainingForm button[type="submit"]').textContent = t('btn_save');
    document.querySelector('#trainingForm label[for="trainingName"]').textContent = t('training_name_label');
    nameInput.placeholder = t('training_name_placeholder');
    document.querySelector('#trainingForm label[for="trainingDate"]').textContent = t('training_date_label');
    document.querySelector('#importModal h2').textContent = t('import_title');
    document.querySelector('.import-warning').textContent = t('import_warning');
    document.getElementById('importCancelBtn').textContent = t('btn_cancel');
    document.getElementById('importMergeBtn').textContent = t('btn_merge');
    document.getElementById('importReplaceBtn').textContent = t('btn_replace');
    emptyMsg.textContent = t('empty_no_trainings');

    var thCells = document.querySelectorAll('#trainingsTable thead th');
    thCells[1].innerHTML = t('th_name') + ' <span class="sort-icon" id="sortIconName"></span>';
    thCells[2].innerHTML = t('th_date') + ' <span class="sort-icon" id="sortIconDate"></span>';
    thCells[3].innerHTML = t('th_exercises') + ' <span class="sort-icon" id="sortIconExercises"></span>';
    thCells[4].innerHTML = t('th_rating') + ' <span class="sort-icon" id="sortIconRating"></span>';

    document.querySelectorAll('.date-helper-btn').forEach(function (btn) {
        btn.textContent = tDateHelper(parseInt(btn.dataset.offset));
    });

    // ---- Panele ----
    toggleFiltersBtn.addEventListener('click', function () {
        filtersBar.classList.toggle('collapsed');
        toggleFiltersBtn.classList.toggle('active');
    });
    toggleDataBtn.addEventListener('click', function () {
        dataBar.classList.toggle('collapsed');
        toggleDataBtn.classList.toggle('active');
    });

    // ---- Pomocniki daty ----
    document.querySelectorAll('.date-helper-btn').forEach(function (btn) {
        btn.addEventListener('click', function () {
            var d = new Date();
            d.setDate(d.getDate() + parseInt(btn.dataset.offset));
            dateInput.value = d.toISOString().split('T')[0];
            document.querySelectorAll('.date-helper-btn').forEach(function (b) { b.classList.remove('active'); });
            btn.classList.add('active');
        });
    });
    dateInput.addEventListener('change', highlightDateHelper);

    function highlightDateHelper() {
        var val = dateInput.value;
        document.querySelectorAll('.date-helper-btn').forEach(function (btn) {
            var d = new Date();
            d.setDate(d.getDate() + parseInt(btn.dataset.offset));
            btn.classList.toggle('active', val === d.toISOString().split('T')[0]);
        });
    }

    // ---- Eksport JSON ----
    document.getElementById('exportJsonBtn').addEventListener('click', function () {
        var blob = new Blob([exportData()], { type: 'application/json' });
        var url = URL.createObjectURL(blob);
        var a = document.createElement('a');
        a.href = url;
        a.download = t('export_filename_prefix') + '_' + new Date().toISOString().split('T')[0] + '.json';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    });

    // ---- Import JSON ----
    document.getElementById('importJsonBtn').addEventListener('click', function () { importFileInput.click(); });
    importFileInput.addEventListener('change', function (e) {
        var file = e.target.files[0];
        if (!file) return;
        var reader = new FileReader();
        reader.onload = function (ev) {
            try {
                var parsed = JSON.parse(ev.target.result);
                if (!parsed.version || !Array.isArray(parsed.trainings)) {
                    alert(t('import_invalid_format'));
                    return;
                }
                pendingImport = parsed.trainings;
                importDetail.textContent = t('import_detail', {
                    fileCount: parsed.trainings.length,
                    currentCount: getTrainings().length
                });
                importModal.classList.add('active');
            } catch (err) {
                alert(t('import_read_error'));
            }
        };
        reader.readAsText(file);
        importFileInput.value = '';
    });
    document.getElementById('importCancelBtn').addEventListener('click', function () {
        importModal.classList.remove('active');
        pendingImport = null;
    });
    document.getElementById('importMergeBtn').addEventListener('click', function () {
        if (!pendingImport) return;
        importData(pendingImport, 'merge');
        importModal.classList.remove('active');
        pendingImport = null;
        selected.clear();
        renderTrainings();
    });
    document.getElementById('importReplaceBtn').addEventListener('click', function () {
        if (!pendingImport) return;
        importData(pendingImport, 'replace');
        importModal.classList.remove('active');
        pendingImport = null;
        selected.clear();
        renderTrainings();
    });
    importModal.addEventListener('click', function (e) {
        if (e.target === importModal) {
            importModal.classList.remove('active');
            pendingImport = null;
        }
    });

    // ---- Filtrowanie i sortowanie ----
    function getFiltered() {
        var trainings = getTrainings();
        var q = filterName.value.trim().toLowerCase();
        if (q) trainings = trainings.filter(function (x) { return x.name.toLowerCase().includes(q); });
        if (filterDateFrom.value) trainings = trainings.filter(function (x) { return x.date >= filterDateFrom.value; });
        if (filterDateTo.value) trainings = trainings.filter(function (x) { return x.date <= filterDateTo.value; });
        trainings.sort(function (a, b) {
            var va, vb;
            if (sortCol === 'name') { va = a.name.toLowerCase(); vb = b.name.toLowerCase(); }
            else if (sortCol === 'date') { va = a.date; vb = b.date; }
            else if (sortCol === 'exercises') { va = a.exercises.length; vb = b.exercises.length; }
            else { va = getAverageRating(a); vb = getAverageRating(b); }
            if (va < vb) return sortDir === 'asc' ? -1 : 1;
            if (va > vb) return sortDir === 'asc' ? 1 : -1;
            return 0;
        });
        return trainings;
    }

    function updateSortIcons() {
        ['sortIconName', 'sortIconDate', 'sortIconExercises', 'sortIconRating'].forEach(function (id) {
            document.getElementById(id).textContent = '';
        });
        var map = { name: 'sortIconName', date: 'sortIconDate', exercises: 'sortIconExercises', rating: 'sortIconRating' };
        if (map[sortCol]) document.getElementById(map[sortCol]).textContent = sortDir === 'asc' ? '▲' : '▼';
    }

    function formatDate(dateStr) {
        var d = new Date(dateStr + 'T00:00:00');
        if (window.innerWidth <= 480) return d.toLocaleDateString(dateLocale(), { month: 'short', day: 'numeric' });
        return d.toLocaleDateString(dateLocale(), { year: 'numeric', month: 'short', day: 'numeric' });
    }

    // ---- Zaznaczenie ----
    function updateSelectionUI() {
        var count = selected.size;
        var hasData = getTrainings().length > 0;

        pdfBtn.style.display = hasData ? '' : 'none';
        pdfBtn.disabled = count === 0;
        pdfBtn.title = count > 0 ? t('tooltip_pdf_enabled', { count: count }) : t('tooltip_pdf_disabled');
        editBtn.style.display = hasData ? '' : 'none';
        editBtn.disabled = count !== 1;
        editBtn.title = count === 1 ? t('tooltip_edit_enabled') : t('tooltip_edit_disabled');
        delBtn.style.display = hasData ? '' : 'none';
        delBtn.disabled = count === 0;
        delBtn.title = count > 0 ? t('tooltip_delete_enabled', { count: count }) : t('tooltip_delete_disabled');

        if (count > 0) {
            selToolbar.classList.add('visible');
            selCountEl.textContent = t('selection_count', { count: count });
        } else {
            selToolbar.classList.remove('visible');
        }

        var visible = getFiltered();
        var allSel = visible.length > 0 && visible.every(function (x) { return selected.has(x.id); });
        var someSel = visible.some(function (x) { return selected.has(x.id); });
        selectAllCb.checked = allSel;
        selectAllCb.indeterminate = someSel && !allSel;

        document.querySelectorAll('#trainingsBody tr').forEach(function (row) {
            row.classList.toggle('selected', row.dataset.id && selected.has(row.dataset.id));
        });
    }

    // ---- Renderowanie ----
    function renderTrainings() {
        var trainings = getFiltered();
        var all = getTrainings();
        trainingsBody.innerHTML = '';
        toggleFiltersBtn.style.display = all.length === 0 ? 'none' : '';

        if (trainings.length === 0) {
            emptyMsg.style.display = 'block';
            emptyMsg.textContent = all.length === 0 ? t('empty_no_trainings') : t('empty_no_filter_match');
            document.getElementById('trainingsTable').style.display = 'none';
            updateSelectionUI();
            return;
        }

        emptyMsg.style.display = 'none';
        document.getElementById('trainingsTable').style.display = 'table';
        updateSortIcons();

        trainings.forEach(function (training) {
            var row = document.createElement('tr');
            row.dataset.id = training.id;
            var checked = selected.has(training.id) ? 'checked' : '';
            var avg = getAverageRating(training);
            row.innerHTML =
                '<td class="td-checkbox"><input type="checkbox" class="row-checkbox" data-id="' + training.id + '" ' + checked + '></td>' +
                '<td class="clickable" data-id="' + training.id + '">' + escapeHtml(training.name) + '</td>' +
                '<td class="clickable" data-id="' + training.id + '">' + formatDate(training.date) + '</td>' +
                '<td class="clickable" data-id="' + training.id + '">' + training.exercises.length + '</td>' +
                '<td class="clickable td-rating" data-id="' + training.id + '">' + renderStarsReadonly(avg) + '</td>';
            trainingsBody.appendChild(row);
        });
        updateSelectionUI();
    }

    // ---- Modal ----
    function openModal(training) {
        if (training) {
            trainingModalTitle.textContent = t('modal_edit_training');
            nameInput.value = training.name;
            dateInput.value = training.date;
            editingId = training.id;
        } else {
            trainingModalTitle.textContent = t('modal_add_training');
            nameInput.value = '';
            dateInput.value = new Date().toISOString().split('T')[0];
            editingId = null;
        }
        highlightDateHelper();
        trainingModal.classList.add('active');
        nameInput.focus();
    }

    function closeModal() {
        trainingModal.classList.remove('active');
        editingId = null;
    }

    // ---- PDF ----
    function exportPDF(ids) {
        var trainings = ids.map(function (id) { return getTrainings().find(function (x) { return x.id === id; }); }).filter(Boolean);
        if (!trainings.length) return;
        trainings.sort(function (a, b) { return new Date(a.date) - new Date(b.date); });

        var jsPDF = window.jspdf.jsPDF;
        var doc = new jsPDF(CONFIG.PDF_ORIENTATION);
        var pw = doc.internal.pageSize.getWidth();

        trainings.forEach(function (training, tIdx) {
            if (tIdx > 0) doc.addPage();
            var y = 18;

            doc.setFontSize(22);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(30);
            doc.text(training.name, pw / 2, y, { align: 'center' });
            y += 8;

            var dateStr = new Date(training.date + 'T00:00:00').toLocaleDateString(dateLocale(), {
                weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
            });
            doc.setFontSize(12);
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(100);
            doc.text(dateStr, pw / 2, y, { align: 'center' });
            y += 6;

            doc.setDrawColor(200);
            doc.setLineWidth(0.5);
            doc.line(14, y, pw - 14, y);
            y += 8;

            doc.setTextColor(60);
            doc.setFontSize(11);
            doc.text(t('pdf_total_exercises') + ': ' + training.exercises.length, 14, y);
            var grandTotal = 0;
            training.exercises.forEach(function (ex) { grandTotal += getTotalReps(ex); });
            doc.text(t('pdf_total_reps') + ': ' + grandTotal, 100, y);
            y += 8;

            if (training.exercises.length === 0) {
                doc.setFontSize(12);
                doc.setTextColor(150);
                doc.text(t('pdf_no_exercises'), pw / 2, y + 10, { align: 'center' });
            } else {
                var grouped = {};
                training.exercises.forEach(function (ex) {
                    var type = ex.type || t('pdf_uncategorized');
                    if (!grouped[type]) grouped[type] = [];
                    grouped[type].push(ex);
                });

                Object.keys(grouped).forEach(function (type) {
                    doc.setFontSize(13);
                    doc.setFont('helvetica', 'bold');
                    doc.setTextColor(40);
                    doc.text(type, 14, y);
                    y += 2;

                    var tableRows = grouped[type].map(function (ex) {
                        var s = ex.series || [];
                        var total = getTotalReps(ex);
                        return [
                            ex.name || '-', ex.load || '-',
                            s[0] != null ? String(s[0]) : '-', s[1] != null ? String(s[1]) : '-',
                            s[2] != null ? String(s[2]) : '-', s[3] != null ? String(s[3]) : '-',
                            s[4] != null ? String(s[4]) : '-', s[5] != null ? String(s[5]) : '-',
                            total > 0 ? String(total) : '-'
                        ];
                    });

                    doc.autoTable({
                        startY: y,
                        head: [[t('pdf_header_exercise'), t('pdf_header_load'), 'S1', 'S2', 'S3', 'S4', 'S5', 'S6', t('pdf_header_total')]],
                        body: tableRows,
                        theme: 'grid',
                        margin: { left: 14, right: 14 },
                        headStyles: {
                            fillColor: CONFIG.PDF_HEADER_COLOR,
                            textColor: 255,
                            fontStyle: 'bold',
                            fontSize: 10,
                            halign: 'center'
                        },
                        columnStyles: {
                            0: { cellWidth: 'auto', halign: 'left' },
                            1: { cellWidth: 28, halign: 'center' },
                            2: { cellWidth: 14, halign: 'center' },
                            3: { cellWidth: 14, halign: 'center' },
                            4: { cellWidth: 14, halign: 'center' },
                            5: { cellWidth: 14, halign: 'center' },
                            6: { cellWidth: 14, halign: 'center' },
                            7: { cellWidth: 14, halign: 'center' },
                            8: { cellWidth: 18, halign: 'center', fontStyle: 'bold' }
                        },
                        bodyStyles: { fontSize: 10, textColor: 50 },
                        alternateRowStyles: { fillColor: CONFIG.PDF_ALT_ROW_COLOR }
                    });
                    y = doc.lastAutoTable.finalY + 10;
                });
            }
        });

        var totalPages = doc.internal.getNumberOfPages();
        for (var p = 1; p <= totalPages; p++) {
            doc.setPage(p);
            doc.setFontSize(8);
            doc.setTextColor(180);
            doc.text(
                t('pdf_footer', { date: new Date().toLocaleDateString(dateLocale()), page: p, total: totalPages }),
                pw / 2,
                doc.internal.pageSize.getHeight() - 10,
                { align: 'center' }
            );
        }

        var filename;
        if (trainings.length === 1) {
            var safeName = trainings[0].name.replace(/[^a-z0-9ąćęłńóśźż]/gi, '_').toLowerCase();
            filename = safeName + '_' + trainings[0].date + '.pdf';
        } else {
            filename = t('pdf_filename_prefix') + '_' + trainings.length + '_' + t('pdf_filename_suffix') + '.pdf';
        }
        doc.save(filename);
    }

    // ---- Zdarzenia ----
    document.getElementById('addTrainingBtn').addEventListener('click', function () { openModal(null); });
    document.getElementById('cancelTrainingBtn').addEventListener('click', closeModal);
    trainingModal.addEventListener('click', function (e) { if (e.target === trainingModal) closeModal(); });

    trainingForm.addEventListener('submit', function (e) {
        e.preventDefault();
        var name = nameInput.value.trim();
        var date = dateInput.value;
        if (!name || !date) return;
        if (editingId) {
            updateTraining(editingId, { name: name, date: date });
            closeModal();
            renderTrainings();
        } else {
            var training = addTraining(name, date);
            closeModal();
            window.location.href = 'training.html?id=' + training.id;
        }
    });

    trainingsBody.addEventListener('click', function (e) {
        var el = e.target.classList.contains('clickable') ? e.target : e.target.closest('.clickable');
        if (el && el.dataset.id) window.location.href = 'training.html?id=' + el.dataset.id;
    });

    trainingsBody.addEventListener('change', function (e) {
        if (!e.target.classList.contains('row-checkbox')) return;
        var id = e.target.dataset.id;
        if (e.target.checked) selected.add(id); else selected.delete(id);
        updateSelectionUI();
    });

    selectAllCb.addEventListener('change', function () {
        var visible = getFiltered();
        if (selectAllCb.checked) visible.forEach(function (x) { selected.add(x.id); });
        else visible.forEach(function (x) { selected.delete(x.id); });
        renderTrainings();
    });

    editBtn.addEventListener('click', function () {
        if (selected.size !== 1) return;
        var training = getTrainings().find(function (x) { return x.id === Array.from(selected)[0]; });
        if (training) openModal(training);
    });

    pdfBtn.addEventListener('click', function () {
        if (selected.size > 0) exportPDF(Array.from(selected));
    });

    delBtn.addEventListener('click', function () {
        if (selected.size === 0) return;
        var count = selected.size;
        var msg = count === 1 ? t('confirm_delete_single') : t('confirm_delete_multiple', { count: count });
        if (!confirm(msg)) return;
        Array.from(selected).forEach(function (id) { deleteTraining(id); });
        selected.clear();
        renderTrainings();
    });

    clrSelBtn.addEventListener('click', function () { selected.clear(); renderTrainings(); });

    document.querySelectorAll('#trainingsTable th.sortable').forEach(function (th) {
        th.addEventListener('click', function () {
            var col = th.dataset.sort;
            if (sortCol === col) sortDir = sortDir === 'asc' ? 'desc' : 'asc';
            else { sortCol = col; sortDir = 'asc'; }
            renderTrainings();
        });
    });

    filterName.addEventListener('input', renderTrainings);
    filterDateFrom.addEventListener('change', renderTrainings);
    filterDateTo.addEventListener('change', renderTrainings);
    document.getElementById('clearFiltersBtn').addEventListener('click', function () {
        filterName.value = '';
        filterDateFrom.value = '';
        filterDateTo.value = '';
        renderTrainings();
    });

    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') {
            closeModal();
            importModal.classList.remove('active');
            pendingImport = null;
        }
    });

    window.addEventListener('resize', renderTrainings);
    renderTrainings();
}

// ========================================
// STRONA TRENINGU
// ========================================

function initTrainingPage() {
    var EXDATA = getLocalizedExerciseData();

    var params = new URLSearchParams(window.location.search);
    var trainingId = params.get('id');
    if (!trainingId) { window.location.href = 'index.html'; return; }

    var exercisesBody = document.getElementById('exercisesBody');
    var emptyMsg = document.getElementById('emptyMessage');
    var filterType = document.getElementById('filterType');
    var filterExercise = document.getElementById('filterExercise');
    var exFiltersBar = document.getElementById('exerciseFiltersBar');
    var toggleExFiltersBtn = document.getElementById('toggleExFiltersBtn');
    var avgRatingEl = document.getElementById('trainingAvgRating');

    var exSortCol = null;
    var exSortDir = 'asc';

    // ---- Tłumaczenia ----
    document.querySelector('.back-link').textContent = t('back_to_trainings');
    document.getElementById('addExerciseBtn').textContent = t('btn_add_exercise');
    toggleExFiltersBtn.textContent = t('btn_filters');
    document.querySelector('#exerciseFiltersBar label[for="filterType"]').textContent = t('filter_type');
    filterType.querySelector('option').textContent = t('filter_all_types');
    document.querySelector('#exerciseFiltersBar label[for="filterExercise"]').textContent = t('filter_exercise');
    filterExercise.placeholder = t('filter_exercise_placeholder');
    document.getElementById('clearExerciseFiltersBtn').textContent = t('btn_clear_filters');
    emptyMsg.textContent = t('empty_no_exercises');

    var ths = document.querySelectorAll('#exercisesTable thead th');
    ths[0].innerHTML = t('th_type') + ' <span class="sort-icon" id="sortIconType"></span>';
    ths[1].innerHTML = t('th_exercise') + ' <span class="sort-icon" id="sortIconExName"></span>';
    ths[2].innerHTML = t('th_load') + ' <span class="sort-icon" id="sortIconExLoad"></span>';
    ths[9].innerHTML = t('th_total') + ' <span class="sort-icon" id="sortIconExTotal"></span>';
    ths[10].innerHTML = t('th_rating') + ' <span class="sort-icon" id="sortIconExRating"></span>';

    toggleExFiltersBtn.addEventListener('click', function () {
        exFiltersBar.classList.toggle('collapsed');
        toggleExFiltersBtn.classList.toggle('active');
    });

    function getTraining() {
        return getTrainings().find(function (x) { return x.id === trainingId; });
    }

    function renderHeader() {
        var training = getTraining();
        if (!training) { window.location.href = 'index.html'; return; }
        document.getElementById('trainingTitle').textContent = '🏋️ ' + training.name;
        document.getElementById('trainingDate').textContent = new Date(training.date + 'T00:00:00').toLocaleDateString(dateLocale(), {
            weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
        });
        document.title = training.name + ' - ' + t('app_title');
        updateAvgRating();
    }

    function updateAvgRating() {
        var training = getTraining();
        if (!training) return;
        var avg = getAverageRating(training);
        if (training.exercises.length === 0 || avg === 0) {
            avgRatingEl.innerHTML = '<span class="avg-label">' + t('avg_rating_label') + '</span> <span class="avg-no-data">' + t('avg_no_data') + '</span>';
        } else {
            avgRatingEl.innerHTML = '<span class="avg-label">' + t('avg_rating_label') + '</span> ' + renderStarsReadonly(avg) + ' <span class="avg-value">(' + avg.toFixed(1) + '/' + CONFIG.MAX_STARS + ')</span>';
        }
    }

    function populateTypeFilter() {
        var current = filterType.value;
        filterType.innerHTML = '<option value="">' + t('filter_all_types') + '</option>';
        Object.keys(EXDATA).forEach(function (type) {
            var opt = document.createElement('option');
            opt.value = type;
            opt.textContent = type;
            filterType.appendChild(opt);
        });
        filterType.value = current;
    }

    function buildTypeOptions(selected) {
        var html = '<option value="">' + t('select_type_placeholder') + '</option>';
        Object.keys(EXDATA).forEach(function (type) {
            html += '<option value="' + type + '" ' + (type === selected ? 'selected' : '') + '>' + type + '</option>';
        });
        return html;
    }

    function buildExerciseOptions(type, selected) {
        var html = '<option value="">' + t('select_exercise_placeholder') + '</option>';
        if (type && EXDATA[type]) {
            EXDATA[type].forEach(function (name) {
                html += '<option value="' + name + '" ' + (name === selected ? 'selected' : '') + '>' + name + '</option>';
            });
        }
        return html;
    }

    function getFilteredExercises(training) {
        var exercises = training.exercises.map(function (ex, i) {
            return Object.assign({}, ex, { _idx: i });
        });

        if (filterType.value) exercises = exercises.filter(function (ex) { return ex.type === filterType.value; });
        var q = filterExercise.value.trim().toLowerCase();
        if (q) exercises = exercises.filter(function (ex) { return (ex.name || '').toLowerCase().includes(q); });

        if (exSortCol) {
            exercises.sort(function (a, b) {
                var va, vb;
                if (exSortCol === 'type') { va = (a.type || '').toLowerCase(); vb = (b.type || '').toLowerCase(); }
                else if (exSortCol === 'name') { va = (a.name || '').toLowerCase(); vb = (b.name || '').toLowerCase(); }
                else if (exSortCol === 'rating') { va = a.rating || 0; vb = b.rating || 0; }
                else if (exSortCol === 'total') { va = getTotalReps(a); vb = getTotalReps(b); }
                else if (exSortCol === 'load') { va = (a.load || '').toLowerCase(); vb = (b.load || '').toLowerCase(); }
                if (va < vb) return exSortDir === 'asc' ? -1 : 1;
                if (va > vb) return exSortDir === 'asc' ? 1 : -1;
                return 0;
            });
        }
        return exercises;
    }

    function updateExSortIcons() {
        ['sortIconType', 'sortIconExName', 'sortIconExRating', 'sortIconExTotal', 'sortIconExLoad'].forEach(function (id) {
            document.getElementById(id).textContent = '';
        });
        if (!exSortCol) return;
        var icon = exSortDir === 'asc' ? '▲' : '▼';
        var map = { type: 'sortIconType', name: 'sortIconExName', rating: 'sortIconExRating', total: 'sortIconExTotal', load: 'sortIconExLoad' };
        if (map[exSortCol]) document.getElementById(map[exSortCol]).textContent = icon;
    }

    function buildStars(rating, idx) {
        var html = '<div class="star-rating-interactive" data-index="' + idx + '">';
        for (var i = 1; i <= CONFIG.MAX_STARS; i++) {
            html += '<span class="star-btn ' + (i <= rating ? 'star-active' : '') + '" data-star="' + i + '" data-index="' + idx + '">★</span>';
        }
        return html + '</div>';
    }

    function renderExercises() {
        var training = getTraining();
        if (!training) return;
        exercisesBody.innerHTML = '';
        toggleExFiltersBtn.style.display = training.exercises.length === 0 ? 'none' : '';

        var exercises = getFilteredExercises(training);

        if (exercises.length === 0) {
            emptyMsg.style.display = 'block';
            emptyMsg.textContent = training.exercises.length === 0 ? t('empty_no_exercises') : t('empty_no_exercise_filter_match');
            document.getElementById('exercisesTable').style.display = 'none';
            return;
        }

        emptyMsg.style.display = 'none';
        document.getElementById('exercisesTable').style.display = 'table';
        updateExSortIcons();

        exercises.forEach(function (ex) {
            var i = ex._idx;
            var row = document.createElement('tr');
            row.dataset.index = i;
            var s = ex.series || [];
            var total = getTotalReps(ex);

            var seriesHtml = '';
            for (var si = 0; si < CONFIG.MAX_SERIES; si++) {
                seriesHtml += '<td class="td-series"><input type="number" class="inline-input inline-series" data-index="' + i + '" data-series="' + si + '" min="0" placeholder="-" value="' + (s[si] != null ? s[si] : '') + '"></td>';
            }

            row.innerHTML =
                '<td class="td-type"><select class="inline-select inline-type" data-index="' + i + '">' + buildTypeOptions(ex.type) + '</select></td>' +
                '<td class="td-name"><select class="inline-select inline-name" data-index="' + i + '">' + buildExerciseOptions(ex.type, ex.name) + '</select></td>' +
                '<td class="td-load"><input type="text" class="inline-input inline-load" data-index="' + i + '" placeholder="' + t('load_placeholder') + '" value="' + escapeHtml(ex.load || '') + '"></td>' +
                seriesHtml +
                '<td class="td-total" data-index="' + i + '">' + (total > 0 ? total : '-') + '</td>' +
                '<td class="td-rating-interactive">' + buildStars(ex.rating || 0, i) + '</td>' +
                '<td class="td-action"><button class="btn btn-small btn-delete btn-delete-row" data-index="' + i + '" title="' + t('btn_delete_exercise_title') + '">✕</button></td>';

            exercisesBody.appendChild(row);
        });
        updateAvgRating();
    }

    function updateTotalCell(index) {
        var training = getTraining();
        if (!training || !training.exercises[index]) return;
        var total = getTotalReps(training.exercises[index]);
        var cell = exercisesBody.querySelector('.td-total[data-index="' + index + '"]');
        if (cell) cell.textContent = total > 0 ? total : '-';
    }

    function saveField(index, field, value) {
        var trainings = getTrainings();
        var training = trainings.find(function (x) { return x.id === trainingId; });
        if (!training || !training.exercises[index]) return;

        if (field === 'type') {
            training.exercises[index].type = value;
            training.exercises[index].name = '';
            saveTrainings(trainings);
            renderExercises();
        } else if (field === 'name') {
            training.exercises[index].name = value;
            saveTrainings(trainings);
        } else if (field === 'load') {
            training.exercises[index].load = value;
            saveTrainings(trainings);
        } else if (field === 'series') {
            training.exercises[index].series = normalizeSeries(training.exercises[index].series);
            training.exercises[index].series[value.seriesIndex] = value.reps !== '' ? parseInt(value.reps) : null;
            saveTrainings(trainings);
            updateTotalCell(index);
        } else if (field === 'rating') {
            training.exercises[index].rating = value;
            saveTrainings(trainings);
            updateAvgRating();
        }
    }

    // ---- Zdarzenia tabeli ----
    exercisesBody.addEventListener('change', function (e) {
        var tgt = e.target;
        var idx = parseInt(tgt.dataset.index);
        if (isNaN(idx)) return;

        if (tgt.classList.contains('inline-type')) saveField(idx, 'type', tgt.value);
        else if (tgt.classList.contains('inline-name')) saveField(idx, 'name', tgt.value);
        else if (tgt.classList.contains('inline-load')) saveField(idx, 'load', tgt.value);
        else if (tgt.classList.contains('inline-series')) {
            saveField(idx, 'series', { seriesIndex: parseInt(tgt.dataset.series), reps: tgt.value });
        }
    });

    exercisesBody.addEventListener('input', function (e) {
        var tgt = e.target;
        var idx = parseInt(tgt.dataset.index);
        if (isNaN(idx)) return;

        if (tgt.classList.contains('inline-series')) {
            saveField(idx, 'series', { seriesIndex: parseInt(tgt.dataset.series), reps: tgt.value });
        } else if (tgt.classList.contains('inline-load')) {
            saveField(idx, 'load', tgt.value);
        }
    });

    exercisesBody.addEventListener('click', function (e) {
        var tgt = e.target;

        if (tgt.classList.contains('star-btn')) {
            var idx = parseInt(tgt.dataset.index);
            var star = parseInt(tgt.dataset.star);
            if (isNaN(idx) || isNaN(star)) return;

            var training = getTraining();
            var current = (training && training.exercises[idx]) ? (training.exercises[idx].rating || 0) : 0;
            var newRating = current === star ? 0 : star;
            saveField(idx, 'rating', newRating);

            var container = tgt.closest('.star-rating-interactive');
            if (container) {
                container.querySelectorAll('.star-btn').forEach(function (btn) {
                    btn.classList.toggle('star-active', parseInt(btn.dataset.star) <= newRating);
                });
            }
            return;
        }

        if (tgt.classList.contains('btn-delete-row')) {
            var idx2 = parseInt(tgt.dataset.index);
            if (!isNaN(idx2)) {
                deleteExercise(trainingId, idx2);
                renderExercises();
            }
        }
    });

    exercisesBody.addEventListener('mouseover', function (e) {
        if (!e.target.classList.contains('star-btn')) return;
        var container = e.target.closest('.star-rating-interactive');
        var hoverStar = parseInt(e.target.dataset.star);
        if (container && !isNaN(hoverStar)) {
            container.querySelectorAll('.star-btn').forEach(function (btn) {
                btn.classList.toggle('star-hover', parseInt(btn.dataset.star) <= hoverStar);
            });
        }
    });

    exercisesBody.addEventListener('mouseout', function (e) {
        if (!e.target.classList.contains('star-btn')) return;
        var container = e.target.closest('.star-rating-interactive');
        if (container) {
            container.querySelectorAll('.star-btn').forEach(function (btn) {
                btn.classList.remove('star-hover');
            });
        }
    });

    // ---- Sortowanie ----
    document.querySelectorAll('#exercisesTable th.sortable').forEach(function (th) {
        th.addEventListener('click', function () {
            var col = th.dataset.sort;
            if (exSortCol === col) exSortDir = exSortDir === 'asc' ? 'desc' : 'asc';
            else { exSortCol = col; exSortDir = 'asc'; }
            renderExercises();
        });
    });

    // ---- Filtry ----
    filterType.addEventListener('change', renderExercises);
    filterExercise.addEventListener('input', renderExercises);
    document.getElementById('clearExerciseFiltersBtn').addEventListener('click', function () {
        filterType.value = '';
        filterExercise.value = '';
        exSortCol = null;
        renderExercises();
    });

    // ---- Dodaj ćwiczenie ----
    document.getElementById('addExerciseBtn').addEventListener('click', function () {
        filterType.value = '';
        filterExercise.value = '';
        exSortCol = null;

        var emptySeries = [];
        for (var i = 0; i < CONFIG.MAX_SERIES; i++) emptySeries.push(null);

        addExercise(trainingId, { type: '', name: '', load: '', series: emptySeries, rating: 0 });
        renderExercises();

        var rows = exercisesBody.querySelectorAll('tr');
        if (rows.length > 0) {
            var lastSelect = rows[rows.length - 1].querySelector('.inline-type');
            if (lastSelect) lastSelect.focus();
        }
        window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
    });

    // ---- Init ----
    populateTypeFilter();
    renderHeader();
    renderExercises();
}