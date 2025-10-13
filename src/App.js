import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LoginPage from "./login/LoginPage";
import MultiStepRegister from "./register/MultiStepRegister";
import Homepage from "./Homepage/homepage";
import Messages from "./messgaes/messages";
import Uprofile from "./Homepage/Uprofile";
import TagFeed from "./Homepage/Tagfeed";
import Explore from "./Explore/explore";
import SearchPage from "./search/search";

import Profile from "./profile/profile";
import "./App.css";
import ProfileViewers from "./profileview/ProfileViewers";
import ForgotPassword from "./login/ForgotPassword";
const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/register" element={<MultiStepRegister />} />
        <Route path="/home" element={<Homepage />} />
        <Route path="/messages" element={<Messages />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/profile/:userId" element={<Uprofile />} />
        <Route path="/tag/:tag" element={<TagFeed />} />
        <Route path="/explore" element={<Explore />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/profileview" element={<ProfileViewers />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
      </Routes>
    </Router>
  );
};

export default App;
