const fetch = require('node-fetch');

exports.handler = async (event) => {
  const { code } = JSON.parse(event.body);

  const client_id = process.env.GITHUB_CLIENT_ID;
  const client_secret = process.env.GITHUB_CLIENT_SECRET;

  const tokenRes = await fetch('https://github.com/login/oauth/access_token', {
    method:'POST',
    headers:{ 'Accept':'application/json' },
    body: new URLSearchParams({ client_id, client_secret, code })
  });
  const tokenData = await tokenRes.json();
  const token = tokenData.access_token;

  const userRes = await fetch('https://api.github.com/user',{
    headers:{ Authorization:`token ${token}` }
  });
  const userData = await userRes.json();

  return {
    statusCode:200,
    body: JSON.stringify({ token, login: userData.login })
  };
};
