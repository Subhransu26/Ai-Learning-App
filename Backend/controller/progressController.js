import Document from "../models/Document.js";
import Flashcard from "../models/Flashcard.js";
import Quiz from "../models/Quiz.js";

// @desc    Get user learning progress
// @route   GET /api/progress/dashboard
// @access  Private
export const getDashboard = async (req, res, next) => {
  try {
    const userId = req.user._id;

    // Get counts
    const totalDocuments = await Document.countDocuments({ userId });
    const totalFlashcardSets = await Flashcard.countDocuments({ userId });
    const totalQuizzes = await Quiz.countDocuments({ userId });
    const completedQuizzes = await Quiz.countDocuments({
      userId,
      completedAt: { $ne: null },
    });

    // Get Flashcard statistics
    const flashcardSets = await Flashcard.find({ userId });
    let totalFlashcards = 0;
    let reviewedFlashcards = 0;
    let starredFlashcards = 0;

    flashcardSets.forEach((set) => {
      totalFlashcards += set.cards.length;
      reviewedFlashcards += set.cards.filter((c) => c.reviewCount > 0).length;
      starredFlashcards += set.cards.filter((c) => c.isStarred).length;
    });

    // Get quiz statisics
    const quizzes = await Quiz.find({ userId, completedAt: { $ne: null } });
    const averageScore =
      quizzes.length > 0
        ? quizzes.reduce((sum, q) => sum + q.score, 0) / quizzes.length
        : 0;

    // Recent activity - recently accessed documents and quizzes
    const recentDocuments = await Document.find({ userId })
      .sort({
        lastAccessed: -1,
      })
      .limit(5)
      .select("title fileName lastAccessed status");

    const recentQuizzes = await Quiz.find({ userId })
      .sort({
        createdAt: -1,
      })
      .limit(5)
      .populate("documentId", "title")
      .select("title score totalQuestions completedAt");

    // ------------------------------------------------------------------------------------------------------
    /* Study streak (simplified - in production, track daily activity)
     here we check activity like:
        opened a document
        reviewed flashcard
        submitted quiz
        chatted with AI 
    */
    const docDates = recentDocuments.map((doc) =>
      new Date(doc.lastAccessed).toDateString(),
    );

    const quizDates = quizzes
      .filter((quiz) => quiz.completedAt)
      .map((quiz) => new Date(quiz.completedAt).toDateString());

    // Merge + remove duplicates and sort to latest first
    const uniqueDays = [...new Set([...docDates, ...quizDates])].sort(
      (a, b) => new Date(b) - new Date(a),
    );

    let studyStreak = 0;
    if (uniqueDays.length > 0) {
      studyStreak = 1; // first active day counts

      for (let i = 0; i < uniqueDays.length - 1; i++) {
        const today = new Date(uniqueDays[i]);
        const nextDay = new Date(uniqueDays[i + 1]);

        const diff = (today - nextDay) / (1000 * 60 * 60 * 24);

        if (diff === 1) {
          studyStreak++;
        } else {
          break;
        }
      }
    }

    // ------------------------------------------------------------------------------------------------------

    res.status(200).json({
      success: true,
      data: {
        overview: {
          totalDocuments,
          totalFlashcards,
          totalFlashcardSets,
          reviewedFlashcards,
          starredFlashcards,
          totalQuizzes,
          completedQuizzes,
          averageScore,
          studyStreak,
        },
        recentActivity: {
          documents: recentDocuments,
          quizzes: recentQuizzes,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};
