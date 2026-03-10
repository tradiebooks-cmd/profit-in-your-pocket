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
        messages: [{ role: 'user', content: [
          { type: 'document', source: { type: 'base64', media_type: 'application/pdf', data: base64 } },
          { type: 'text', text: `You are a financial analyst for Tradie Books Australia. Analyse this report with these sections:\n\nExecutive Summary: 2-3 sentences overview.\n\nKey Findings: Most important numbers and trends in plain language.\n\nRisks & Concerns: Warning signs, cashflow issues, red flags.\n\nRecommendations: Practical actionable steps.\n\nConclusion: Plain-English wrap-up and #1 focus area.` }
        ]}],
      }),
    });
    const data = await response.json();
    if (data.error) return res.status(500).json({ error: data.error.message });
    const text = data.content.map((b) => b.text || '').join('\n');
    return res.status(200).json({ text });
  } catch (err) {
    return res.status(500).json({ error: err.message || 'Something went wrong' });
  }
}
