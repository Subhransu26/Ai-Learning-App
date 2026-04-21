import Document from "../models/Document.js";
import Flashcard from "../models/Flashcard.js";
import Quiz from "../models/Quiz.js";
import ChatHistory from "../models/ChatHistory.js";

import * as geminiService from "../utils/geminiService.js";
import { findRelevantChunks } from "../utils/textChunker.js";

// @desc: Generate FlashCards from document
// @route: POST /api/ai/generate-flashcards
// @access: Private
export const generateFlashcards = async (req, res, next) => {
  try {
    const { documentId, count = 10 } = req.body;

    if (!documentId) {
      return res.status(400).json({
        success: false,
        error: "Document ID is required",
        statusCode: 400,
      });
    }

    const document = await Document.findOne({
      _id: documentId,
      userId: req.user._id,
      status: "ready",
    });

    if (!document) {
      return res.status(404).json({
        success: false,
        error: "Document not found or not ready",
        statusCode: 404,
      });
    }

    // Generate flashcards using Gemini
    const cards = await geminiService.generateFlashcards(
      document.extractedText,
      parseInt(count),
    );

    // save flashcards to database
    const flashcardSet = await Flashcard.create({
      userId: req.user._id,
      documentId: document._id,
      cards: cards.map((card) => ({
        question: card.question,
        answer: card.answer,
        difficulty: card.difficulty,
        reviewCount: 0,
        isStarred: false,  //means marked as important / favorite
      })),
    });

    return res.status(201).json({
      success: true,
      data: flashcardSet,
      message: "Flashcards generated successfully",
      statusCode: 201,
    });
  } catch (error) {
    next(error);
  }
};

// @desc: Generate Quiz from document
// @route: POST /api/ai/generate-quiz
// @access: Private
export const generateQuiz = async (req, res, next) => {
  try {
  } catch (error) {
    next(error);
  }
};

// @desc: Generate Summary from document
// @route: POST /api/ai/generate-summary
// @access: Private
export const generateSummary = async (req, res, next) => {
  try {
  } catch (error) {
    next(error);
  }
};

// @desc: Chat with AI about document
// @route: POST /api/ai/chat
// @access: Private
export const chat = async (req, res, next) => {
  try {
  } catch (error) {
    next(error);
  }
};

// @desc: Explain concept from document
// @route: POST /api/ai/explain-concept
// @access: Private
export const explainConcept = async (req, res, next) => {
  try {
  } catch (error) {
    next(error);
  }
};

// @desc: Get chat history for document
// @route: GET /api/ai/chat-history/:documentId
// @access: Private
export const getChatHistory = async (req, res, next) => {
  try {
  } catch (error) {
    next(error);
  }
};
