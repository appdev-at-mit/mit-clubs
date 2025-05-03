import React, { useState, useEffect } from "react";
import { useParams, useNavigate, NavLink, Routes, Route } from "react-router-dom";
import { getID, updateClub } from "../../api/clubs";
import Navbar from "../modules/Navbar";
import { ArrowLeft, X, Menu } from "lucide-react";

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
  Social: ["Greek Life"],
  Other: [],
};

const allTags = Object.values(tagCategories).flat();

const ClubManage = () => {
  const { clubId } = useParams();
  const navigate = useNavigate();
  const [club, setClub] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("edit");
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const fetchClubDetails = async () => {
      setLoading(true);
      try {
        const response = await getID(clubId);
        setClub(response.data);
      } catch (error) {
        console.error("Error fetching club details:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchClubDetails();
  }, [clubId]);

  // save functionality
  const handleSave = async () => {
    setIsSaving(true);
    setSaveMessage(null);
    
    try {
      // get current form data from the active tab component
      let updateData = {};
      
      switch (activeTab) {
        case "edit":
          // get data from EditClubPage component
          const editComponent = document.getElementById('edit-form');
          updateData = {
            name: editComponent.querySelector('#club-name').value,
            mission: editComponent.querySelector('#club-mission').value,
            tags: editComponent.querySelector('#club-tags').value
          };
          break;
        
        case "recruitment":
          // get data from RecruitmentPage component
          const recruitmentComponent = document.getElementById('recruitment-form');
          updateData = {
            is_active: recruitmentComponent.querySelector('#is_active').checked,
            is_accepting: recruitmentComponent.querySelector('#is_accepting').checked,
            membership_process: recruitmentComponent.querySelector('#membership-process').value,
            recruiting_cycle: Array.from(
              recruitmentComponent.querySelectorAll('input[name="recruitment_cycle"]:checked')
            ).map(input => input.value)
          };
          break;
        
        case "questions":
          // get data from QuestionsPage component
          const questionsComponent = document.getElementById('questions-form');
          updateData = {
            questions: JSON.parse(questionsComponent.querySelector('#club-questions').value)
          };
          break;
        
        default:
          break;
      }
      
      // send update to server
      const response = await updateClub(clubId, updateData);
      
      // update local state with new data
      setClub(response.data.club);
      
      // show success message
      setSaveMessage({ type: 'success', text: 'Changes saved successfully!' });
      
      // clear message after 3 seconds
      setTimeout(() => setSaveMessage(null), 3000);
      
    } catch (error) {
      console.error("Error saving changes:", error);
      setSaveMessage({ type: 'error', text: 'Error saving changes. Please try again.' });
    } finally {
      setIsSaving(false);
    }
  };

  // content for each tab
  const renderTabContent = () => {
    switch (activeTab) {
      case "edit":
        return <EditClubPage club={club} />;
      case "recruitment":
        return <RecruitmentPage club={club} />;
      case "questions":
        return <QuestionsPage club={club} />;
      default:
        return <EditClubPage club={club} />;
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <div className="flex-grow flex items-center justify-center">
          <p className="text-xl text-brand-blue-dark">Loading club details...</p>
        </div>
      </div>
    );
  }

  if (!club) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <div className="flex-grow flex items-center justify-center">
          <p className="text-xl text-red-600">Could not load club details.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Navbar />
      <div className="container mx-auto px-4 py-6">
        {/* Club Name and View Club button */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-2">
          <h1 className="text-2xl font-bold text-gray-800 break-words hyphens-auto overflow-wrap-anywhere max-w-3xl overflow-hidden">{club.name}</h1>
          <button
            onClick={() => navigate(`/clubs/${clubId}`)}
            className="px-4 py-2 border border-gray-300 rounded-md bg-white text-gray-700 hover:bg-gray-50"
          >
            View Club
          </button>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-300 mb-6">
          <div className="hidden md:flex space-x-8">
            <button
              className={`pb-3 font-medium ${
                activeTab === "edit"
                  ? "text-brand-blue-dark border-b-2 border-brand-blue-dark"
                  : "text-gray-500 hover:text-gray-700"
              }`}
              onClick={() => setActiveTab("edit")}
            >
              Edit Club Page
            </button>
            <button
              className={`pb-3 font-medium ${
                activeTab === "recruitment"
                  ? "text-brand-blue-dark border-b-2 border-brand-blue-dark"
                  : "text-gray-500 hover:text-gray-700"
              }`}
              onClick={() => setActiveTab("recruitment")}
            >
              Recruitment
            </button>
            <button
              className={`pb-3 font-medium ${
                activeTab === "questions"
                  ? "text-brand-blue-dark border-b-2 border-brand-blue-dark"
                  : "text-gray-500 hover:text-gray-700"
              }`}
              onClick={() => setActiveTab("questions")}
            >
              Questions
            </button>
          </div>
          
          {/* Mobile tabs */}
          <div className="md:hidden">
            <div className="flex justify-between items-center">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="flex items-center text-gray-700"
              >
                <span className="mr-2 font-medium">
                  {activeTab === "edit" ? "Edit Club Page" : 
                   activeTab === "recruitment" ? "Recruitment" : "Questions"}
                </span>
                <Menu size={20} />
              </button>
            </div>
            
            {mobileMenuOpen && (
              <div className="bg-white absolute z-10 shadow-md rounded-md mt-2 w-48 py-1">
                <button
                  className={`block w-full text-left px-4 py-2 ${activeTab === "edit" ? "bg-gray-100 text-brand-blue-dark" : "text-gray-700"}`}
                  onClick={() => {
                    setActiveTab("edit");
                    setMobileMenuOpen(false);
                  }}
                >
                  Edit Club Page
                </button>
                <button
                  className={`block w-full text-left px-4 py-2 ${activeTab === "recruitment" ? "bg-gray-100 text-brand-blue-dark" : "text-gray-700"}`}
                  onClick={() => {
                    setActiveTab("recruitment");
                    setMobileMenuOpen(false);
                  }}
                >
                  Recruitment
                </button>
                <button
                  className={`block w-full text-left px-4 py-2 ${activeTab === "questions" ? "bg-gray-100 text-brand-blue-dark" : "text-gray-700"}`}
                  onClick={() => {
                    setActiveTab("questions");
                    setMobileMenuOpen(false);
                  }}
                >
                  Questions
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Tab Content */}
        <div className="bg-white border border-gray-200 rounded-md p-4 md:p-6">
          {renderTabContent()}
        </div>
        
        {/* Save Button and Messages */}
        <div className="flex flex-col sm:flex-row justify-between items-center mt-4 gap-2">
          {saveMessage && (
            <div className={`px-4 py-2 rounded-md ${saveMessage.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'} w-full sm:w-auto`}>
              {saveMessage.text}
            </div>
          )}
          <div className={`${saveMessage ? 'mt-2 sm:mt-0' : ''} sm:ml-auto w-full sm:w-auto`}>
            <button 
              className={`px-6 py-2 bg-brand-blue text-white rounded-md hover:bg-brand-blue-dark transition-colors ${isSaving ? 'opacity-70 cursor-not-allowed' : ''} w-full sm:w-auto`}
              onClick={handleSave}
              disabled={isSaving}
            >
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Component for the Edit Club Page tab
const EditClubPage = ({ club }) => {
  // Convert club tags string to array
  const clubTagsArray = club.tags ? club.tags.split(/,\s*/).filter(tag => tag) : [];
  const [selectedTags, setSelectedTags] = useState(clubTagsArray);
  const [expandedCategory, setExpandedCategory] = useState(null);
  const [name, setName] = useState(club.name || "");
  const [mission, setMission] = useState(club.mission || "");
  
  const toggleTag = (tag) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter(t => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const toggleCategory = (category) => {
    if (expandedCategory === category) {
      setExpandedCategory(null);
    } else {
      setExpandedCategory(category);
    }
  };

  const removeTag = (tag) => {
    setSelectedTags(selectedTags.filter(t => t !== tag));
  };

  // Join tags to a comma-separated string when form is submitted
  const getTagsString = () => {
    return selectedTags.join(', ');
  };

  return (
    <div id="edit-form">
      <div className="mb-6">
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-[150px,1fr] gap-2 md:gap-4 items-start">
            <label className="font-medium text-gray-700">Club Name<span className="text-red-500">*</span></label>
            <div>
              <input
                id="club-name"
                type="text"
                className="w-full p-2 border border-gray-300 rounded-md mb-1"
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={100}
              />
              <div className="flex flex-col sm:flex-row sm:justify-between">
                <p className="text-sm text-gray-500 mt-1">
                  This should be the official name that is recognized by ASA.
                </p>
                <p className="text-sm text-gray-500 mt-1 sm:ml-2 flex-shrink-0">
                  {name.length}/100
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-[150px,1fr] gap-2 md:gap-4 items-start">
            <label className="font-medium text-gray-700">Club Mission<span className="text-red-500">*</span></label>
            <div>
              <textarea
                id="club-mission"
                className="w-full p-2 border border-gray-300 rounded-md min-h-32 mb-1"
                value={mission}
                onChange={(e) => setMission(e.target.value)}
                placeholder="Enter your club's mission statement here..."
                maxLength={1000}
              />
              <div className="flex flex-col sm:flex-row sm:justify-between">
                <p className="text-sm text-gray-500 mt-1">
                  We recommend you use your official mission recognized by the ASA. However, we also encourage you to add additional information to the existing mission as you see fit.
                </p>
                <p className="text-sm text-gray-500 mt-1 sm:ml-2 flex-shrink-0">
                  {mission.length}/1000
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-[150px,1fr] gap-2 md:gap-4 items-start">
            <label className="font-medium text-gray-700">Tags<span className="text-red-500">*</span></label>
            <div>
              {/* Hidden input to store selected tags */}
              <input type="hidden" id="club-tags" value={getTagsString()} />
              
              {/* Selected Tags Display */}
              <div className="mb-1 flex flex-wrap gap-2">
                {selectedTags.length > 0 ? (
                  selectedTags.map(tag => (
                    <div key={tag} className="inline-flex items-center bg-brand-blue/20 text-brand-blue-dark px-2.5 py-1 rounded-full text-sm">
                      {tag}
                      <button onClick={() => removeTag(tag)} className="ml-1 text-brand-blue-dark hover:text-brand-blue-dark/80">
                        <X size={14} />
                      </button>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-500">No tags selected. Add tags to help students find your club.</p>
                )}
              </div>
              
              {/* Category Dropdowns */}
              <div className="border border-gray-300 rounded-md p-3 max-h-64 overflow-y-auto">
                {Object.entries(tagCategories).map(([category, tags]) => (
                  <div key={category} className="mb-2 last:mb-0">
                    <button 
                      onClick={() => toggleCategory(category)}
                      className="w-full text-left mb-1 font-medium text-gray-700 hover:text-gray-900 flex justify-between items-center"
                    >
                      {category}
                      <span className="text-xs text-gray-500">
                        {expandedCategory === category ? '↑' : '↓'}
                      </span>
                    </button>
                    
                    {expandedCategory === category && tags.length > 0 && (
                      <div className="ml-2 space-y-1">
                        {tags.map(tag => (
                          <div key={tag} className="flex items-center">
                            <input
                              type="checkbox" 
                              id={`tag-${tag}`}
                              checked={selectedTags.includes(tag)}
                              onChange={() => toggleTag(tag)}
                              className="h-4 w-4 rounded text-brand-blue-dark focus:ring-brand-blue-dark"
                            />
                            <label htmlFor={`tag-${tag}`} className="ml-2 text-sm text-gray-700">
                              {tag}
                            </label>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
              <p className="text-sm text-gray-500 mt-1">
                Select tags that describe your club. These help students find your club when searching.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// component for the Recruitment tab
const RecruitmentPage = ({ club }) => {
  // parse recruiting_cycle from string to array
  const initialCycles = club.recruiting_cycle ? 
    (typeof club.recruiting_cycle === 'string' ? [club.recruiting_cycle] : club.recruiting_cycle) : 
    [];
  
  const [cycles, setCycles] = useState(initialCycles);
  const [isActive, setIsActive] = useState(club.is_active || false);
  const [isAccepting, setIsAccepting] = useState(club.is_accepting || false);
  const [membershipProcess, setMembershipProcess] = useState(club.membership_process || "Open Membership");
  
  const toggleCycle = (cycle) => {
    if (cycles.includes(cycle)) {
      setCycles(cycles.filter(c => c !== cycle));
    } else {
      setCycles([...cycles, cycle]);
    }
  };

  return (
    <div id="recruitment-form">
      <p className="text-gray-600 mb-6">
        Configure your club's recruitment settings, application processes, and open recruitment periods.
      </p>
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-[150px,1fr] gap-2 md:gap-4 items-start">
          <label className="font-medium text-gray-700">Status<span className="text-red-500">*</span></label>
          <div className="space-y-3">
            <div className="flex items-center">
              <input 
                type="checkbox" 
                id="is_accepting" 
                checked={isAccepting}
                onChange={(e) => setIsAccepting(e.target.checked)}
                className="h-4 w-4 rounded text-brand-blue-dark focus:ring-brand-blue-dark" 
              />
              <label htmlFor="is_accepting" className="ml-2 text-gray-700">Currently accepting members</label>
            </div>
            <div className="flex items-center">
              <input 
                type="checkbox" 
                id="is_active" 
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="h-4 w-4 rounded text-brand-blue-dark focus:ring-brand-blue-dark" 
              />
              <label htmlFor="is_active" className="ml-2 text-gray-700">Active</label>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-[150px,1fr] gap-2 md:gap-4 items-start">
          <label className="font-medium text-gray-700">Membership<span className="text-red-500">*</span></label>
          <div>
            <select 
              id="membership-process"
              className="w-full p-2 border border-gray-300 rounded-md mb-1"
              value={membershipProcess}
              onChange={(e) => setMembershipProcess(e.target.value)}
            >
              <option value="Open Membership">Open Membership</option>
              <option value="Application Required">Application Required</option>
              <option value="Tryout Required">Tryout Required</option>
              <option value="Audition Required">Audition Required</option>
              <option value="Application and Interview Required">Application and Interview Required</option>
              <option value="Invite-only">Invite-only</option>
            </select>
            <p className="text-sm text-gray-500 mt-1">
              Select how new members join your club.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-[150px,1fr] gap-2 md:gap-4 items-start">
          <label className="font-medium text-gray-700">Recruitment Cycle<span className="text-red-500">*</span></label>
          <div className="space-y-2">
            <div className="flex items-center">
              <input 
                type="checkbox" 
                id="cycle_open" 
                name="recruitment_cycle"
                value="Open"
                checked={cycles.includes("Open")}
                onChange={() => toggleCycle("Open")}
                className="h-4 w-4 rounded text-brand-blue-dark focus:ring-brand-blue-dark" 
              />
              <label htmlFor="cycle_open" className="ml-2 text-gray-700">Open</label>
            </div>
            <div className="flex items-center">
              <input 
                type="checkbox" 
                id="cycle_fall" 
                name="recruitment_cycle"
                value="Fall Semester"
                checked={cycles.includes("Fall Semester")}
                onChange={() => toggleCycle("Fall Semester")}
                className="h-4 w-4 rounded text-brand-blue-dark focus:ring-brand-blue-dark" 
              />
              <label htmlFor="cycle_fall" className="ml-2 text-gray-700">Fall Semester</label>
            </div>
            <div className="flex items-center">
              <input 
                type="checkbox" 
                id="cycle_spring" 
                name="recruitment_cycle"
                value="Spring Semester"
                checked={cycles.includes("Spring Semester")}
                onChange={() => toggleCycle("Spring Semester")}
                className="h-4 w-4 rounded text-brand-blue-dark focus:ring-brand-blue-dark" 
              />
              <label htmlFor="cycle_spring" className="ml-2 text-gray-700">Spring Semester</label>
            </div>
            <div className="flex items-center">
              <input 
                type="checkbox" 
                id="cycle_iap" 
                name="recruitment_cycle"
                value="IAP"
                checked={cycles.includes("IAP")}
                onChange={() => toggleCycle("IAP")}
                className="h-4 w-4 rounded text-brand-blue-dark focus:ring-brand-blue-dark" 
              />
              <label htmlFor="cycle_iap" className="ml-2 text-gray-700">IAP</label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// component for the Questions tab
const QuestionsPage = ({ club }) => {
  // initialize with default questions if they don't exist in the club data
  const defaultQuestions = [
    { question: "What does the time commitment for this club look like?", answer: "" },
    { question: "When and where does this club meet?", answer: "" }
  ];
  
  const [questions, setQuestions] = useState(
    club.questions && club.questions.length > 0 
      ? club.questions 
      : defaultQuestions
  );

  // update answer for a specific question
  const handleAnswerChange = (index, newAnswer) => {
    const updatedQuestions = [...questions];
    updatedQuestions[index] = { 
      ...updatedQuestions[index], 
      answer: newAnswer 
    };
    setQuestions(updatedQuestions);
  };

  return (
    <div id="questions-form">
      <p className="text-gray-600 mb-6">
        Answer questions from potential members about your club.
      </p>
      
      {/* Hidden input to store all questions for form submission */}
      <input 
        type="hidden" 
        id="club-questions" 
        value={JSON.stringify(questions)} 
      />
      
      <div className="space-y-6">
        {questions.map((item, index) => (
          <div key={index} className={index < questions.length - 1 ? "border-b pb-4" : "pb-4"}>
            <div className="flex">
              <div className="border-l-4 border-gray-300 pl-4 w-full">
                <div className="mb-2">
                  <span className="font-semibold text-gray-800">Question: </span>
                  <span className="text-gray-800 break-words">
                    {item.question.replace("this club", club.name)}
                  </span>
                </div>
                <textarea
                  className="w-full p-2 border border-gray-300 rounded-md"
                  rows="3"
                  value={item.answer || ""}
                  onChange={(e) => handleAnswerChange(index, e.target.value)}
                  placeholder={`Enter information about ${index === 0 ? 'time commitment' : 'meeting times and locations'}...`}
                  maxLength={500}
                ></textarea>
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
};

export default ClubManage; 