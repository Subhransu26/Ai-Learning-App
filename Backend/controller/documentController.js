import Document from "../models/Document.js";
import Flashcard from "../models/Flashcard.js";
import Quiz from "../models/Quiz.js";
import { extractTextFromPDF } from "../utils/pdfParser.js";
import { chunkText } from "../utils/textChunker.js";
import fs from "fs/promises";
import mongoose from "mongoose";

// @desc    Upload PDF document
// @route   POST /api/documents/upload
// @access  Private
export const uploadDocument = async (req, res, next) => {
  try {
    // Validate uploaded file
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: "No file uploaded. Please upload a PDF document.",
        statusCode: 400,
      });
    }

    const { title } = req.body;
    if (!title) {
      // Delete uploaded file if title is missing
      await fs.unlink(req.file.path);
      return res.status(400).json({
        success: false,
        error: "Document title is required.",
        statusCode: 400,
      });
    }

    // Construct the URL for the uploaded file
    const baseUrl = `http://localhost:${process.env.PORT || 8000}`;
    const fileUrl = `${baseUrl}/uploads/documents/${req.file.filename}`;

    // Create document record in database
    const document = await Document.create({
      userId: req.user._id,
      title,
      fileName: req.file.filename,
      filePath: fileUrl, // Store the URL instead of the file path
      fileSize: req.file.size,
      status: "processing",
    });

    // Process the PDF in background (in production, use a queue system like Bull)
    processPDF(document._id, req.file.path).catch((err) => {
      console.error("Error processing PDF:", err);
    });

    res.status(201).json({
      success: true,
      data: document,
      message:
        "Document uploaded successfully. Processing may take a few moments.",
      statusCode: 201,
    });
  } catch (error) {
    // Clean up file on error
    if (req.file) {
      await fs.unlink(req.file.path).catch(() => {});
    }
    next(error);
  }
};

// Helper function to process PDF and update document record
const processPDF = async (documentId, filePath) => {
  try {
    const { text } = await extractTextFromPDF(filePath);

    // create chunks
    const chunks = chunkText(text, 500, 50);

    // update document record with extracted text and chunks
    await Document.findByIdAndUpdate(documentId, {
      extractedText: text,
      chunks: chunks,
      status: "ready",
    });

    console.log(`Document ${documentId} processed successfully.`);
  } catch (error) {
    console.error(`Error processing document ${documentId}:`, error);
    await Document.findByIdAndUpdate(documentId, {
      status: "failed",
    });
  }
};

// @desc    Get all user documents
// @route   GET /api/documents
// @access  Private
export const getDocuments = async (req, res, next) => {
  try {
    const documents = await Document.aggregate([
      {
        $match: { userId: new mongoose.Types.ObjectId(req.user._id) },
      },
      {
        $lookup: {
          from: "flashcards",
          localField: "_id",
          foreignField: "documentId",
          as: "flashcards",
        },
      },
      {
        $lookup: {
          from: "quizzes",
          localField: "_id",
          foreignField: "documentId",
          as: "quizzes",
        },
      },
      {
        $addFields: {
          flashcardCount: { $size: "$flashcards" },
          quizCount: { $size: "$quizzes" },
        },
      },
      {
        $project: {
          extractedText: 0,
          chunks: 0,
          flashcards: 0,
          quizzes: 0,
        },
      },
      {
        $sort: { uploadDate: -1 },
      },
    ]);

    res.status(200).json({
      success: true,
      count: documents.length,
      data: documents,
      message: "Documents retrieved successfully.",
      statusCode: 200,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single document with chunks
// @route   GET /api/documents/:id
// @access  Private
export const getDocument = async (req, res, next) => {
  try {
    //Get document ID from params
    const document = await Document.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    // Check if document exists and belongs to user
    if (!document) {
      return res.status(404).json({
        success: false,
        error: "Document not found.",
        statusCode: 404,
      });
    }

    // Get Counts of associated flashcards and quizzes
    const flashcardCount = await Flashcard.countDocuments({
      documentId: document._id,
      userId: req.user._id,
    });
    const quizCount = await Quiz.countDocuments({
      documentId: document._id,
      userId: req.user._id,
    });

    // update last accessed date
    document.lastAccessed = Date.now();
    await document.save();

    // combine document data with counts
    const documentData = document.toObject();
    documentData.flashcardCount = flashcardCount;
    documentData.quizCount = quizCount;

    res.status(200).json({
      success: true,
      data: documentData,
      message: "Document retrieved successfully.",
      statusCode: 200,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete document
// @route   DELETE /api/documents/:id
// @access  Private
export const deleteDocument = async (req, res, next) => {
  try {
    // Get document ID from params
    const document = await Document.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    // Check if document exists and belongs to user
    if (!document) {
      return res.status(404).json({
        success: false,
        error: "Document not found.",
        statusCode: 404,
      });
    }

    // Delete file from filesystem
    await fs.unlink(`uploads/documents/${document.fileName}`).catch(() => {});

    // Delete document record from database
    await document.deleteOne();

    res.status(200).json({
      success: true,
      message: "Document deleted successfully.",
      statusCode: 200,
    });
  } catch (error) {
    next(error);
  }
};
