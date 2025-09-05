export const tagCategories = {
  Academic: [
    "Academic and Pre-Professional",
    "Education",
    "Research",
    "Technology",
    "Entrepreneurship",
    "Engineering",
    "Computer Science",
    "Math",
    "Business and Economics",
    "Science",
    "Medicine and Health",
    "Finance and Consulting",
    "Media and Journalism",
    "Design",
  ],
  Creative: [
    "Arts",
    "Performance",
    "Music",
    "Visual Arts",
    "Literary Arts",
    "Publication",
  ],
  Identity: [
    "Cultural",
    "International Student",
    "Religious and Spiritual",
    "LGBTQ+",
    "Gender-Based",
    "Diversity and Inclusion",
    "Gender and Sexuality",
  ],
  Service: [
    "Community Service",
    "Activism",
    "Political",
    "Fundraising and Philanthropy",
  ],
  Athletics: [
    "Athletics and Outdoors",
    "Club Sports",
    "Intramural Sports",
    "Recreational",
  ],
  Hobbies: [
    "Hobbies and Special Interests",
    "Games and Puzzles",
    "Gaming",
    "Food and Cooking",
  ],
  Social: ["Greek Life"],
  Other: ["Departmental Program", "Resources and Support"],
};

export const availableRoles = [
  { role: "Co-Chair", permissions: "Owner" as const },
  { role: "Marketing Chair", permissions: "Officer" as const },
  { role: "Treasurer", permissions: "Officer" as const },
  { role: "Secretary", permissions: "Officer" as const },
  { role: "Member", permissions: "Member" as const },
];

export const membershipProcessOptions = [
  "Open Membership",
  "Application Required",
  "Tryout Required",
  "Audition Required",
  "Application and Interview Required",
  "Invite-only",
];

export const recruitmentCycles = [
  { id: "cycle_open", value: "Open", label: "Open" },
  { id: "cycle_fall", value: "Fall Semester", label: "Fall Semester" },
  { id: "cycle_spring", value: "Spring Semester", label: "Spring Semester" },
  { id: "cycle_iap", value: "IAP", label: "IAP" },
];
