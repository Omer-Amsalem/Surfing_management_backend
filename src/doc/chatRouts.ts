const chatPaths = {
    "/chat/message": {
      post: {
        summary: "Send a message to the AI chat assistant",
        description: "Sends a user's message to the Google Generative AI model (Gemini) and retrieves a response.",
        tags: ["Chat"],
        security: [{ bearerAuth: [] }], // Requires authentication
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  message: {
                    type: "string",
                    description: "The user's message to the AI assistant",
                    example: "What are the best surfing spots in Israel?",
                  },
                },
                required: ["message"],
              },
            },
          },
        },
        responses: {
          200: {
            description: "AI response received successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    message: {
                      type: "string",
                      description: "The AI-generated response",
                      example: "The best surfing spots in Israel include Hilton Beach, Bat Galim, and Herzliya.",
                    },
                  },
                },
              },
            },
          },
          400: { description: "Bad request - missing or invalid message" },
          401: { description: "Unauthorized - missing or invalid token" },
          500: { description: "Internal server error" },
        },
      },
    },
  };
  
  export default chatPaths;
  