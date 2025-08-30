export const tagCategories = {
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
