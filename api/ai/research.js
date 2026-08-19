export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  if (!process.env.OPENAI_API_KEY) return res.status(503).json({ error: 'OPENAI_API_KEY is not configured' });
  try {
    const { product, context } = req.body || {};
    if (!product?.title) return res.status(400).json({ error: 'Product is required' });
    const prompt = `You are a marketplace product research analyst. Analyze ONLY the supplied dataset fields; never invent missing sales, review, competition or cost data. Return JSON with exactly these keys: summary (string), recommendation (string), risks (array of short strings), imagePlan (array of short strings), priceAdvice (string). Be practical for an Indian reseller. Product: ${JSON.stringify(product)}. Context: ${JSON.stringify(context || {})}. Explain why the opportunity score is high/medium/low, whether to TEST NOW/WATCH/AVOID, what to validate before buying stock, and what product-image composition would be stronger. Do not claim certainty or that reviews equal sales.`;
    const response = await fetch('https://api.openai.com/v1/responses', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${process.env.OPENAI_API_KEY}` },
      body: JSON.stringify({ model: process.env.OPENAI_MODEL || 'gpt-5.6-luna', input: prompt })
    });
    if (!response.ok) {
      const detail = await response.text();
      return res.status(502).json({ error: 'AI provider error', detail: detail.slice(0, 500) });
    }
    const data = await response.json();
    const text = data.output_text || '';
    let parsed;
    try { parsed = JSON.parse(text); } catch { parsed = { summary: text, recommendation: 'Review the supplied signals manually before ordering stock.', risks: ['AI response was not returned as structured JSON.'], imagePlan: ['Use a clear hero product image and supporting detail/lifestyle images.'], priceAdvice: 'Validate landed cost, fees and returns before choosing price.' }; }
    return res.status(200).json(parsed);
  } catch (error) {
    return res.status(500).json({ error: 'Unexpected server error', detail: error?.message || 'Unknown error' });
  }
}
