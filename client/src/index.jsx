import React from "react";
import ReactDOM from "react-dom/client";
import App from "./components/App";
import Skeleton from "./components/pages/Skeleton";
import NotFound from "./components/pages/NotFound";
import Clubs from "./components/pages/Clubs";
import SavedClubs from "./components/pages/SavedClubs";
import ClubDetails from "./components/pages/ClubDetails";
import AdminPanel from "./components/pages/AdminPanel";
import Calendar from "./components/pages/Calendar";
import Profile from "./components/pages/Profile";

import InterestSurvey from "./components/pages/InterestSurvey";
import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
  RouterProvider
} from 'react-router-dom'

import { GoogleOAuthProvider } from '@react-oauth/google';

const GOOGLE_CLIENT_ID = "245535244517-1kuqpnlojjqstpgisiv5unp6ktof9s0c.apps.googleusercontent.com";

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route errorElement={<NotFound />} element={<App />}>
      <Route path="/" element={<Clubs />}/>
      <Route path="/saved-clubs" element={<SavedClubs />}/>
      <Route path="/clubs/:clubId" element={<ClubDetails />}/>
      <Route path="/admin" element={<AdminPanel />} />
      <Route path="/calendar" element={<Calendar />}/>
      <Route path="/profile" element={<Profile />}/>
      <Route path="/survey" element={<InterestSurvey />}/>
    </Route>
  )
)

// renders React Component "Root" into the DOM element with ID "root"
ReactDOM.createRoot(document.getElementById("root")).render(
  <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
    <RouterProvider router={router} />
  </GoogleOAuthProvider>
);
