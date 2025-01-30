import { Request, Response } from "express";
import chatController from "../controller/chatController";
import { GoogleGenerativeAI } from "@google/generative-ai";

// Mocking GoogleGenerativeAI and its methods
jest.mock("@google/generative-ai", () => {
  return {
    GoogleGenerativeAI: jest.fn().mockImplementation(() => {
      return {
        getGenerativeModel: jest.fn().mockReturnValue({
          generateContent: jest.fn().mockResolvedValue({
            response: {
              text: jest.fn().mockReturnValue("Mocked response from Kelly"),
            },
          }),
        }),
      };
    }),
  };
});

describe("chatController", () => {
  let req: Partial<Request>;
  let res: Partial<Response>;

  beforeEach(() => {
    req = {
      body: {
        message: "What are the best surfing spots in Israel?",
      },
    };

    res = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis(),
    };
  });

  it("should return a response from Kelly when message is provided", async () => {
    await chatController.sendMessage(req as Request, res as Response);

    expect(GoogleGenerativeAI).toHaveBeenCalledWith(process.env.GEMINI_API_KEY);
    expect(res.json).toHaveBeenCalledWith({
      message: "Mocked response from Kelly",
    });
  });

  it("should return 500 if an error occurs", async () => {
    jest.spyOn(console, "error").mockImplementation(() => {}); // Suppress console error in test output
    const mockGenerateContent = jest
      .fn()
      .mockRejectedValue(new Error("Mocked error"));
    const mockGetGenerativeModel = jest
      .fn()
      .mockReturnValue({ generateContent: mockGenerateContent });

    // Update mock implementation
    (GoogleGenerativeAI as jest.Mock).mockImplementation(() => ({
      getGenerativeModel: mockGetGenerativeModel,
    }));

    await chatController.sendMessage(req as Request, res as Response);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: "Failed to send message" });
  });
});
