import React, { useState, useEffect } from "react";
import {
  Plus,
  ChevronLeft,
  ChevronRight,
  Trash2,
  ArrowLeft,
  Sparkles,
  Brain,
} from "lucide-react";

import toast from "react-hot-toast";
import moment from "moment";

import flashcardService from "../../services/flashcardService";
import aiService from "../../services/aiService";
import Spinner from "../common/Spinner";
import Modal from "../common/Modal";
import Flashcard from "./Flashcard";

const FlashcardManager = ({ documentId }) => {

    const [flashcardSets, setFlashcardSets] = useState([]);
    const [selectedSet, setSelectedSet] = useState(null);

    const [loading, setLoading] = useState(true);
    const [generating, setGenerating] = useState(false);

    const [currentCardIndex, setCurrentCardIndex] = useState(0);

    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [setToDelete, setSetToDelete] = useState(null);

    const fetchFlashcardSets = async () => {
      setLoading(true);
      try {
        const response = await flashcardService.getFlashcardsForDocument(documentId);

        setFlashcardSets(response.data);
      } catch (error) {
        toast.error("Failed to fetch flashcard sets.");
        console.error(error);
      } finally{
        setLoading(false);
      }
    };

    useEffect(()=>{
        if(documentId){
            fetchFlashcardSets();
        }
    },[documentId]);

    const handleGenerateFlashcards = async () => {
        setGenerating(true);
    }
  return <div>FlashcardManager</div>;
};

export default FlashcardManager;
