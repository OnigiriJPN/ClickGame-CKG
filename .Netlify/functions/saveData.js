const fetch = require('node-fetch');

exports.handler = async (event) => {
  const { token, repo, path, data } = JSON.parse(event.body);

  const content = Buffer.from(JSON.stringify(data, null, 2)).toString('base64');

  // GitHub APIでファイル作成/更新
  const res = await fetch(`https://api.github.com/repos/${repo}/contents/${path}`, {
    method: 'PUT',
    headers: {
      'Authorization': `token ${token}`,
      'Accept': 'application/vnd.github.v3+json'
    },
    body: JSON.stringify({
      message: `Save game data for ${data.user}`,
      content,
      branch: 'main'
    })
  });
  const result = await res.json();

  return { statusCode:200, body: JSON.stringify(result) };
};
