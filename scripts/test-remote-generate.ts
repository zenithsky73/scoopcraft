async function testRemoteGenerate() {
  console.log('Testing POST https://scoopcraft.vercel.app/api/generate ...');
  
  try {
    const res = await fetch('https://scoopcraft.vercel.app/api/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
      },
      body: JSON.stringify({
        mode: 'prompt',
        prompt: '5 tips keuangan untuk pemula di tahun 2026',
        tone: 'Informatif',
        style: 'BREAKING_NEWS',
        format: 'FEED_PORTRAIT',
        slides: 5,
      }),
    });

    console.log('Response Status:', res.status, res.statusText);
    const text = await res.text();
    console.log('Response Body:', text.slice(0, 1000));
  } catch (err) {
    console.error('Fetch Error:', err);
  }
}

testRemoteGenerate();
