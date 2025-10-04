const fetch = require('node-fetch');

exports.handler = async (event) => {
  const { token, repo, path, user, score, teamId } = JSON.parse(event.body);

  // 既存ランキング取得
  const rankRes = await fetch(`https://api.github.com/repos/${repo}/contents/${path}`, {
    headers: { 'Authorization': `token ${token}`, 'Accept':'application/vnd.github.v3.raw' }
  });
  let ranking = [];
  if(rankRes.status !== 404){
    ranking = await rankRes.json().catch(()=>[]);
  }

  // ユーザーのスコア更新
  const idx = ranking.findIndex(r=>r.user===user);
  if(idx>=0){
    ranking[idx].score = Math.max(ranking[idx].score, score);
    ranking[idx].teamId = teamId;
  } else {
    ranking.push({ user, score, teamId });
  }

  // GitHubに保存
  const content = Buffer.from(JSON.stringify(ranking,null,2)).toString('base64');
  const saveRes = await fetch(`https://api.github.com/repos/${repo}/contents/${path}`, {
    method: 'PUT',
    headers: {
      'Authorization': `token ${token}`,
      'Accept': 'application/vnd.github.v3+json'
    },
    body: JSON.stringify({
      message:`Update ranking for ${user}`,
      content,
      branch:'main'
    })
  });
  const result = await saveRes.json();

  return { statusCode:200, body: JSON.stringify(result) };
};
