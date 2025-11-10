import "./profile.css";
import Modal from "../utils/Modal";
import React, { useEffect, useState } from "react";
import Select from "react-select";
import ProfileUploadModal from "./ProfileUploadModal";
import useLocation from "../utils/useLocation";
import { IoMdAdd } from "react-icons/io";
import { MdEdit } from "react-icons/md";
import { MdDelete } from "react-icons/md";
import UserActivity from "./UserActivity";
import Navbar from "../Homepage/Navbar";
import ProfileLoadFull from "../Loading/profileLoadfull";
import WeekBooking from "../slotbooking/weekbookings";
import MultiSelectTags from "../utils/MultiSelectTags";
export default function Profile() {
  const server = process.env.REACT_APP_SERVER;
  const token = localStorage.getItem("token");
  const loggedInUserId = JSON.parse(localStorage.getItem("user"))?.id;
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [about, setAbout] = useState("");
  const [isModalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState("");
  const [experienceForm, setExperienceForm] = useState([]); // full array from DB
  const [educationForm, setEducationForm] = useState([]); // full array from DB
  const [skillsTemp, setSkillsTemp] = useState([]); // full array from DB
  const [interestsTemp, setinterestsTemp] = useState([]); // full array from DB
  const [projectForm, setprojectForm] = useState([]); // full array from DB
  const [editingIndex, setEditingIndex] = useState(null); // null = adding new
  const [selectedSkill, setSelectedSkill] = useState(null);
  const [selectedInterest, setSelectedInterest] = useState(null);
  const [profileUrl, setProfileUrl] = useState(null);
  const { location, status } = useLocation();

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const res = await fetch(`${server}/api/user/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Failed to load");
        const data = await res.json();

        setProfile({
          ...data,
          experience: Array.isArray(data.experience) ? data.experience : [],
          education: Array.isArray(data.education) ? data.education : [],
          projects: Array.isArray(data.projects) ? data.projects : [],
          skills: Array.isArray(data.skills) ? data.skills : [],
          interests: Array.isArray(data.interests) ? data.interests : [],
        });
        setProfileUrl(data.profile);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadProfile();
  }, [token]);

  const skillOptions = [
    { value: "JavaScript", label: "JavaScript" },
    { value: "Python", label: "Python" },
    { value: "React", label: "React" },
    { value: "Node.js", label: "Node.js" },

    // Technical & Professional
    { value: "Programming", label: "Programming" },
    { value: "Java", label: "Java" },
    { value: "C++", label: "C++" },
    {
      value: "Data Analysis & Statistics",
      label: "Data Analysis & Statistics",
    },
    { value: "Web / App Development", label: "Web / App Development" },
    { value: "UI/UX Design", label: "UI/UX Design" },
    { value: "Graphic Design", label: "Graphic Design" },

    // Communication & Leadership
    { value: "Public Speaking", label: "Public Speaking" },
    { value: "Writing & Editing", label: "Writing & Editing" },
    { value: "Research Assistance", label: "Research Assistance" },
    { value: "Time Management", label: "Time Management" },
    {
      value: "Leadership (Student Clubs)",
      label: "Leadership (Student Clubs)",
    },
    { value: "Event Coordination", label: "Event Coordination" },

    // Newly added academic / research skills
    {
      value: "Teaching & Curriculum Development",
      label: "Teaching & Curriculum Development",
    },
    {
      value: "Academic Research & Publishing",
      label: "Academic Research & Publishing",
    },
    {
      value: "Mentoring & Student Guidance",
      label: "Mentoring & Student Guidance",
    },
    { value: "Grant Writing", label: "Grant Writing" },
    { value: "Conference Presentations", label: "Conference Presentations" },
    {
      value: "Leadership & Administration",
      label: "Leadership & Administration",
    },
    {
      value: "Data Analysis / Advanced Stats",
      label: "Data Analysis / Advanced Stats",
    },
    {
      value: "Public Speaking / Workshops",
      label: "Public Speaking / Workshops",
    },
    {
      value: "Interdisciplinary Collaboration",
      label: "Interdisciplinary Collaboration",
    },
  ];

  const interestOptions = [
    {
      value: "Artificial Intelligence & Machine Learning",
      label: "Artificial Intelligence & Machine Learning",
    },
    { value: "Cybersecurity", label: "Cybersecurity" },
    { value: "Cloud Computing", label: "Cloud Computing" },
    { value: "Robotics", label: "Robotics" },
    { value: "Blockchain", label: "Blockchain" },
    { value: "VR / AR", label: "VR / AR" },
    { value: "Environmental Issues", label: "Environmental Issues" },
    { value: "Finance & Investing", label: "Finance & Investing" },
    { value: "Marketing & Branding", label: "Marketing & Branding" },
    { value: "Creative Writing", label: "Creative Writing" },
    { value: "Sports & Fitness", label: "Sports & Fitness" },
    { value: "Music & Performing Arts", label: "Music & Performing Arts" },
    { value: "Traveling & Culture", label: "Traveling & Culture" },

    // Newly added interests you requested
    {
      value: "Emerging Technologies in Education",
      label: "Emerging Technologies in Education",
    },
    { value: "AI / ML Applications", label: "AI / ML Applications" },
    {
      value: "Sustainability & Environmental Research",
      label: "Sustainability & Environmental Research",
    },
    { value: "Policy & Governance", label: "Policy & Governance" },
    {
      value: "Community Outreach & Service Learning",
      label: "Community Outreach & Service Learning",
    },
    {
      value: "Cross-Disciplinary Research",
      label: "Cross-Disciplinary Research",
    },
    { value: "Educational Technology", label: "Educational Technology" },
    { value: "Industry Partnerships", label: "Industry Partnerships" },
    { value: "Lifelong Learning", label: "Lifelong Learning" },
  ];
  if (loading) return <ProfileLoadFull />;
  if (!profile) return <div>No data</div>;
  const editinfo = (type, i) => {
    setModalType(type);
    setModalOpen(true);
    if (type === "about") {
      setAbout(profile.about);
    }

    if (type === "experience") {
      setEditingIndex(i);
      if (i !== null && profile.experience[i]) {
        setExperienceForm(profile.experience[i]);
      } else {
        // Adding new
        setExperienceForm({
          title: "",
          start_date: "",
          end_date: "",
          company_name: "",
          description: "",
        });
      }
    }
    if (type === "education") {
      setEditingIndex(i);
      if (i !== null && profile.education[i]) {
        setEducationForm(profile.education[i]);
      } else {
        // Adding new
        setEducationForm({
          university_name: "",
          start_date: "",
          end_date: "",
          course_name: "",
        });
      }
    }
    if (type === "projects") {
      setEditingIndex(i);
      if (i !== null && profile.projects[i]) {
        setprojectForm(profile.projects[i]);
      } else {
        // Adding new
        setprojectForm({
          project_name: "",
          start_date: "",
          end_date: "",
          description: "",
        });
      }
    }
    if (type === "skills") {
      setEditingIndex(null);
      setSkillsTemp(Array.isArray(profile.skills) ? [...profile.skills] : []);
      setSelectedSkill(null);
    }
    if (type === "interests") {
      setEditingIndex(null);
      setinterestsTemp(
        Array.isArray(profile.interests) ? [...profile.interests] : []
      );
      setSelectedInterest(null);
    }
  };

  const saveField = async () => {
    if (modalType === "about") {
      try {
        const res = await fetch(`${server}/api/user/about`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`, // send JWT token
          },
          body: JSON.stringify({ about }),
        });

        if (!res.ok) throw new Error("Failed to update profile");
        setProfile({ ...profile, about: about });
        setModalOpen(false);
      } catch (error) {
        console.error("Error updating profile:", error);
        alert("Error saving changes. Please try again.");
      }
    } else if (modalType === "experience") {
      let updatedExperience = [...profile.experience];

      if (editingIndex !== null && updatedExperience[editingIndex]) {
        // Editing
        updatedExperience[editingIndex] = experienceForm;
      } else {
        // Adding
        updatedExperience.push(experienceForm);
      }

      try {
        const res = await fetch(`${server}/api/user/experience`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify(updatedExperience),
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to save experience");

        setProfile((prev) => ({ ...prev, experience: data.experience }));
        setModalOpen(false);
      } catch (err) {
        alert(err.message);
      }
    } else if (modalType === "education") {
      let updatedEducation = [...profile.education];

      if (editingIndex !== null && updatedEducation[editingIndex]) {
        // Editing
        updatedEducation[editingIndex] = educationForm;
      } else {
        // Adding
        updatedEducation.push(educationForm);
      }

      try {
        const res = await fetch(`${server}/api/user/education`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify(updatedEducation),
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to save experience");

        setProfile((prev) => ({ ...prev, education: data.education }));
        setModalOpen(false);
      } catch (err) {
        alert(err.message);
      }
    } else if (modalType === "projects") {
      let updatedprojects = [...profile.projects];

      if (editingIndex !== null && updatedprojects[editingIndex]) {
        // Editing
        updatedprojects[editingIndex] = projectForm;
      } else {
        // Adding
        updatedprojects.push(projectForm);
      }

      try {
        const res = await fetch(`${server}/api/user/projects`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify(updatedprojects),
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to save experience");

        setProfile((prev) => ({ ...prev, projects: data.projects }));
        setModalOpen(false);
      } catch (err) {
        alert(err.message);
      }
    } else if (modalType === "skills") {
      if (!Array.isArray(skillsTemp) || skillsTemp.length > 15) {
        alert("Skills must be an array with 15 or fewer items.");
        return;
      }
      try {
        const res = await fetch(`${server}/api/user/skills`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({ skills: skillsTemp }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to save skills");
        setProfile((prev) => ({ ...prev, skills: data.skills || skillsTemp }));
        setModalOpen(false);
      } catch (err) {
        alert(err.message);
      }
    } else if (modalType === "interests") {
      if (!Array.isArray(interestsTemp) || interestsTemp.length > 7) {
        alert("interests must be an array with 7 or fewer items.");
        return;
      }
      try {
        const res = await fetch(`${server}/api/user/interests`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({ interests: interestsTemp }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to save skills");
        setProfile((prev) => ({
          ...prev,
          interests: data.interests || interestsTemp,
        }));
        setModalOpen(false);
      } catch (err) {
        alert(err.message);
      }
    }
  };
  function formatDuration(startDate, endDate) {
    const start = new Date(startDate);
    const end = endDate ? new Date(endDate) : new Date(); // if null => Present
    const diffMs = end - start;

    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffWeeks = Math.floor(diffDays / 7);
    const diffMonths =
      (end.getFullYear() - start.getFullYear()) * 12 +
      (end.getMonth() - start.getMonth());
    const diffYears = Math.floor(diffMonths / 12);

    if (diffDays < 7) return `${diffDays} day${diffDays !== 1 ? "s" : ""}`;
    if (diffWeeks < 4) return `${diffWeeks} week${diffWeeks !== 1 ? "s" : ""}`;
    if (diffMonths < 12)
      return `${diffMonths} month${diffMonths !== 1 ? "s" : ""}`;
    return `${diffYears} year${diffYears !== 1 ? "s" : ""}${
      diffMonths % 12 > 0
        ? `, ${diffMonths % 12} month${diffMonths % 12 !== 1 ? "s" : ""}`
        : ""
    }`;
  }

  const handleChange = (e) => {
    if (modalType === "experience") {
      setExperienceForm({ ...experienceForm, [e.target.name]: e.target.value });
    } else if (modalType === "education") {
      setEducationForm({ ...educationForm, [e.target.name]: e.target.value });
    } else if (modalType === "projects") {
      setprojectForm({ ...projectForm, [e.target.name]: e.target.value });
    }
  };

  const deleteinfo = async (type, index) => {
    if (type === "experience") {
      let updated = [...profile.experience];
      updated.splice(index, 1);

      try {
        const res = await fetch(`${server}/api/user/experience`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify(updated),
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to delete");

        setProfile((prev) => ({ ...prev, experience: data.experience }));
      } catch (err) {
        alert(err.message);
      }
    } else if (type === "education") {
      let updated = [...profile.education];
      updated.splice(index, 1);

      try {
        const res = await fetch(`${server}/api/user/education`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify(updated),
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to delete");

        setProfile((prev) => ({ ...prev, education: data.education }));
      } catch (err) {
        alert(err.message);
      }
    } else if (type === "projects") {
      let updated = [...profile.projects];
      updated.splice(index, 1);

      try {
        const res = await fetch(`${server}/api/user/projects`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify(updated),
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to delete");

        setProfile((prev) => ({ ...prev, projects: data.projects }));
      } catch (err) {
        alert(err.message);
      }
    }
  };
  const filteredSkillOptions = skillOptions.filter(
    (opt) => !skillsTemp.includes(opt.value)
  );
  const filteredInterestOptions = interestOptions.filter(
    (opt) => !interestsTemp.includes(opt.value)
  );
  return (
    <>
      <div className="container-1">
        <Navbar />
      </div>
      <div className="container-2">
        <div className="prof">
          <Modal isOpen={isModalOpen} onClose={() => setModalOpen(false)}>
            {modalType === "about" && (
              <>
                <h3>About</h3>
                <textarea
                  className="post-textarea"
                  value={about}
                  onChange={(e) => {
                    if (e.target.value.length <= 150) {
                      setAbout(e.target.value);
                    }
                  }}
                  onInput={(e) => {
                    e.target.style.height = "auto";
                    e.target.style.height = e.target.scrollHeight + "px";
                  }}
                  rows="4"
                  style={{
                    width: "100%", // now 100% of modal-ins
                    minHeight: "100px",
                    resize: "none",
                    overflowY: "hidden",
                    boxSizing: "border-box",
                  }}
                />

                <p>{about.length}/150 characters</p>
                {about.trim() !== profile.about.trim() &&
                  about.trim() !== "" && (
                    <button onClick={saveField} className="prof-btn">
                      Save
                    </button>
                  )}
              </>
            )}
            {modalType === "profile" && (
              <>
                <ProfileUploadModal
                  isOpen={isModalOpen}
                  onClose={() => setModalOpen(false)}
                  onUploaded={(newUrl) => setProfileUrl(newUrl)} // update instantly
                />
              </>
            )}
            {modalType === "experience" && (
              <>
                <h3>Add Experience</h3>
                <label className="input-register-label">
                  Title
                  <input
                    name="title"
                    className="input-register"
                    placeholder="Title"
                    value={experienceForm.title}
                    onChange={handleChange}
                  />
                </label>
                <label className="input-register-label">
                  Company Name
                  <input
                    name="company_name"
                    placeholder="Company Name"
                    className="input-register"
                    value={experienceForm.company_name}
                    onChange={handleChange}
                  />
                </label>

                <div style={{ display: "flex", gap: "10px" }}>
                  <label htmlFor="start_date" className="input-register-label">
                    Start Date
                    <input
                      type="date"
                      name="start_date"
                      className="input-register"
                      value={experienceForm.start_date}
                      onChange={handleChange}
                    />
                  </label>
                  <label htmlFor="end_Date" className="input-register-label">
                    End date
                    <input
                      type="date"
                      name="end_date"
                      className="input-register"
                      value={experienceForm.end_date}
                      onChange={handleChange}
                    />
                  </label>
                </div>
                <label className="input-register-label ">
                  Description
                  <textarea
                    name="description"
                    className="post-textarea"
                    placeholder="Role description"
                    value={experienceForm.description}
                    onChange={handleChange}
                  />
                </label>
                <button onClick={saveField} className="prof-btn">
                  Save
                </button>
              </>
            )}
            {modalType === "education" && (
              <>
                <h3>Education</h3>

                <label className="input-register-label">
                  School Name
                  <input
                    className="input-register"
                    name="university_name"
                    placeholder="School name"
                    value={educationForm.university_name}
                    onChange={handleChange}
                  />
                </label>

                <div style={{ display: "flex", gap: "10px" }}>
                  <label className="input-register-label">
                    Start Date
                    <input
                      className="input-register"
                      type="date"
                      name="start_date"
                      value={educationForm.start_date}
                      onChange={handleChange}
                    />
                  </label>
                  <label className="input-register-label">
                    End Date
                    <input
                      className="input-register"
                      type="date"
                      name="end_date"
                      value={educationForm.end_date}
                      onChange={handleChange}
                    />
                  </label>
                </div>
                <label className="input-register-label">
                  Course
                  <textarea
                    name="course_name"
                    className="post-textarea"
                    placeholder="Course"
                    value={educationForm.course_name}
                    onChange={handleChange}
                  />
                </label>

                <button onClick={saveField} className="prof-btn">
                  Save
                </button>
              </>
            )}
            {modalType === "projects" && (
              <>
                <h3>Projects</h3>
                <label className="input-register-label">
                  Project Name
                  <input
                    name="project_name"
                    className="input-register"
                    placeholder="Project name"
                    value={projectForm.project_name}
                    onChange={handleChange}
                  />
                </label>
                <div style={{ display: "flex", gap: "10px" }}>
                  <label className="input-register-label">
                    Start Date
                    <input
                      className="input-register"
                      type="date"
                      name="start_date"
                      value={projectForm.start_date}
                      onChange={handleChange}
                    />
                  </label>

                  <label className="input-register-label">
                    End Date
                    <input
                      type="date"
                      className="input-register"
                      name="end_date"
                      value={projectForm.end_date}
                      onChange={handleChange}
                    />
                  </label>
                </div>

                <label className="input-register-label">
                  Description
                  <textarea
                    className="post-textarea"
                    name="description"
                    placeholder="Description"
                    value={projectForm.description}
                    onChange={handleChange}
                  />
                </label>

                <button onClick={saveField} className="prof-btn">
                  Save
                </button>
              </>
            )}
            {modalType === "skills" && (
              <>
                <div className="flex-c gap10">
                  <h3>Skills</h3>
                  <div className="skills-dis flex-r gap10">
                    {skillsTemp.length > 0 &&
                      skillsTemp.map((skill, i) => (
                        <div key={i} className="prof-8-1-1">
                          {skill}
                          <button
                            onClick={() =>
                              setSkillsTemp(
                                skillsTemp.filter((s) => s !== skill)
                              )
                            }
                            className="close-btn-skills"
                          >
                            X
                          </button>
                        </div>
                      ))}
                  </div>

                  {skillsTemp.length < 15 && (
                    <div className="select-container">
                      <div className="flex-r gap20">
                        <Select
                          className="skill-select"
                          options={filteredSkillOptions}
                          value={selectedSkill}
                          onChange={setSelectedSkill}
                          isClearable
                          isSearchable
                          placeholder="Select a skill"
                          menuPortalTarget={null}
                          menuPosition="absolute"
                          styles={{
                            /** outer wrapper */
                            container: (base) => ({
                              ...base,
                              width: 300,
                              flex: "0 0 auto",
                            }),
                            /** the visible input/control */
                            control: (base) => ({
                              ...base,
                              minHeight: 36,
                              width: "100%",
                            }),
                            /** dropdown panel */
                            menu: (base) => ({ ...base, width: "100%" }),
                            /** list inside the dropdown */
                            menuList: (base) => ({
                              ...base,
                              maxHeight: 150,
                              overflowY: "auto",
                            }),
                          }}
                        />
                        <button
                          onClick={() => {
                            if (!selectedSkill?.value) return;
                            const next = selectedSkill.value;

                            if (skillsTemp.length >= 15) return; // enforce cap
                            setSkillsTemp([...skillsTemp, next]); // preview list only
                            setSelectedSkill(null);
                          }}
                          className="add-btn"
                        >
                          Add
                        </button>
                      </div>
                    </div>
                  )}
                  <button onClick={saveField} className="prof-btn">
                    Save
                  </button>
                </div>
              </>
            )}
            {modalType === "interests" && (
              <>
                <div className="flex-c gap10">
                  <h3>Interests</h3>
                  <div className="skills-dis">
                    {interestsTemp.length > 0 &&
                      interestsTemp.map((interest, i) => (
                        <div key={i} className="interests-dis">
                          {interest}
                          <button
                            onClick={() =>
                              setinterestsTemp(
                                interestsTemp.filter((s) => s !== interest)
                              )
                            }
                            className="close-btn-skills"
                          >
                            X
                          </button>
                        </div>
                      ))}
                  </div>

                  {interestsTemp.length < 7 && (
                    <div className="select-container">
                      <div>
                        <Select
                          className="skill-select"
                          options={filteredInterestOptions}
                          value={selectedInterest}
                          onChange={setSelectedInterest}
                          isClearable
                          isSearchable
                          placeholder="Select a interest"
                          menuPortalTarget={null} // keep it inside the modal
                          menuPosition="absolute" // ensures it positions properly inside modal
                          styles={{
                            /** outer wrapper */
                            container: (base) => ({
                              ...base,
                              width: 300,
                              flex: "0 0 auto",
                            }),
                            /** the visible input/control */
                            control: (base) => ({
                              ...base,
                              minHeight: 36,
                              width: "100%",
                            }),
                            /** dropdown panel */
                            menu: (base) => ({ ...base, width: "100%" }),
                            /** list inside the dropdown */
                            menuList: (base) => ({
                              ...base,
                              maxHeight: 150,
                              overflowY: "auto",
                            }),
                          }}
                        />
                      </div>
                      <button
                        onClick={() => {
                          if (!selectedInterest?.value) return;
                          const next = selectedInterest.value;

                          if (interestsTemp.length > 7) return; // enforce cap
                          setinterestsTemp([...interestsTemp, next]); // preview list only
                          setSelectedInterest(null);
                        }}
                        className="add-btn"
                      >
                        Add
                      </button>
                    </div>
                  )}
                  <button onClick={saveField} className="prof-btn">
                    Save
                  </button>
                </div>
              </>
            )}
          </Modal>
          <div className="prof-1">
            <div className="prof-11">
              {profileUrl ? (
                <img src={profileUrl} alt="Profile" className="profile-img" />
              ) : (
                <div className="profile-fallback">
                  {`${profile.first_name?.[0] || ""}${
                    profile.last_name?.[0] || ""
                  }`.toUpperCase()}
                </div>
              )}

              <MdEdit onClick={() => editinfo("profile", null)} size={20} />
            </div>

            <div className="prof-12">
              <p className="name-prof">
                {profile.first_name} {profile.last_name}
              </p>

              {profile.course && <p>{profile.course}</p>}
              {profile.university && <p>{profile.university}</p>}

              {status ? (
                <div>{status}</div>
              ) : (
                <div>
                  {location.city}, {location.state}, {location.country}
                </div>
              )}
            </div>
          </div>

          <div className="prof-1">
            <h1>Have free time! Help students And earn Money</h1>

            <WeekBooking user={profile} />
          </div>
          {/* <div className="prof-2">Suggested for you</div> */}
          <div className="prof-3">
            <div className="prof-3-1">
              <h2>About</h2>
              {!profile.about ? (
                <div>
                  <div>add about</div>
                  <IoMdAdd onClick={() => editinfo("about", 0)} size={20} />
                </div>
              ) : (
                <>
                  <div>
                    <MdEdit onClick={() => editinfo("about", 0)} size={20} />
                  </div>
                </>
              )}
            </div>
            <div>{profile.about}</div>
          </div>
          <div className="prof-4">
            <p>Activity</p>
            <UserActivity userId={loggedInUserId} />
          </div>
          <div className="prof-5">
            <div className="prof-5-1">
              <h2>Experience</h2>
              {profile.experience.length < 3 && (
                <IoMdAdd
                  onClick={() => editinfo("experience", null)}
                  size={28}
                />
              )}
            </div>
            {profile.experience.length > 0 ? (
              profile.experience.map((exp, i) => (
                <div key={i} className="exp-div">
                  <div className="prof-5-1">
                    <h3>{exp.company_name} </h3>
                    <div className="prof-5-1-1">
                      <MdEdit
                        onClick={() => editinfo("experience", i)}
                        size={20}
                      />
                      <MdDelete
                        onClick={() => deleteinfo("experience", i)}
                        size={20}
                      />
                    </div>
                  </div>

                  <p>
                    {new Date(exp.start_date).toLocaleDateString("en-US", {
                      month: "long",
                      year: "numeric",
                    })}{" "}
                    -{" "}
                    {exp.end_date
                      ? new Date(exp.end_date).toLocaleDateString("en-US", {
                          month: "long",
                          year: "numeric",
                        })
                      : "Present"}
                    {" . "}
                    <i>{formatDuration(exp.start_date, exp.end_date)}</i>
                  </p>
                  <p>{exp.title}</p>
                  <p>{exp.description}</p>
                </div>
              ))
            ) : (
              <p>No experiences added yet.</p>
            )}
          </div>

          <div className="prof-6">
            <div className="prof-5-1">
              <h2>Education</h2>
              {profile.education.length < 3 && (
                <IoMdAdd
                  onClick={() => editinfo("education", null)}
                  size={28}
                />
              )}
            </div>
            {profile.education.length > 0 ? (
              profile.education.map((edu, i) => (
                <div key={i} className="exp-div">
                  <div className="prof-5-1">
                    <h3>{edu.university_name}</h3>
                    <div className="prof-5-1-1">
                      <MdEdit
                        onClick={() => editinfo("education", i)}
                        size={20}
                      />
                      <MdDelete
                        onClick={() => deleteinfo("education", i)}
                        size={20}
                      />
                    </div>
                  </div>
                  <p>
                    {new Date(edu.start_date).toLocaleDateString("en-US", {
                      month: "long",
                      year: "numeric",
                    })}{" "}
                    -{" "}
                    {edu.end_date
                      ? new Date(edu.end_date).toLocaleDateString("en-US", {
                          month: "long",
                          year: "numeric",
                        })
                      : "Present"}
                    {" . "}
                    <i>{formatDuration(edu.start_date, edu.end_date)}</i>
                  </p>
                  <p>{edu.course_name}</p>
                </div>
              ))
            ) : (
              <p>No education added yet.</p>
            )}
          </div>
          <div className="prof-7">
            <div className="prof-5-1">
              <h2>Projects</h2>{" "}
              {profile.projects.length < 3 && (
                <IoMdAdd onClick={() => editinfo("projects", null)} size={28} />
              )}
            </div>
            {profile.projects.length > 0 ? (
              profile.projects.map((pro, i) => (
                <div key={i} className="exp-div">
                  <div className="prof-5-1">
                    <h3>{pro.project_name}</h3>
                    <div className="prof-5-1-1">
                      <MdEdit
                        onClick={() => editinfo("projects", i)}
                        size={20}
                      />
                      <MdDelete
                        onClick={() => deleteinfo("projects", i)}
                        size={20}
                      />
                    </div>
                  </div>
                  <p>{pro.course_name}</p>
                  <p>
                    {new Date(pro.start_date).toLocaleDateString("en-US", {
                      month: "long",
                      year: "numeric",
                    })}{" "}
                    -{" "}
                    {pro.end_date
                      ? new Date(pro.end_date).toLocaleDateString("en-US", {
                          month: "long",
                          year: "numeric",
                        })
                      : "Present"}
                    {" . "}
                    <i>{formatDuration(pro.start_date, pro.end_date)}</i>
                  </p>
                  <p>{pro.description}</p>
                </div>
              ))
            ) : (
              <p>No education added yet.</p>
            )}
          </div>
          <div className="prof-8">
            <div className="prof-5-1">
              <h2>Skills</h2>
              <div style={{ display: "flex", gap: 8 }}>
                {(!Array.isArray(profile.skills) ||
                  profile.skills.length < 15) && (
                  <>
                    {profile.skills && profile.skills.length > 0 ? (
                      <MdEdit
                        onClick={() => editinfo("skills", null)}
                        size={20}
                      />
                    ) : (
                      <IoMdAdd
                        onClick={() => editinfo("skills", null)}
                        size={28}
                      />
                    )}
                  </>
                )}
              </div>
            </div>
            <div className="prof-8-1">
              {profile.skills.length > 0 ? (
                profile.skills.map((skill, i) => (
                  <div key={i} className="prof-8-1-1">
                    {skill}
                  </div>
                ))
              ) : (
                <p>No skills added yet.</p>
              )}
            </div>
          </div>

          <div className="prof-10">
            <div className="prof-5-1">
              <h2>Interests</h2>
              <div style={{ display: "flex", gap: 8 }}>
                {(!Array.isArray(profile.interests) ||
                  profile.interests.length < 7) && (
                  <>
                    {profile.interests && profile.interests.length > 0 ? (
                      <MdEdit
                        onClick={() => editinfo("interests", null)}
                        size={20}
                      />
                    ) : (
                      <IoMdAdd
                        onClick={() => editinfo("interests", null)}
                        size={28}
                      />
                    )}
                  </>
                )}
              </div>
            </div>
            <div className="prof-8-1">
              {profile.interests.length > 0 ? (
                profile.interests.map((interest, i) => (
                  <div key={i} className="prof-9-1-1 interests-dis">
                    {interest}
                  </div>
                ))
              ) : (
                <p>No interests added yet.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
