import React, { useState } from "react";
import { Club } from "../../../types";

function QuestionsPage({ club }: { club: Club }) {
  const defaultQuestions = [
    {
      question: "What does the time commitment for this club look like?",
      answer: "",
    },
    { question: "When and where does this club meet?", answer: "" },
  ];

  let initialQuestions = defaultQuestions;
  if (club.questions && club.questions.length > 0) {
    initialQuestions = club.questions.map(q => ({
      question: q.question,
      answer: q.answer || "",
    }));
  }

  const [questions, setQuestions] = useState(initialQuestions);

  function handleAnswerChange(index: number, newAnswer: string) {
    const updatedQuestions = [...questions];
    if (updatedQuestions[index]) {
      updatedQuestions[index].answer = newAnswer;
      setQuestions(updatedQuestions);
    }
  }

  return (
    <div id="questions-form">
      <p className="text-gray-600 mb-6">
        Answer questions from potential members about your club.
      </p>
      <input
        type="hidden"
        id="club-questions"
        value={JSON.stringify(questions)}
      />

      <div className="space-y-6">
        {questions.map((item, index) => (
          <div
            key={index}
            className={index < questions.length - 1 ? "border-b pb-4" : "pb-4"}
          >
            <div className="flex">
              <div className="border-l-4 border-gray-300 pl-4 w-full">
                <div className="mb-2">
                  <span className="font-semibold text-gray-800">
                    Question:{" "}
                  </span>
                  <span className="text-gray-800 break-words">
                    {item.question.replace("this club", club.name)}
                  </span>
                </div>
                <textarea
                  className="w-full p-2 border border-gray-300 rounded-md"
                  rows={3}
                  value={item.answer || ""}
                  onChange={(e) => handleAnswerChange(index, e.target.value)}
                  placeholder={`Enter information about ${
                    index === 0
                      ? "time commitment"
                      : "meeting times and locations"
                  }...`}
                  maxLength={500}
                />
                <div className="flex justify-end">
                  <p className="text-sm text-gray-500 mt-1">
                    {item.answer ? item.answer.length : 0}/500
                  </p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default QuestionsPage;
