export const config = {
  api: {
    bodyParser: {
      sizeLimit: '20mb',
    },
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { base64, filename } = req.body;

  if (!base64) {
    return res.status(400).json({ error: 'No file provided' });
  }

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY || '',
        console.log('KEY EXISTS:', !!process.env.ANTHROPIC_API_KEY);
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1500,
        messages: [{
          role: 'user',
          content: [
            {
              type: 'document',
              source: {
                type: 'base64',
                media_type: 'application/pdf',
                data: base64,
              },
            },
            {
              type: 'text',
              text: `You are a financial analyst for Tradie Books Australia, helping tradies (tradespeople) understand their business finances. Analyse this report and respond with clearly labelled sections:

Executive Summary: 2-3 sentences — what is this report about and what does it show overall?

Key Findings: The most important numbers, trends, or results (use plain language a tradie would understand).

Risks & Concerns: Any warning signs, cashflow issues, cost blowouts, or red flags.

Recommendations: Practical, actionable steps this tradie should take based on what you found.

Conclusion: A plain-English wrap-up — are they on track, and what's the #1 thing they should focus on?

Keep it direct, practical, and jargon-free. Speak like a trusted advisor to a small business owner.`,
            },
          ],
        }],
      }),
    });

    const data = await response.json();

    if (data.error) {
      return res.status(500).json({ error: data.error.message });
    }

    const text = data.content.map((b) => b.text || '').join('\n');
    return res.status(200).json({ text });

  } catch (err) {
    return res.status(500).json({ error: err.message || 'Something went wrong' });
  }
}
