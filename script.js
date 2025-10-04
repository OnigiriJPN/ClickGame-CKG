let score = 0;
let slots = [];
let accessToken = '';
let teamId = 'default';
let userName = '';

const scoreEl = document.getElementById('score');
const slotsContainer = document.getElementById('slotsContainer');
const userInfo = document.getElementById('userInfo');
const rankingEl = document.getElementById('ranking');
const adContainer = document.getElementById('ad');

// --- GitHubログイン ---
document.getElementById('loginBtn').addEventListener('click', () => {
  const clientId = 'YOUR_GITHUB_CLIENT_ID';
  const redirectUri = window.location.href;
  window.location.href = `https://github.com/login/oauth/authorize?client_id=${clientId}&scope=repo&redirect_uri=${redirectUri}`;
});

// OAuthリダイレクト処理
const urlParams = new URLSearchParams(window.location.search);
const code = urlParams.get('code');
if(code){
  fetch('/.netlify/functions/getData', { method:'POST', body: JSON.stringify({ code }) })
    .then(res=>res.json())
    .then(data=>{
      accessToken = data.token;
      userName = data.login;             // GitHubユーザー名
      userInfo.textContent = `ログイン: ${userName}`;
      loadGameData();
      loadRanking();
    });
}

// --- タップ ---
document.getElementById('tapBtn').addEventListener('click', ()=>{
  score++;
  scoreEl.textContent = score;

  // スコアアニメーション
  scoreEl.classList.remove('score-animate');
  void scoreEl.offsetWidth; // 再トリガー
  scoreEl.classList.add('score-animate');
});

// --- スロット管理 ---
function renderSlots(){
  slotsContainer.innerHTML = '';
  slots.forEach((slot, index)=>{
    const div = document.createElement('div');
    div.className = 'slot';
    div.innerHTML = `<input type="checkbox" data-index="${index}"> ${slot.name}`;
    slotsContainer.appendChild(div);

    // 新規追加アニメーション
    div.style.opacity = 0;
    div.style.transform = 'scale(0.5)';
    setTimeout(()=>{
      div.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
      div.style.opacity = 1;
      div.style.transform = 'scale(1)';
    },50);
  });
}

document.getElementById('addSlotBtn').addEventListener('click', ()=>{
  const name = document.getElementById('newSlotName').value.trim();
  if(name){ slots.push({name}); renderSlots(); }
});

document.getElementById('deleteSlotBtn').addEventListener('click', ()=>{
  const checked = document.querySelectorAll('#slotsContainer input:checked');
  const indexes = Array.from(checked).map(cb=>parseInt(cb.dataset.index));
  slots = slots.filter((_,i)=>!indexes.includes(i));
  renderSlots();
});

// --- 保存 ---
document.getElementById('saveBtn').addEventListener('click', ()=>{
  if(!accessToken) return alert('GitHubログインしてください');
  fetch('/.netlify/functions/saveData',{
    method:'POST',
    body: JSON.stringify({
      token: accessToken,
      repo: 'YOUR_REPO_NAME',
      path: 'gameData.json',
      data: { user: userName, score, slots, teamId }
    })
  }).then(res=>res.json()).then(res=>alert('保存完了'));
});

// --- ゲームデータ読み込み ---
function loadGameData(){
  fetch('/.netlify/functions/getData', {
    method:'POST',
    body: JSON.stringify({ token: accessToken, repo: 'YOUR_REPO_NAME', path: 'gameData.json' })
  })
  .then(res=>res.json())
  .then(data=>{
    if(data.score) score = data.score;
    if(data.slots) slots = data.slots;
    if(data.teamId) teamId = data.teamId;
    scoreEl.textContent = score;
    renderSlots();
  });
}

// --- ランキング表示 ---
function loadRanking(){
  fetch('/.netlify/functions/getData', {
    method:'POST',
    body: JSON.stringify({ token: accessToken, repo: 'YOUR_REPO_NAME', path: 'ranking.json' })
  })
  .then(res=>res.json())
  .then(data=>{
    const arr = data || [];
    arr.sort((a,b)=>b.score-a.score);
    rankingEl.innerHTML = arr.map(d=>`<div>${d.user} [Team:${d.teamId}] - ${d.score}</div>`).join('');
  });
}

// --- 広告（バナー） ---
function loadBannerAd(){
  if(window.innerWidth < 768){
    adContainer.innerHTML = '<iframe src="https://safe-ninjaadmax.com/banner-mobile" style="width:320px;height:50px;border:none;"></iframe>';
  } else {
    adContainer.innerHTML = '<iframe src="https://safe-ninjaadmax.com/banner-desktop" style="width:728px;height:90px;border:none;"></iframe>';
  }
}
window.addEventListener('load', loadBannerAd);
window.addEventListener('resize', loadBannerAd);
