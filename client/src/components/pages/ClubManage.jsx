import React, { useState, useEffect, useRef, useContext } from "react";
import { useParams, useNavigate, NavLink, Routes, Route } from "react-router-dom";
import { getID, updateClub, getClubMembers, addClubMember, updateClubMember, removeClubMember } from "../../api/clubs";
import { checkIsAdmin } from "../../api/admin";
import { UserContext } from "../App";
import Navbar from "../modules/Navbar";
import { ArrowLeft, X, Menu, Search, Check, Edit, UserX, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";

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
  const { userId, userEmail, isAdmin: userIsAdmin } = useContext(UserContext);
  const [club, setClub] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("edit");
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [hasOwnerPermission, setHasOwnerPermission] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [permissionChecked, setPermissionChecked] = useState(false);
  const [isHoveringViewClub, setIsHoveringViewClub] = useState(false);

  useEffect(() => {
    const checkPermissionsAndFetchClub = async () => {
      setLoading(true);
      
      // first check if user is logged in
      if (!userId || !userEmail) {
        navigate('/');
        return;
      }
      
      try {
        // use admin status from context
        setIsAdmin(userIsAdmin);
        
        // if user is admin fetch the club
        if (userIsAdmin) {
          console.log("User is admin");
          const response = await getID(clubId);
          setClub(response.data);
          setLoading(false);
          setPermissionChecked(true);
          return;
        }
        
        // otherwise, check if user has owner permissions
        const membersResponse = await getClubMembers(clubId);
        const members = membersResponse.data.members || [];
        
        // check if the current user is an owner
        const userMember = members.find(member => 
          member.email === userEmail && member.permissions === "Owner"
        );
        
        setHasOwnerPermission(Boolean(userMember));
        
        const hasPermission = Boolean(userMember) || isAdmin;
        console.log("Permission check:", { hasOwnerPermission: Boolean(userMember), isAdmin, hasPermission });
        setPermissionChecked(true);
        
        if (!hasPermission) {
          // if no permission, don't fetch club data and prepare to redirect
          console.log("No permission, preparing to redirect");
          setLoading(false);
          return;
        }
        
        // if has permission, fetch club data
        const response = await getID(clubId);
        setClub(response.data);
        setLoading(false);
      } catch (error) {
        console.error("Error checking permissions or fetching club:", error);
        setLoading(false);
        setPermissionChecked(true);
      }
    };

    checkPermissionsAndFetchClub();
  }, [clubId, userId, userEmail, navigate, userIsAdmin]);
  
  // redirect if user doesn't have permission
  useEffect(() => {
    if (permissionChecked && !hasOwnerPermission && !isAdmin && !loading) {
      navigate(`/clubs/${clubId}`);
    }
  }, [permissionChecked, hasOwnerPermission, isAdmin, loading, navigate, clubId]);

  // save functionality
  const handleSave = async () => {
    // don't allow saving if user doesn't have permission
    if (!hasOwnerPermission && !isAdmin) {
      setSaveMessage({ type: 'error', text: 'You do not have permission to edit this club.' });
      return;
    }
    
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
        
        case "members":
          setSaveMessage({ type: 'info', text: 'Member changes are saved automatically.' });
          setIsSaving(false);
          return;
          
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
      case "members":
        return <MembersPage club={club} />;
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
          <p className="text-xl text-red-600">You do not have permission to manage this club.</p>
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
            onMouseEnter={() => setIsHoveringViewClub(true)}
            onMouseLeave={() => setIsHoveringViewClub(false)}
            style={{
              backgroundColor: isHoveringViewClub ? '#F3F4F6' : 'white',
              transition: 'background-color 0.2s ease'
            }}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700"
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
            <button
              className={`pb-3 font-medium ${
                activeTab === "members"
                  ? "text-brand-blue-dark border-b-2 border-brand-blue-dark"
                  : "text-gray-500 hover:text-gray-700"
              }`}
              onClick={() => setActiveTab("members")}
            >
              Members
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
                   activeTab === "recruitment" ? "Recruitment" : 
                   activeTab === "questions" ? "Questions" : "Members"}
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
                <button
                  className={`block w-full text-left px-4 py-2 ${activeTab === "members" ? "bg-gray-100 text-brand-blue-dark" : "text-gray-700"}`}
                  onClick={() => {
                    setActiveTab("members");
                    setMobileMenuOpen(false);
                  }}
                >
                  Members
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
            <div className={`px-4 py-2 rounded-md ${
              saveMessage.type === 'success' ? 'bg-green-100 text-green-800' : 
              saveMessage.type === 'error' ? 'bg-red-100 text-red-800' :
              'bg-blue-100 text-blue-800'
            } w-full sm:w-auto`}>
              {saveMessage.text}
            </div>
          )}
          {activeTab !== "members" && (
            <div className={`${saveMessage ? 'mt-2 sm:mt-0' : ''} sm:ml-auto w-full sm:w-auto`}>
              <button 
                className={`px-6 py-2 bg-brand-purple text-white rounded-md hover:bg-brand-purple/80 transition-all duration-200 ${isSaving ? 'opacity-70 cursor-not-allowed' : ''} w-full sm:w-auto`}
                onClick={handleSave}
                disabled={isSaving}
              >
                {isSaving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          )}
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

// component for the Members tab
const MembersPage = ({ club }) => {
  const { clubId } = useParams();
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [membersPerPage] = useState(10);
  const [editingMember, setEditingMember] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [members, setMembers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const modalRef = useRef(null);
  
  // form validation errors
  const [nameError, setNameError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [roleError, setRoleError] = useState("");
  
  // confirmation modal for member removal
  const [memberToRemove, setMemberToRemove] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  
  // available roles
  const availableRoles = [
    { role: "Co-Chair", permissions: "Owner" },
    { role: "Marketing Chair", permissions: "Officer" },
    { role: "Treasurer", permissions: "Officer" },
    { role: "Secretary", permissions: "Officer" },
    { role: "Member", permissions: "Member" }
  ];
  
  // fetch members when component mounts
  useEffect(() => {
    const fetchMembers = async () => {
      try {
        setIsLoading(true);
        const response = await getClubMembers(clubId);
        setMembers(response.data.members || []);
        setError(null);
      } catch (err) {
        console.error("Error fetching club members:", err);
        setError("Could not load members");
        setMembers([]);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchMembers();
  }, [clubId]);
  
  // close modal when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        setShowEditModal(false);
        setShowAddModal(false);
      }
    }
    
    if (showEditModal || showAddModal) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }
    
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showEditModal, showAddModal]);
  
  // filter members based on search query and role filter
  const filteredMembers = members.filter(member => {
    const matchesSearch = member.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          member.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === "" || 
                        (member.role + " (" + member.permissions + ")").toLowerCase().includes(roleFilter.toLowerCase());
    return matchesSearch && matchesRole;
  });
  
  // get current members for pagination
  const indexOfLastMember = currentPage * membersPerPage;
  const indexOfFirstMember = indexOfLastMember - membersPerPage;
  const currentMembers = filteredMembers.slice(indexOfFirstMember, indexOfLastMember);
  
  // change page
  const handlePageChange = (pageNumber) => {
    if (pageNumber < 1 || pageNumber > Math.ceil(filteredMembers.length / membersPerPage)) {
      return;
    }
    setCurrentPage(pageNumber);
  };
  
  // reset all error states
  const resetErrors = () => {
    setNameError("");
    setEmailError("");
    setRoleError("");
    setError(null);
  };
  
  // handle member edit
  const handleEditMember = (member) => {
    resetErrors();
    setEditingMember({...member});
    setShowEditModal(true);
  };
  
  // handle adding a new member
  const handleAddMember = () => {
    resetErrors();
    setEditingMember({
      name: "",
      role: "Member",
      permissions: "Member",
      email: ""
    });
    setShowAddModal(true);
  };
  
  // handle saving new member
  const handleSaveNewMember = async () => {
    // reset validation errors
    setNameError("");
    setEmailError("");
    setRoleError("");
    
    // validate inputs
    let hasError = false;
    
    if (!editingMember.name || editingMember.name.trim() === "") {
      setNameError("Name is required");
      hasError = true;
    } else if (editingMember.name.length > 50) {
      setNameError("Name cannot exceed 50 characters");
      hasError = true;
    } else {
      // check that name only contains letters and spaces
      const nameRegex = /^[A-Za-z\s]+$/;
      if (!nameRegex.test(editingMember.name)) {
        setNameError("Name can only contain alphabetic characters and spaces");
        hasError = true;
      }
    }
    
    if (!editingMember.email || editingMember.email.trim() === "") {
      setEmailError("Email is required");
      hasError = true;
    } else if (editingMember.email.length > 100) {
      setEmailError("Email cannot exceed 100 characters");
      hasError = true;
    } else {
      // validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(editingMember.email)) {
        setEmailError("Please enter a valid email address");
        hasError = true;
      }
    }
    
    if (!editingMember.role) {
      setRoleError("Role is required");
      hasError = true;
    }
    
    // return if validation failed
    if (hasError) {
      return;
    }
    
    try {
      const response = await addClubMember(clubId, editingMember);
      setMembers([...members, response.data.member]);
      setShowAddModal(false);
      setEditingMember(null);
    } catch (error) {
      console.error("Error adding member:", error);
      if (error.response && error.response.data.error) {
        if (error.response.data.error.includes("email")) {
          setEmailError(error.response.data.error);
        } else {
          setError(error.response.data.error);
        }
      } else {
        setError("Failed to add member. Please try again.");
      }
    }
  };
  
  // handle member role change
  const handleRoleChange = (e) => {
    const selectedRoleIndex = e.target.value;
    const selectedRole = availableRoles[selectedRoleIndex];
    
    setEditingMember(prev => ({
      ...prev,
      role: selectedRole.role,
      permissions: selectedRole.permissions
    }));
  };
  
  // handle saving member changes
  const handleSaveMemberChanges = async () => {
    // reset validation errors
    setNameError("");
    setEmailError("");
    setRoleError("");
    
    // validate inputs
    let hasError = false;
    
    if (!editingMember.name || editingMember.name.trim() === "") {
      setNameError("Name is required");
      hasError = true;
    } else if (editingMember.name.length > 50) {
      setNameError("Name cannot exceed 50 characters");
      hasError = true;
    } else {
      // check that name only contains letters and spaces
      const nameRegex = /^[A-Za-z\s]+$/;
      if (!nameRegex.test(editingMember.name)) {
        setNameError("Name can only contain alphabetic characters and spaces");
        hasError = true;
      }
    }
    
    if (!editingMember.email || editingMember.email.trim() === "") {
      setEmailError("Email is required");
      hasError = true;
    } else if (editingMember.email.length > 100) {
      setEmailError("Email cannot exceed 100 characters");
      hasError = true;
    } else {
      // validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(editingMember.email)) {
        setEmailError("Please enter a valid email address");
        hasError = true;
      }
    }
    
    if (!editingMember.role) {
      setRoleError("Role is required");
      hasError = true;
    }
    
    // Return if validation failed
    if (hasError) {
      return;
    }
    
    try {
      await updateClubMember(clubId, editingMember.id, editingMember);
      setMembers(members.map(m => m.id === editingMember.id ? editingMember : m));
      setShowEditModal(false);
      setEditingMember(null);
    } catch (error) {
      console.error("Error updating member:", error);
      if (error.response && error.response.data.error) {
        if (error.response.data.error.includes("email")) {
          setEmailError(error.response.data.error);
        } else {
          setError(error.response.data.error);
        }
      } else {
        setError("Failed to update member. Please try again.");
      }
    }
  };
  
  // member removal
  const handleRemoveMember = async (member) => {
    setMemberToRemove(member);
    setShowConfirmModal(true);
  };
  
  // confirm member removal
  const confirmRemoveMember = async () => {
    try {
      await removeClubMember(clubId, memberToRemove.id);
      setMembers(members.filter(m => m.id !== memberToRemove.id));
      setShowConfirmModal(false);
      setMemberToRemove(null);
    } catch (error) {
      console.error("Error removing member:", error);
      setError(error.response?.data?.error || "Failed to remove member. Please try again.");
      setShowConfirmModal(false);
    }
  };
  
  // cancel member removal
  const cancelRemoveMember = () => {
    setShowConfirmModal(false);
    setMemberToRemove(null);
  };

  // show loading state
  if (isLoading) {
    return <div className="text-center py-6">Loading members...</div>;
  }

  // show error state
  if (error) {
    return <div className="text-center text-red-600 py-6">{error}</div>;
  }

  return (
    <div id="members-form">
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
          <div className="flex flex-col sm:flex-row gap-4 w-full">
            <div className="relative w-full sm:w-64">
              <input
                type="text"
                placeholder={`Search ${members.length} entries`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-3 pr-10 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-brand-blue"
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <Search size={18} className="text-gray-400" />
              </div>
            </div>
            
            <div className="w-full sm:w-64">
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-brand-blue appearance-none bg-white"
              >
                <option value="">Filter by Role</option>
                <option value="Co-Chair (Owner)">Co-Chair (Owner)</option>
                <option value="Marketing Chair (Officer)">Marketing Chair (Officer)</option>
                <option value="Treasurer (Officer)">Treasurer (Officer)</option>
                <option value="Secretary (Officer)">Secretary (Officer)</option>
                <option value="Member (Member)">Member (Member)</option>
              </select>
            </div>
          </div>
          
          <button
            onClick={handleAddMember}
            className="whitespace-nowrap px-3 py-1.5 bg-brand-green-dark text-white rounded-md hover:bg-brand-green-dark/80 transition-all duration-200"
          >
            + Add Member
          </button>
        </div>
        
        {/* Show message if no members */}
        {members.length === 0 ? (
          <div className="text-center py-8 bg-gray-50 rounded-md">
            <p className="text-gray-600">No members yet. Click "Add Member" to add club members.</p>
          </div>
        ) : (
          <>
            {/* Members Table */}
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-white">
                  <tr>
                    <th className="px-6 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Title (permissions)
                    </th>
                    <th className="px-6 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {currentMembers.map((member) => (
                    <tr key={member.id} className="hover:bg-gray-50">
                      <td className="px-6 py-2 whitespace-nowrap text-sm text-gray-900">
                        {member.name}
                      </td>
                      <td className="px-6 py-2 whitespace-nowrap text-sm text-gray-900">
                        {member.role} ({member.permissions})
                      </td>
                      <td className="px-6 py-2 whitespace-nowrap text-sm text-gray-900">
                        {member.email}
                      </td>
                      <td className="px-6 py-2 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => handleEditMember(member)}
                          className="text-white bg-brand-green-dark rounded-md px-3 py-1 mr-2 inline-flex items-center"
                        >
                          <Edit size={16} className="mr-1" /> Edit
                        </button>
                        <button
                          onClick={() => handleRemoveMember(member)}
                          className="text-white bg-brand-red rounded-md px-3 py-1 inline-flex items-center"
                        >
                          <UserX size={16} className="mr-1" /> Kick
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {/* Pagination */}
            <div className="flex items-center justify-between mt-4">
              <div className="flex items-center">
                <p className="text-sm text-gray-700">
                  {filteredMembers.length} total entries, {membersPerPage} entries per page
                </p>
              </div>
              <div className="flex items-center">
                <button
                  onClick={() => handlePageChange(1)}
                  disabled={currentPage === 1}
                  className={`p-2 rounded-md ${currentPage === 1 ? 'text-gray-400 cursor-not-allowed' : 'text-gray-700 hover:bg-gray-100'}`}
                >
                  <ChevronsLeft size={16} />
                </button>
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className={`p-2 rounded-md ${currentPage === 1 ? 'text-gray-400 cursor-not-allowed' : 'text-gray-700 hover:bg-gray-100'}`}
                >
                  <ChevronLeft size={16} />
                </button>
                
                <div className="px-2 py-1">
                  <input 
                    type="text" 
                    value={`Page ${currentPage}`}
                    readOnly
                    className="w-20 text-center border border-gray-300 rounded-md text-sm"
                  />
                </div>
                
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage >= Math.ceil(filteredMembers.length / membersPerPage)}
                  className={`p-2 rounded-md ${currentPage >= Math.ceil(filteredMembers.length / membersPerPage) ? 'text-gray-400 cursor-not-allowed' : 'text-gray-700 hover:bg-gray-100'}`}
                >
                  <ChevronRight size={16} />
                </button>
                <button
                  onClick={() => handlePageChange(Math.ceil(filteredMembers.length / membersPerPage))}
                  disabled={currentPage >= Math.ceil(filteredMembers.length / membersPerPage)}
                  className={`p-2 rounded-md ${currentPage >= Math.ceil(filteredMembers.length / membersPerPage) ? 'text-gray-400 cursor-not-allowed' : 'text-gray-700 hover:bg-gray-100'}`}
                >
                  <ChevronsRight size={16} />
                </button>
              </div>
            </div>
          </>
        )}
      </div>
      
      {/* Edit Member Modal */}
      {showEditModal && editingMember && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div ref={modalRef} className="bg-white rounded-lg p-6 w-full max-w-md m-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Edit Member</h3>
              <button 
                onClick={() => setShowEditModal(false)} 
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={20} />
              </button>
            </div>
            
            {error && (
              <div className="mb-4 p-3 rounded-md bg-red-50 text-brand-red text-sm">
                {error}
              </div>
            )}
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name <span className="text-red-500">*</span>
                </label>
                <input 
                  type="text" 
                  value={editingMember.name} 
                  onChange={(e) => setEditingMember({...editingMember, name: e.target.value})}
                  className={`w-full p-2 border ${nameError ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-1 focus:ring-brand-blue`}
                  required
                  maxLength={50}
                  pattern="[A-Za-z\s]+"
                  title="Name can only contain alphabetic characters and spaces"
                />
                <div className="flex justify-between">
                  <p className="text-xs text-brand-red mt-1">
                    {nameError}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    {editingMember.name.length}/50
                  </p>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Role <span className="text-red-500">*</span>
                </label>
                <select 
                  value={availableRoles.findIndex(r => r.role === editingMember.role && r.permissions === editingMember.permissions)}
                  onChange={handleRoleChange}
                  className={`w-full p-2 border ${roleError ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-1 focus:ring-brand-blue`}
                  required
                >
                  {availableRoles.map((roleOption, index) => (
                    <option key={index} value={index}>
                      {roleOption.role} ({roleOption.permissions})
                    </option>
                  ))}
                </select>
                {roleError && (
                  <p className="text-xs text-brand-red mt-1">
                    {roleError}
                  </p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email <span className="text-red-500">*</span>
                </label>
                <input 
                  type="email" 
                  value={editingMember.email} 
                  onChange={(e) => setEditingMember({...editingMember, email: e.target.value})}
                  className={`w-full p-2 border ${emailError ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-1 focus:ring-brand-blue`}
                  required
                  maxLength={100}
                  pattern="[^\s@]+@[^\s@]+\.[^\s@]+"
                  title="Please enter a valid email address"
                />
                <div className="flex justify-between">
                  <p className="text-xs text-brand-red mt-1">
                    {emailError}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    {editingMember.email.length}/100
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex justify-end gap-2 mt-6">
              <button 
                onClick={() => setShowEditModal(false)} 
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-100 transition-all duration-200"
              >
                Cancel
              </button>
              <button 
                onClick={handleSaveMemberChanges} 
                className="px-4 py-2 bg-brand-purple text-white rounded-md hover:bg-brand-purple/80 transition-all duration-200"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Add Member Modal */}
      {showAddModal && editingMember && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div ref={modalRef} className="bg-white rounded-lg p-6 w-full max-w-md m-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Add New Member</h3>
              <button 
                onClick={() => setShowAddModal(false)} 
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={20} />
              </button>
            </div>
            
            {error && (
              <div className="mb-4 p-3 rounded-md bg-red-50 text-brand-red text-sm">
                {error}
              </div>
            )}
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name <span className="text-red-500">*</span>
                </label>
                <input 
                  type="text" 
                  value={editingMember.name} 
                  onChange={(e) => setEditingMember({...editingMember, name: e.target.value})}
                  className={`w-full p-2 border ${nameError ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-1 focus:ring-brand-blue`}
                  placeholder="Enter member name"
                  required
                  maxLength={50}
                  pattern="[A-Za-z\s]+"
                  title="Name can only contain alphabetic characters and spaces"
                />
                <div className="flex justify-between">
                  <p className="text-xs text-brand-red mt-1">
                    {nameError}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    {editingMember.name.length}/50
                  </p>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Role <span className="text-red-500">*</span>
                </label>
                <select 
                  value={availableRoles.findIndex(r => r.role === editingMember.role && r.permissions === editingMember.permissions)}
                  onChange={handleRoleChange}
                  className={`w-full p-2 border ${roleError ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-1 focus:ring-brand-blue`}
                  required
                >
                  {availableRoles.map((roleOption, index) => (
                    <option key={index} value={index}>
                      {roleOption.role} ({roleOption.permissions})
                    </option>
                  ))}
                </select>
                {roleError && (
                  <p className="text-xs text-brand-red mt-1">
                    {roleError}
                  </p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email <span className="text-red-500">*</span>
                </label>
                <input 
                  type="email" 
                  value={editingMember.email} 
                  onChange={(e) => setEditingMember({...editingMember, email: e.target.value})}
                  className={`w-full p-2 border ${emailError ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-1 focus:ring-brand-blue`}
                  placeholder="Enter member email"
                  required
                  maxLength={100}
                  pattern="[^\s@]+@[^\s@]+\.[^\s@]+"
                  title="Please enter a valid email address"
                />
                <div className="flex justify-between">
                  <p className="text-xs text-brand-red mt-1">
                    {emailError}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    {editingMember.email.length}/100
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex justify-end gap-2 mt-6">
              <button 
                onClick={() => setShowAddModal(false)} 
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-100 transition-all duration-200"
              >
                Cancel
              </button>
              <button 
                onClick={handleSaveNewMember} 
                className="px-4 py-2 bg-brand-green-dark text-white rounded-md hover:bg-brand-green-dark/80 transition-all duration-200"
              >
                Add Member
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Confirmation Modal for Member Removal */}
      {showConfirmModal && memberToRemove && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md m-4">
            <div className="mb-4">
              <h3 className="text-lg font-medium text-gray-900">Remove Member</h3>
              <p className="mt-2 text-sm text-gray-600">
                Are you sure you want to remove <span className="font-semibold">{memberToRemove.name}</span> from the club?
                This action cannot be undone.
              </p>
            </div>
            
            <div className="flex justify-end gap-2 mt-6">
              <button 
                onClick={cancelRemoveMember} 
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-100 transition-all duration-200"
              >
                Cancel
              </button>
              <button 
                onClick={confirmRemoveMember} 
                className="px-4 py-2 bg-brand-red text-white rounded-md hover:bg-brand-red/80 transition-all duration-200"
              >
                Remove Member
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClubManage; 