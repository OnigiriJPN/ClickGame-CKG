const fetch = require('node-fetch');

exports.handler = async (event) => {
  const { token, repo, path } = JSON.parse(event.body);

  const res = await fetch(`https://api.github.com/repos/${repo}/contents/${path}`, {
    headers: {
      'Authorization': `token ${token}`,
      'Accept': 'application/vnd.github.v3.raw'
    }
  });

  if(res.status === 404) return { statusCode:200, body: JSON.stringify({}) };

  const data = await res.json().catch(()=>({}));
  return { statusCode:200, body: JSON.stringify(data) };
};
