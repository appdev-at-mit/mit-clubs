import ReactDOM from "react-dom/client";
import App from "./components/App";
import NotFound from "./components/pages/NotFound";
import Home from "./components/pages/Home";
import About from "./components/pages/About";
import Clubs from "./components/pages/Clubs";
import ClubDetails from "./components/pages/ClubDetails";
import ClubManage from "./components/pages/ClubManage";
import Profile from "./components/pages/Profile";

import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
  RouterProvider,
} from "react-router-dom";

import "./utilities.css";

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route errorElement={<NotFound />} element={<App />}>
      <Route path="/" element={<Home />} />
      <Route path="/about" element={<About />} />
      <Route path="/clubs" element={<Clubs />} />
      <Route path="/club/:clubId" element={<ClubDetails />} />
      <Route path="/manage/:clubId" element={<ClubManage />} />
      <Route path="/profile/:userId" element={<Profile />} />
    </Route>
  )
);

const rootElement = document.getElementById("root");
if (!rootElement) throw new Error("Root element not found");

ReactDOM.createRoot(rootElement).render(<RouterProvider router={router} />);
