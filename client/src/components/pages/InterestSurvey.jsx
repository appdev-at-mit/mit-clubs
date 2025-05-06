import React, { useState, useEffect } from 'react';
import {useNavigate} from 'react-router-dom';

import ClubCard from "../modules/ClubCard";

const questions = [
  {
    id: "club-type",
    question: "What type of club are you looking for?",
    options: [
      "Career",
      "Academic",
      "Cultural",
      "Recreational",
      "Sports",
      "Any"
    ]
  },
  {
    id: "membership",
    question: "What type of membership do you prefer?",
    options: [
      "Open",
      "Tryout Required",
      "Audition Required",
      "Application Required",
      "Application and Interview Required",
      "Any"
    ]
  },
  {
    id: "size",
    question: "How large of a club are you looking for?",
    options: [
      "Small (1-10 members)",
      "Medium (20-50 members)",
      "Large (50-100 members)",
      "Very Large (100+ members)",
      "Any size"
    ]
  },
];

export default function InterestSurvey() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [completed, setCompleted] = useState(false);
  const [fadeOut, setFadeOut] = useState(false);
  const [transitioning, setTransitioning] = useState(false);
  const [clubs, setClubs] = useState([]);
  

  useEffect(() => {
    // fetch all clubs
    fetch("http://localhost:3000/api/clubs")
      .then((response) => response.json())
      .then((data) => {
        setClubs(data);
      })
      .catch((error) => console.error("Error fetching clubs:", error));
  }, []);

  const filteredClubs = useMemo(() => {
    return clubs.filter()
  }, [clubs, answers]);

  const restart = () => {
    setStep(0);
    setCompleted(false);
    setAnswers({});
  }

  const handleSelect = (option) => {
    if (transitioning) return;
        
    setFadeOut(true);
    setTransitioning(true);
    setAnswers({...answers, [questions[step].id]: option});
    
    setTimeout(() => {
      if (step < questions.length - 1) {
        setStep(step + 1);
      } else {
        setCompleted(true);
      }
      setFadeOut(false);
      setTimeout(() => {
        setTransitioning(false);
      }, 400);
    }, 400);
  };

  return (
    <div className="flex-grow overflow-y-auto p-6 w-full bg-gray-50">
      <h1 className="text-2xl font-bold text-center mb-6">What Are You Interested In?</h1>
      {!completed ? (<h2 className="text-xl font-semibold mb-4 text-right text-blue">skip</h2>) : false }
      <div className={`transition-opacity duration-300 ${fadeOut ? 'opacity-0' : 'opacity-100'}`}>
        {!completed ? (
          <div className="mb-6">
            <div className="flex mb-4">
              {questions.map((_, index) => (
                <div 
                  key={index} 
                  className={`h-2 flex-1 mx-1 rounded-full ${index <= step ? 'bg-blue-500' : 'bg-gray-200'} transition-all duration-500`}
                />
              ))}
            </div>
            
            <h2 className="text-xl font-semibold mb-4">{questions[step].question}</h2>
            
            <div className="space-y-3">
              {questions[step].options.map((option, index) => (
                <button
                  key={option}
                  onClick={() => handleSelect(option)}
                  className={`w-full py-3 px-4 bg-gray-100 hover:bg-blue-100 text-left rounded-lg border border-gray-200 hover:border-blue-300 transition-all duration-300 transform hover:translate-x-1`}
                  style={{
                    animationDelay: `${index * 100}ms`,
                    opacity: fadeOut ? 0 : 1,
                    transition: 'opacity 300ms, transform 300ms, background-color 300ms, border-color 300ms'
                  }}
                  disabled={transitioning}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center">
            <h2 className="text-xl font-semibold mb-4">Here are some clubs you might be interested in!</h2>

            <div className="flex-grow overflow-y-auto p-6 w-full bg-gray-50">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {Object.entries(answers).map(([key, value], index) => (
                  <ClubCard
                    key={"placeholder"}
                    id={0}
                    name={"placeholder"}
                    type={"placeholder"}
                    isAccepting={"placeholder"}
                    pictureUrl={"placeholder"}
                    description={"placeholder"}
                    recruitmentProcess={"placeholder"}
                    membersRange={0}
                    isSavedInitially={false}
                    inSurvey={true}
                  />
                ))}
              </div>
            </div>
            
            <button
              onClick={() => navigate("/")}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              disabled={transitioning}
            >
              Complete
            </button>
            <button
              onClick={restart}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              disabled={transitioning}
            >
              Restart
            </button>
          </div>
        )}
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
