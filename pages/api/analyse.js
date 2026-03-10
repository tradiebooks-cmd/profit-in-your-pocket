export const config = {
  api: { bodyParser: { sizeLimit: '20mb' } },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const { base64 } = req.body;
  if (!base64) return res.status(400).json({ error: 'No file provided' });
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'API key not configured' });

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 1500,
        messages: [{
          role: 'user',
          content: [
            {
              type: 'document',
              source: { type: 'base64', media_type: 'application/pdf', data: base64 },
            },
            {
              type: 'text',
              text: `You are a financial analyst for Tradie Books Australia. Analyse this report and respond using EXACTLY this format with these exact markers:

[SUMMARY]
Write 2-3 sentences overview of what this report is about and what it shows overall.

[FINDINGS]
List the most important numbers and trends in plain language a tradie would understand.

[RISKS]
List any warning signs, cashflow issues, cost blowouts, or red flags.

[RECOMMENDATIONS]
List practical actionable steps this tradie should take.

[CONCLUSION]
Write a plain-English wrap-up and the #1 thing they should focus on.

Use ONLY these exact markers. Keep it direct and jargon-free.`,
            },
          ],
        }],
      }),
    });

    const data = await response.json();
    if (data.error) return res.status(500).json({ error: data.error.message });
    const text = data.content.map((b) => b.text || '').join('\n');

    // Parse using exact markers
    const sections = [];
    const markers = [
      { key: '[SUMMARY]', label: 'Executive Summary' },
      { key: '[FINDINGS]', label: 'Key Findings' },
      { key: '[RISKS]', label: 'Risks & Concerns' },
      { key: '[RECOMMENDATIONS]', label: 'Recommendations' },
      { key: '[CONCLUSION]', label: 'Conclusion' },
    ];

    for (let i = 0; i < markers.length; i++) {
      const start = text.indexOf(markers[i].key);
      if (start === -1) continue;
      const contentStart = start + markers[i].key.length;
      const end = i + 1 < markers.length ? text.indexOf(markers[i + 1].key) : text.length;
      const content = text.slice(contentStart, end !== -1 ? end : text.length).trim();
      if (content) sections.push({ label: markers[i].label, content });
    }

    if (sections.length === 0) {
      sections.push({ label: 'Analysis', content: text.trim() });
    }

    return res.status(200).json({ sections });

  } catch (err) {
    return res.status(500).json({ error: err.message || 'Something went wrong' });
  }
}
