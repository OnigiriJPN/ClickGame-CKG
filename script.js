let score=0, slots=[], accessToken='', teamId='default', userName='';

const scoreEl=document.getElementById('score');
const slotsContainer=document.getElementById('slotsContainer');
const userInfo=document.getElementById('userInfo');
const rankingEl=document.getElementById('ranking');
const adContainer=document.getElementById('ad');
const startScreen=document.getElementById('startScreen');
const startBtn=document.getElementById('startBtn');
const resetBtn=document.getElementById('resetBtn');

const githubLoginBtn=document.getElementById('githubLoginBtn');
const tapBtn=document.getElementById('tapBtn');
const addSlotBtn=document.getElementById('addSlotBtn');
const deleteSlotBtn=document.getElementById('deleteSlotBtn');
const saveBtn=document.getElementById('saveBtn');
const joinTeamBtn=document.getElementById('joinTeamBtn');

const teamInput=document.getElementById('teamInput');

const bgm=document.getElementById('bgm');
const tapSound=document.getElementById('tapSound');
const slotSound=document.getElementById('slotSound');

const clientId='Ov23liVLXTuwPP1PIcco';
const redirectUri=window.location.origin+window.location.pathname;

// --- GitHub OAuth ---
githubLoginBtn.addEventListener('click',()=>{ window.location.href=`https://github.com/login/oauth/authorize?client_id=${clientId}&scope=repo&redirect_uri=${redirectUri}`; });
const urlParams=new URLSearchParams(window.location.search);
const code=urlParams.get('code');

if(code){
  fetch('/.Netlify/functions/getToken',{method:'POST',body:JSON.stringify({code})})
  .then(res=>res.json())
  .then(data=>{
    accessToken=data.token;
    userName=data.login;
    userInfo.textContent=`ログイン: ${userName}`;
    startBtn.disabled=false;
    loadGameData();
    loadRanking();
  });
}

// --- スタート ---
startBtn.addEventListener('click',()=>{
  startScreen.classList.add('hide');
  setTimeout(()=>{
    startScreen.style.display='none';
    document.getElementById('game').style.display='block';
  },500);
  bgm.play();
});

// --- パーティクル ---
function createParticle(text,x,y){
  const particle=document.createElement('div');
  particle.className='particle';
  particle.textContent=text;
  particle.style.left=`${x}px`; particle.style.top=`${y}px`;
  const dx=(Math.random()-0.5)*100, dy=-Math.random()*100;
  particle.style.setProperty('--x',dx+'px'); particle.style.setProperty('--y',dy+'px');
  document.body.appendChild(particle);
  setTimeout(()=>particle.remove(),800);
}

// --- タップ ---
tapBtn.addEventListener('click',(e)=>{
  tapSound.currentTime=0; tapSound.play();
  score++;
  scoreEl.textContent=score;
  scoreEl.classList.remove('score-animate'); void scoreEl.offsetWidth; scoreEl.classList.add('score-animate');

  const rect=e.target.getBoundingClientRect();
  createParticle('+1', rect.left+rect.width/2, rect.top);

  if(score%10===0) saveRanking(score);
});

// --- スロット管理 ---
function renderSlots(){
  slotsContainer.innerHTML='';
  slots.forEach((slot,index)=>{
    const div=document.createElement('div');
    div.className='slot';
    div.innerHTML=`<input type="checkbox" data-index="${index}"> ${slot.name}`;
    slotsContainer.appendChild(div);
    div.style.opacity=0; div.style.transform='scale(0.5)';
    setTimeout(()=>{ div.style.transition='opacity 0.3s ease, transform 0.3s ease'; div.style.opacity=1; div.style.transform='scale(1)'; },50);
  });
}

addSlotBtn.addEventListener('click',()=>{
  const name=document.getElementById('newSlotName').value.trim();
  if(name){ slots.push({name}); renderSlots(); const rect=document.getElementById('newSlotName').getBoundingClientRect(); for(let i=0;i<10;i++) createParticle('✨',rect.left+rect.width/2,rect.top); slotSound.currentTime=0; slotSound.play(); }
});

deleteSlotBtn.addEventListener('click',()=>{
  const checked=document.querySelectorAll('#slotsContainer input:checked');
  const indexes=Array.from(checked).map(cb=>parseInt(cb.dataset.index));
  slots=slots.filter((_,i)=>!indexes.includes(i)); renderSlots();
});

// --- 保存 ---
saveBtn.addEventListener('click',()=>{
  if(!accessToken) return alert('GitHubログインしてください');
  fetch('/.Netlify/functions/saveData',{method:'POST',body:JSON.stringify({ token:accessToken, repo:'YOUR_REPO_NAME', path:'gameData.json', data:{ user:userName, score, slots, teamId } })}).then(res=>res.json()).then(()=>alert('保存完了'));
});

// --- データ読み込み ---
function loadGameData(){
  fetch('/.Netlify/functions/getData',{method:'POST',body:JSON.stringify({ token:accessToken, repo:'YOUR_REPO_NAME', path:'gameData.json' })})
  .then(res=>res.json())
  .then(data=>{
    if(data.score) score=data.score;
    if(data.slots) slots=data.slots;
    if(data.teamId) teamId=data.teamId;
    scoreEl.textContent=score; renderSlots();
  });
}

// --- ランキング ---
function loadRanking(){
  fetch('/.Netlify/functions/getData',{method:'POST',body:JSON.stringify({ token:accessToken, repo:'YOUR_REPO_NAME', path:'ranking.json' })})
  .then(res=>res.json())
  .then(data=>{
    const arr=data||[];
    arr.sort((a,b)=>b.score-a.score);
    rankingEl.innerHTML=arr.map(d=>`<div>${d.user} [Team:${d.teamId}] - ${d.score}</div>`).join('');
  });
}

// --- ランキング保存 ---
function saveRanking(userScore){
  if(!accessToken) return;
  fetch('/.Netlify/functions/saveRanking',{method:'POST',body:JSON.stringify({ token:accessToken, repo:'YOUR_REPO_NAME', path:'ranking.json', user:userName, score:userScore, teamId:teamId })})
  .then(res=>res.json()).then(()=>loadRanking());
}

// --- チーム参加 ---
joinTeamBtn.addEventListener('click',()=>{
  const newTeam=teamInput.value.trim();
  if(newTeam){ teamId=newTeam; saveRanking(score); alert(`チーム「${teamId}」に参加しました`); }
});

// --- ニューゲーム ---
resetBtn.addEventListener('click',()=>{
  if(confirm('本当にニューゲームしますか？スコアとスロットはリセットされます')){
    saveRanking(score); score=0; slots=[]; teamId='default';
    scoreEl.textContent=score; renderSlots();
    for(let i=0;i<20;i++) createParticle('💥', window.innerWidth/2, window.innerHeight/2);
    rankingEl.innerHTML='<div>ランキングを更新中...</div>'; setTimeout(loadRanking,500);
  }
});

// --- 広告 ---
function loadBannerAd(){
  if(window.innerWidth<768){ adContainer.innerHTML='<iframe src="https://safe-ninjaadmax.com/banner-mobile" style="width:320px;height:50px;border:none;"></iframe>'; }
  else{ adContainer.innerHTML='<iframe src="https://safe-ninjaadmax.com/banner-desktop" style="width:728px;height:90px;border:none;"></iframe>'; }
}
window.addEventListener('load',loadBannerAd); window.addEventListener('resize',loadBannerAd);
