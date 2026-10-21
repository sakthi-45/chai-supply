import { useEffect, useRef, useState } from 'react'

const DEFAULT_SUGGESTIONS = [
  '☕ Top wholesale tea blends',
  '🚚 Delivery schedule & areas',
  '💰 Bulk pricing & discounts',
  '📦 How to place an order',
  '🌿 Fresh spices & milk supply',
]

const KNOWLEDGE_RESPONSES = [
  {
    keywords: ['tea', 'assam', 'blend', 'ctc', 'leaf', 'dust', 'grade', 'variety'],
    answer: `☕ **ChaiSupply Tea Catalog**:
• **Assam CTC (BOPL & BP Grade)**: Strong liquor and rich golden color, perfect for high-volume commercial milk tea.
• **Premium Orthodox & Leaf**: Aromatic Darjeeling and Nilgiri tea for specialty cafes.
• **Masala Chai Premix & Dust**: Quick brewing, intense flavor, ideal for fast-paced tapris.
All teas are sourced directly from Assam and Dooars gardens in 25kg & 50kg wholesale bags.`,
  },
  {
    keywords: ['delivery', 'timing', 'schedule', 'morning', 'ship', 'time', 'area', 'track'],
    answer: `🚚 **Delivery Information**:
• **Early Morning Dispatch**: We deliver between **5:00 AM – 8:00 AM** daily, ensuring your kitchen is stocked before the morning tea rush!
• **Free Delivery**: On all wholesale orders above **₹1,500**. Standard delivery fee is ₹30 for smaller batches.
• **Coverage**: Serving all major local tea stalls, cafes, and restaurants with real-time order tracking.`,
  },
  {
    keywords: ['price', 'pricing', 'discount', 'bulk', 'wholesale', 'cost', 'rate', 'offer'],
    answer: `💰 **Wholesale Pricing & Tiers**:
• **Tier 1 (Daily)**: Transparent wholesale rates direct from verified growers.
• **Bulk Volume Discount**: Flat **5% OFF** on orders above ₹5,000 and **10% OFF** on monthly standing subscriptions.
• **Zero Middlemen**: Save 15–20% compared to local retail mandis. Check your Buyer Dashboard for active seasonal promotions!`,
  },
  {
    keywords: ['order', 'how to order', 'buy', 'cart', 'checkout', 'payment'],
    answer: `📦 **Placing an Order**:
1. Browse products from the **Explore / Marketplace** tab.
2. Select desired wholesale quantities and click **Add to Cart**.
3. Go to your Cart, verify delivery address, and proceed to checkout.
4. We support **UPI, Netbanking, Cards**, and verified **Cash on Delivery (COD)** for repeat vendors!`,
  },
  {
    keywords: ['spice', 'spices', 'cardamom', 'elaichi', 'ginger', 'adrak', 'clove', 'cinnamon', 'milk'],
    answer: `🌿 **Fresh Spices & Daily Dairy**:
• **Green Cardamom (Elaichi)**: 8mm bold green pods from Idukki, Kerala with intense aroma.
• **Sun-Dried Ginger (Sonth) & Fresh Adrak**: High pungency, thoroughly cleaned.
• **Cinnamon & Cloves**: Premium grade whole spices.
• **Fresh Milk & Dairy Whitener**: Daily fresh farm milk delivery and high-solids dairy whiteners.`,
  },
  {
    keywords: ['hi', 'hello', 'hey', 'help', 'start', 'namaste'],
    answer: `Namaste! 🙏 Welcome to ChaiSupply! I am your wholesale tea supply assistant. Ask me about our bulk tea varieties, morning delivery, live wholesale prices, or how to place your daily order.`,
  },
]

function getLocalBotReply(userText) {
  const normalized = userText.toLowerCase().trim()
  for (const item of KNOWLEDGE_RESPONSES) {
    if (item.keywords.some((kw) => normalized.includes(kw))) {
      return item.answer
    }
  }
  return `Thank you for your inquiry! ☕ 
ChaiSupply provides wholesale CTC teas, fresh spices, milk, and packaging with daily 5:00 AM delivery for tea shops. 
• Use the **Marketplace** to browse available inventory.
• Place orders before 9:00 PM for guaranteed next-morning delivery!
Is there a specific product (Assam CTC, Cardamom, Milk, Cups) you'd like pricing for?`
}

export function ChatBot() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      sender: 'bot',
      text: 'Namaste! 🙏 Welcome to ChaiSupply. I am your wholesale chai assistant. How can I help your tea stall or cafe today?',
      time: 'Just now',
    },
  ])
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [hasUnread, setHasUnread] = useState(false)
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

  useEffect(() => {
    if (isOpen) {
      setHasUnread(false)
      setTimeout(() => inputRef.current?.focus(), 150)
    }
  }, [isOpen])

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages, isTyping, isOpen])

  async function handleSend(textToSend) {
    const text = (textToSend || input).trim()
    if (!text || isTyping) return

    const now = new Date()
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

    const userMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text,
      time: timeStr,
    }

    setMessages((prev) => [...prev, userMessage])
    setInput('')
    setIsTyping(true)

    // Attempt to call backend /api/chat with smart fallback
    let botReply = ''
    try {
      const res = await fetch(`${API_URL}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text }),
      })
      if (res.ok) {
        const data = await res.json()
        if (data && data.reply) {
          botReply = data.reply
        }
      }
    } catch {
      // Backend offline or endpoint not yet configured — use local intelligence
    }

    if (!botReply) {
      // Use local ChaiSupply domain intelligence
      botReply = getLocalBotReply(text)
    }

    // Small natural delay for conversational feel
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          id: `bot-${Date.now()}`,
          sender: 'bot',
          text: botReply,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ])
      setIsTyping(false)
      if (!isOpen) {
        setHasUnread(true)
      }
    }, 600)
  }

  function handleReset() {
    setMessages([
      {
        id: 'welcome',
        sender: 'bot',
        text: 'Namaste! 🙏 Conversation reset. How can I help your tea shop today?',
        time: 'Just now',
      },
    ])
  }

  return (
    <aside aria-label="ChaiSupply Assistant" className="chai-chatbot-wrapper [position:fixed] [right:24px] [bottom:24px] [z-index:9999] [font-family:inherit]">
      {/* Floating Chat Window */}
      {isOpen && (
        <section
          aria-label="Chat dialogue window"
          className="[position:absolute] [right:0] [bottom:74px] [width:375px] [max-width:calc(100vw-36px)] [height:530px] [max-height:calc(100vh-110px)] [background:#ffffff] [border:1px_solid_#e8ded2] [border-radius:20px] [box-shadow:0_20px_50px_rgba(66,42,26,0.22),0_4px_16px_rgba(0,0,0,0.06)] [display:flex] [flex-direction:column] [overflow:hidden] [animation:fadeInUp_0.25s_ease-out]"
          style={{ transformOrigin: 'bottom right' }}
        >
          {/* Header */}
          <header className="[background:linear-gradient(135deg,#522d19_0%,#6f3e25_60%,#d9822b_100%)] [color:white] [padding:16px_18px] [display:flex] [align-items:center] [justify-content:space-between] [box-shadow:0_2px_10px_rgba(0,0,0,0.1)]">
            <div className="[display:flex] [align-items:center] [gap:11px]">
              <div className="[position:relative] [width:40px] [height:40px] [background:rgba(255,255,255,0.16)] [border:1px_solid_rgba(255,255,255,0.3)] [border-radius:12px] [display:flex] [align-items:center] [justify-content:center] [font-size:20px]">
                ☕
                <span className="[position:absolute] [bottom:-1px] [right:-1px] [width:10px] [height:10px] [background:#22c55e] [border:2px_solid_#522d19] [border-radius:50%]" />
              </div>
              <div>
                <div className="[font-size:14px] [font-weight:700] [line-height:1.2] [letter-spacing:-0.2px]">
                  ChaiSupply Assistant
                </div>
                <div className="[font-size:11px] [color:rgba(255,249,241,0.85)] [display:flex] [align-items:center] [gap:5px]">
                  <span className="[display:inline-block] [width:6px] [height:6px] [background:#4ade80] [border-radius:50%]" />
                  Online • Wholesale Guide
                </div>
              </div>
            </div>

            <div className="[display:flex] [align-items:center] [gap:4px]">
              <button
                aria-label="Restart chat"
                className="[background:none] [border:0] [color:rgba(255,255,255,0.8)] [cursor:pointer] [padding:6px] [border-radius:8px] [display:flex] [align-items:center] [justify-content:center] hover:[background:rgba(255,255,255,0.15)] hover:[color:white] [transition:all_0.15s]"
                onClick={handleReset}
                title="Restart chat"
                type="button"
              >
                <svg fill="none" height="15" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" width="15">
                  <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                  <path d="M3 3v5h5" />
                </svg>
              </button>

              <button
                aria-label="Close chat"
                className="[background:none] [border:0] [color:rgba(255,255,255,0.8)] [cursor:pointer] [padding:6px] [border-radius:8px] [display:flex] [align-items:center] [justify-content:center] hover:[background:rgba(255,255,255,0.15)] hover:[color:white] [transition:all_0.15s]"
                onClick={() => setIsOpen(false)}
                title="Close chat"
                type="button"
              >
                <svg fill="none" height="17" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" viewBox="0 0 24 24" width="17">
                  <line x1="18" x2="6" y1="6" y2="18" />
                  <line x1="6" x2="18" y1="6" y2="18" />
                </svg>
              </button>
            </div>
          </header>

          {/* Quick Suggestion Chips */}
          <div className="[background:#fffdf9] [border-bottom:1px_solid_#f0e8de] [padding:8px_12px] [display:flex] [gap:6px] [overflow-x:auto] [scrollbar-width:none]">
            {DEFAULT_SUGGESTIONS.map((chip) => (
              <button
                className="[white-space:nowrap] [flex-shrink:0] [background:#fff] [border:1px_solid_#e7ddd1] [color:#6f3e25] [padding:5px_10px] [border-radius:14px] [font-size:11px] [font-weight:600] [cursor:pointer] hover:[background:#f8f2eb] hover:[border-color:#d9822b] [transition:all_0.15s]"
                key={chip}
                onClick={() => handleSend(chip.replace(/^[^\w]+/, ''))}
                type="button"
              >
                {chip}
              </button>
            ))}
          </div>

          {/* Chat Messages Log */}
          <div className="[flex:1] [overflow-y:auto] [padding:16px_14px] [display:flex] [flex-direction:column] [gap:12px] [background:#fff9f1]/40">
            {messages.map((m) => {
              const isUser = m.sender === 'user'
              return (
                <div
                  className={`[display:flex] [flex-direction:column] ${
                    isUser ? '[align-items:flex-end]' : '[align-items:flex-start]'
                  }`}
                  key={m.id}
                >
                  <div
                    className={`[max-width:85%] [padding:10px_14px] [border-radius:15px] [font-size:12.5px] [line-height:1.45] [box-shadow:0_1px_4px_rgba(66,42,26,0.06)] [white-space:pre-wrap] ${
                      isUser
                        ? '[background:linear-gradient(135deg,#6f3e25,#522d19)] [color:white] [border-bottom-right-radius:4px]'
                        : '[background:#ffffff] [color:#252525] [border:1px_solid_#e8ded2] [border-bottom-left-radius:4px]'
                    }`}
                  >
                    {m.text}
                  </div>
                  <span className="[font-size:10px] [color:#9c958f] [margin-top:3px] [padding:0_4px]">
                    {m.time}
                  </span>
                </div>
              )
            })}

            {isTyping && (
              <div className="[display:flex] [align-items:center] [gap:8px] [padding:8px_12px] [background:#ffffff] [border:1px_solid_#e8ded2] [border-radius:14px] [border-bottom-left-radius:4px] [width:fit-content] [box-shadow:0_1px_4px_rgba(66,42,26,0.06)]">
                <span className="[font-size:11px] [color:#6f3e25] [font-weight:600]">Assistant typing</span>
                <span className="[display:flex] [gap:3px]">
                  <span className="[width:5px] [height:5px] [background:#d9822b] [border-radius:50%] [animation:pulseDot_1s_infinite]" />
                  <span className="[width:5px] [height:5px] [background:#d9822b] [border-radius:50%] [animation:pulseDot_1s_0.2s_infinite]" />
                  <span className="[width:5px] [height:5px] [background:#d9822b] [border-radius:50%] [animation:pulseDot_1s_0.4s_infinite]" />
                </span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Footer */}
          <footer className="[background:#ffffff] [border-top:1px_solid_#e8ded2] [padding:10px_12px]">
            <form
              className="[display:flex] [align-items:center] [gap:8px]"
              onSubmit={(e) => {
                e.preventDefault()
                handleSend()
              }}
            >
              <input
                className="[flex:1] [height:38px] [padding:0_14px] [border:1px_solid_#e8ded2] [border-radius:20px] [font-size:12.5px] [outline:none] [background:#fcfaf7] focus:[background:#ffffff] focus:[border-color:#d9822b] [color:#252525] [transition:all_0.15s]"
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about tea, prices, delivery..."
                ref={inputRef}
                type="text"
                value={input}
              />
              <button
                aria-label="Send message"
                className={`[width:38px] [height:38px] [border-radius:50%] [border:0] [display:flex] [align-items:center] [justify-content:center] [transition:all_0.15s] ${
                  input.trim() && !isTyping
                    ? '[background:linear-gradient(135deg,#6f3e25,#d9822b)] [color:white] [cursor:pointer] hover:[opacity:0.9] hover:[transform:scale(1.04)]'
                    : '[background:#e9dfd4] [color:#9e9285] [cursor:not-allowed]'
                }`}
                disabled={!input.trim() || isTyping}
                type="submit"
              >
                <svg fill="currentColor" height="15" viewBox="0 0 24 24" width="15">
                  <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
                </svg>
              </button>
            </form>
            <div className="[font-size:10px] [color:#a8a199] [text-align:center] [margin-top:6px]">
              ChaiSupply Wholesale AI • Fast Early-Morning Delivery
            </div>
          </footer>
        </section>
      )}

      {/* Floating Toggle Button */}
      <button
        aria-label={isOpen ? 'Close ChaiSupply chat' : 'Open ChaiSupply wholesale chat'}
        className="[position:relative] [height:52px] [padding:0_18px] [border-radius:26px] [border:0] [background:linear-gradient(135deg,#522d19_0%,#6f3e25_55%,#d9822b_100%)] [color:white] [box-shadow:0_8px_25px_rgba(66,42,26,0.35),0_2px_8px_rgba(0,0,0,0.12)] [cursor:pointer] [display:flex] [align-items:center] [gap:9px] [font-weight:700] [font-size:13px] hover:[transform:translateY(-2px)] hover:[box-shadow:0_12px_30px_rgba(66,42,26,0.42)] [transition:all_0.2s_ease-out]"
        onClick={() => setIsOpen((prev) => !prev)}
        type="button"
      >
        <span className="[display:flex] [align-items:center] [justify-content:center] [font-size:18px]">
          {isOpen ? (
            <svg fill="none" height="18" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" viewBox="0 0 24 24" width="18">
              <line x1="18" x2="6" y1="6" y2="18" />
              <line x1="6" x2="18" y1="6" y2="18" />
            </svg>
          ) : (
            '☕'
          )}
        </span>
        <span>{isOpen ? 'Close' : 'Chai Assistant'}</span>

        {/* Unread dot */}
        {hasUnread && !isOpen && (
          <span className="[position:absolute] [top:-3px] [right:-3px] [width:12px] [height:12px] [background:#ef4444] [border:2px_solid_white] [border-radius:50%] [animation:ping_1.5s_cubic-bezier(0,0,0.2,1)_infinite]" />
        )}
      </button>

      {/* Keyframe helpers */}
      <style>{`
        @keyframes pulseDot {
          0%, 100% { transform: scale(0.8); opacity: 0.5; }
          50% { transform: scale(1.3); opacity: 1; }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(14px) scale(0.97); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </aside>
  )
}

export default ChatBot
