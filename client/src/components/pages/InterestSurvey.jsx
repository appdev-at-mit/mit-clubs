import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft, FaArrowRight } from "react-icons/fa";
import Navbar from "../modules/Navbar";
import ClubCard from "../modules/ClubCard";
import beaver from "../../assets/beaver.png";
import { API_BASE_URL } from "../../config";

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
  const [showWelcome, setShowWelcome] = useState(true);
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
  const [clubs, setClubs] = useState([]);
  const [filteredClubs, setFilteredClubs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [savedClubs, setSavedClubs] = useState(new Set());

  useEffect(() => {
    // fetch saved clubs for the user
    fetch(`${API_BASE_URL}/api/saved-clubs`, { credentials: "include" })
      .then((response) => (response.ok ? response.json() : []))
      .then((data) => {
        const savedClubIds = new Set(Array.isArray(data) ? data.map((club) => club.club_id) : []);
        setSavedClubs(savedClubIds);
      })
      .catch((error) => {
        console.error("Error fetching saved clubs:", error);
        setSavedClubs(new Set());
      });
  }, []);

  // qhen survey is completed, fetch clubs and filter them
  useEffect(() => {
    if (completed) {
      setLoading(true);
      fetch(`${API_BASE_URL}/api/clubs`)
        .then((response) => response.json())
        .then((data) => {
          setClubs(data);
          filterClubsBasedOnAnswers(data);
          setLoading(false);
        })
        .catch((error) => {
          console.error("Error fetching clubs:", error);
          setLoading(false);
        });
    }
  }, [completed]);

  const filterClubsBasedOnAnswers = (clubsData) => {
    // start with all clubs
    let filtered = [...clubsData];

    // filter by selected tags
    if (answers.tags && answers.tags.length > 0) {
      filtered = filtered.filter((club) => {
        if (!club.tags || typeof club.tags !== "string") return false;
        const clubTags = club.tags.toLowerCase().split(/,\s*/);
        // match if any of the selected tags are present (not all)
        return answers.tags.some((selectedTag) =>
          clubTags.includes(selectedTag.toLowerCase())
        );
      });
    }
    // if no specific tags but categories are selected, filter by categories
    else if (answers.category && answers.category.length > 0) {
      const allSelectedTags = answers.category.flatMap(cat => tagCategories[cat] || []);
      filtered = filtered.filter((club) => {
        if (!club.tags || typeof club.tags !== "string") return false;
        const clubTags = club.tags.toLowerCase().split(/,\s*/);
        // match if any of the category tags are present
        return allSelectedTags.some((categoryTag) =>
          clubTags.includes(categoryTag.toLowerCase())
        );
      });
    }

    // filter by membership process
    if (answers.membership && answers.membership.length > 0) {
      filtered = filtered.filter((club) =>
        answers.membership.includes(club.membership_process)
      );
    }

    // filter by recruiting cycle
    if (answers.recruiting && answers.recruiting.length > 0) {
      filtered = filtered.filter((club) =>
        answers.recruiting.includes(club.recruiting_cycle)
      );
    }

    // filter to only active clubs
    filtered = filtered.filter((club) => club.is_active === true);

    // sort by whether the club is accepting members (prioritize accepting clubs)
    filtered.sort((a, b) => {
      if (a.is_accepting && !b.is_accepting) return -1;
      if (!a.is_accepting && b.is_accepting) return 1;
      return 0;
    });

    // take up to 6 recommendations
    const recommendations = filtered.slice(0, 6);
    setFilteredClubs(recommendations);
  };

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

  const startSurvey = () => {
    setShowWelcome(false);
  };

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Navbar />
      <div className="flex-grow flex flex-col items-center px-3 py-6">
        <div className="w-full max-w-7xl flex flex-col h-full">
          
          {showWelcome ? (
            // welcome Screen
            <div className="flex flex-col items-center justify-center h-full text-center max-w-2xl mx-auto py-12">
              <h1 className="text-4xl font-bold mb-10 text-gray-800">
                Welcome to Beaver Clubs!
              </h1>
              <p className="text-lg text-gray-500 mb-16 max-w-lg">
                Let's start with a few quick questions about your preferences to help you discover clubs that are perfect for you.
              </p>
              <button
                onClick={startSurvey}
                className="px-8 py-3 bg-brand-blue text-white rounded-lg hover:bg-brand-blue-dark transition-colors font-semibold text-lg shadow-md hover:shadow-lg transform hover:-translate-y-1 transition-all"
              >
                Get Started
              </button>
            </div>
          ) : (
            <div className={`flex flex-col flex-grow transition-opacity duration-300 ${fadeOut ? 'opacity-0' : 'opacity-100'}`}>
              {!completed ? (
                <div className="flex flex-col h-full mb-4 relative">
                  <div className="flex mb-6 flex-shrink-0 mt-8">
                    {displayedQuestions.map((_, index) => (
                      <div 
                        key={index} 
                        className={`h-2 flex-1 mx-1 rounded-full ${index <= step ? 'bg-brand-blue' : 'bg-gray-200'} transition-all duration-500`}
                      />
                    ))}
                  </div>
                  
                  <h2 className="text-xl font-semibold mb-5 mt-12 text-center text-gray-700 flex-shrink-0">{currentQuestion.question}</h2>
                  
                  <div className="overflow-y-auto pr-2 mb-40">
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

                  <div className="absolute bottom-0 left-0 right-0 py-10 text-center flex-shrink-0 flex justify-center space-x-20 bg-white">
                    {step > 0 ? (
                      <button
                        onClick={() => {
                          if (transitioning) return;
                          setFadeOut(true);
                          setTransitioning(true);
                          setTimeout(() => {
                            setStep(step - 1);
                            setFadeOut(false);
                            setTimeout(() => setTransitioning(false), 50);
                          }, 300);
                        }}
                        className="flex flex-col items-center text-gray-500 hover:text-gray-700 transition-colors disabled:opacity-30"
                        disabled={transitioning}
                      >
                        <FaArrowLeft size={24} className="mb-2" />
                        <span className="font-medium">Back</span>
                      </button>
                    ) : (
                      <div className="w-16">{/* placeholder when back button is not shown */}</div>
                    )}
                    <button
                      onClick={handleNextStep}
                      className="flex flex-col items-center text-brand-blue hover:text-brand-blue-dark transition-colors disabled:opacity-30"
                      disabled={transitioning || answers[currentQuestion.id]?.length === 0}
                    >
                      <FaArrowRight size={24} className="mb-2" />
                      <span className="font-medium">
                        {step < displayedQuestions.length - 1 ? 'Next' : 'See Results'}
                      </span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col h-full">
                  <h2 className="text-xl font-semibold mb-6 text-gray-700 flex-shrink-0">
                    {loading 
                      ? "Finding clubs that match your interests..." 
                      : filteredClubs.length > 0 
                        ? "Based on your preferences, check these out!" 
                        : null}
                  </h2>
      
                  {loading ? (
                    <div className="flex-grow flex items-center justify-center">
                      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-blue"></div>
                    </div>
                  ) : filteredClubs.length > 0 ? (
                    <div className="flex-grow columns-1 md:columns-2 lg:columns-3 gap-6 mb-6 overflow-y-auto pr-2">
                      {filteredClubs.map((club) => (
                        <div key={club.club_id} className="mb-6 break-inside-avoid-column">
                          <ClubCard
                            id={club.club_id}
                            name={club.name}
                            tags={club.tags}
                            isAccepting={club.is_accepting}
                            image_url={club.image_url}
                            description={club.mission}
                            recruitmentProcess={club.membership_process}
                            isSavedInitially={savedClubs.has(club.club_id)}
                          />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex-grow flex flex-col items-center justify-center mt-12 mb-16">
                      <div className="text-center max-w-md">
                        <h3 className="text-2xl font-bold text-gray-800 mb-4">No Matches Found</h3>
                        <p className="text-lg text-gray-600 mb-16">
                          We couldn't find clubs that match all your selected preferences. Try exploring all clubs!
                        </p>
                        <div className="relative inline-block">
                          <div className="absolute"></div>
                          <div className="relative">
                            <img 
                              src={beaver} 
                              alt="MIT Clubs Logo" 
                              className="mx-auto h-36 w-auto" 
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <div className="flex-shrink-0 flex justify-center space-x-4">
                    <button
                      onClick={() => {
                        setCompleted(false);
                        setStep(0);
                        setAnswers({ category: [], tags: [], membership: [], recruiting: [] });
                        setDisplayedQuestions([
                          baseQuestions.category, 
                          baseQuestions.tags,
                          baseQuestions.membership, 
                          baseQuestions.recruiting
                        ]);
                      }}
                      className="px-6 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors font-semibold"
                      disabled={transitioning}
                    >
                      Retake Survey
                    </button>
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
          )}
        </div>
      </div>
    </div>
  );
}
