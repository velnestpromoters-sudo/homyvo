const Quota = require('../models/Quota');
const { GoogleGenerativeAI } = require('@google/generative-ai');

exports.askChatbot = async (req, res) => {
    try {
        const { messages, userMessage, language } = req.body;
        
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
        
        // Initialize Gemini API
        if (!process.env.GEMINI_API_KEY) {
            console.error("Missing GEMINI_API_KEY in environment variables.");
            return res.json({ 
                success: true, 
                reply: "I'm having trouble connecting to my brain right now. Please call us at +91 63692 69611." 
            });
        }
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

        const selectedLanguage = language === 'tamil' ? 'Tamil' : 'English';
        const systemPrompt = `You are the Homyvo Support Assistant. You answer questions strictly about the Homyvo rental platform in Tamil Nadu. Be highly concise (2-3 sentences max) and friendly.
You MUST reply strictly in ${selectedLanguage}. Do not reply in any other language.
Here is your knowledge base:
- Homyvo is a premium rental platform in Tamil Nadu connecting tenants directly with verified property owners with ZERO brokerage.
- We focus on PGs, Apartments, and Commercial Spaces.
- To search nearby, use the 'Nearest to Me' sort option and grant location access.
- Browsing is free. There is no brokerage. Contacting owners might require a small platform fee.
- Verified properties have a blue badge. Owners must submit trust verification documents.
- If a user asks something unrelated, inappropriate, or needing complex human help, kindly redirect them to call our support line at +91 63692 69611.`;

        // Combine into one large prompt string
        const historyText = messages && messages.length > 0 ? messages.join('\n') : '';
        const prompt = `${systemPrompt}\n\nChat History:\n${historyText}\n\nUser: ${userMessage}\nAssistant:`;

        const result = await model.generateContent(prompt);
        const botReply = result.response.text();
        
        // Increment Quota ON SUCCESS
        quota.used += 1;
        await quota.save();

        res.json({ success: true, reply: botReply });
    } catch (err) {
        console.error("Backend Chatbot Exception Error:", err);
        res.status(500).json({ success: false, message: "Chatbot error" });
    }
};
