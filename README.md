# MIT Clubs

## Overview
MIT Clubs serves as a platform for connecting students with MIT's student organizations. Explore and discover student groups throughout the academic year, beyond just Activities Midway.

## Features
- Find clubs using search function and filters by categories, membership size, and application processes
- Save clubs to your profile to track organizations that interest you
- Organize your recruitment schedule and application process via a calendar
- Get recommendations for clubs based on your interests
- Manage your club's profile and membership directory

## Club Leader Tools
Beaver Clubs provides tools for organization leaders to:
- Customize and update your club's public profile
- Indicate your recruitment status and application timeline
- Manage your membership directory
- Answer questions from prospective members

## Development Setup

1. Navigate to the folder where you want to download the code in your IDE.
2. Clone the Github Repository with `git clone <this repository's url>`.
3. In the terminal (root directory), run `npm install`.
4. In the root directory, create a `.env` file.
5. Ask Hailey to send you a copy of the `.env` file contents.
6. Then open two separate terminals:
   - Run `npm run dev` in the first terminal (for the frontend)
   - Run `npm start` in the second terminal (for the backend)
7. You should see in the terminal where you ran `npm start` that you are connected to MongoDB.
8. Open [http://localhost:5173](http://localhost:5173) in your browser.

## Known Issues
- The search bar and saving clubs feature is currently being fixed after migrating the code to the newer tech stack

## Tech Stack
- Frontend: React.js, Tailwind CSS, Vite
- Backend: Node.js, Express.js
- Database: MongoDB

## Team
Beaver Clubs is built by a team of students at [AppDev@MIT](https://www.mitappdev.com/).

## Contact
Questions or ideas? Reach out to our team at [fullstack-exec@mit.edu](mailto:fullstack-exec@mit.edu).
