const Quota = require('../models/Quota');
const Property = require('../models/Property');
const { GoogleGenerativeAI } = require('@google/generative-ai');

function getDistance(lat1, lon1, lat2, lon2) {
    if (!lat1 || !lon1 || !lat2 || !lon2) return null;
    const R = 6371; // km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return Number((R * c).toFixed(1)); // 1 decimal place
}

exports.askChatbot = async (req, res) => {
    try {
        const { messages, userMessage, language, coordinates, locationName } = req.body;
        
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

        // Query active properties from DB
        const activeProps = await Property.find({ isActive: true }).select('title location.address location.area location.city location.coordinates rent deposit bhkType propertyType amenities furnishing availability');
        
        const propertiesContext = activeProps.map(p => {
            let distance = null;
            if (coordinates && coordinates.lat && coordinates.lng && p.location?.coordinates?.coordinates) {
                const pLng = p.location.coordinates.coordinates[0];
                const pLat = p.location.coordinates.coordinates[1];
                distance = getDistance(coordinates.lat, coordinates.lng, pLat, pLng);
            }
            
            return {
                id: p._id.toString(),
                title: p.title,
                address: p.location?.address,
                area: p.location?.area,
                city: p.location?.city,
                rent: p.rent,
                deposit: p.deposit,
                bhkType: p.bhkType,
                propertyType: p.propertyType,
                furnishing: p.furnishing,
                availability: p.availability,
                amenities: p.amenities ? p.amenities.join(', ') : '',
                distanceFromUserKm: distance
            };
        });

        const selectedLanguage = language === 'tamil' ? 'Tamil' : 'English';
        const systemPrompt = `You are the Homyvo Support Assistant, a friendly and highly conversational local rental assistant in Tamil Nadu.
You answer questions strictly about the Homyvo rental platform. Speak in a natural, live-chat conversational tone (warm local style for English, polite conversational style for Tamil).
You MUST reply strictly in ${selectedLanguage}. Do not reply in any other language.

Here is your knowledge base:
- Homyvo is a premium rental platform in Tamil Nadu connecting tenants directly with verified property owners with ZERO brokerage.
- We focus on PGs, Apartments, and Commercial Spaces.
- To search nearby, use the 'Nearest to Me' sort option and grant location access.
- Browsing is free. There is no brokerage. Contacting owners might require a small platform fee.
- Verified properties have a blue badge. Owners must submit trust verification documents.
- If a user asks something unrelated, inappropriate, or needing complex human help, kindly redirect them to call our support line at +91 63692 69611.

USER LOCATION CONTEXT:
${coordinates ? `The user is currently at coordinates: Lat ${coordinates.lat}, Lng ${coordinates.lng}.` : `User coordinates are not shared.`}
${locationName ? `The user's currently selected search area is: "${locationName}".` : `User has not selected a search area.`}

AVAILABLE PROPERTIES DATABASE:
Use this real-time list of available properties on Homyvo to answer recommendations queries:
${JSON.stringify(propertiesContext, null, 2)}

When recommending properties:
1. Always state the REASON for your recommendation clearly (e.g. proximity, budget match, BHK layout, amenities, or furnishing).
2. Actively match the user's location name (either locationName above or any location name mentioned by the user in the text, e.g. "Sitra", "Kalapatti", "Peelamedu", "Coimbatore") against property listings.
3. If user coordinates are known, prioritize suggesting properties with the smallest "distanceFromUserKm" and explicitly mention how far they are (e.g., "This home is only 1.2 km away from you...").
4. Provide the link to view the property details page using this exact format: [View Property](http://homyvo.com/property/[id]) where [id] is the property's real database ID from the database above (e.g. [View Property](http://homyvo.com/property/6a01502445a652aff6a3d7e1)).
5. Respond in a highly natural, engaging, and friendly live-chat manner (keep answers to 2-4 sentences max so it remains clean).`;

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
