const { GoogleGenAI } = require('@google/genai');

const CHAI_SYSTEM_PROMPT = `You are the friendly, helpful AI wholesale assistant for "ChaiSupply" (ChaiSupply.com).
ChaiSupply is a specialized B2B marketplace supplying tea stall owners, chai tapris, cafes, and restaurants with wholesale ingredients and supplies.

Catalog & Key Facts:
1. Teas: Assam CTC (BOPL, BP, Dust grades) in 25kg & 50kg bags; Darjeeling leaf; Specialty Masala Chai Premix.
2. Spices: 8mm Bold Green Cardamom (Elaichi), Sun-dried Ginger (Sonth), Whole Cinnamon, Cloves, Black Pepper.
3. Dairy: Daily fresh farm milk delivery and high-solids Dairy Whiteners.
4. Sweeteners: Sulphur-free granulated sugar, Organic Jaggery (Gur) powder.
5. Packaging: Clay Kulhads, 150ml ripple hot tea paper cups, stirrers.
6. Delivery: Daily early-morning delivery between 5:00 AM – 8:00 AM so shops are ready before the morning rush. Free delivery above ₹1,500.
7. Discounts: 5% off on orders above ₹5,000; 10% off on standing monthly subscriptions.

Guidelines:
- Keep answers concise, polite, and helpful (2 to 4 sentences).
- Use clear bullet points if listing options.
- If greeting, use "Namaste! 🙏".`;

const FALLBACK_ANSWERS = [
  {
    keywords: ['tea', 'assam', 'blend', 'ctc', 'leaf', 'dust', 'grade'],
    answer: "ChaiSupply offers Assam CTC (BOPL & BP grades) in 25kg & 50kg wholesale bags with rich liquor and strong aroma. Check our Marketplace tab for live stock and bulk rates!",
  },
  {
    keywords: ['delivery', 'time', 'timing', 'morning', 'schedule', 'when'],
    answer: "We deliver every morning between 5:00 AM – 8:00 AM before the morning rush! Delivery is FREE on orders above ₹1,500.",
  },
  {
    keywords: ['price', 'pricing', 'discount', 'bulk', 'rate', 'cost'],
    answer: "Our rates are direct-from-origin wholesale prices. You get 5% OFF on orders over ₹5,000, and 10% OFF with a monthly standing subscription.",
  },
  {
    keywords: ['order', 'buy', 'place', 'cart', 'checkout'],
    answer: "To order, browse products in the Marketplace, add items to your cart, and checkout with UPI, Netbanking, Cards, or COD for verified buyers.",
  },
  {
    keywords: ['spice', 'cardamom', 'elaichi', 'ginger', 'adrak', 'milk'],
    answer: "We supply 8mm bold green cardamom, premium dry ginger (sonth), whole cloves, cinnamon, and daily fresh morning milk for tea shops.",
  },
  {
    keywords: ['hi', 'hello', 'hey', 'namaste'],
    answer: "Namaste! 🙏 Welcome to ChaiSupply. I'm here to assist with your wholesale tea and daily supplies. How can I help you today?",
  },
];

function getRuleBasedReply(text) {
  const normalized = (text || '').toLowerCase().trim();
  for (const item of FALLBACK_ANSWERS) {
    if (item.keywords.some((kw) => normalized.includes(kw))) {
      return item.answer;
    }
  }
  return "ChaiSupply is your dedicated wholesale partner for tea, milk, spices, and cups with 5:00 AM morning delivery. How can I assist your order today?";
}

async function handleChat(req, res) {
  try {
    const { message } = req.body || {};
    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'Message text is required' });
    }

    const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;

    // If Gemini API key is configured, use Google GenAI SDK
    if (apiKey) {
      try {
        const ai = new GoogleGenAI({ apiKey });
        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: [
            { role: 'user', parts: [{ text: `${CHAI_SYSTEM_PROMPT}\n\nUser Question: ${message}` }] },
          ],
        });

        const reply = response.text ? response.text.trim() : null;
        if (reply) {
          return res.json({ reply });
        }
      } catch (geminiErr) {
        console.warn('Gemini API call failed, falling back to local domain intelligence:', geminiErr.message);
      }
    }

    // Fallback: smart domain responder
    const reply = getRuleBasedReply(message);
    return res.json({ reply });
  } catch (err) {
    console.error('Chatbot handler error:', err);
    return res.status(500).json({ error: 'Internal chatbot error', reply: getRuleBasedReply('') });
  }
}

module.exports = { handleChat };
