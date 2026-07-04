const fs = require('fs');

async function test() {
  const env = fs.readFileSync('.env.local', 'utf-8');
  const apiKeyMatch = env.match(/RAPIDAPI_KEY=(.*)/);
  if (!apiKeyMatch) throw new Error('No API key');

  const host = 'instagram-scraper-stable-api.p.rapidapi.com';
  const url = `https://${host}/get_ig_user_posts.php`;
  
  const searchParams = new URLSearchParams();
  searchParams.append('username_or_url', 'ji_sh_nu__naroth'); // using the username from the screenshot
  searchParams.append('amount', '3');

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'x-rapidapi-key': apiKeyMatch[1].trim(),
      'x-rapidapi-host': host,
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: searchParams.toString()
  });

  const data = await res.json();
  const firstPost = data.posts[0].node;
  console.log('clips_metadata:', JSON.stringify(firstPost.clips_metadata, null, 2));
  console.log('media_repost_count:', firstPost.media_repost_count);
  console.log('social_context:', firstPost.social_context);
}
test();
