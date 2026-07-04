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
  console.log('Available keys in post node:', Object.keys(firstPost));
  
  // Also log values for related keys
  console.log('view_count:', firstPost.view_count);
  console.log('play_count:', firstPost.play_count);
  console.log('like_count:', firstPost.like_count);
  console.log('comment_count:', firstPost.comment_count);
  console.log('share_count:', firstPost.share_count);
  console.log('reshare_count:', firstPost.reshare_count);
  console.log('save_count:', firstPost.save_count);
  console.log('saved_count:', firstPost.saved_count);
  console.log('bookmark_count:', firstPost.bookmark_count);
  console.log('repost_count:', firstPost.repost_count);
}
test();
