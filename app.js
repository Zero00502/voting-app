(() => {
  'use strict';
  const cfg = window.ACCESS_CONFIG;
  const questions = [
    { title:'WHEN DOES WATCHING BECOME PARTICIPATING?', subtitle:'Which kind of influence would make a live experience interesting to you?', options:['Choose what happens next','Shape something together with others','Change the environment or atmosphere','Ask questions and receive a response'] },
    { title:'HOW WOULD YOU DESIGN THE UNPREDICTABLE?', subtitle:'Imagine you are organizing an interactive event. What would you prioritize?', options:['Predefined branches with audience choices','Freely changing outcomes based on live input','A performer or host who can override the system','Small, reliable interactions throughout the event'] },
    { title:'WHAT MATTERS MOST IN A LIVE INTERACTION?', subtitle:'Choose the most important principle for an experience you would want to attend.', options:['Knowing that my action made a difference','Taking part without looking at my phone for long','Connecting and collaborating with other people','A smooth and reliable experience'] },
  ];
  const stage = document.getElementById('stage');
  const progress = document.getElementById('progress');
  const label = document.getElementById('mode-label');
  const dot = document.getElementById('connection-dot');
  const storageKey = `ia-${cfg.eventId}-answers`;
  let answers = {};
  try { answers = JSON.parse(localStorage.getItem(storageKey) || '{}'); } catch {}
  let current = 0;
  let pollTimer = null;
  const connected = Boolean(cfg.supabaseUrl && cfg.supabaseAnonKey);
  label.textContent = connected ? 'LIVE RESULTS ENABLED' : 'PREVIEW MODE — VOTES ON THIS DEVICE ONLY';
  dot.className = connected ? 'dot live' : 'dot';
  const normalize = s => String(s||'').normalize('NFKD').toUpperCase().replace(/[^A-Z0-9]/g,'');
  const escapeHtml = s => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const apiUrl = () => cfg.supabaseUrl.replace(/\/$/,'') + '/rest/v1/votes';
  const headers = () => ({apikey:cfg.supabaseAnonKey,Authorization:`Bearer ${cfg.supabaseAnonKey}`,'Content-Type':'application/json'});
  async function fetchVotes(i) {
    if (!connected) return Object.values(answers).filter(x => x.question === i).map(x => x.choice);
    const qs = `?event_id=eq.${encodeURIComponent(cfg.eventId)}&question=eq.${i}&select=choice`;
    const r = await fetch(apiUrl()+qs,{headers:headers(),cache:'no-store'});
    if (!r.ok) throw new Error('Unable to load shared votes');
    return (await r.json()).map(x=>x.choice);
  }
  async function sendVote(i, choice) {
    if (!connected) return;
    const r = await fetch(apiUrl(),{method:'POST',headers:{...headers(),Prefer:'return=minimal'},body:JSON.stringify({event_id:cfg.eventId,question:i,choice})});
    if (!r.ok) throw new Error('Vote was not saved. Please try again.');
  }
  function save() {localStorage.setItem(storageKey,JSON.stringify(answers));progress.textContent=`${Object.keys(answers).length} / 3 answered`;}
  function stopPolling() {if(pollTimer){clearInterval(pollTimer);pollTimer=null;}}
  function renderGate(i) {
    stopPolling(); current=i;
    stage.innerHTML=`<span class="fold-tag">FOLD ${String(i+1).padStart(2,'0')} / ACCESS REQUIRED</span><h2>UNLOCK THE NEXT QUESTION.</h2><p class="sub">Unfold section ${i+1} of your printed ticket. Find the access word next to <b>FOLD ${i+1}</b>, then enter it below.</p><label class="field-label" for="word">ACCESS WORD</label><form id="unlock-form" class="unlock"><input id="word" autocomplete="off" autocapitalize="characters" spellcheck="false" placeholder="ENTER THE WORD" required/><button class="primary">UNLOCK →</button></form><p class="error" id="error" role="alert"></p>`;
    document.getElementById('unlock-form').addEventListener('submit',e=>{
      e.preventDefault();const word=document.getElementById('word').value;
      if(normalize(word)===normalize(cfg.foldWords[i])) renderQuestion(i); else document.getElementById('error').textContent='That does not match. Check the word beside the fold on your ticket.';
    });
  }
  function renderQuestion(i) {
    stopPolling();const q=questions[i];
    if(answers[i] !== undefined){renderSubmitted(i);return;}
    stage.innerHTML=`<span class="fold-tag">FOLD ${String(i+1).padStart(2,'0')} / QUESTION UNLOCKED</span><h2>${escapeHtml(q.title)}</h2><p class="sub">${escapeHtml(q.subtitle)}</p><div class="options">${q.options.map((o,j)=>`<button class="option" data-choice="${j}"><span class="letter">${'ABCD'[j]}</span><span>${escapeHtml(o)}</span></button>`).join('')}</div><p id="vote-error" class="error" role="alert"></p>`;
    stage.querySelectorAll('.option').forEach(b=>b.addEventListener('click',async()=>{
      const choice=Number(b.dataset.choice);stage.querySelectorAll('.option').forEach(x=>x.disabled=true);
      try {await sendVote(i,choice);answers[i]={question:i,choice};save();renderSubmitted(i);}catch(e){document.getElementById('vote-error').textContent=e.message;stage.querySelectorAll('.option').forEach(x=>x.disabled=false);}
    }));
  }
  function renderSubmitted(i) {
    stopPolling();current=i;
    stage.innerHTML=`<span class="fold-tag">FOLD ${String(i+1).padStart(2,'0')} / VOTE RECORDED</span><h2>YOUR CHOICE IS IN.</h2><p class="sub">Your answer has been saved. Everyone's choices will be revealed together at the end.</p><div class="notice">${connected?'The class results are kept hidden until the final reveal.':'Preview mode: only this phone’s answers are stored. Set up Supabase for shared class results.'}</div><div class="next"><p>${i<2?'Wait for the cue to unfold the next part of your ticket.':'All three questions are complete. Unfold the final section.'}</p><button class="secondary" id="continue">${i<2?'NEXT FOLD →':'REVEAL THE RESULTS →'}</button></div>`;
    document.getElementById('continue').addEventListener('click',()=>i<2?renderGate(i+1):renderFinal());
  }
  async function renderFinal(){
    stopPolling();current=3;
    stage.innerHTML=`<span class="fold-tag">FINAL REVEAL / THE AUDIENCE HAS SPOKEN</span><h2>YOUR COLLECTIVE EXPERIENCE.</h2><p class="sub">Here's how everyone answered all three questions. Orange marks your answer. Teal shows the other options.</p><div id="all-results">${questions.map((q,i)=>`<section class="summary-question"><div class="summary-number">QUESTION ${String(i+1).padStart(2,'0')}</div><h3>${escapeHtml(q.title)}</h3><p id="total-${i}" class="eyebrow">Loading votes…</p>${q.options.map((o,j)=>`<div class="result ${answers[i]?.choice===j?'selected':''}"><div class="bar-meta"><span>${escapeHtml(o)}${answers[i]?.choice===j?' ✓':''}</span><span id="count-${i}-${j}">—</span></div><div class="bar-rail"><div class="bar-fill" id="bar-${i}-${j}" style="width:0%"></div></div></div>`).join('')}</section>`).join('')}</div><div class="notice" id="result-status">${connected?'Class results refresh automatically every few seconds.':'Preview mode: these results only include votes on this phone. Connect Supabase to show class-wide results.'}</div><button class="secondary" id="refresh-results">REFRESH RESULTS ↻</button>`;
    document.getElementById('refresh-results').addEventListener('click',updateFinal);
    await updateFinal();if(connected)pollTimer=setInterval(updateFinal,cfg.pollIntervalMs||4000);
  }
  async function updateFinal(){
    if(current!==3)return;
    try {
      for(let i=0;i<questions.length;i++){
        let votes=connected?await fetchVotes(i):(answers[i]?[answers[i].choice]:[]);
        if(current!==3)return;
        const n=votes.length;
        const total=document.getElementById(`total-${i}`);if(total)total.textContent=`${n} vote${n===1?'':'s'} received`;
        questions[i].options.forEach((_,j)=>{
          const count=votes.filter(v=>v===j).length;
          const percent=n?Math.round(count*100/n):0;
          const bar=document.getElementById(`bar-${i}-${j}`);
          const text=document.getElementById(`count-${i}-${j}`);
          if(bar)bar.style.width=`${percent}%`;
          if(text)text.textContent=`${percent}% · ${count}`;
        });
      }
    }catch(e){const status=document.getElementById('result-status');if(status)status.textContent='Shared results could not load. Check your connection and database settings.';}
  }
  save();renderGate(0);
})();
