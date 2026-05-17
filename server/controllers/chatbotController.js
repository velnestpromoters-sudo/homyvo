const Quota = require('../models/Quota');

exports.askChatbot = async (req, res) => {
    try {
        const { messages, userMessage } = req.body;
        
        // Track Quota
        const today = new Date().toISOString().split('T')[0];
        let quota = await Quota.findOne({ type: 'gemini_daily', period: today });
        if (!quota) {
            quota = await Quota.create({ type: 'gemini_daily', period: today, used: 0 });
        }
        
        // Prevent if over 1500
        if (quota.used >= 1500) {
            return res.json({ 
                success: true, 
                reply: "Sorry, we have reached our maximum daily chatbot capacity. Please call us at +91 63692 69611." 
            });
        }
        
        // Hit Gemini API
        const systemPrompt = `You are the Homyvo Support Assistant. You answer questions strictly about the Homyvo rental platform in Tamil Nadu. Be highly concise (2-3 sentences max) and friendly. 
Here is your knowledge base:
- Homyvo is a premium rental platform in Tamil Nadu connecting tenants directly with verified property owners with ZERO brokerage.
- We focus on PGs, Apartments, and Commercial Spaces.
- To search nearby, use the 'Nearest to Me' sort option and grant location access.
- Browsing is free. There is no brokerage. Contacting owners might require a small platform fee.
- Verified properties have a blue badge. Owners must submit trust verification documents.
- If a user asks something unrelated, inappropriate, or needing complex human help, kindly redirect them to call our support line at +91 63692 69611.`;

        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{
                    parts: [
                        { text: systemPrompt },
                        ...messages.map(m => ({ text: m })),
                        { text: `User: ${userMessage}` }
                    ]
                }]
            })
        });

        const data = await response.json();
        
        // Increment Quota ON SUCCESS
        quota.used += 1;
        await quota.save();

        let botReply = "I'm having trouble connecting to my brain right now. Please call us at +91 63692 69611.";
        if (data.candidates && data.candidates[0].content.parts[0].text) {
            botReply = data.candidates[0].content.parts[0].text.replace(/^Assistant:\s*/i, '');
        }

        res.json({ success: true, reply: botReply });
    } catch (err) {
        console.error("Backend Chatbot Error:", err);
        res.status(500).json({ success: false, message: "Chatbot error" });
    }
};
