import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../modules/Navbar";
import ClubCard from "../modules/ClubCard";

const tagCategories = {
  "Academic & Professional": [
    "Academic",
    "Pre-Professional",
    "Education",
    "Research",
    "Technology",
    "Entrepreneurship",
    "Engineering",
  ],
  "Arts & Performance": [
    "Performing Arts",
    "Music",
    "Visual Arts",
    "Literary Arts",
    "Media / Publication",
    "Arts",
  ],
  "Cultural & Identity": [
    "Cultural",
    "International Student",
    "Religious / Spiritual",
    "LGBTQ+",
    "Gender-Based",
    "Diversity & Inclusion",
    "Gender and Sexuality",
  ],
  "Service & Activism": [
    "Community Service / Volunteering",
    "Activism/Advocacy",
    "Political",
    "Fundraising / Philanthropy",
  ],
  "Sports & Recreation": [
    "Club Sports",
    "Intramural Sports",
    "Recreational",
    "Athletics and Outdoors",
  ],
  "Hobbies & Interests": [
    "Hobby",
    "Gaming",
    "Food / Cooking",
    "Food",
    "Games and Puzzles",
  ],
  "Social": ["Greek Life"],
  "Other": [],
};

const membershipProcesses = [
  "Open Membership",
  "Tryout Required",
  "Audition Required",
  "Application Required",
  "Application and Interview Required",
  "Invite-only",
];

const recruitingCycles = ["Open", "Fall Semester", "Spring Semester", "IAP"];

const baseQuestions = {
  category: {
    id: "category",
    question: "Which general club categories interest you?",
    options: Object.keys(tagCategories),
  },
  tags: {
    id: "tags", 
    question: "Which specific interests appeal to you?",
    options: [],
  },
  membership: {
    id: "membership",
    question: "What types of membership processes are you open to?",
    options: membershipProcesses,
  },
  recruiting: {
    id: "recruiting",
    question: "Which recruiting cycles work for you?",
    options: recruitingCycles,
  },
};

export default function InterestSurvey() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({ category: [], tags: [], membership: [], recruiting: [] });
  const [displayedQuestions, setDisplayedQuestions] = useState([
    baseQuestions.category, 
    baseQuestions.tags, // Placeholder for potential tags step
    baseQuestions.membership, 
    baseQuestions.recruiting
  ]); 
  const [completed, setCompleted] = useState(false);
  const [fadeOut, setFadeOut] = useState(false);
  const [transitioning, setTransitioning] = useState(false);

  const handleSelect = (option) => {
    const currentQuestionId = displayedQuestions[step].id;
    setAnswers(prevAnswers => {
      const currentSelections = prevAnswers[currentQuestionId] || [];
      let newSelections;
      if (currentSelections.includes(option)) {
        newSelections = currentSelections.filter(item => item !== option);
      } else {
        newSelections = [...currentSelections, option];
      }
      return { ...prevAnswers, [currentQuestionId]: newSelections };
    });
  };

  const handleNextStep = () => {
    if (transitioning) return;

    setFadeOut(true);
    setTransitioning(true);

    const currentQuestionId = displayedQuestions[step].id;
    let nextStep = step + 1;
    let currentQuestions = [...displayedQuestions]; // Use current displayed questions

    if (currentQuestionId === 'category') {
      const selectedCategories = answers.category;
      const specificTags = [...
        new Set(
          selectedCategories.flatMap(cat => tagCategories[cat] || [])
        )
      ];

      // Find the index of the placeholder tags question
      const tagsQuestionIndex = currentQuestions.findIndex(q => q.id === 'tags');

      if (specificTags.length > 0) {
        // Tags exist: Update the placeholder tags question with actual options
        if (tagsQuestionIndex !== -1) {
          currentQuestions[tagsQuestionIndex] = { ...baseQuestions.tags, options: specificTags };
        }
        // Ensure tags step wasn't previously removed if user goes back and changes category
        else if (tagsQuestionIndex === -1) { 
           const tagsQuestion = { ...baseQuestions.tags, options: specificTags };
           currentQuestions.splice(1, 0, tagsQuestion); // Insert tags question at index 1
        }
      } else {
        // No tags: Remove the placeholder tags question if it exists
        if (tagsQuestionIndex !== -1) {
          currentQuestions.splice(tagsQuestionIndex, 1);
        }
      }
      // Update the state with the potentially modified question list
      // This modification happens *before* the timeout, 
      // so the length check in the timeout uses the correct list
      setDisplayedQuestions(currentQuestions); 
    }

    // --- Timeout for transition ---
    setTimeout(() => {
      // Check completion against the potentially modified length
      if (nextStep < currentQuestions.length) { 
        setStep(nextStep);
      } else {
        // If nextStep is out of bounds, we are done.
        setCompleted(true); 
      }
      setFadeOut(false);
      setTimeout(() => setTransitioning(false), 50);
    }, 300); 
  };

  // get the current question based on the dynamic state
  const currentQuestion = displayedQuestions[step];

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      <Navbar />
      <div className="flex-grow flex flex-col items-center p-6">
        <div className="w-full max-w-4xl flex flex-col h-full">
          <h1 className="text-2xl font-bold text-center mb-6 text-gray-800 flex-shrink-0">
            Get Club Recommendations
          </h1>
          
          <div className={`flex flex-col flex-grow transition-opacity duration-300 ${fadeOut ? 'opacity-0' : 'opacity-100'}`}>
            {!completed ? (
              <div className="flex flex-col h-full mb-4">
                <div className="flex mb-6 flex-shrink-0">
                  {displayedQuestions.map((_, index) => (
                    <div 
                      key={index} 
                      className={`h-2 flex-1 mx-1 rounded-full ${index <= step ? 'bg-brand-blue' : 'bg-gray-200'} transition-all duration-500`}
                    />
                  ))}
                </div>
                
                <h2 className="text-xl font-semibold mb-5 text-center text-gray-700 flex-shrink-0">{currentQuestion.question}</h2>
                
                <div className="flex-grow overflow-y-auto pr-2">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {currentQuestion.options.map((option) => {
                      const isChecked = answers[currentQuestion.id]?.includes(option) || false;
                      return (
                        <label 
                          key={option} 
                          className={`flex items-center w-full py-3 px-4 rounded-lg border transition-all duration-200 cursor-pointer ${isChecked ? 'bg-brand-blue/10 border-brand-blue-dark text-brand-blue-dark' : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100 hover:border-gray-300'}`}
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => handleSelect(option)}
                            className="h-4 w-4 rounded text-brand-blue focus:ring-brand-blue mr-3 border-gray-300"
                            disabled={transitioning}
                          />
                          <span className="font-medium">{option}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>

                <div className="text-center mt-6 flex-shrink-0">
                  <button
                    onClick={handleNextStep}
                    className="px-8 py-2 bg-brand-blue text-white rounded-lg hover:bg-brand-blue-dark transition-colors font-semibold disabled:opacity-50"
                    disabled={transitioning || answers[currentQuestion.id]?.length === 0}
                  >
                    {step < displayedQuestions.length - 1 ? 'Next' : 'See Results'} 
                  </button>
                </div>

              </div>
            ) : (
              <div className="text-center flex flex-col h-full">
                <h2 className="text-xl font-semibold mb-6 text-gray-700 flex-shrink-0">Based on your preferences, check these out!</h2>
    
                <div className="flex-grow grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6 overflow-y-auto pr-2">
                  {[1, 2, 3, 4, 5, 6].map((_, index) => (
                    <ClubCard
                      key={`placeholder-${index}`}
                      id={index}
                      name={`Recommended Club ${index + 1}`}
                      tags="Placeholder, Tag"
                      isAccepting={true}
                      description="This is a placeholder description based on survey results."
                      recruitmentProcess="Placeholder Process"
                      isSavedInitially={false}
                    />
                  ))}
                </div>
                
                <div className="flex-shrink-0 mt-6">
                  <button
                    onClick={() => navigate("/")}
                    className="px-6 py-2 bg-brand-blue text-white rounded-lg hover:bg-brand-blue-dark transition-colors font-semibold"
                    disabled={transitioning}
                  >
                    Explore All Clubs
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
