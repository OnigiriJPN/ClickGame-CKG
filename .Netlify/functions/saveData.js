import fetch from 'node-fetch';

export async function handler(event) {
  const { token, repo, path, data } = JSON.parse(event.body);
  const res = await fetch(`https://api.github.com/repos/YOUR_USERNAME/${repo}/contents/${path}`, {
    method:'PUT',
    headers:{
      Authorization:`token ${token}`,
      'Content-Type':'application/json'
    },
    body: JSON.stringify({
      message:'Update game data',
      content: Buffer.from(JSON.stringify(data)).toString('base64')
    })
  });
  const result = await res.json();
  return { statusCode: 200, body: JSON.stringify(result) };
}
