import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LoginPage from "./login/LoginPage";
import MultiStepRegister from "./register/MultiStepRegister";
import Homepage from "./Homepage/homepage";
import Messages from "./messgaes/messages";
import Uprofile from "./Homepage/Uprofile";
import TagFeed from "./Homepage/Tagfeed";
import MainLayout from "./Homepage/MainLayout";
import Explore from "./Explore/explore";
import SearchPage from "./search/search";
import Profile from "./profile/profile";
import ProfileViewers from "./profileview/ProfileViewers";
import ForgotPassword from "./login/ForgotPassword";
import SavedPosts from "./Homepage/SavedPosts";
import LostFoundPage from "./LostFound/LostFoundPage";
import Marketplace from "./marketplace/Marketplace";
import { UserProvider } from "./UserContext/UserContext";
import "./App.css";
import Settings from "./settings/Settings";
import Welcome from "./welcome/welcome";

const App = () => {
  return (
    <Router>
      <UserProvider>
        <Routes>
          {/* <Route path="/" element={<LoginPage />} /> */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/" element={<Welcome />} />
          <Route path="/register" element={<MultiStepRegister />} />
          <Route element={<MainLayout />}>
            <Route path="/home" element={<Homepage />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/messages" element={<Messages />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/profile/:userId" element={<Uprofile />} />
            <Route path="/tag/:tag" element={<TagFeed />} />
            <Route path="/explore" element={<Explore />} />
            <Route path="/search" element={<SearchPage />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/saved-items" element={<SavedPosts />} />
            <Route path="/profileview" element={<ProfileViewers />} />
            <Route path="/lost-found" element={<LostFoundPage />} />
            <Route path="/marketplace" element={<Marketplace />} />
          </Route>
        </Routes>
      </UserProvider>
    </Router>
  );
};

export default App;
