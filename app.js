function getTrainings(){var d=localStorage.getItem(CONFIG.STORAGE_KEY);return d?JSON.parse(d):[];}
function saveTrainings(ts){localStorage.setItem(CONFIG.STORAGE_KEY,JSON.stringify(ts));}
function generateId(){return Date.now().toString(36)+Math.random().toString(36).substring(2,8);}

function addTraining(name,date,bodyWeight){
    var ts=getTrainings();
    var tr={id:generateId(),name:name,date:date,bodyWeight:bodyWeight||null,exercises:[]};
    ts.push(tr);saveTrainings(ts);return tr;
}
function updateTraining(id,u){
    var ts=getTrainings();var i=ts.findIndex(function(x){return x.id===id;});
    if(i!==-1){ts[i]=Object.assign({},ts[i],u);saveTrainings(ts);}
}
function deleteTraining(id){saveTrainings(getTrainings().filter(function(x){return x.id!==id;}));}

function addExercise(tid,ex){
    var ts=getTrainings();var tr=ts.find(function(x){return x.id===tid;});
    if(tr){ex.series=normalizeSeries(ex.series);if(ex.rating===undefined)ex.rating=0;if(ex.load===undefined)ex.load='';tr.exercises.push(ex);saveTrainings(ts);}
}
function deleteExercise(tid,idx){
    var ts=getTrainings();var tr=ts.find(function(x){return x.id===tid;});
    if(tr){tr.exercises.splice(idx,1);saveTrainings(ts);}
}
function moveExercise(tid,from,to){
    var ts=getTrainings();var tr=ts.find(function(x){return x.id===tid;});
    if(!tr||from<0||to<0||from>=tr.exercises.length||to>=tr.exercises.length)return;
    var item=tr.exercises.splice(from,1)[0];tr.exercises.splice(to,0,item);saveTrainings(ts);
}
function normalizeSeries(s){
    var r=[];for(var i=0;i<CONFIG.MAX_SERIES;i++)r.push(s&&s[i]!==undefined&&s[i]!==null&&s[i]!==''?s[i]:null);return r;
}
function getAverageRating(tr){
    if(!tr||!tr.exercises||!tr.exercises.length)return 0;
    var r=tr.exercises.filter(function(e){return(e.rating||0)>0;});
    if(!r.length)return 0;return r.reduce(function(a,e){return a+(e.rating||0);},0)/r.length;
}
function renderStarsReadonly(rating){
    var h='<span class="star-rating-readonly">';
    for(var i=1;i<=CONFIG.MAX_STARS;i++){
        if(rating>=i)h+='<span class="star-ro star-full">★</span>';
        else if(rating>=i-0.5)h+='<span class="star-ro star-half">★</span>';
        else h+='<span class="star-ro star-empty">★</span>';
    }return h+'</span>';
}
function getTotalReps(ex){
    var s=ex.series||[];var tot=0;
    for(var i=0;i<CONFIG.MAX_SERIES;i++)if(s[i]!=null&&!isNaN(s[i]))tot+=s[i];return tot;
}
function getRepsClass(total,type){
    if(type){
        var cardioName=tCategory('cardio');
        if(type===cardioName||type.toLowerCase()==='cardio')return'';
    }
    if(total>60)return'reps-purple';
    if(total>48)return'reps-green';
    if(total<40)return'reps-red';
    if(total<48)return'reps-orange';
    return'';
}
function exportData(){return JSON.stringify({version:CONFIG.DATA_VERSION,exportedAt:new Date().toISOString(),trainings:getTrainings()},null,2);}
function importData(data,mode){
    var norm=function(x){if(!x.id)x.id=generateId();if(!Array.isArray(x.exercises))x.exercises=[];if(x.bodyWeight===undefined)x.bodyWeight=null;x.exercises.forEach(function(e){e.series=normalizeSeries(e.series);if(e.rating===undefined)e.rating=0;if(e.load===undefined)e.load='';});};
    if(mode==='replace'){data.forEach(norm);saveTrainings(data);}
    else{var ex=getTrainings();var ids=new Set(ex.map(function(x){return x.id;}));data.forEach(function(x){norm(x);if(ids.has(x.id)||ex.some(function(e){return e.name===x.name&&e.date===x.date;}))return;ex.push(x);ids.add(x.id);});saveTrainings(ex);}
}
function escapeHtml(s){var d=document.createElement('div');d.textContent=s||'';return d.innerHTML;}
function dateLocale(){return t('date_locale');}

if('serviceWorker' in navigator)navigator.serviceWorker.register('./sw.js').catch(function(){});
if(screen.orientation&&screen.orientation.lock)screen.orientation.lock('portrait').catch(function(){});

// ========================================
// Ustawienia
// ========================================
function initSettings(){
    var btn=document.getElementById('settingsToggleBtn');
    var overlay=document.getElementById('settingsOverlay');
    var closeBtn=document.getElementById('settingsCloseBtn');
    var langSw=document.getElementById('langSwitcher');
    if(!btn||!overlay)return;

    document.getElementById('settingsTitle').textContent=t('settings_title');
    document.getElementById('settingsThemeLabel').textContent=t('settings_theme');
    document.getElementById('settingsLangLabel').textContent=t('settings_language');
    document.getElementById('settingsExercisesLabel').textContent=t('settings_exercises');
    document.getElementById('settingsExercisesDesc').textContent=t('settings_exercises_desc');
    document.getElementById('settingsExAddBtn').textContent=t('settings_add_exercise_btn');
    document.getElementById('settingsExNameInput').placeholder=t('settings_exercise_name_placeholder');

    function open(){overlay.classList.add('open');}
    function close(){overlay.classList.remove('open');}
    btn.addEventListener('click',open);
    closeBtn.addEventListener('click',close);
    overlay.addEventListener('click',function(e){if(e.target===overlay)close();});
    document.addEventListener('keydown',function(e){if(e.key==='Escape'&&overlay.classList.contains('open'))close();});

    var bL=document.getElementById('themeBtnLight');
    var bD=document.getElementById('themeBtnDark');
    function updTh(){var a=getActiveTheme();bL.classList.toggle('active',a==='light');bD.classList.toggle('active',a==='dark');}
    bL.addEventListener('click',function(){applyTheme('light');updTh();});
    bD.addEventListener('click',function(){applyTheme('dark');updTh();});
    updTh();

    var aLang=getActiveLanguage();
    langSw.innerHTML='';
    CONFIG.AVAILABLE_LANGUAGES.forEach(function(code){
        var lang=TRANSLATIONS[code];if(!lang)return;
        var b=document.createElement('button');b.className='lang-btn';
        if(code===aLang)b.classList.add('active');
        b.innerHTML='<span class="lang-btn-flag">'+lang.language_flag+'</span>';
        b.title=lang.language_name;
        b.addEventListener('click',function(){if(code!==aLang)setLanguage(code);});
        langSw.appendChild(b);
    });

    var catSelect=document.getElementById('settingsExCategorySelect');
    var nameInput=document.getElementById('settingsExNameInput');
    var addExBtn=document.getElementById('settingsExAddBtn');
    var exList=document.getElementById('settingsExList');

    catSelect.innerHTML='<option value="">'+t('settings_select_category')+'</option>';
    Object.keys(CONFIG.EXERCISE_DATA).forEach(function(ck){
        var opt=document.createElement('option');opt.value=ck;opt.textContent=tCategory(ck);catSelect.appendChild(opt);
    });

    function renderExList(){
        var catKey=catSelect.value;exList.innerHTML='';if(!catKey)return;
        var custom=getCustomExercises();var customForCat=custom[catKey]||[];
        var builtinKeys=CONFIG.EXERCISE_DATA[catKey]||[];
        builtinKeys.forEach(function(exKey){
            var name=tExercise(exKey);var item=document.createElement('div');item.className='settings-ex-item';
            item.innerHTML='<span class="settings-ex-item-name">'+escapeHtml(name)+'</span><span class="settings-ex-item-badge">'+t('settings_builtin_label')+'</span>';
            exList.appendChild(item);
        });
        customForCat.forEach(function(name){
            var item=document.createElement('div');item.className='settings-ex-item';
            item.innerHTML='<span class="settings-ex-item-name">'+escapeHtml(name)+'</span><span class="settings-ex-item-badge custom">'+t('settings_custom_label')+'</span><button class="settings-ex-delete-btn" data-cat="'+catKey+'" data-name="'+escapeHtml(name)+'" title="'+t('btn_delete')+'">✕</button>';
            exList.appendChild(item);
        });
        if(!builtinKeys.length&&!customForCat.length)exList.innerHTML='<p class="settings-ex-empty">'+t('settings_no_custom_exercises')+'</p>';
    }

    catSelect.addEventListener('change',renderExList);

    function handleAddEx(){
        var catKey=catSelect.value;var name=nameInput.value.trim();
        if(!catKey){catSelect.focus();return;}
        if(!name){alert(t('settings_exercise_name_empty'));nameInput.focus();return;}
        var existingBuiltin=(CONFIG.EXERCISE_DATA[catKey]||[]).map(function(ek){return tExercise(ek).toLowerCase();});
        var existingCustom=(getCustomExercises()[catKey]||[]).map(function(n){return n.toLowerCase();});
        if(existingBuiltin.indexOf(name.toLowerCase())!==-1||existingCustom.indexOf(name.toLowerCase())!==-1){
            alert(t('settings_exercise_exists'));nameInput.focus();return;
        }
        addCustomExercise(catKey,name);nameInput.value='';nameInput.focus();renderExList();
    }

    addExBtn.addEventListener('click',handleAddEx);
    nameInput.addEventListener('keydown',function(e){if(e.key==='Enter'){e.preventDefault();handleAddEx();}});
    exList.addEventListener('click',function(e){
        var delBtn=e.target.closest('.settings-ex-delete-btn');if(!delBtn)return;
        var catKey=delBtn.dataset.cat;var name=delBtn.dataset.name;
        if(confirm(t('confirm_delete_custom_exercise',{name:name}))){removeCustomExercise(catKey,name);renderExList();}
    });
}

// ========================================
// Init
// ========================================
document.addEventListener('DOMContentLoaded',function(){
    initSettings();
    if(document.getElementById('trainingsBody'))initIndexPage();
    if(document.getElementById('exercisesBody'))initTrainingPage();
});

// ========================================
// STRONA GŁÓWNA
// ========================================
function initIndexPage(){
    var body=document.getElementById('trainingsBody');
    var modal=document.getElementById('trainingModal');
    var form=document.getElementById('trainingForm');
    var mTitle=document.getElementById('trainingModalTitle');
    var nIn=document.getElementById('trainingName');
    var dIn=document.getElementById('trainingDate');
    var wIn=document.getElementById('trainingWeight');
    var empty=document.getElementById('emptyMessage');
    var fN=document.getElementById('filterName');
    var fDF=document.getElementById('filterDateFrom');
    var fDT=document.getElementById('filterDateTo');
    var fBar=document.getElementById('filtersBar');
    var tFBtn=document.getElementById('toggleFiltersBtn');
    var selAll=document.getElementById('selectAllCheckbox');
    var selBar=document.getElementById('selectionToolbar');
    var selCnt=document.getElementById('selectionCount');
    var pdfBtn=document.getElementById('downloadPdfBtn');
    var editBtn=document.getElementById('editSelectedBtn');
    var delBtn=document.getElementById('deleteSelectedBtn');
    var clrBtn=document.getElementById('clearSelectionBtn');
    var dBar=document.getElementById('dataBar');
    var tDBtn=document.getElementById('toggleDataBtn');
    var iModal=document.getElementById('importModal');
    var iDet=document.getElementById('importDetail');
    var iFile=document.getElementById('importFileInput');
    var editingId=null,pendingImport=null;
    var sortCol=CONFIG.DEFAULT_SORT_COLUMN,sortDir=CONFIG.DEFAULT_SORT_DIRECTION;
    var sel=new Set();

    document.title=t('app_title');
    document.querySelector('h1').textContent=t('app_title_emoji');
    document.getElementById('addTrainingBtn').textContent=t('btn_add_training');
    editBtn.innerHTML=t('btn_edit');pdfBtn.innerHTML=t('btn_pdf');delBtn.innerHTML=t('btn_delete');
    tFBtn.textContent=t('btn_filters');tDBtn.textContent=t('btn_data');
    document.querySelector('.data-bar-info').textContent=t('data_bar_info');
    document.getElementById('exportJsonBtn').textContent=t('btn_export_json');
    document.getElementById('importJsonBtn').textContent=t('btn_import_json');
    document.querySelector('#filtersBar label[for="filterName"]').textContent=t('filter_name');
    fN.placeholder=t('filter_name_placeholder');
    document.querySelector('#filtersBar label[for="filterDateFrom"]').textContent=t('filter_from');
    document.querySelector('#filtersBar label[for="filterDateTo"]').textContent=t('filter_to');
    document.getElementById('clearFiltersBtn').textContent=t('btn_clear_filters');
    clrBtn.textContent=t('btn_clear_selection');
    selAll.title=t('select_all_title');
    document.getElementById('cancelTrainingBtn').textContent=t('btn_cancel');
    document.querySelector('#trainingForm button[type="submit"]').textContent=t('btn_save');
    document.querySelector('#trainingForm label[for="trainingName"]').textContent=t('training_name_label');
    nIn.placeholder=t('training_name_placeholder');
    document.querySelector('#trainingForm label[for="trainingDate"]').textContent=t('training_date_label');
    document.querySelector('#trainingForm label[for="trainingWeight"]').textContent=t('training_weight_label');
    wIn.placeholder=t('training_weight_placeholder');
    document.querySelector('#importModal h2').textContent=t('import_title');
    document.querySelector('.import-warning').textContent=t('import_warning');
    document.getElementById('importCancelBtn').textContent=t('btn_cancel');
    document.getElementById('importMergeBtn').textContent=t('btn_merge');
    document.getElementById('importReplaceBtn').textContent=t('btn_replace');
    empty.textContent=t('empty_no_trainings');

    var ths=document.querySelectorAll('#trainingsTable thead th');
    ths[1].innerHTML=t('th_name')+' <span class="sort-icon" id="sortIconName"></span>';
    ths[2].innerHTML=t('th_date')+' <span class="sort-icon" id="sortIconDate"></span>';
    ths[3].innerHTML=t('th_weight')+' <span class="sort-icon" id="sortIconWeight"></span>';
    ths[4].innerHTML=t('th_exercises')+' <span class="sort-icon" id="sortIconExercises"></span>';
    ths[5].innerHTML=t('th_rating')+' <span class="sort-icon" id="sortIconRating"></span>';
    document.querySelectorAll('.date-helper-btn').forEach(function(b){b.textContent=tDateHelper(parseInt(b.dataset.offset));});

    tFBtn.addEventListener('click',function(){fBar.classList.toggle('collapsed');tFBtn.classList.toggle('active');});
    tDBtn.addEventListener('click',function(){dBar.classList.toggle('collapsed');tDBtn.classList.toggle('active');});

    document.querySelectorAll('.date-helper-btn').forEach(function(b){
        b.addEventListener('click',function(){
            var d=new Date();d.setDate(d.getDate()+parseInt(b.dataset.offset));
            dIn.value=d.toISOString().split('T')[0];
            document.querySelectorAll('.date-helper-btn').forEach(function(x){x.classList.remove('active');});
            b.classList.add('active');
        });
    });
    dIn.addEventListener('change',udh);
    function udh(){var v=dIn.value;document.querySelectorAll('.date-helper-btn').forEach(function(b){var d=new Date();d.setDate(d.getDate()+parseInt(b.dataset.offset));b.classList.toggle('active',v===d.toISOString().split('T')[0]);});}

    document.getElementById('exportJsonBtn').addEventListener('click',function(){
        var b=new Blob([exportData()],{type:'application/json'});var u=URL.createObjectURL(b);
        var a=document.createElement('a');a.href=u;a.download=t('export_filename_prefix')+'_'+new Date().toISOString().split('T')[0]+'.json';
        document.body.appendChild(a);a.click();document.body.removeChild(a);URL.revokeObjectURL(u);
    });
    document.getElementById('importJsonBtn').addEventListener('click',function(){iFile.click();});
    iFile.addEventListener('change',function(e){
        var f=e.target.files[0];if(!f)return;var r=new FileReader();
        r.onload=function(ev){try{var p=JSON.parse(ev.target.result);if(!p.version||!Array.isArray(p.trainings)){alert(t('import_invalid_format'));return;}pendingImport=p.trainings;iDet.textContent=t('import_detail',{fileCount:p.trainings.length,currentCount:getTrainings().length});iModal.classList.add('active');}catch(x){alert(t('import_read_error'));}};
        r.readAsText(f);iFile.value='';
    });
    document.getElementById('importCancelBtn').addEventListener('click',function(){iModal.classList.remove('active');pendingImport=null;});
    document.getElementById('importMergeBtn').addEventListener('click',function(){if(!pendingImport)return;importData(pendingImport,'merge');iModal.classList.remove('active');pendingImport=null;sel.clear();render();});
    document.getElementById('importReplaceBtn').addEventListener('click',function(){if(!pendingImport)return;importData(pendingImport,'replace');iModal.classList.remove('active');pendingImport=null;sel.clear();render();});
    iModal.addEventListener('click',function(e){if(e.target===iModal){iModal.classList.remove('active');pendingImport=null;}});

    function filtered(){
        var ts=getTrainings();var q=fN.value.trim().toLowerCase();
        if(q)ts=ts.filter(function(x){return x.name.toLowerCase().includes(q);});
        if(fDF.value)ts=ts.filter(function(x){return x.date>=fDF.value;});
        if(fDT.value)ts=ts.filter(function(x){return x.date<=fDT.value;});
        ts.sort(function(a,b){
            var va,vb;
            if(sortCol==='name'){va=a.name.toLowerCase();vb=b.name.toLowerCase();}
            else if(sortCol==='date'){va=a.date;vb=b.date;}
            else if(sortCol==='weight'){va=a.bodyWeight||0;vb=b.bodyWeight||0;}
            else if(sortCol==='exercises'){va=a.exercises.length;vb=b.exercises.length;}
            else{va=getAverageRating(a);vb=getAverageRating(b);}
            return va<vb?(sortDir==='asc'?-1:1):va>vb?(sortDir==='asc'?1:-1):0;
        });return ts;
    }
    function updSort(){
        ['sortIconName','sortIconDate','sortIconWeight','sortIconExercises','sortIconRating'].forEach(function(id){document.getElementById(id).textContent='';});
        var map={name:'sortIconName',date:'sortIconDate',weight:'sortIconWeight',exercises:'sortIconExercises',rating:'sortIconRating'};
        if(map[sortCol])document.getElementById(map[sortCol]).textContent=sortDir==='asc'?'▲':'▼';
    }
    function fmtD(ds){var d=new Date(ds+'T00:00:00');return window.innerWidth<=480?d.toLocaleDateString(dateLocale(),{month:'short',day:'numeric'}):d.toLocaleDateString(dateLocale(),{year:'numeric',month:'short',day:'numeric'});}

    function updSel(){
        var c=sel.size,has=getTrainings().length>0;
        pdfBtn.style.display=has?'':'none';pdfBtn.disabled=!c;
        editBtn.style.display=has?'':'none';editBtn.disabled=c!==1;
        delBtn.style.display=has?'':'none';delBtn.disabled=!c;
        if(c){selBar.classList.add('visible');selCnt.textContent=t('selection_count',{count:c});}else selBar.classList.remove('visible');
        var vis=filtered();var allS=vis.length&&vis.every(function(x){return sel.has(x.id);});var someS=vis.some(function(x){return sel.has(x.id);});
        selAll.checked=allS;selAll.indeterminate=someS&&!allS;
        body.querySelectorAll('tr').forEach(function(r){r.classList.toggle('selected',r.dataset.id&&sel.has(r.dataset.id));});
    }

    function render(){
        var ts=filtered(),all=getTrainings();body.innerHTML='';tFBtn.style.display=all.length?'':'none';
        if(!ts.length){empty.style.display='block';empty.textContent=all.length?t('empty_no_filter_match'):t('empty_no_trainings');document.getElementById('trainingsTable').style.display='none';updSel();return;}
        empty.style.display='none';document.getElementById('trainingsTable').style.display='table';updSort();
        ts.forEach(function(tr){
            var row=document.createElement('tr');row.dataset.id=tr.id;
            var wt=tr.bodyWeight?tr.bodyWeight+' '+t('weight_unit'):'-';
            row.innerHTML='<td class="td-checkbox"><input type="checkbox" class="row-checkbox" data-id="'+tr.id+'" '+(sel.has(tr.id)?'checked':'')+'></td><td class="clickable" data-id="'+tr.id+'">'+escapeHtml(tr.name)+'</td><td class="clickable" data-id="'+tr.id+'">'+fmtD(tr.date)+'</td><td class="clickable td-weight" data-id="'+tr.id+'">'+wt+'</td><td class="clickable" data-id="'+tr.id+'">'+tr.exercises.length+'</td><td class="clickable td-rating" data-id="'+tr.id+'">'+renderStarsReadonly(getAverageRating(tr))+'</td>';
            body.appendChild(row);
        });updSel();
    }

    function openM(tr){
        if(tr){mTitle.textContent=t('modal_edit_training');nIn.value=tr.name;dIn.value=tr.date;wIn.value=tr.bodyWeight||'';editingId=tr.id;}
        else{mTitle.textContent=t('modal_add_training');nIn.value='';dIn.value=new Date().toISOString().split('T')[0];wIn.value='';editingId=null;}
        udh();modal.classList.add('active');nIn.focus();
    }
    function closeM(){modal.classList.remove('active');editingId=null;}

    function exportPDF(ids){
        var trainings=ids.map(function(id){return getTrainings().find(function(x){return x.id===id;});}).filter(Boolean);
        if(!trainings.length)return;trainings.sort(function(a,b){return new Date(a.date)-new Date(b.date);});
        var jsPDF=window.jspdf.jsPDF;var doc=new jsPDF(CONFIG.PDF_ORIENTATION);var pw=doc.internal.pageSize.getWidth();
        trainings.forEach(function(tr,ti){
            if(ti)doc.addPage();var y=18;
            doc.setFontSize(22);doc.setFont('helvetica','bold');doc.setTextColor(30);doc.text(tr.name,pw/2,y,{align:'center'});y+=8;
            doc.setFontSize(12);doc.setFont('helvetica','normal');doc.setTextColor(100);
            doc.text(new Date(tr.date+'T00:00:00').toLocaleDateString(dateLocale(),{weekday:'long',year:'numeric',month:'long',day:'numeric'}),pw/2,y,{align:'center'});y+=6;
            doc.setDrawColor(200);doc.setLineWidth(0.5);doc.line(14,y,pw-14,y);y+=8;
            doc.setTextColor(60);doc.setFontSize(11);
            doc.text(t('pdf_total_exercises')+': '+tr.exercises.length,14,y);
            var gt=0;tr.exercises.forEach(function(e){gt+=getTotalReps(e);});
            doc.text(t('pdf_total_reps')+': '+gt,100,y);
            if(tr.bodyWeight)doc.text(t('pdf_body_weight')+': '+tr.bodyWeight+' '+t('weight_unit'),190,y);
            y+=8;
            if(!tr.exercises.length){doc.setFontSize(12);doc.setTextColor(150);doc.text(t('pdf_no_exercises'),pw/2,y+10,{align:'center'});}
            else{
                var grp={};tr.exercises.forEach(function(e){var tp=e.type||t('pdf_uncategorized');if(!grp[tp])grp[tp]=[];grp[tp].push(e);});
                Object.keys(grp).forEach(function(tp){
                    doc.setFontSize(13);doc.setFont('helvetica','bold');doc.setTextColor(40);doc.text(tp,14,y);y+=2;
                    var rows=grp[tp].map(function(e){var s=e.series||[];var tot=getTotalReps(e);return[e.name||'-',e.load||'-',s[0]!=null?String(s[0]):'-',s[1]!=null?String(s[1]):'-',s[2]!=null?String(s[2]):'-',s[3]!=null?String(s[3]):'-',s[4]!=null?String(s[4]):'-',s[5]!=null?String(s[5]):'-',tot>0?String(tot):'-'];});
                    doc.autoTable({startY:y,head:[[t('pdf_header_exercise'),t('pdf_header_load'),'S1','S2','S3','S4','S5','S6',t('pdf_header_total')]],body:rows,theme:'grid',margin:{left:14,right:14},
                        headStyles:{fillColor:CONFIG.PDF_HEADER_COLOR,textColor:255,fontStyle:'bold',fontSize:10,halign:'center'},
                        columnStyles:{0:{cellWidth:'auto',halign:'left'},1:{cellWidth:28,halign:'center'},2:{cellWidth:14,halign:'center'},3:{cellWidth:14,halign:'center'},4:{cellWidth:14,halign:'center'},5:{cellWidth:14,halign:'center'},6:{cellWidth:14,halign:'center'},7:{cellWidth:14,halign:'center'},8:{cellWidth:18,halign:'center',fontStyle:'bold'}},
                        bodyStyles:{fontSize:10,textColor:50},alternateRowStyles:{fillColor:CONFIG.PDF_ALT_ROW_COLOR}});
                    y=doc.lastAutoTable.finalY+10;
                });
            }
        });
        var tp2=doc.internal.getNumberOfPages();
        for(var p=1;p<=tp2;p++){doc.setPage(p);doc.setFontSize(8);doc.setTextColor(180);doc.text(t('pdf_footer',{date:new Date().toLocaleDateString(dateLocale()),page:p,total:tp2}),pw/2,doc.internal.pageSize.getHeight()-10,{align:'center'});}
        var fn;if(trainings.length===1)fn=trainings[0].name.replace(/[^a-z0-9ąćęłńóśźż]/gi,'_').toLowerCase()+'_'+trainings[0].date+'.pdf';
        else fn=t('pdf_filename_prefix')+'_'+trainings.length+'_'+t('pdf_filename_suffix')+'.pdf';
        doc.save(fn);
    }

    document.getElementById('addTrainingBtn').addEventListener('click',function(){openM(null);});
    document.getElementById('cancelTrainingBtn').addEventListener('click',closeM);
    modal.addEventListener('click',function(e){if(e.target===modal)closeM();});
    form.addEventListener('submit',function(e){
        e.preventDefault();var name=nIn.value.trim(),date=dIn.value,weight=wIn.value?parseFloat(wIn.value):null;
        if(!name||!date)return;
        if(editingId){updateTraining(editingId,{name:name,date:date,bodyWeight:weight});closeM();render();}
        else{var tr=addTraining(name,date,weight);closeM();window.location.href='training.html?id='+tr.id;}
    });
    body.addEventListener('click',function(e){var el=e.target.classList.contains('clickable')?e.target:e.target.closest('.clickable');if(el&&el.dataset.id)window.location.href='training.html?id='+el.dataset.id;});
    body.addEventListener('change',function(e){if(!e.target.classList.contains('row-checkbox'))return;if(e.target.checked)sel.add(e.target.dataset.id);else sel.delete(e.target.dataset.id);updSel();});
    selAll.addEventListener('change',function(){var v=filtered();if(selAll.checked)v.forEach(function(x){sel.add(x.id);});else v.forEach(function(x){sel.delete(x.id);});render();});
    editBtn.addEventListener('click',function(){if(sel.size!==1)return;var tr=getTrainings().find(function(x){return x.id===Array.from(sel)[0];});if(tr)openM(tr);});
    pdfBtn.addEventListener('click',function(){if(sel.size)exportPDF(Array.from(sel));});
    delBtn.addEventListener('click',function(){if(!sel.size)return;var c=sel.size;if(!confirm(c===1?t('confirm_delete_single'):t('confirm_delete_multiple',{count:c})))return;Array.from(sel).forEach(function(id){deleteTraining(id);});sel.clear();render();});
    clrBtn.addEventListener('click',function(){sel.clear();render();});
    document.querySelectorAll('#trainingsTable th.sortable').forEach(function(th){th.addEventListener('click',function(){var col=th.dataset.sort;if(sortCol===col)sortDir=sortDir==='asc'?'desc':'asc';else{sortCol=col;sortDir='asc';}render();});});
    fN.addEventListener('input',render);fDF.addEventListener('change',render);fDT.addEventListener('change',render);
    document.getElementById('clearFiltersBtn').addEventListener('click',function(){fN.value='';fDF.value='';fDT.value='';render();});
    document.addEventListener('keydown',function(e){if(e.key==='Escape'){closeM();iModal.classList.remove('active');pendingImport=null;}});
    window.addEventListener('resize',render);
    render();
}

// ========================================
// STRONA TRENINGU
// ========================================
function initTrainingPage(){
    var EXDATA=getLocalizedExerciseData();
    var params=new URLSearchParams(window.location.search);
    var trainingId=params.get('id');
    if(!trainingId){window.location.href='index.html';return;}

    var exBody=document.getElementById('exercisesBody');
    var empty=document.getElementById('emptyMessage');
    var fType=document.getElementById('filterType');
    var fEx=document.getElementById('filterExercise');
    var exFBar=document.getElementById('exerciseFiltersBar');
    var tExFBtn=document.getElementById('toggleExFiltersBtn');
    var avgEl=document.getElementById('trainingAvgRating');
    var weightEl=document.getElementById('trainingBodyWeight');
    var exSortCol=null,exSortDir='asc';

    document.querySelector('.back-link').textContent=t('back_to_trainings');
    document.getElementById('addExerciseBtn').textContent=t('btn_add_exercise');
    tExFBtn.textContent=t('btn_filters');
    document.querySelector('#exerciseFiltersBar label[for="filterType"]').textContent=t('filter_type');
    fType.querySelector('option').textContent=t('filter_all_types');
    document.querySelector('#exerciseFiltersBar label[for="filterExercise"]').textContent=t('filter_exercise');
    fEx.placeholder=t('filter_exercise_placeholder');
    document.getElementById('clearExerciseFiltersBtn').textContent=t('btn_clear_filters');
    empty.textContent=t('empty_no_exercises');

    var ths=document.querySelectorAll('#exercisesTable thead th');
    ths[0].textContent=t('th_order');
    ths[1].innerHTML=t('th_type')+' <span class="sort-icon" id="sortIconType"></span>';
    ths[2].innerHTML=t('th_exercise')+' <span class="sort-icon" id="sortIconExName"></span>';
    ths[3].innerHTML=t('th_load')+' <span class="sort-icon" id="sortIconExLoad"></span>';
    ths[10].innerHTML=t('th_total')+' <span class="sort-icon" id="sortIconExTotal"></span>';
    ths[11].innerHTML=t('th_rating')+' <span class="sort-icon" id="sortIconExRating"></span>';

    tExFBtn.addEventListener('click',function(){exFBar.classList.toggle('collapsed');tExFBtn.classList.toggle('active');});

    function getTr(){return getTrainings().find(function(x){return x.id===trainingId;});}

    function renderHeader(){
        var tr=getTr();if(!tr){window.location.href='index.html';return;}
        document.getElementById('trainingTitle').textContent='🏋️ '+tr.name;
        document.getElementById('trainingDate').textContent=new Date(tr.date+'T00:00:00').toLocaleDateString(dateLocale(),{weekday:'long',year:'numeric',month:'long',day:'numeric'});
        document.title=tr.name+' - '+t('app_title');
        updAvg();updWeight();
    }
    function updAvg(){
        var tr=getTr();if(!tr)return;var avg=getAverageRating(tr);
        if(!tr.exercises.length||avg===0)avgEl.innerHTML='<span class="avg-label">'+t('avg_rating_label')+'</span> <span class="avg-no-data">'+t('avg_no_data')+'</span>';
        else avgEl.innerHTML='<span class="avg-label">'+t('avg_rating_label')+'</span> '+renderStarsReadonly(avg)+' <span class="avg-value">('+avg.toFixed(1)+'/'+CONFIG.MAX_STARS+')</span>';
    }
    function updWeight(){
        var tr=getTr();if(!tr)return;
        if(tr.bodyWeight)weightEl.innerHTML='<span class="weight-label">'+t('body_weight_label')+'</span> <span class="weight-value">'+tr.bodyWeight+' '+t('weight_unit')+'</span>';
        else weightEl.innerHTML='';
    }
    function popTypeFilter(){var cur=fType.value;fType.innerHTML='<option value="">'+t('filter_all_types')+'</option>';Object.keys(EXDATA).forEach(function(type){var o=document.createElement('option');o.value=type;o.textContent=type;fType.appendChild(o);});fType.value=cur;}
    function buildTypeOpts(s){var h='<option value="">'+t('select_type_placeholder')+'</option>';Object.keys(EXDATA).forEach(function(type){h+='<option value="'+type+'" '+(type===s?'selected':'')+'>'+type+'</option>';});return h;}
    function buildExOpts(type,s){var h='<option value="">'+t('select_exercise_placeholder')+'</option>';if(type&&EXDATA[type])EXDATA[type].forEach(function(n){h+='<option value="'+n+'" '+(n===s?'selected':'')+'>'+n+'</option>';});return h;}

    function getFilteredEx(tr){
        var exs=tr.exercises.map(function(e,i){return Object.assign({},e,{_idx:i});});
        if(fType.value)exs=exs.filter(function(e){return e.type===fType.value;});
        var q=fEx.value.trim().toLowerCase();
        if(q)exs=exs.filter(function(e){return(e.name||'').toLowerCase().includes(q);});
        if(exSortCol){exs.sort(function(a,b){
            var va,vb;
            if(exSortCol==='type'){va=(a.type||'').toLowerCase();vb=(b.type||'').toLowerCase();}
            else if(exSortCol==='name'){va=(a.name||'').toLowerCase();vb=(b.name||'').toLowerCase();}
            else if(exSortCol==='rating'){va=a.rating||0;vb=b.rating||0;}
            else if(exSortCol==='total'){va=getTotalReps(a);vb=getTotalReps(b);}
            else if(exSortCol==='load'){va=(a.load||'').toLowerCase();vb=(b.load||'').toLowerCase();}
            return va<vb?(exSortDir==='asc'?-1:1):va>vb?(exSortDir==='asc'?1:-1):0;
        });}return exs;
    }
    function updExSort(){
        ['sortIconType','sortIconExName','sortIconExRating','sortIconExTotal','sortIconExLoad'].forEach(function(id){document.getElementById(id).textContent='';});
        if(!exSortCol)return;var map={type:'sortIconType',name:'sortIconExName',rating:'sortIconExRating',total:'sortIconExTotal',load:'sortIconExLoad'};
        if(map[exSortCol])document.getElementById(map[exSortCol]).textContent=exSortDir==='asc'?'▲':'▼';
    }
    function buildStars(r,idx){var h='<div class="star-rating-interactive" data-index="'+idx+'">';for(var i=1;i<=CONFIG.MAX_STARS;i++)h+='<span class="star-btn '+(i<=r?'star-active':'')+'" data-star="'+i+'" data-index="'+idx+'">★</span>';return h+'</div>';}

    function renderEx(){
        var tr=getTr();if(!tr)return;exBody.innerHTML='';
        tExFBtn.style.display=tr.exercises.length?'':'none';
        var exs=getFilteredEx(tr);var totalCount=tr.exercises.length;
        var isFiltered=exSortCol||fType.value||fEx.value.trim();
        if(!exs.length){empty.style.display='block';empty.textContent=!tr.exercises.length?t('empty_no_exercises'):t('empty_no_exercise_filter_match');document.getElementById('exercisesTable').style.display='none';return;}
        empty.style.display='none';document.getElementById('exercisesTable').style.display='table';updExSort();
        exs.forEach(function(ex){
            var i=ex._idx;var row=document.createElement('tr');row.dataset.index=i;
            var s=ex.series||[];var total=getTotalReps(ex);var repsClass=getRepsClass(total,ex.type);
            var seriesH='';for(var si=0;si<CONFIG.MAX_SERIES;si++)seriesH+='<td class="td-series"><input type="number" class="inline-input inline-series" data-index="'+i+'" data-series="'+si+'" min="0" placeholder="-" value="'+(s[si]!=null?s[si]:'')+'"></td>';
            var moveH='<td class="td-order">';
            if(!isFiltered){moveH+='<button class="move-btn move-up" data-index="'+i+'" title="'+t('move_up_title')+'" '+(i===0?'disabled':'')+'>▲</button>';moveH+='<button class="move-btn move-down" data-index="'+i+'" title="'+t('move_down_title')+'" '+(i===totalCount-1?'disabled':'')+'>▼</button>';}
            moveH+='</td>';
            row.innerHTML=moveH+'<td class="td-type '+repsClass+'"><select class="inline-select inline-type" data-index="'+i+'">'+buildTypeOpts(ex.type)+'</select></td><td class="td-name '+repsClass+'"><select class="inline-select inline-name" data-index="'+i+'">'+buildExOpts(ex.type,ex.name)+'</select></td><td class="td-load"><input type="text" class="inline-input inline-load" data-index="'+i+'" placeholder="'+t('load_placeholder')+'" value="'+escapeHtml(ex.load||'')+'"></td>'+seriesH+'<td class="td-total" data-index="'+i+'">'+(total>0?total:'-')+'</td><td class="td-rating-interactive">'+buildStars(ex.rating||0,i)+'</td><td class="td-action"><button class="btn btn-small btn-delete btn-delete-row" data-index="'+i+'" title="'+t('btn_delete_exercise_title')+'">✕</button></td>';
            exBody.appendChild(row);
        });updAvg();
    }

    function updTotal(idx){
        var tr=getTr();if(!tr||!tr.exercises[idx])return;
        var total=getTotalReps(tr.exercises[idx]);
        var cell=exBody.querySelector('.td-total[data-index="'+idx+'"]');
        if(cell)cell.textContent=total>0?total:'-';
        var repsClass=getRepsClass(total,tr.exercises[idx].type);
        var row=exBody.querySelector('tr[data-index="'+idx+'"]');
        if(row){
            var tc=row.querySelector('.td-type');var nc=row.querySelector('.td-name');
            if(tc){tc.classList.remove('reps-red','reps-orange','reps-green','reps-purple');if(repsClass)tc.classList.add(repsClass);}
            if(nc){nc.classList.remove('reps-red','reps-orange','reps-green','reps-purple');if(repsClass)nc.classList.add(repsClass);}
        }
    }

    function saveField(idx,field,val){
        var ts=getTrainings();var tr=ts.find(function(x){return x.id===trainingId;});
        if(!tr||!tr.exercises[idx])return;
        if(field==='type'){tr.exercises[idx].type=val;tr.exercises[idx].name='';saveTrainings(ts);renderEx();}
        else if(field==='name'){tr.exercises[idx].name=val;saveTrainings(ts);}
        else if(field==='load'){tr.exercises[idx].load=val;saveTrainings(ts);}
        else if(field==='series'){tr.exercises[idx].series=normalizeSeries(tr.exercises[idx].series);tr.exercises[idx].series[val.si]=val.reps!==''?parseInt(val.reps):null;saveTrainings(ts);updTotal(idx);}
        else if(field==='rating'){tr.exercises[idx].rating=val;saveTrainings(ts);updAvg();}
    }

    exBody.addEventListener('change',function(e){var tgt=e.target;var idx=parseInt(tgt.dataset.index);if(isNaN(idx))return;if(tgt.classList.contains('inline-type'))saveField(idx,'type',tgt.value);else if(tgt.classList.contains('inline-name'))saveField(idx,'name',tgt.value);else if(tgt.classList.contains('inline-load'))saveField(idx,'load',tgt.value);else if(tgt.classList.contains('inline-series'))saveField(idx,'series',{si:parseInt(tgt.dataset.series),reps:tgt.value});});
    exBody.addEventListener('input',function(e){var tgt=e.target;var idx=parseInt(tgt.dataset.index);if(isNaN(idx))return;if(tgt.classList.contains('inline-series'))saveField(idx,'series',{si:parseInt(tgt.dataset.series),reps:tgt.value});else if(tgt.classList.contains('inline-load'))saveField(idx,'load',tgt.value);});

    exBody.addEventListener('click',function(e){
        var tgt=e.target;
        if(tgt.classList.contains('star-btn')){var idx=parseInt(tgt.dataset.index);var star=parseInt(tgt.dataset.star);if(isNaN(idx)||isNaN(star))return;var tr=getTr();var cur=(tr&&tr.exercises[idx])?(tr.exercises[idx].rating||0):0;var nR=cur===star?0:star;saveField(idx,'rating',nR);var c=tgt.closest('.star-rating-interactive');if(c)c.querySelectorAll('.star-btn').forEach(function(b){b.classList.toggle('star-active',parseInt(b.dataset.star)<=nR);});return;}
        if(tgt.classList.contains('btn-delete-row')){var idx2=parseInt(tgt.dataset.index);if(!isNaN(idx2)&&confirm(t('confirm_delete_exercise'))){deleteExercise(trainingId,idx2);renderEx();}return;}
        if(tgt.classList.contains('move-up')){var idx3=parseInt(tgt.dataset.index);if(!isNaN(idx3)&&idx3>0){moveExercise(trainingId,idx3,idx3-1);renderEx();}return;}
        if(tgt.classList.contains('move-down')){var idx4=parseInt(tgt.dataset.index);var tr2=getTr();if(!isNaN(idx4)&&tr2&&idx4<tr2.exercises.length-1){moveExercise(trainingId,idx4,idx4+1);renderEx();}return;}
    });

    exBody.addEventListener('mouseover',function(e){if(!e.target.classList.contains('star-btn'))return;var c=e.target.closest('.star-rating-interactive');var h=parseInt(e.target.dataset.star);if(c&&!isNaN(h))c.querySelectorAll('.star-btn').forEach(function(b){b.classList.toggle('star-hover',parseInt(b.dataset.star)<=h);});});
    exBody.addEventListener('mouseout',function(e){if(!e.target.classList.contains('star-btn'))return;var c=e.target.closest('.star-rating-interactive');if(c)c.querySelectorAll('.star-btn').forEach(function(b){b.classList.remove('star-hover');});});

    document.querySelectorAll('#exercisesTable th.sortable').forEach(function(th){th.addEventListener('click',function(){var col=th.dataset.sort;if(exSortCol===col)exSortDir=exSortDir==='asc'?'desc':'asc';else{exSortCol=col;exSortDir='asc';}renderEx();});});
    fType.addEventListener('change',renderEx);
    fEx.addEventListener('input',renderEx);
    document.getElementById('clearExerciseFiltersBtn').addEventListener('click',function(){fType.value='';fEx.value='';exSortCol=null;renderEx();});

    document.getElementById('addExerciseBtn').addEventListener('click',function(){
        fType.value='';fEx.value='';exSortCol=null;
        var emptySeries=[];for(var i=0;i<CONFIG.MAX_SERIES;i++)emptySeries.push(null);
        addExercise(trainingId,{type:'',name:'',load:'',series:emptySeries,rating:0});
        renderEx();
        var rows=exBody.querySelectorAll('tr');
        if(rows.length){var sel2=rows[rows.length-1].querySelector('.inline-type');if(sel2)sel2.focus();}
        window.scrollTo({top:document.body.scrollHeight,behavior:'smooth'});
    });

    popTypeFilter();renderHeader();renderEx();
}