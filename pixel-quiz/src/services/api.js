import axios from 'axios';

const API_URL = import.meta.env.VITE_GOOGLE_APP_SCRIPT_URL;
const QUESTION_COUNT = parseInt(import.meta.env.VITE_QUESTION_COUNT || '5', 10);

// Mock Data for development when no API_URL is present or for testing
const MOCK_QUESTIONS = [
  {
    id: 1,
    question: "What is the capital of 8-bit?",
    options: {
      A: "Byte City",
      B: "Pixel Town",
      C: "Sprite Village",
      D: "Vector Valley"
    }
  },
  {
    id: 2,
    question: "Which color is #FF0000?",
    options: {
      A: "Blue",
      B: "Green",
      C: "Red",
      D: "Yellow"
    }
  },
  {
    id: 3,
    question: "Who is the most famous plumber?",
    options: {
      A: "Luigi",
      B: "Wario",
      C: "Mario",
      D: "Toad"
    }
  },
  {
    id: 4,
    question: "What does NES stand for?",
    options: {
      A: "New Entertainment System",
      B: "Nintendo Entertainment System",
      C: "Nice Electro Sound",
      D: "Never Ending Story"
    }
  },
  {
    id: 5,
    question: "1 Byte equals how many bits?",
    options: {
      A: "4",
      B: "8",
      C: "16",
      D: "32"
    }
  }
];

export const fetchQuestions = async (userId) => {
  if (!API_URL || API_URL.includes("YOUR_SCRIPT_ID")) {
    console.warn("Using MOCK QUESTIONS (No API URL configured)");
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 800));
    // Return random subset of mock questions if needed, or just all
    return MOCK_QUESTIONS.slice(0, QUESTION_COUNT);
  }

  try {
    const response = await axios.get(`${API_URL}`, {
      params: {
        action: 'getQuestions',
        userId: userId,
        count: QUESTION_COUNT
      }
    });

    if (response.data && response.data.error) {
       throw new Error(response.data.error);
    }
    
    return response.data.questions;
  } catch (error) {
    console.error("Error fetching questions:", error);
    throw error;
  }
};

export const submitResult = async (resultData) => {
  if (!API_URL || API_URL.includes("YOUR_SCRIPT_ID")) {
    console.log("Mock Submit Results:", resultData);
    await new Promise(resolve => setTimeout(resolve, 500));
    return { success: true, message: "Mock saved" };
  }

  try {
    // Google Apps Script Web App usually handles POST requests, 
    // but sometimes requires `application/x-www-form-urlencoded` or pure JSON text 
    // with `Content-Type: text/plain` to avoid CORS preflight options issues if not handled correctly.
    // We'll try standard post first.
    
    // NOTE: GAS Web Apps often need "no-cors" or text/plain content type to work easily from browser,
    // but axios JSON usually works if the GAS script defines doOptions().
    // For simplicity/robustness with typical GAS setups, sending as text payload is often safer.
    
    const response = await axios.post(API_URL, resultData, {
       headers: {
        'Content-Type': 'text/plain' // Often necessary for GAS to skip CORS Preflight strictness
       }
    });
    
    return response.data;
  } catch (error) {
    console.error("Error submitting result:", error);
    throw error;
  }
};
