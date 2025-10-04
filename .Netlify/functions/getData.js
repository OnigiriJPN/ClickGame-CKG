import fetch from 'node-fetch';

export async function handler(event) {
  const { token, repo, path } = JSON.parse(event.body);
  const res = await fetch(`https://api.github.com/repos/YOUR_USERNAME/${repo}/contents/${path}`, {
    headers: { Authorization:`token ${token}` }
  });
  const json = await res.json();
  let content = {};
  if(json.content) content = JSON.parse(Buffer.from(json.content,'base64').toString());
  return { statusCode:200, body: JSON.stringify(content) };
}
