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
  Navigate,
} from "react-router-dom";

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route errorElement={<NotFound />} element={<App />}>
      <Route path="/" element={<Clubs />} />
      <Route path="/saved-clubs" element={<Navigate to="/profile" replace />} />
      <Route path="/clubs/:clubId" element={<ClubDetails />} />
      <Route path="/clubs/:clubId/manage" element={<ClubManage />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/about" element={<About />} />
    </Route>
  )
);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <RouterProvider router={router} />
);
