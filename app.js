const DAYS={
 tirsdag:{label:'Tirsdag',card:'assets/tirsdag.jpg',walk:'20–25 min rolig til moderat gange',ex:[
  ['legpress','Beinpress i maskin','3 × 10–12','assets/tirsdag-1.jpg','Hold korsryggen mot ryggstøtten. Ikke gå så dypt at bekkenet ruller opp.'],
  ['incline','Skråbenk med manualer','3 × 8–12','assets/tirsdag-2.jpg','Skuldrene ned og bak. Senk kontrollert.'],
  ['pulldown','Nedtrekk','3 × 8–12','assets/tirsdag-3.jpg','Trekk albuene ned. Unngå å lene deg langt bakover.'],
  ['shoulder','Skulderpress med manualer','2–3 × 8–12','assets/tirsdag-4.jpg','Stram magen og unngå å svaie i korsryggen.'],
  ['birddog','Bird dog','2 × 8 per side','assets/tirsdag-5.jpg','Hold bekkenet stabilt. Beveg rolig og kontrollert.']
 ]},
 torsdag:{label:'Torsdag',card:'assets/torsdag.jpg',walk:'20–25 min rolig til moderat gange',ex:[
  ['chestrow','Bryststøttet roing','3 × 8–12','assets/torsdag-1.jpg','La brystet ligge stødig mot benken. Trekk albuene bakover.'],
  ['shoulder','Skulderpress med manualer','3 × 8–12','assets/torsdag-2.jpg','Stram magen og unngå å svaie i korsryggen.'],
  ['pulldown','Nedtrekk','3 × 8–12','assets/torsdag-3.jpg','Trekk albuene ned og hold bevegelsen kontrollert.'],
  ['lunges','Gående utfall med manualer','2–3 × 8–10 per bein','assets/torsdag-4.jpg','Ta kontrollerte steg. Bruk lettere manualer til teknikken sitter.'],
  ['pallof','Pallof press','2 × 10 per side','assets/torsdag-5.jpg','Stå stødig og motstå rotasjon når armene presses frem.']
 ]},
 sondag:{label:'Søndag',card:'assets/sondag.jpg',walk:'25–30 min rolig til moderat gange',ex:[
  ['legpress','Beinpress i maskin','2–3 × 10','assets/sondag-1.jpg','Hold korsryggen mot ryggstøtten.'],
  ['incline','Skråbenk med manualer','2–3 × 10','assets/sondag-2.jpg','Rolig senkefase og stabil skulderposisjon.'],
  ['machinerow','Bryststøttet roing i maskin','2–3 × 10','assets/sondag-3.jpg','Brystet mot puten. Trekk håndtakene kontrollert bakover.'],
  ['pulldown','Nedtrekk','2–3 × 8–10','assets/sondag-4.jpg','Trekk stangen mot øvre bryst.'],
  ['pallof','Pallof press','2 × 10 per side','assets/sondag-5.jpg','Hold overkroppen rett frem mens kabelen trekker fra siden.']
 ]}
};
const DBKEY='runeTrainingV1';
const db=()=>JSON.parse(localStorage.getItem(DBKEY)||'{"sessions":[]}');
const saveDb=d=>localStorage.setItem(DBKEY,JSON.stringify(d));
const iso=d=>d.toISOString().slice(0,10);
const todayKey=()=>{const n=new Date().getDay();return n===2?'tirsdag':n===4?'torsdag':n===0?'sondag':(n<2?'tirsdag':n<4?'torsdag':n<7?'sondag':'tirsdag')};
const fmtDate=s=>new Date(s+'T12:00:00').toLocaleDateString('nb-NO',{day:'2-digit',month:'short',year:'numeric'});
let activeDay=todayKey(), working=null;

function nav(view){document.querySelectorAll('.view').forEach(v=>v.classList.toggle('active',v.id===view));document.querySelectorAll('.bottomnav button').forEach(b=>b.classList.toggle('active',b.dataset.view===view));if(view==='today')renderToday();if(view==='program')renderProgram();if(view==='progress')renderProgress();if(view==='exercises')renderExercises();}
document.querySelectorAll('.bottomnav button').forEach(b=>b.onclick=()=>nav(b.dataset.view));

function latestSession(day){return db().sessions.filter(s=>s.day===day).sort((a,b)=>(b.date||'').localeCompare(a.date||''))[0];}
function sessionsForExercise(id){return db().sessions.filter(s=>s.sets?.[id]).sort((a,b)=>(b.date||'').localeCompare(a.date||''));}
function repRange(text){const m=text.match(/×\s*(\d+)(?:\s*[–-]\s*(\d+))?/);return m?{min:Number(m[1]),max:Number(m[2]||m[1])}:{min:0,max:0};}
function exerciseStats(id,targetText){
 const sessions=sessionsForExercise(id),last=sessions[0];
 const allSets=sessions.flatMap(s=>s.sets[id]||[]);
 const weights=allSets.map(z=>Number(z.kg)||0).filter(Boolean);
 const pr=weights.length?Math.max(...weights):0;
 if(!last)return {last:null,pr,suggestion:null};
 const lastSets=(last.sets[id]||[]).filter(s=>Number(s.kg)>0||Number(s.reps)>0);
 if(!lastSets.length)return {last,pr,suggestion:null};
 const range=repRange(targetText);
 const completed=lastSets.filter(s=>s.done!==false);
 const allAtTop=completed.length===lastSets.length&&completed.length>0&&completed.every(s=>(Number(s.reps)||0)>=range.max);
 const base=Math.max(...lastSets.map(s=>Number(s.kg)||0));
 let suggestion=base||null;
 if(id!=='birddog'&&base>0&&allAtTop)suggestion=Math.round((base+2.5)*2)/2;
 return {last,pr,suggestion,allAtTop};
}
function formatLast(id){
 const x=findExercise(id),st=exerciseStats(id,x?.[2]||'');
 if(!st.last)return 'Ingen tidligere registrering';
 const sets=(st.last.sets[id]||[]).filter(s=>Number(s.kg)>0||Number(s.reps)>0);
 if(!sets.length)return fmtDate(st.last.date)+' · ingen vekt/reps';
 return fmtDate(st.last.date)+' · '+sets.map(s=>(s.kg||'–')+' kg × '+(s.reps||'–')).join(' · ');
}
function backLabel(v){return ({1:'Bra',2:'Litt stiv',3:'Merkbar',4:'Ganske stiv',5:'Vond / låst'})[v]||'Ikke valgt';}
function backScale(name,value){return '<div class="backscale">'+[1,2,3,4,5].map(n=>'<button type="button" data-back="'+name+'|'+n+'" class="'+(Number(value)===n?'active':'')+'"><b>'+n+'</b><span>'+backLabel(n)+'</span></button>').join('')+'</div>';}
function renderToday(){
 const d=DAYS[activeDay], last=latestSession(activeDay); const el=document.getElementById('today');
 el.innerHTML=`<div class="hero"><div class="row space"><div><span class="pill">Neste planlagte økt</span><h2 style="margin-top:10px">${d.label}</h2><div class="sub">Tredemølle: ${d.walk}</div></div><button class="btn" id="start">Start økt</button></div></div>
 <div class="card"><div class="row space"><h3>Dagens program</h3><button class="btn secondary small" id="changeDay">Bytt dag</button></div>${d.ex.map((x,i)=>`<div class="exercise"><img class="thumb" src="${x[3]}" alt="${x[1]}"><div><h4>${i+1}. ${x[1]}</h4><div class="meta">${x[2]}</div></div><button class="check" data-open="${x[0]}">›</button></div>`).join('')}</div>
 ${last?`<div class="card"><h3>Sist gjennomført ${d.label.toLowerCase()}</h3><div class="sub">${fmtDate(last.date)} · ${last.walkMinutes||0} min tredemølle</div></div>`:''}`;
 document.getElementById('start').onclick=()=>startSession(activeDay);
 document.getElementById('changeDay').onclick=()=>{const keys=['tirsdag','torsdag','sondag'];activeDay=keys[(keys.indexOf(activeDay)+1)%3];renderToday()};
 el.querySelectorAll('[data-open]').forEach(b=>b.onclick=()=>openExercise(findExercise(b.dataset.open)));
}
function renderProgram(){const el=document.getElementById('program');el.innerHTML=`<div class="daytabs">${Object.entries(DAYS).map(([k,d])=>`<button data-day="${k}" class="${k===activeDay?'active':''}">${d.label}</button>`).join('')}</div><div class="card"><img class="program-img" src="${DAYS[activeDay].card}" alt="${DAYS[activeDay].label} treningsprogram"></div>`;el.querySelectorAll('[data-day]').forEach(b=>b.onclick=()=>{activeDay=b.dataset.day;renderProgram()});}
function startSession(day){
 const prev=latestSession(day);
 working={day,date:iso(new Date()),walkMinutes:'',notes:'',backBefore:'',backAfter:'',sets:{}};
 DAYS[day].ex.forEach(x=>{const p=prev?.sets?.[x[0]]||[];working.sets[x[0]]=[0,1,2].map((_,i)=>({kg:p[i]?.kg||'',reps:p[i]?.reps||'',done:false}));});
 renderWorkout(day);
}
function renderWorkout(day){
 const d=DAYS[day],el=document.getElementById('today');
 el.innerHTML='<div class="card"><div class="row space"><div><span class="pill">Pågående økt</span><h2 style="margin-top:8px">'+d.label+'</h2></div><button class="btn secondary small" id="cancel">Avslutt uten å lagre</button></div>'+
 '<div class="backbox"><h3>Hvordan kjennes korsryggen før økten?</h3><div class="tiny">1 = bra, 5 = vond eller låst</div>'+backScale('backBefore',working.backBefore)+'</div>'+
 '<label class="sub">Tredemølle, minutter</label><input id="walk" class="fullinput" inputmode="numeric" value="'+working.walkMinutes+'" placeholder="f.eks. 25"></div>'+
 d.ex.map((x,idx)=>workoutExercise(x,idx)).join('')+
 '<div class="card"><div class="backbox"><h3>Hvordan kjennes korsryggen etter økten?</h3>'+backScale('backAfter',working.backAfter)+'</div><label class="sub">Kommentar til økten</label><textarea id="notes" class="note" placeholder="F.eks. ryggen kjentes bra, øk vekten neste gang">'+(working.notes||'')+'</textarea><button class="btn" id="saveSession" style="width:100%;margin-top:12px">Lagre økten</button></div>';
 document.getElementById('cancel').onclick=()=>{working=null;renderToday()};
 document.getElementById('walk').oninput=e=>working.walkMinutes=e.target.value;
 document.getElementById('notes').oninput=e=>working.notes=e.target.value;
 el.querySelectorAll('[data-ex]').forEach(inp=>inp.oninput=()=>{const [id,i,field]=inp.dataset.ex.split('|');working.sets[id][+i][field]=inp.value});
 el.querySelectorAll('[data-done]').forEach(b=>b.onclick=()=>{const [id,i]=b.dataset.done.split('|');working.sets[id][+i].done=!working.sets[id][+i].done;b.classList.toggle('done');b.textContent=working.sets[id][+i].done?'✓':'○'});
 el.querySelectorAll('[data-info]').forEach(b=>b.onclick=()=>openExercise(findExercise(b.dataset.info)));
 el.querySelectorAll('[data-back]').forEach(b=>b.onclick=()=>{const [field,val]=b.dataset.back.split('|');working[field]=Number(val);el.querySelectorAll('[data-back^="'+field+'|"]').forEach(x=>x.classList.remove('active'));b.classList.add('active')});
 document.getElementById('saveSession').onclick=finishSession;
}
function workoutExercise(x,idx){
 const sets=working.sets[x[0]],st=exerciseStats(x[0],x[2]);
 const suggestion=x[0]==='birddog'?'Kroppsvekt':st.suggestion?st.suggestion+' kg':'Registrer første økt';
 return '<div class="card"><div class="row"><img class="thumb" src="'+x[3]+'" alt="'+x[1]+'"><div class="grow"><h3>'+(idx+1)+'. '+x[1]+'</h3><div class="sub">'+x[2]+'</div></div><button class="btn secondary small" data-info="'+x[0]+'">Bilde</button></div>'+
 '<div class="workout-stats"><div><span>Forrige gang</span><b>'+formatLast(x[0])+'</b></div><div><span>Forslag i dag</span><b>'+suggestion+'</b></div><div><span>Personlig rekord</span><b>'+(st.pr?st.pr+' kg':'–')+'</b></div></div>'+
 '<div class="setline"><span></span><label>kg</label><label>reps</label><span></span></div>'+
 sets.map((s,i)=>'<div class="setline"><b>Sett '+(i+1)+'</b><input data-ex="'+x[0]+'|'+i+'|kg" type="number" step="0.5" value="'+s.kg+'" placeholder="'+(x[0]==='birddog'?'–':'kg')+'" '+(x[0]==='birddog'?'disabled':'')+'><input data-ex="'+x[0]+'|'+i+'|reps" type="number" value="'+s.reps+'" placeholder="reps"><button data-done="'+x[0]+'|'+i+'" class="check '+(s.done?'done':'')+'">'+(s.done?'✓':'○')+'</button></div>').join('')+'</div>';
}
function finishSession(){working.walkMinutes=Number(working.walkMinutes)||0;working.notes=document.getElementById('notes').value;const d=db();d.sessions.push(working);saveDb(d);working=null;renderToday();alert('Økten er lagret.');}
function findExercise(id){for(const d of Object.values(DAYS)){const x=d.ex.find(e=>e[0]===id);if(x)return x;}return null;}
function openExercise(x){
 const dialog=document.getElementById('exerciseDialog'),st=exerciseStats(x[0],x[2]);
 document.getElementById('dialogBody').innerHTML='<h2>'+x[1]+'</h2><div class="sub">'+x[2]+'</div><img class="detail-img" src="'+x[3]+'" alt="'+x[1]+'"><p>'+x[4]+'</p><div class="detail-stats"><div><span>Forrige gang</span><b>'+formatLast(x[0])+'</b></div><div><span>Personlig rekord</span><b>'+(st.pr?st.pr+' kg':'–')+'</b></div></div><div class="tiny">Trykk på × for å lukke.</div>';
 dialog.showModal();
}
document.querySelector('#exerciseDialog .close').onclick=()=>document.getElementById('exerciseDialog').close();
function renderExercises(){const seen=new Set(),all=[];Object.values(DAYS).forEach(d=>d.ex.forEach(x=>{if(!seen.has(x[0])){seen.add(x[0]);all.push(x)}}));document.getElementById('exercises').innerHTML=`<div class="card"><h2>Øvelsesbibliotek</h2><div class="sub">Trykk på en øvelse for bilde og huskeregel.</div>${all.map(x=>`<div class="exercise"><img class="thumb" src="${x[3]}"><div><h4>${x[1]}</h4><div class="meta">${x[2]}</div></div><button class="check" data-open="${x[0]}">›</button></div>`).join('')}</div>`;document.querySelectorAll('#exercises [data-open]').forEach(b=>b.onclick=()=>openExercise(findExercise(b.dataset.open)));}
function renderProgress(){
 const sessions=db().sessions.slice().sort((a,b)=>(b.date||'').localeCompare(a.date||''));
 const total=sessions.length,month=new Date().toISOString().slice(0,7),monthCount=sessions.filter(s=>s.date.startsWith(month)).length,walk=sessions.reduce((a,s)=>a+(+s.walkMinutes||0),0);
 const ids=[...new Set(Object.values(DAYS).flatMap(d=>d.ex.map(x=>x[0])))];
 const latestBack=sessions.find(s=>s.backBefore||s.backAfter);
 const el=document.getElementById('progress');
 el.innerHTML='<div class="statgrid"><div class="stat"><b>'+total+'</b><span class="tiny">økter totalt</span></div><div class="stat"><b>'+monthCount+'</b><span class="tiny">denne måneden</span></div><div class="stat"><b>'+walk+'</b><span class="tiny">min gange</span></div></div>'+
 (latestBack?'<div class="card"><h3>Siste ryggstatus</h3><div class="back-summary">Før: <b>'+(latestBack.backBefore||'–')+'/5</b> '+backLabel(latestBack.backBefore)+' · Etter: <b>'+(latestBack.backAfter||'–')+'/5</b> '+backLabel(latestBack.backAfter)+'</div></div>':'')+
 '<div class="card"><h3>Styrkeutvikling</h3><select id="chartEx" class="fullselect">'+ids.map(id=>{const x=findExercise(id);return '<option value="'+id+'">'+x[1]+'</option>'}).join('')+'</select><div class="chartwrap" style="margin-top:12px"><canvas id="chart"></canvas></div><div class="tiny" style="margin-top:8px">Grafen viser høyeste registrerte vekt for øvelsen per økt.</div></div>'+
 '<div class="card"><h3>Historikk</h3>'+(sessions.length?sessions.map(s=>'<div class="history-item"><div>'+fmtDate(s.date)+'</div><div>'+DAYS[s.day].label+(s.backBefore?'<div class="tiny">Rygg '+s.backBefore+'/5 → '+(s.backAfter||'–')+'/5</div>':'')+'</div><div class="metric">'+(s.walkMinutes||0)+' min</div></div>').join(''):'<div class="empty">Ingen økter lagret ennå.</div>')+'</div>';
 const sel=document.getElementById('chartEx');sel.onchange=()=>drawChart(sel.value);drawChart(sel.value);
}
function drawChart(id){const cvs=document.getElementById('chart');if(!cvs)return;const ctx=cvs.getContext('2d'),rect=cvs.getBoundingClientRect(),dpr=devicePixelRatio||1;cvs.width=rect.width*dpr;cvs.height=rect.height*dpr;ctx.scale(dpr,dpr);const W=rect.width,H=rect.height;ctx.clearRect(0,0,W,H);const pts=db().sessions.filter(s=>s.sets?.[id]).map(s=>({date:s.date,val:Math.max(0,...s.sets[id].map(z=>Number(z.kg)||0))})).filter(p=>p.val>0).sort((a,b)=>a.date.localeCompare(b.date));ctx.strokeStyle='#dce6ec';ctx.lineWidth=1;for(let i=0;i<5;i++){const y=20+i*(H-50)/4;ctx.beginPath();ctx.moveTo(36,y);ctx.lineTo(W-12,y);ctx.stroke()}if(!pts.length){ctx.fillStyle='#667784';ctx.font='14px system-ui';ctx.fillText('Registrer vekt på øvelsen for å få graf.',45,H/2);return}const max=Math.max(...pts.map(p=>p.val))*1.1,min=0;const x=i=>36+(pts.length===1?(W-60)/2:i*(W-60)/(pts.length-1));const y=v=>H-30-(v-min)/(max-min||1)*(H-55);ctx.strokeStyle='#16324f';ctx.lineWidth=3;ctx.beginPath();pts.forEach((p,i)=>i?ctx.lineTo(x(i),y(p.val)):ctx.moveTo(x(i),y(p.val)));ctx.stroke();ctx.fillStyle='#16324f';pts.forEach((p,i)=>{ctx.beginPath();ctx.arc(x(i),y(p.val),4,0,Math.PI*2);ctx.fill()});ctx.fillStyle='#667784';ctx.font='11px system-ui';ctx.fillText(`${Math.round(max)} kg`,4,24);ctx.fillText('0',18,H-28);}

let deferredPrompt;window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();deferredPrompt=e;const b=document.getElementById('installBtn');b.hidden=false;b.onclick=async()=>{deferredPrompt.prompt();await deferredPrompt.userChoice;b.hidden=true;deferredPrompt=null}});if('serviceWorker'in navigator)window.addEventListener('load',()=>navigator.serviceWorker.register('sw.js'));
renderToday();
