require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

async function testGemini() {
    console.log("Testing Gemini API Key...");
    if (!process.env.GEMINI_API_KEY) {
        console.error("No GEMINI_API_KEY found in .env");
        return;
    }
    try {
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
        const result = await model.generateContent("Hello, are you there?");
        console.log("Success! Response from Gemini:");
        console.log(result.response.text());
    } catch (error) {
        console.error("Error from Gemini API:", error.message);
    }
}

testGemini();
