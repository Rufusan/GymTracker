// ========================================
// Dziennik Treningowy - Logika aplikacji
// ========================================

// ========================================
// LocalStorage
// ========================================

function getTrainings() {
    const data = localStorage.getItem(CONFIG.STORAGE_KEY);
    return data ? JSON.parse(data) : [];
}

function saveTrainings(trainings) {
    localStorage.setItem(CONFIG.STORAGE_KEY, JSON.stringify(trainings));
}

function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substring(2, 8);
}

// ========================================
// CRUD treningów
// ========================================

function addTraining(name, date) {
    const trainings = getTrainings();
    const training = { id: generateId(), name, date, exercises: [] };
    trainings.push(training);
    saveTrainings(trainings);
    return training;
}

function updateTraining(id, updates) {
    const trainings = getTrainings();
    const i = trainings.findIndex(t => t.id === id);
    if (i !== -1) { trainings[i] = { ...trainings[i], ...updates }; saveTrainings(trainings); }
}

function deleteTraining(id) {
    saveTrainings(getTrainings().filter(t => t.id !== id));
}

// ========================================
// CRUD ćwiczeń
// ========================================

function addExercise(trainingId, exercise) {
    const trainings = getTrainings();
    const training = trainings.find(t => t.id === trainingId);
    if (training) {
        exercise.series = normalizeSeries(exercise.series);
        if (exercise.rating === undefined) exercise.rating = 0;
        if (exercise.load === undefined) exercise.load = '';
        training.exercises.push(exercise);
        saveTrainings(trainings);
    }
}

function deleteExercise(trainingId, exerciseIndex) {
    const trainings = getTrainings();
    const training = trainings.find(t => t.id === trainingId);
    if (training) { training.exercises.splice(exerciseIndex, 1); saveTrainings(trainings); }
}

function normalizeSeries(series) {
    const result = [];
    for (let i = 0; i < CONFIG.MAX_SERIES; i++) {
        const val = series && series[i] !== undefined && series[i] !== null && series[i] !== '' ? series[i] : null;
        result.push(val);
    }
    return result;
}

// ========================================
// Oceny
// ========================================

function getAverageRating(training) {
    if (!training || !training.exercises || training.exercises.length === 0) return 0;
    const rated = training.exercises.filter(ex => (ex.rating || 0) > 0);
    if (rated.length === 0) return 0;
    return rated.reduce((acc, ex) => acc + (ex.rating || 0), 0) / rated.length;
}

function renderStarsReadonly(rating) {
    let html = '<span class="star-rating-readonly">';
    for (let i = 1; i <= CONFIG.MAX_STARS; i++) {
        if (rating >= i) html += '<span class="star-ro star-full">★</span>';
        else if (rating >= i - 0.5) html += '<span class="star-ro star-half">★</span>';
        else html += '<span class="star-ro star-empty">★</span>';
    }
    return html + '</span>';
}

// ========================================
// Suma powtórzeń
// ========================================

function getTotalReps(exercise) {
    const s = exercise.series || [];
    let total = 0;
    for (let i = 0; i < CONFIG.MAX_SERIES; i++) {
        if (s[i] != null && !isNaN(s[i])) total += s[i];
    }
    return total;
}

// ========================================
// Import / Eksport
// ========================================

function exportData() {
    return JSON.stringify({ version: CONFIG.DATA_VERSION, exportedAt: new Date().toISOString(), trainings: getTrainings() }, null, 2);
}

function importData(trainings, mode) {
    const normalize = (tr) => {
        if (!tr.id) tr.id = generateId();
        if (!Array.isArray(tr.exercises)) tr.exercises = [];
        tr.exercises.forEach(ex => {
            ex.series = normalizeSeries(ex.series);
            if (ex.rating === undefined) ex.rating = 0;
            if (ex.load === undefined) ex.load = '';
        });
    };
    if (mode === 'replace') {
        trainings.forEach(normalize);
        saveTrainings(trainings);
    } else if (mode === 'merge') {
        const existing = getTrainings();
        const existingIds = new Set(existing.map(tr => tr.id));
        trainings.forEach(tr => {
            normalize(tr);
            if (existingIds.has(tr.id)) return;
            if (existing.some(e => e.name === tr.name && e.date === tr.date)) return;
            existing.push(tr);
            existingIds.add(tr.id);
        });
        saveTrainings(existing);
    }
}

// ========================================
// Pomocniki
// ========================================

function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str || '';
    return div.innerHTML;
}

function dateLocale() {
    return t('date_locale');
}

// ========================================
// Service Worker
// ========================================

if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js')
        .then(reg => console.log('SW registered:', reg.scope))
        .catch(err => console.log('SW registration failed:', err));
}

// ========================================
// Inicjalizacja
// ========================================

document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('trainingsBody')) initIndexPage();
    if (document.getElementById('exercisesBody')) initTrainingPage();
});

// ========================================
// ======= STRONA GŁÓWNA =======
// ========================================

function initIndexPage() {
    const EXERCISE_DATA_LOCALIZED = getLocalizedExerciseData();

    const trainingsBody = document.getElementById('trainingsBody');
    const trainingModal = document.getElementById('trainingModal');
    const trainingForm = document.getElementById('trainingForm');
    const trainingModalTitle = document.getElementById('trainingModalTitle');
    const trainingNameInput = document.getElementById('trainingName');
    const trainingDateInput = document.getElementById('trainingDate');
    const emptyMessage = document.getElementById('emptyMessage');
    const filterName = document.getElementById('filterName');
    const filterDateFrom = document.getElementById('filterDateFrom');
    const filterDateTo = document.getElementById('filterDateTo');
    const filtersBar = document.getElementById('filtersBar');
    const toggleFiltersBtn = document.getElementById('toggleFiltersBtn');
    const selectAllCheckbox = document.getElementById('selectAllCheckbox');
    const selectionToolbar = document.getElementById('selectionToolbar');
    const selectionCountEl = document.getElementById('selectionCount');
    const downloadPdfBtn = document.getElementById('downloadPdfBtn');
    const editSelectedBtn = document.getElementById('editSelectedBtn');
    const deleteSelectedBtn = document.getElementById('deleteSelectedBtn');
    const clearSelectionBtn = document.getElementById('clearSelectionBtn');
    const dataBar = document.getElementById('dataBar');
    const toggleDataBtn = document.getElementById('toggleDataBtn');
    const importModal = document.getElementById('importModal');
    const importDetail = document.getElementById('importDetail');
    const importFileInput = document.getElementById('importFileInput');

    let editingTrainingId = null;
    let pendingImportData = null;
    let sortColumn = CONFIG.DEFAULT_SORT_COLUMN;
    let sortDirection = CONFIG.DEFAULT_SORT_DIRECTION;
    const selectedIds = new Set();

    // ---- Zastosuj tłumaczenia do HTML ----
    document.title = t('app_title');
    document.querySelector('h1').textContent = t('app_title_emoji');
    document.getElementById('addTrainingBtn').textContent = t('btn_add_training');
    editSelectedBtn.innerHTML = t('btn_edit');
    downloadPdfBtn.innerHTML = t('btn_pdf');
    deleteSelectedBtn.innerHTML = t('btn_delete');
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
    clearSelectionBtn.textContent = t('btn_clear_selection');
    selectAllCheckbox.title = t('select_all_title');
    document.getElementById('cancelTrainingBtn').textContent = t('btn_cancel');
    document.querySelector('#trainingForm button[type="submit"]').textContent = t('btn_save');
    document.querySelector('#trainingForm label[for="trainingName"]').textContent = t('training_name_label');
    trainingNameInput.placeholder = t('training_name_placeholder');
    document.querySelector('#trainingForm label[for="trainingDate"]').textContent = t('training_date_label');
    document.querySelector('#importModal h2').textContent = t('import_title');
    document.querySelector('.import-warning').textContent = t('import_warning');
    document.getElementById('importCancelBtn').textContent = t('btn_cancel');
    document.getElementById('importMergeBtn').textContent = t('btn_merge');
    document.getElementById('importReplaceBtn').textContent = t('btn_replace');

    // Nagłówki tabeli
    const thCells = document.querySelectorAll('#trainingsTable thead th');
    thCells[1].innerHTML = `${t('th_name')} <span class="sort-icon" id="sortIconName"></span>`;
    thCells[2].innerHTML = `${t('th_date')} <span class="sort-icon" id="sortIconDate"></span>`;
    thCells[3].innerHTML = `${t('th_exercises')} <span class="sort-icon" id="sortIconExercises"></span>`;
    thCells[4].innerHTML = `${t('th_rating')} <span class="sort-icon" id="sortIconRating"></span>`;

    // Pomocniki daty
    document.querySelectorAll('.date-helper-btn').forEach(btn => {
        const offset = parseInt(btn.dataset.offset);
        btn.textContent = tDateHelper(offset);
    });

    emptyMessage.textContent = t('empty_no_trainings');

    // ---- Panele ----
    toggleFiltersBtn.addEventListener('click', () => { filtersBar.classList.toggle('collapsed'); toggleFiltersBtn.classList.toggle('active'); });
    toggleDataBtn.addEventListener('click', () => { dataBar.classList.toggle('collapsed'); toggleDataBtn.classList.toggle('active'); });

    // ---- Pomocniki daty ----
    document.querySelectorAll('.date-helper-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const d = new Date(); d.setDate(d.getDate() + parseInt(btn.dataset.offset));
            trainingDateInput.value = d.toISOString().split('T')[0];
            document.querySelectorAll('.date-helper-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
        });
    });
    trainingDateInput.addEventListener('change', updateDateHelperHighlight);

    function updateDateHelperHighlight() {
        const val = trainingDateInput.value;
        document.querySelectorAll('.date-helper-btn').forEach(btn => {
            const d = new Date(); d.setDate(d.getDate() + parseInt(btn.dataset.offset));
            btn.classList.toggle('active', val === d.toISOString().split('T')[0]);
        });
    }

    // ---- Eksport JSON ----
    document.getElementById('exportJsonBtn').addEventListener('click', () => {
        const blob = new Blob([exportData()], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a'); a.href = url;
        a.download = `${t('export_filename_prefix')}_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url);
    });

    // ---- Import JSON ----
    document.getElementById('importJsonBtn').addEventListener('click', () => importFileInput.click());
    importFileInput.addEventListener('change', (e) => {
        const file = e.target.files[0]; if (!file) return;
        const reader = new FileReader();
        reader.onload = (ev) => {
            try {
                const parsed = JSON.parse(ev.target.result);
                if (!parsed.version || !Array.isArray(parsed.trainings)) { alert(t('import_invalid_format')); return; }
                pendingImportData = parsed.trainings;
                importDetail.textContent = t('import_detail', { fileCount: parsed.trainings.length, currentCount: getTrainings().length });
                importModal.classList.add('active');
            } catch (err) { alert(t('import_read_error')); }
        };
        reader.readAsText(file); importFileInput.value = '';
    });
    document.getElementById('importCancelBtn').addEventListener('click', () => { importModal.classList.remove('active'); pendingImportData = null; });
    document.getElementById('importMergeBtn').addEventListener('click', () => { if (!pendingImportData) return; importData(pendingImportData, 'merge'); importModal.classList.remove('active'); pendingImportData = null; selectedIds.clear(); renderTrainings(); });
    document.getElementById('importReplaceBtn').addEventListener('click', () => { if (!pendingImportData) return; importData(pendingImportData, 'replace'); importModal.classList.remove('active'); pendingImportData = null; selectedIds.clear(); renderTrainings(); });
    importModal.addEventListener('click', (e) => { if (e.target === importModal) { importModal.classList.remove('active'); pendingImportData = null; } });

    // ---- Sortowanie i filtrowanie ----
    function getFilteredAndSortedTrainings() {
        let trainings = getTrainings();
        const q = filterName.value.trim().toLowerCase();
        if (q) trainings = trainings.filter(tr => tr.name.toLowerCase().includes(q));
        if (filterDateFrom.value) trainings = trainings.filter(tr => tr.date >= filterDateFrom.value);
        if (filterDateTo.value) trainings = trainings.filter(tr => tr.date <= filterDateTo.value);
        trainings.sort((a, b) => {
            let va, vb;
            if (sortColumn === 'name') { va = a.name.toLowerCase(); vb = b.name.toLowerCase(); }
            else if (sortColumn === 'date') { va = a.date; vb = b.date; }
            else if (sortColumn === 'exercises') { va = a.exercises.length; vb = b.exercises.length; }
            else if (sortColumn === 'rating') { va = getAverageRating(a); vb = getAverageRating(b); }
            if (va < vb) return sortDirection === 'asc' ? -1 : 1;
            if (va > vb) return sortDirection === 'asc' ? 1 : -1;
            return 0;
        });
        return trainings;
    }

    function updateSortIcons() {
        ['sortIconName', 'sortIconDate', 'sortIconExercises', 'sortIconRating'].forEach(id => document.getElementById(id).textContent = '');
        const icon = sortDirection === 'asc' ? '▲' : '▼';
        const map = { name: 'sortIconName', date: 'sortIconDate', exercises: 'sortIconExercises', rating: 'sortIconRating' };
        if (map[sortColumn]) document.getElementById(map[sortColumn]).textContent = icon;
    }

    function formatDateShort(dateStr) {
        const date = new Date(dateStr + 'T00:00:00');
        if (window.innerWidth <= 480) return date.toLocaleDateString(dateLocale(), { month: 'short', day: 'numeric' });
        return date.toLocaleDateString(dateLocale(), { year: 'numeric', month: 'short', day: 'numeric' });
    }

    // ---- UI zaznaczenia ----
    function updateSelectionUI() {
        const count = selectedIds.size;
        const has = getTrainings().length > 0;
        downloadPdfBtn.style.display = has ? '' : 'none'; downloadPdfBtn.disabled = count === 0;
        downloadPdfBtn.title = count > 0 ? t('tooltip_pdf_enabled', { count }) : t('tooltip_pdf_disabled');
        editSelectedBtn.style.display = has ? '' : 'none'; editSelectedBtn.disabled = count !== 1;
        editSelectedBtn.title = count === 1 ? t('tooltip_edit_enabled') : t('tooltip_edit_disabled');
        deleteSelectedBtn.style.display = has ? '' : 'none'; deleteSelectedBtn.disabled = count === 0;
        deleteSelectedBtn.title = count > 0 ? t('tooltip_delete_enabled', { count }) : t('tooltip_delete_disabled');
        if (count > 0) { selectionToolbar.classList.add('visible'); selectionCountEl.textContent = t('selection_count', { count }); }
        else { selectionToolbar.classList.remove('visible'); }
        const visible = getFilteredAndSortedTrainings();
        const allSel = visible.length > 0 && visible.every(tr => selectedIds.has(tr.id));
        const someSel = visible.some(tr => selectedIds.has(tr.id));
        selectAllCheckbox.checked = allSel; selectAllCheckbox.indeterminate = someSel && !allSel;
        document.querySelectorAll('#trainingsBody tr').forEach(tr => { tr.classList.toggle('selected', tr.dataset.id && selectedIds.has(tr.dataset.id)); });
    }

    // ---- Renderowanie ----
    function renderTrainings() {
        const trainings = getFilteredAndSortedTrainings();
        const all = getTrainings();
        trainingsBody.innerHTML = '';
        toggleFiltersBtn.style.display = all.length === 0 ? 'none' : '';
        if (trainings.length === 0) {
            emptyMessage.style.display = 'block';
            emptyMessage.textContent = all.length === 0 ? t('empty_no_trainings') : t('empty_no_filter_match');
            document.getElementById('trainingsTable').style.display = 'none';
            updateSelectionUI(); return;
        }
        emptyMessage.style.display = 'none';
        document.getElementById('trainingsTable').style.display = 'table';
        updateSortIcons();
        trainings.forEach(training => {
            const tr = document.createElement('tr'); tr.dataset.id = training.id;
            tr.innerHTML = `
                <td class="td-checkbox"><input type="checkbox" class="row-checkbox" data-id="${training.id}" ${selectedIds.has(training.id) ? 'checked' : ''}></td>
                <td class="clickable" data-id="${training.id}">${escapeHtml(training.name)}</td>
                <td class="clickable" data-id="${training.id}">${formatDateShort(training.date)}</td>
                <td class="clickable" data-id="${training.id}">${training.exercises.length}</td>
                <td class="clickable td-rating" data-id="${training.id}">${renderStarsReadonly(getAverageRating(training))}</td>
            `;
            trainingsBody.appendChild(tr);
        });
        updateSelectionUI();
    }

    // ---- Modal ----
    function openTrainingModal(training) {
        if (training) {
            trainingModalTitle.textContent = t('modal_edit_training');
            trainingNameInput.value = training.name; trainingDateInput.value = training.date; editingTrainingId = training.id;
        } else {
            trainingModalTitle.textContent = t('modal_add_training');
            trainingNameInput.value = ''; trainingDateInput.value = new Date().toISOString().split('T')[0]; editingTrainingId = null;
        }
        updateDateHelperHighlight(); trainingModal.classList.add('active'); trainingNameInput.focus();
    }
    function closeTrainingModal() { trainingModal.classList.remove('active'); editingTrainingId = null; }

    // ---- PDF ----
    function exportPDF(ids) {
        const trainings = ids.map(id => getTrainings().find(tr => tr.id === id)).filter(Boolean);
        if (trainings.length === 0) return;
        trainings.sort((a, b) => new Date(a.date) - new Date(b.date));
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF(CONFIG.PDF_ORIENTATION);
        const pw = doc.internal.pageSize.getWidth();

        trainings.forEach((training, tIdx) => {
            if (tIdx > 0) doc.addPage();
            let y = 18;
            doc.setFontSize(22); doc.setFont('helvetica', 'bold'); doc.setTextColor(30);
            doc.text(training.name, pw / 2, y, { align: 'center' }); y += 8;
            const ds = new Date(training.date + 'T00:00:00').toLocaleDateString(dateLocale(), { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
            doc.setFontSize(12); doc.setFont('helvetica', 'normal'); doc.setTextColor(100);
            doc.text(ds, pw / 2, y, { align: 'center' }); y += 6;
            doc.setDrawColor(200); doc.setLineWidth(0.5); doc.line(14, y, pw - 14, y); y += 8;
            doc.setTextColor(60); doc.setFontSize(11);
            doc.text(`${t('pdf_total_exercises')}: ${training.exercises.length}`, 14, y);
            let gt = 0; training.exercises.forEach(ex => { gt += getTotalReps(ex); });
            doc.text(`${t('pdf_total_reps')}: ${gt}`, 100, y); y += 8;

            if (training.exercises.length === 0) {
                doc.setFontSize(12); doc.setTextColor(150);
                doc.text(t('pdf_no_exercises'), pw / 2, y + 10, { align: 'center' });
            } else {
                const grouped = {};
                training.exercises.forEach(ex => {
                    const type = ex.type || t('pdf_uncategorized');
                    if (!grouped[type]) grouped[type] = [];
                    grouped[type].push(ex);
                });
                Object.keys(grouped).forEach(type => {
                    doc.setFontSize(13); doc.setFont('helvetica', 'bold'); doc.setTextColor(40);
                    doc.text(type, 14, y); y += 2;
                    const rows = grouped[type].map(ex => {
                        const s = ex.series || [];
                        const tot = getTotalReps(ex);
                        return [ex.name || '-', ex.load || '-',
                            s[0] != null ? String(s[0]) : '-', s[1] != null ? String(s[1]) : '-',
                            s[2] != null ? String(s[2]) : '-', s[3] != null ? String(s[3]) : '-',
                            s[4] != null ? String(s[4]) : '-', s[5] != null ? String(s[5]) : '-',
                            tot > 0 ? String(tot) : '-'];
                    });
                    doc.autoTable({
                        startY: y, body: rows, theme: 'grid', margin: { left: 14, right: 14 },
                        head: [[t('pdf_header_exercise'), t('pdf_header_load'), 'S1', 'S2', 'S3', 'S4', 'S5', 'S6', t('pdf_header_total')]],
                        headStyles: { fillColor: CONFIG.PDF_HEADER_COLOR, textColor: 255, fontStyle: 'bold', fontSize: 10, halign: 'center' },
                        columnStyles: {
                            0: { cellWidth: 'auto', halign: 'left' }, 1: { cellWidth: 28, halign: 'center' },
                            2: { cellWidth: 14, halign: 'center' }, 3: { cellWidth: 14, halign: 'center' },
                            4: { cellWidth: 14, halign: 'center' }, 5: { cellWidth: 14, halign: 'center' },
                            6: { cellWidth: 14, halign: 'center' }, 7: { cellWidth: 14, halign: 'center' },
                            8: { cellWidth: 18, halign: 'center', fontStyle: 'bold' }
                        },
                        bodyStyles: { fontSize: 10, textColor: 50 },
                        alternateRowStyles: { fillColor: CONFIG.PDF_ALT_ROW_COLOR }
                    });
                    y = doc.lastAutoTable.finalY + 10;
                });
            }
        });

        const tp = doc.internal.getNumberOfPages();
        for (let i = 1; i <= tp; i++) {
            doc.setPage(i); doc.setFontSize(8); doc.setTextColor(180);
            doc.text(t('pdf_footer', { date: new Date().toLocaleDateString(dateLocale()), page: i, total: tp }),
                pw / 2, doc.internal.pageSize.getHeight() - 10, { align: 'center' });
        }
        let fn;
        if (trainings.length === 1) fn = `${trainings[0].name.replace(/[^a-z0-9ąćęłńóśźż]/gi, '_').toLowerCase()}_${trainings[0].date}.pdf`;
        else fn = `${t('pdf_filename_prefix')}_${trainings.length}_${t('pdf_filename_suffix')}.pdf`;
        doc.save(fn);
    }

    // ---- Zdarzenia ----
    document.getElementById('addTrainingBtn').addEventListener('click', () => openTrainingModal(null));
    document.getElementById('cancelTrainingBtn').addEventListener('click', closeTrainingModal);
    trainingModal.addEventListener('click', (e) => { if (e.target === trainingModal) closeTrainingModal(); });

    trainingForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = trainingNameInput.value.trim(); const date = trainingDateInput.value;
        if (!name || !date) return;
        if (editingTrainingId) { updateTraining(editingTrainingId, { name, date }); closeTrainingModal(); renderTrainings(); }
        else { const tr = addTraining(name, date); closeTrainingModal(); window.location.href = `training.html?id=${tr.id}`; }
    });

    trainingsBody.addEventListener('click', (e) => {
        const el = e.target.classList.contains('clickable') ? e.target : e.target.closest('.clickable');
        if (el && el.dataset.id) window.location.href = `training.html?id=${el.dataset.id}`;
    });
    trainingsBody.addEventListener('change', (e) => {
        if (!e.target.classList.contains('row-checkbox')) return;
        if (e.target.checked) selectedIds.add(e.target.dataset.id); else selectedIds.delete(e.target.dataset.id);
        updateSelectionUI();
    });
    selectAllCheckbox.addEventListener('change', () => {
        const v = getFilteredAndSortedTrainings();
        if (selectAllCheckbox.checked) v.forEach(tr => selectedIds.add(tr.id)); else v.forEach(tr => selectedIds.delete(tr.id));
        renderTrainings();
    });
    editSelectedBtn.addEventListener('click', () => {
        if (selectedIds.size !== 1) return;
        const tr = getTrainings().find(t => t.id === Array.from(selectedIds)[0]);
        if (tr) openTrainingModal(tr);
    });
    downloadPdfBtn.addEventListener('click', () => { if (selectedIds.size > 0) exportPDF(Array.from(selectedIds)); });
    deleteSelectedBtn.addEventListener('click', () => {
        if (selectedIds.size === 0) return;
        const c = selectedIds.size;
        if (!confirm(c === 1 ? t('confirm_delete_single') : t('confirm_delete_multiple', { count: c }))) return;
        Array.from(selectedIds).forEach(id => deleteTraining(id));
        selectedIds.clear(); renderTrainings();
    });
    clearSelectionBtn.addEventListener('click', () => { selectedIds.clear(); renderTrainings(); });

    document.querySelectorAll('#trainingsTable th.sortable').forEach(th => {
        th.addEventListener('click', () => {
            const col = th.dataset.sort;
            if (sortColumn === col) sortDirection = sortDirection === 'asc' ? 'desc' : 'asc';
            else { sortColumn = col; sortDirection = 'asc'; }
            renderTrainings();
        });
    });
    filterName.addEventListener('input', renderTrainings);
    filterDateFrom.addEventListener('change', renderTrainings);
    filterDateTo.addEventListener('change', renderTrainings);
    document.getElementById('clearFiltersBtn').addEventListener('click', () => { filterName.value = ''; filterDateFrom.value = ''; filterDateTo.value = ''; renderTrainings(); });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') { closeTrainingModal(); importModal.classList.remove('active'); pendingImportData = null; } });
    window.addEventListener('resize', renderTrainings);

    renderTrainings();
}

// ========================================
// ======= STRONA TRENINGU =======
// ========================================

function initTrainingPage() {
    const EXERCISE_DATA_LOCALIZED = getLocalizedExerciseData();

    const params = new URLSearchParams(window.location.search);
    const trainingId = params.get('id');
    if (!trainingId) { window.location.href = 'index.html'; return; }

    const exercisesBody = document.getElementById('exercisesBody');
    const emptyMessage = document.getElementById('emptyMessage');
    const filterType = document.getElementById('filterType');
    const filterExercise = document.getElementById('filterExercise');
    const exerciseFiltersBar = document.getElementById('exerciseFiltersBar');
    const toggleExFiltersBtn = document.getElementById('toggleExFiltersBtn');
    const trainingAvgRating = document.getElementById('trainingAvgRating');

    let exSortColumn = null;
    let exSortDirection = 'asc';

    // ---- Tłumaczenia HTML ----
    document.querySelector('.back-link').textContent = t('back_to_trainings');
    document.getElementById('addExerciseBtn').textContent = t('btn_add_exercise');
    toggleExFiltersBtn.textContent = t('btn_filters');
    document.querySelector('#exerciseFiltersBar label[for="filterType"]').textContent = t('filter_type');
    filterType.querySelector('option').textContent = t('filter_all_types');
    document.querySelector('#exerciseFiltersBar label[for="filterExercise"]').textContent = t('filter_exercise');
    filterExercise.placeholder = t('filter_exercise_placeholder');
    document.getElementById('clearExerciseFiltersBtn').textContent = t('btn_clear_filters');
    emptyMessage.textContent = t('empty_no_exercises');

    // Nagłówki tabeli
    const ths = document.querySelectorAll('#exercisesTable thead th');
    ths[0].innerHTML = `${t('th_type')} <span class="sort-icon" id="sortIconType"></span>`;
    ths[1].innerHTML = `${t('th_exercise')} <span class="sort-icon" id="sortIconExName"></span>`;
    ths[2].innerHTML = `${t('th_load')} <span class="sort-icon" id="sortIconExLoad"></span>`;
    // S1-S6 remain
    ths[9].innerHTML = `${t('th_total')} <span class="sort-icon" id="sortIconExTotal"></span>`;
    ths[10].innerHTML = `${t('th_rating')} <span class="sort-icon" id="sortIconExRating"></span>`;

    toggleExFiltersBtn.addEventListener('click', () => { exerciseFiltersBar.classList.toggle('collapsed'); toggleExFiltersBtn.classList.toggle('active'); });

    function getTraining() { return getTrainings().find(t => t.id === trainingId); }

    function renderHeader() {
        const training = getTraining();
        if (!training) { window.location.href = 'index.html'; return; }
        document.getElementById('trainingTitle').textContent = `🏋️ ${training.name}`;
        document.getElementById('trainingDate').textContent = new Date(training.date + 'T00:00:00').toLocaleDateString(dateLocale(), {
            weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
        });
        document.title = `${training.name} - ${t('app_title')}`;
        updateAvgRatingDisplay();
    }

    function updateAvgRatingDisplay() {
        const training = getTraining(); if (!training) return;
        const avg = getAverageRating(training);
        if (training.exercises.length === 0 || avg === 0) {
            trainingAvgRating.innerHTML = `<span class="avg-label">${t('avg_rating_label')}</span> <span class="avg-no-data">${t('avg_no_data')}</span>`;
        } else {
            trainingAvgRating.innerHTML = `<span class="avg-label">${t('avg_rating_label')}</span> ${renderStarsReadonly(avg)} <span class="avg-value">(${avg.toFixed(1)}/${CONFIG.MAX_STARS})</span>`;
        }
    }

    function populateFilterTypeDropdown() {
        const current = filterType.value;
        filterType.innerHTML = `<option value="">${t('filter_all_types')}</option>`;
        Object.keys(EXERCISE_DATA_LOCALIZED).forEach(type => {
            const o = document.createElement('option'); o.value = type; o.textContent = type;
            filterType.appendChild(o);
        });
        filterType.value = current;
    }

    function buildTypeOptions(selectedType) {
        let html = `<option value="">${t('select_type_placeholder')}</option>`;
        Object.keys(EXERCISE_DATA_LOCALIZED).forEach(type => {
            html += `<option value="${type}" ${type === selectedType ? 'selected' : ''}>${type}</option>`;
        });
        return html;
    }

    function buildExerciseOptions(type, selectedName) {
        let html = `<option value="">${t('select_exercise_placeholder')}</option>`;
        if (type && EXERCISE_DATA_LOCALIZED[type]) {
            EXERCISE_DATA_LOCALIZED[type].forEach(name => {
                html += `<option value="${name}" ${name === selectedName ? 'selected' : ''}>${name}</option>`;
            });
        }
        return html;
    }

    function getFilteredAndSortedExercises(training) {
        let exercises = training.exercises.map((ex, i) => ({ ...ex, _origIndex: i }));
        if (filterType.value) exercises = exercises.filter(ex => ex.type === filterType.value);
        const q = filterExercise.value.trim().toLowerCase();
        if (q) exercises = exercises.filter(ex => (ex.name || '').toLowerCase().includes(q));
        if (exSortColumn) {
            exercises.sort((a, b) => {
                let va, vb;
                if (exSortColumn === 'type') { va = (a.type || '').toLowerCase(); vb = (b.type || '').toLowerCase(); }
                else if (exSortColumn === 'name') { va = (a.name || '').toLowerCase(); vb = (b.name || '').toLowerCase(); }
                else if (exSortColumn === 'rating') { va = a.rating || 0; vb = b.rating || 0; }
                else if (exSortColumn === 'total') { va = getTotalReps(a); vb = getTotalReps(b); }
                else if (exSortColumn === 'load') { va = (a.load || '').toLowerCase(); vb = (b.load || '').toLowerCase(); }
                if (va < vb) return exSortDirection === 'asc' ? -1 : 1;
                if (va > vb) return exSortDirection === 'asc' ? 1 : -1;
                return 0;
            });
        }
        return exercises;
    }

    function updateExSortIcons() {
        ['sortIconType', 'sortIconExName', 'sortIconExRating', 'sortIconExTotal', 'sortIconExLoad'].forEach(id => document.getElementById(id).textContent = '');
        if (!exSortColumn) return;
        const icon = exSortDirection === 'asc' ? '▲' : '▼';
        const map = { type: 'sortIconType', name: 'sortIconExName', rating: 'sortIconExRating', total: 'sortIconExTotal', load: 'sortIconExLoad' };
        if (map[exSortColumn]) document.getElementById(map[exSortColumn]).textContent = icon;
    }

    function buildInteractiveStars(rating, idx) {
        let html = `<div class="star-rating-interactive" data-index="${idx}">`;
        for (let i = 1; i <= CONFIG.MAX_STARS; i++) html += `<span class="star-btn ${i <= rating ? 'star-active' : ''}" data-star="${i}" data-index="${idx}">★</span>`;
        return html + '</div>';
    }

    function renderExercises() {
        const training = getTraining(); if (!training) return;
        exercisesBody.innerHTML = '';
        toggleExFiltersBtn.style.display = training.exercises.length === 0 ? 'none' : '';
        const exercises = getFilteredAndSortedExercises(training);
        if (exercises.length === 0) {
            emptyMessage.style.display = 'block';
            emptyMessage.textContent = training.exercises.length === 0 ? t('empty_no_exercises') : t('empty_no_exercise_filter_match');
            document.getElementById('exercisesTable').style.display = 'none'; return;
        }
        emptyMessage.style.display = 'none';
        document.getElementById('exercisesTable').style.display = 'table';
        updateExSortIcons();

        exercises.forEach(ex => {
            const i = ex._origIndex;
            const tr = document.createElement('tr'); tr.dataset.index = i;
            const s = ex.series || []; const total = getTotalReps(ex);
            let seriesCells = '';
            for (let si = 0; si < CONFIG.MAX_SERIES; si++) {
                seriesCells += `<td class="td-series"><input type="number" class="inline-input inline-series" data-index="${i}" data-series="${si}" min="0" placeholder="-" value="${s[si] != null ? s[si] : ''}"></td>`;
            }
            tr.innerHTML = `
                <td class="td-type"><select class="inline-select inline-type" data-index="${i}">${buildTypeOptions(ex.type)}</select></td>
                <td class="td-name"><select class="inline-select inline-name" data-index="${i}">${buildExerciseOptions(ex.type, ex.name)}</select></td>
                <td class="td-load"><input type="text" class="inline-input inline-load" data-index="${i}" placeholder="${t('load_placeholder')}" value="${escapeHtml(ex.load || '')}"></td>
                ${seriesCells}
                <td class="td-total" data-index="${i}">${total > 0 ? total : '-'}</td>
                <td class="td-rating-interactive">${buildInteractiveStars(ex.rating || 0, i)}</td>
                <td class="td-action"><button class="btn btn-small btn-delete btn-delete-row" data-index="${i}" title="${t('btn_delete_exercise_title')}">✕</button></td>
            `;
            exercisesBody.appendChild(tr);
        });
        updateAvgRatingDisplay();
    }

    function updateTotalCell(index) {
        const training = getTraining();
        if (!training || !training.exercises[index]) return;
        const cell = exercisesBody.querySelector(`.td-total[data-index="${index}"]`);
        if (cell) { const tot = getTotalReps(training.exercises[index]); cell.textContent = tot > 0 ? tot : '-'; }
    }

    function saveField(index, field, value) {
        const trainings = getTrainings();
        const training = trainings.find(t => t.id === trainingId);
        if (!training || !training.exercises[index]) return;
        if (field === 'type') { training.exercises[index].type = value; training.exercises[index].name = ''; saveTrainings(trainings); renderExercises(); }
        else if (field === 'name') { training.exercises[index].name = value; saveTrainings(trainings); }
        else if (field === 'load') { training.exercises[index].load = value; saveTrainings(trainings); }
        else if (field === 'series') {
            training.exercises[index].series = normalizeSeries(training.exercises[index].series);
            training.exercises[index].series[value.seriesIndex] = value.reps !== '' ? parseInt(value.reps) : null;
            saveTrainings(trainings); updateTotalCell(index);
        } else if (field === 'rating') { training.exercises[index].rating = value; saveTrainings(trainings); updateAvgRatingDisplay(); }
    }

    // ---- Zdarzenia ----
    exercisesBody.addEventListener('change', (e) => {
        const tgt = e.target; const idx = parseInt(tgt.dataset.index); if (isNaN(idx)) return;
        if (tgt.classList.contains('inline-type')) saveField(idx, 'type', tgt.value);
        else if (tgt.classList.contains('inline-name')) saveField(idx, 'name', tgt.value);
        else if (tgt.classList.contains('inline-load')) saveField(idx, 'load', tgt.value);
        else if (tgt.classList.contains('inline-series')) saveField(idx, 'series', { seriesIndex: parseInt(tgt.dataset.series), reps: tgt.value });
    });
    exercisesBody.addEventListener('input', (e) => {
        const tgt = e.target; const idx = parseInt(tgt.dataset.index); if (isNaN(idx)) return;
        if (tgt.classList.contains('inline-series')) saveField(idx, 'series', { seriesIndex: parseInt(tgt.dataset.series), reps: tgt.value });
        else if (tgt.classList.contains('inline-load')) saveField(idx, 'load', tgt.value);
    });
    exercisesBody.addEventListener('click', (e) => {
        const tgt = e.target;
        if (tgt.classList.contains('star-btn')) {
            const idx = parseInt(tgt.dataset.index); const star = parseInt(tgt.dataset.star);
            if (isNaN(idx) || isNaN(star)) return;
            const training = getTraining();
            const cur = (training && training.exercises[idx]) ? (training.exercises[idx].rating || 0) : 0;
            const newR = cur === star ? 0 : star;
            saveField(idx, 'rating', newR);
            const container = tgt.closest('.star-rating-interactive');
            if (container) container.querySelectorAll('.star-btn').forEach(btn => { btn.classList.toggle('star-active', parseInt(btn.dataset.star) <= newR); });
            return;
        }
        if (tgt.classList.contains('btn-delete-row')) {
            const idx = parseInt(tgt.dataset.index);
            if (!isNaN(idx)) { deleteExercise(trainingId, idx); renderExercises(); }
        }
    });
    exercisesBody.addEventListener('mouseover', (e) => {
        if (!e.target.classList.contains('star-btn')) return;
        const c = e.target.closest('.star-rating-interactive'); const h = parseInt(e.target.dataset.star);
        if (c && !isNaN(h)) c.querySelectorAll('.star-btn').forEach(btn => { btn.classList.toggle('star-hover', parseInt(btn.dataset.star) <= h); });
    });
    exercisesBody.addEventListener('mouseout', (e) => {
        if (!e.target.classList.contains('star-btn')) return;
        const c = e.target.closest('.star-rating-interactive');
        if (c) c.querySelectorAll('.star-btn').forEach(btn => btn.classList.remove('star-hover'));
    });
    document.querySelectorAll('#exercisesTable th.sortable').forEach(th => {
        th.addEventListener('click', () => {
            const col = th.dataset.sort;
            if (exSortColumn === col) exSortDirection = exSortDirection === 'asc' ? 'desc' : 'asc';
            else { exSortColumn = col; exSortDirection = 'asc'; }
            renderExercises();
        });
    });
    filterType.addEventListener('change', renderExercises);
    filterExercise.addEventListener('input', renderExercises);
    document.getElementById('clearExerciseFiltersBtn').addEventListener('click', () => { filterType.value = ''; filterExercise.value = ''; exSortColumn = null; renderExercises(); });
    document.getElementById('addExerciseBtn').addEventListener('click', () => {
        filterType.value = ''; filterExercise.value = ''; exSortColumn = null;
        addExercise(trainingId, { type: '', name: '', load: '', series: new Array(CONFIG.MAX_SERIES).fill(null), rating: 0 });
        renderExercises();
        const rows = exercisesBody.querySelectorAll('tr');
        if (rows.length > 0) { const sel = rows[rows.length - 1].querySelector('.inline-type'); if (sel) sel.focus(); }
        window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
    });

    populateFilterTypeDropdown();
    renderHeader();
    renderExercises();
}