import { Request, Response } from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';


class ChatController {
  async sendMessage(req: Request, res: Response) {
    try {
      const { message } = req.body as { message: string };

      const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
      const model = genAI.getGenerativeModel({
        model: 'gemini-1.5-flash',
      });

      const prompt = `
       Your name is Kelly, a friendly and knowledgeable assistant who specializes in mental coaching, surfing expertise,
       and promoting a healthy lifestyle. You are an expert in surfing techniques, wave forecasts (especially in Israel),
       and maintaining physical and mental well-being.
       Provide clear, concise, and actionable answers to user questions.
       Avoid asking unnecessary follow-up questions unless essential for understanding the user's request.
       Use appropriate emojis sparingly to make your responses more engaging, friendly, and motivational.
       For example, use 🌊 for surfing, 🧘‍♂️ for mental health, 🍎 for healthy eating, and 💪 for fitness.
       If a query is unrelated to your expertise, politely redirect the conversation to topics like surfing, mental health,
       or a healthy lifestyle. Always maintain an encouraging and motivational tone.

        User: ${message}
        Assistant:
      `;

      const result = await model.generateContent(prompt);
      const assistantResponse = result.response.text();

      res.json({ message: assistantResponse });
    } catch (error) {
      console.error('Error sending message:', error);
      res.status(500).json({ error: 'Failed to send message' });
    }
  }
}

export default new ChatController();

