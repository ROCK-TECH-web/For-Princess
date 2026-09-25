const app = document.querySelector('#app');
const toast = document.querySelector('#toast');
const bgAudio = document.querySelector('#bg-audio');
const state = { screen: 'boot', answers: {}, questionIndex: 0, response: '', dateType: '', dateNote: '' };
const steps = ['boot', 'questions', 'suspense', 'confession', 'question', 'response'];

function playBackgroundAudio() {
  if (!bgAudio) return;
  bgAudio.volume = 0.12;
  bgAudio.muted = false;
  bgAudio.play().catch(() => {
    console.warn('Background audio autoplay was blocked by the browser. User interaction is required.');
  });
}

function progress() {
  const current = Math.max(0, steps.indexOf(state.screen));
  return `<div class="progress" aria-label="Story progress">${steps.slice(1, 6).map((_, index) => `<i class="${index <= current - 1 ? 'active' : ''}"></i>`).join('')}</div>`;
}
function shell(content, label = 'for princess') {
  return `<div class="topbar"><span class="brand">${label}</span>${progress()}</div>${content}`;
}
function button(label, action, className = 'primary') {
  return `<button class="btn ${className}" data-action="${action}">${label}</button>`;
}
function setScreen(screen) {
  app.classList.add('is-leaving');
  window.setTimeout(() => {
    state.screen = screen;
    render();
    app.classList.remove('is-leaving');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, 260);
}
function showToast(message) { toast.textContent = message; toast.classList.add('show'); setTimeout(() => toast.classList.remove('show'), 3400); }

function boot() {
  const chorusLines = Array.from({ length: 8 }, (_, index) => `<div class="chorus-line ${index % 2 === 0 ? 'accent' : ''}">Break me down, AMMA</div>`).join('');

  return `<section class="screen hero"><div class="terminal"><div class="terminal-bar"><i></i><i></i><i></i></div><div class="logs"><span>INITIALIZING...</span><span>Loading courage...</span><span>Loading confidence...</span><span>Searching for the right words...</span><span>Error: courage not found 😂</span><span>Trying another approach...</span><span>Website created successfully.</span></div></div><div class="music-card modern-lyric"><p class="eyebrow">now playing</p><h2>Break Me Down <span class="serif accent">— AMMA</span></h2><div class="chorus-loop">${chorusLines}</div></div><p class="eyebrow" style="margin-top:34px">private build / 2026</p><h1>Hey <span class="serif accent">Princess</span> 👋</h1><p class="lede">I built something for you. Please don't judge my coding decisions 😂.</p><div class="actions">${button('START →', 'start')}</div></section>`;
}

const questions = [
  ['01', 'What was your first impression of me?', ['Quiet but nice', 'A little mysterious', 'You were funny', 'Honestly? Unsure']],
  ['02', 'Be honest… do you enjoy talking to me?', ['Obviously 😂', 'Sometimes sha', 'Maybe 👀', "I don't know"]],
  ['03', 'Do you think someone could secretly like you without telling you?', ['Definitely', 'Maybe 👀', 'Hmm…']],
];
function questionsView() {
  const [number, copy, options] = questions[state.questionIndex];
  const selected = state.answers[number];
  const isLast = state.questionIndex === questions.length - 1;
  return `<section class="screen narrow"><div class="glass question-step"><div class="step-heading"><span class="eyebrow">a tiny survey / ${String(state.questionIndex + 1).padStart(2, '0')} of ${questions.length}</span><span class="step-dots">${questions.map((_, index) => `<i class="${index <= state.questionIndex ? 'active' : ''}"></i>`).join('')}</span></div><h2>Princess, I need you to help me with something<span class="accent">…</span></h2><p class="lede">No right answers here. I promise this isn't a trap.</p><div class="question-block"><span class="question-number">QUESTION ${number}</span><p class="question-copy">${copy}</p><div class="option-grid">${options.map(option => `<button class="option ${selected === option ? 'selected' : ''}" data-question="${number}" data-option="${option}">${option}</button>`).join('')}</div></div><div class="actions">${button(isLast ? 'SHOW ME WHY →' : 'NEXT QUESTION →', 'questions-next')}</div></div></section>`;
}
function suspense() { return `<section class="screen suspense"><span class="eyebrow">one more thing</span><div><p style="font-size:clamp(28px,5vw,60px)">Okay Princess<span class="accent">…</span></p><p style="font-size:clamp(24px,4vw,46px)">There's actually a reason I made this.</p><p class="serif" style="font-size:clamp(26px,5vw,58px)">And I've been trying to figure out how to say it.</p><p class="dim" style="margin-top:30px">Because honestly<span class="accent">…</span></p></div><div class="actions" style="justify-content:center">${button('TELL ME →', 'confession')}</div></section>`; }
function confession() { return `<section class="screen confession"><span class="eyebrow">the part I kept rehearsing</span><h2>Okay Princess<span class="accent">…</span> I think I've hidden this long enough.</h2><div class="confession-copy"><p>I've actually been shy to tell you this directly.</p><p>Maybe because I didn't know how you'd react. Maybe because saying it out loud makes it feel more real.</p><p>But the truth is<span class="accent">…</span></p><strong>I really like you, Princess.</strong><p>And it's not just some random feeling. I've caught myself thinking about you more than I probably should 😂.</p><p>There's just something about you that I genuinely like, and I've been trying to find the courage to say it.</p><div class="callout">So instead of trying to find the perfect words<span class="accent">…</span><br><span class="serif">I built you a website. 😭😂</span></div></div><div class="actions">${button('CONTINUE →', 'question')}</div><p class="dim" style="font:12px var(--mono);margin-top:80px">P.S. Yes, I actually coded all this because I was too shy to just say it normally 😂.</p></section>`; }
function finalQuestion() { return `<section class="screen final-question"><span class="eyebrow">the actual reason</span><h2><span class="serif accent">Princess…</span><br>Would you be my girlfriend?</h2><p class="lede" style="margin:24px auto 0">Whatever your answer is, I promise it will be respected.</p><div class="choice-grid"><button class="choice" data-response="YES"><b>YES ❤️</b><small>let's find out</small></button><button class="choice" data-response="NO"><b>NO 🤍</b><small>thank you for being honest</small></button><button class="choice" data-response="I'LL THINK ABOUT IT"><b>I'LL THINK ABOUT IT 🤔</b><small>take your time</small></button></div></section>`; }

function escapeHtml(value = '') {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function createMessageBlock() {
  const message = (state.dateNote || '').trim();
  if (!message) return '';

  const kind = /love|loved|sweet|happy|beautiful|thank|miss|care|kisses|heart|smile|genuinely|like|adore|soft|kind/i.test(message);
  const extra = kind
    ? '<p class="serif" style="font-size:27px;color:var(--text)">That meant a lot to me, Princess. I’m really touched. ❤️</p>'
    : '<p class="serif" style="font-size:24px;color:var(--text)">I really appreciate you saying that.</p>';

  return `<div class="glass" style="margin-top:18px; padding:18px 20px; background: rgba(255,255,255,.03); border: 1px solid rgba(255,255,255,.08);">
    <span class="eyebrow">her message</span>
    <p style="margin-top:14px; font-size:18px; line-height:1.7; color:var(--text)">“${escapeHtml(message)}”</p>
    ${extra}
  </div>`;
}

function responseView() {
  const note = createMessageBlock();
  const copy = {
    YES: `<span class="eyebrow">notification: best possible outcome</span><h2>WAIT… PRINCESS ACTUALLY SAID YES?! <span class="accent">😭❤️</span></h2><p>You've officially made this shy guy very happy.</p><p>I don't know exactly where this goes from here, but I'd genuinely love to find out.</p><h3>Now don't be shy, Princess<span class="accent">…</span><br>Tell me what you want to say. ✨</h3><div class="planner glass"><span class="eyebrow">your move / write her message</span><p class="planner-intro">Tell me what you want to say to me, or write your thoughts here. No pressure, just honest words.</p><label for="date-note">Your message</label><textarea id="date-note" rows="5" maxlength="220" placeholder="Write your answer, your thoughts, or anything you want me to hear...">${state.dateNote}</textarea><div class="actions">${button('SEND MY MESSAGE →', 'plan-date')}</div></div>`,
    NO: `<span class="eyebrow">thank you for being honest</span><h2>It's okay, Princess. <span class="accent">🤍</span></h2><p>Honestly, even telling you how I feel took a lot of courage for me.</p><p>I've been shy about saying all this for a while, but I didn't want to keep wondering:</p><p class="serif" style="font-size:28px;color:var(--text)">“What if I had told her?”</p><p>So regardless of your answer, I'm glad I finally told you.</p><p><strong class="accent">I genuinely like you, Princess, and I meant every word.</strong></p><p>No pressure. No hard feelings.</p><h3>It is well sha 😂❤️</h3><p>Thank you for taking the time to go through my little website.</p><p class="signature">— From someone who was finally brave enough to tell you</p>`,
    "I'LL THINK ABOUT IT": `<span class="eyebrow">no rush at all</span><h2>That's completely okay, Princess. <span class="accent">🤍</span></h2><p>You don't have to give me an answer immediately.</p><p>Honestly, the fact that you took the time to go through all of this already means something to me.</p><p><strong style="color:var(--text)">Take your time. No pressure.</strong></p><p>I just wanted you to know how I feel.</p><p class="serif" style="font-size:27px;color:var(--text)">Whatever you decide, I'm glad I finally told you. ❤️</p>${button('BACK TO THE BEGINNING ↺', 'restart', 'ghost')}`,
  };
  return `<section class="screen response"><div class="glass">${copy[state.response]}${note}<p class="dim" style="font:12px var(--mono);margin-top:60px">Response recorded privately · ${state.response}</p></div></section>`;
}
function render() {
  const views = { boot, questions: questionsView, suspense, confession, question: finalQuestion, response: responseView };
  app.innerHTML = shell(views[state.screen](), state.screen === 'boot' ? 'private build / for princess' : 'for princess / carefully made');
}

async function sendResponse(response) {
  state.response = response;
  state.dateNote = document.querySelector('#date-note')?.value?.trim() || state.dateNote || '';
  setScreen('response');
  if (response === 'YES') celebrate();
  try {
    const result = await fetch('/api/respond', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ response, answers: state.answers, dateType: state.dateType, dateNote: state.dateNote }),
    });
    const payload = await result.json();
    const message = state.dateNote ? 'Your message was recorded and sent privately ❤️' : 'Response recorded and sent privately ❤️';
    showToast(payload.sent ? message : 'Response recorded. Gmail notification needs setup.');
  } catch (error) {
    console.warn('Notification endpoint unavailable:', error);
    showToast('Response recorded. Gmail notification is temporarily unavailable.');
  }
}
function celebrate() { for (let index = 0; index < 18; index += 1) { const heart = document.createElement('span'); heart.className = 'heart-pop'; heart.textContent = ['❤', '✦', '♡'][index % 3]; heart.style.left = `${10 + Math.random() * 80}%`; heart.style.bottom = `${5 + Math.random() * 15}%`; heart.style.animationDelay = `${Math.random() * .6}s`; document.body.appendChild(heart); setTimeout(() => heart.remove(), 3000); } }

app.addEventListener('click', (event) => {
  const option = event.target.closest('[data-question]');
  if (option) { state.answers[option.dataset.question] = option.dataset.option; showToast('Noted. I like that answer 👀'); render(); return; }
  const dateOption = event.target.closest('[data-date]');
  if (dateOption) { state.dateType = dateOption.dataset.date; render(); return; }
  const response = event.target.closest('[data-response]');
  if (response) { sendResponse(response.dataset.response); return; }
  const action = event.target.closest('[data-action]')?.dataset.action;
  if (!action) return;
  if (action === 'start') {
    playBackgroundAudio();
    setScreen('questions');
  }
  if (action === 'questions-next') {
    if (!state.answers[questions[state.questionIndex][0]]) { showToast('Choose an answer first 🤍'); return; }
    if (state.questionIndex < questions.length - 1) { state.questionIndex += 1; render(); return; }
    setScreen('suspense');
  }
  if (action === 'confession') setScreen('confession');
  if (action === 'question') setScreen('question');
  if (action === 'restart') { state.answers = {}; state.questionIndex = 0; state.response = ''; setScreen('boot'); }
  if (action === 'plan-date') {
    state.dateNote = document.querySelector('#date-note')?.value?.trim() || '';
    if (!state.dateNote) {
      showToast('Write something sweet first 💌');
      return;
    }
    showToast('Your message was saved ❤️');
    setScreen('response');
  }
});

render();
