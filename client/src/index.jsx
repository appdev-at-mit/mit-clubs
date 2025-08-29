import React from "react";
import ReactDOM from "react-dom/client";
import App from "./components/App";
import NotFound from "./components/pages/NotFound";
import Clubs from "./components/pages/Clubs";
import ClubDetails from "./components/pages/ClubDetails";
import Profile from "./components/pages/Profile";
import ClubManage from "./components/pages/ClubManage";
import About from "./components/pages/About";
import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
  RouterProvider,
  Navigate
} from 'react-router-dom'

import { GoogleOAuthProvider } from '@react-oauth/google';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route errorElement={<NotFound />} element={<App />}>
      <Route path="/" element={<Clubs />}/>
      <Route path="/saved-clubs" element={<Navigate to="/profile" replace />} />
      <Route path="/clubs/:clubId" element={<ClubDetails />}/>
      <Route path="/clubs/:clubId/manage" element={<ClubManage />} />
      <Route path="/profile" element={<Profile />}/>
      <Route path="/about" element={<About />}/>
    </Route>
  )
)

// renders React Component "Root" into the DOM element with ID "root"
ReactDOM.createRoot(document.getElementById("root")).render(
  <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
    <RouterProvider router={router} />
  </GoogleOAuthProvider>
);
