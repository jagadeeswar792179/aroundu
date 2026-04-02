import "./profile.css";
import Modal from "../utils/Modal";
import React, { useState, useEffect } from "react";
import Select from "react-select";
import ProfileUploadModal from "./ProfileUploadModal";
import useLocation from "../utils/useLocation";
import { IoMdAdd } from "react-icons/io";
import { MdEdit, MdDelete } from "react-icons/md";
import UserActivity from "./UserActivity";
import ProfileLoadFull from "../Loading/profileLoadfull";
import WeekBooking from "../slotbooking/weekbookings";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getTokenPayload } from "../utils/getTokenPayload";
import CustomSelect from "../utils/CustomSelect";

export default function Profile() {
  const server = process.env.REACT_APP_SERVER;
  const token = localStorage.getItem("token");
  const loggedInUserId = JSON.parse(localStorage.getItem("user"))?.id;
  const queryClient = useQueryClient();
  const { location, status } = useLocation();
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  /* =========================
     LOCAL STATE (UNCHANGED)
     ========================= */
  const tokenDetails = getTokenPayload();
  const [about, setAbout] = useState("");
  const [isModalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState("");
  const [experienceForm, setExperienceForm] = useState([]);
  const [educationForm, setEducationForm] = useState([]);
  const [skillsTemp, setSkillsTemp] = useState([]);
  const [interestsTemp, setinterestsTemp] = useState([]);
  const [projectForm, setprojectForm] = useState([]);
  const [editingIndex, setEditingIndex] = useState(null);
  const [selectedSkill, setSelectedSkill] = useState(null);
  const [selectedInterest, setSelectedInterest] = useState(null);
  const [profileUrl, setProfileUrl] = useState(null);

  /* =========================
     FETCH PROFILE (NEW)
     ========================= */

  const fetchProfile = async () => {
    const res = await fetch(`${server}/api/user/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) throw new Error("Failed to load");

    const data = await res.json();

    return {
      ...data,
      experience: Array.isArray(data.experience) ? data.experience : [],
      education: Array.isArray(data.education) ? data.education : [],
      projects: Array.isArray(data.projects) ? data.projects : [],
      skills: Array.isArray(data.skills) ? data.skills : [],
      interests: Array.isArray(data.interests) ? data.interests : [],
    };
  };

  const {
    data: profile,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["profile"],
    queryFn: fetchProfile,
    enabled: !!token,
    staleTime: 1000 * 60 * 5,
  });
  useEffect(() => {
    if (profile?.profile) {
      setProfileUrl(profile.profile);
    }
  }, [profile]);

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
    // {
    //   value: "Artificial Intelligence & Machine Learning",
    //   label: "Artificial Intelligence & Machine Learning",
    // },
    // { value: "Cybersecurity", label: "Cybersecurity" },
    // { value: "Cloud Computing", label: "Cloud Computing" },
    // { value: "Robotics", label: "Robotics" },
    // { value: "Blockchain", label: "Blockchain" },
    // { value: "VR / AR", label: "VR / AR" },
    // { value: "Environmental Issues", label: "Environmental Issues" },
    // { value: "Finance & Investing", label: "Finance & Investing" },
    // { value: "Marketing & Branding", label: "Marketing & Branding" },
    // { value: "Creative Writing", label: "Creative Writing" },
    // { value: "Sports & Fitness", label: "Sports & Fitness" },
    // { value: "Music & Performing Arts", label: "Music & Performing Arts" },
    // { value: "Traveling & Culture", label: "Traveling & Culture" },

    // // Newly added interests you requested
    // {
    //   value: "Emerging Technologies in Education",
    //   label: "Emerging Technologies in Education",
    // },
    // { value: "AI / ML Applications", label: "AI / ML Applications" },
    // {
    //   value: "Sustainability & Environmental Research",
    //   label: "Sustainability & Environmental Research",
    // },
    // { value: "Policy & Governance", label: "Policy & Governance" },
    // {
    //   value: "Community Outreach & Service Learning",
    //   label: "Community Outreach & Service Learning",
    // },
    // {
    //   value: "Cross-Disciplinary Research",
    //   label: "Cross-Disciplinary Research",
    // },
    // { value: "Educational Technology", label: "Educational Technology" },
    // { value: "Industry Partnerships", label: "Industry Partnerships" },
    // { value: "Lifelong Learning", label: "Lifelong Learning" },
    { value: "sports", label: "Sports" },
    { value: "technology", label: "Technology" },
    { value: "career", label: "Career" },
    { value: "campus_life", label: "Campus Life" },
    { value: "social", label: "Social" },
    { value: "music", label: "Music" },
    { value: "food", label: "Food" },
    { value: "entertainment", label: "Entertainment" },
    { value: "academics", label: "Academics" },
    { value: "community", label: "Community" },
    { value: "travel", label: "Travel" },
    { value: "tech", label: "Tech" },
    { value: "fashion", label: "Fashion" },
    { value: "fitness", label: "Fitness" },
    { value: "nature", label: "Nature" },

    // Student tags
    { value: "stem-student", label: "STEM Student" },
    { value: "humanities-student", label: "Humanities Student" },
    { value: "arts-design-student", label: "Arts & Design" },
    {
      value: "business-entrepreneurship-student",
      label: "Business & Entrepreneurship",
    },
    { value: "innovation-startups-student", label: "Innovation & Startups" },
    {
      value: "sustainability-social-impact-student",
      label: "Sustainability & Social Impact",
    },
    { value: "hackathons-competitions", label: "Hackathons / Competitions" },
    { value: "internships", label: "Internships" },
    { value: "volunteering", label: "Volunteering" },

    // Faculty / professional tags
    { value: "stem-faculty", label: "STEM Faculty" },
    { value: "humanities-faculty", label: "Humanities Faculty" },
    { value: "arts-design-faculty", label: "Arts & Design Faculty" },
    { value: "business-management", label: "Business & Management" },
    { value: "research-supervisor", label: "Research Supervisor" },
    { value: "grant-recipient", label: "Grant Recipient" },
    { value: "industry-collaboration", label: "Industry Collaboration" },
    { value: "conference-speaker", label: "Conference Speaker" },
    { value: "editorial-board-member", label: "Editorial Board Member" },
  ];
  if (isLoading) return <ProfileLoadFull />;
  if (isError) return <div>Error loading profile</div>;
  if (!profile) return <div>No data</div>;

  /* =========================
     HELPER FUNCTIONS (UNCHANGED)
     ========================= */

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
        setprojectForm({
          project_name: "",
          start_date: "",
          end_date: "",
          description: "",
        });
      }
    }

    if (type === "skills") {
      setSkillsTemp([...profile.skills]);
      setSelectedSkill(null);
    }

    if (type === "interests") {
      setinterestsTemp([...profile.interests]);
      setSelectedInterest(null);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (modalType === "experience") {
      setExperienceForm((prev) => ({ ...prev, [name]: value }));
    } else if (modalType === "education") {
      setEducationForm((prev) => ({ ...prev, [name]: value }));
    } else if (modalType === "projects") {
      setprojectForm((prev) => ({ ...prev, [name]: value }));
    }

    validateField(name, value);
  };

  const validateField = (name, value) => {
    let error = "";

    if (!value || !value.toString().trim()) {
      error = "Required";
    }

    if (name === "end_date") {
      let start;

      if (modalType === "experience") start = experienceForm.start_date;
      if (modalType === "education") start = educationForm.start_date;
      if (modalType === "projects") start = projectForm.start_date;

      if (start && value && value < start) {
        error = "End date cannot be before start date";
      }
    }

    setErrors((prev) => ({
      ...prev,
      [name]: error,
    }));
  };

  const handleBlur = (e) => {
    const { name } = e.target;

    setTouched((prev) => ({
      ...prev,
      [name]: true,
    }));
  };
  function formatDuration(startDate, endDate) {
    const start = new Date(startDate);
    const end = endDate ? new Date(endDate) : new Date();
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
    return `${diffYears} year${diffYears !== 1 ? "s" : ""}`;
  }

  const getBlogUrl = (rawUrl) => {
    if (!rawUrl) return "#";
    if (/^https?:\/\//i.test(rawUrl)) return rawUrl;
    return `https://${rawUrl}`;
  };

  /* =========================
     SAVE FIELD (UPDATED CACHE)
     ========================= */

  const saveField = async () => {
    try {
      const endpoints = {
        about: "/api/user/about",
        experience: "/api/user/experience",
        education: "/api/user/education",
        projects: "/api/user/projects",
        skills: "/api/user/skills",
        interests: "/api/user/interests",
      };

      let body;

      if (modalType === "about") body = { about };
      if (modalType === "experience") {
        const updated = [...profile.experience];
        editingIndex !== null
          ? (updated[editingIndex] = experienceForm)
          : updated.push(experienceForm);
        body = updated;
      }
      if (modalType === "education") {
        const updated = [...profile.education];
        editingIndex !== null
          ? (updated[editingIndex] = educationForm)
          : updated.push(educationForm);
        body = updated;
      }
      if (modalType === "projects") {
        const updated = [...profile.projects];
        editingIndex !== null
          ? (updated[editingIndex] = projectForm)
          : updated.push(projectForm);
        body = updated;
      }
      if (modalType === "skills") body = { skills: skillsTemp };
      if (modalType === "interests") body = { interests: interestsTemp };

      const res = await fetch(`${server}${endpoints[modalType]}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update");

      queryClient.setQueryData(["profile"], (old) => ({
        ...old,
        ...data,
      }));

      setModalOpen(false);
    } catch (err) {
      alert(err.message);
    }
  };

  /* =========================
     DELETE (UPDATED CACHE)
     ========================= */
  const handleSave = () => {
    let form =
      modalType === "experience"
        ? experienceForm
        : modalType === "education"
          ? educationForm
          : projectForm;

    let newErrors = {};

    Object.keys(form).forEach((key) => {
      if (!form[key] || !form[key].toString().trim()) {
        newErrors[key] = "Required";
      }
    });

    if (form.start_date && form.end_date && form.end_date < form.start_date) {
      newErrors.end_date = "Invalid date";
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      alert("Fix errors before submitting");
      return;
    }

    saveField();
  };
  const deleteinfo = async (type, index) => {
    const updated = [...profile[type]];
    updated.splice(index, 1);

    try {
      const res = await fetch(`${server}/api/user/${type}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updated),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to delete");

      queryClient.setQueryData(["profile"], (old) => ({
        ...old,
        [type]: data[type],
      }));
    } catch (err) {
      alert(err.message);
    }
  };
  const filteredSkillOptions = skillOptions.filter(
    (opt) => !skillsTemp.includes(opt.value),
  );

  const filteredInterestOptions = interestOptions.filter(
    (opt) => !interestsTemp.includes(opt.value),
  );

  //temp

  return (
    <>
      <div className="prof">
        <Modal
          isOpen={isModalOpen}
          onClose={() => {
            setModalOpen(false);

            // 🔥 reset forms
            setExperienceForm({});
            setEducationForm({});
            setprojectForm({});

            // 🔥 reset validation
            setErrors({});
            setTouched({});
          }}
        >
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
              {about.trim() !== profile.about.trim() && about.trim() !== "" && (
                <button onClick={handleSave} className="prof-btn">
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

              {/* TITLE */}
              <label className="input-register-label">
                Title
                <input
                  name="title"
                  className={`input-register ${
                    touched.title && errors.title ? "error-border" : ""
                  }`}
                  placeholder="Title"
                  value={experienceForm.title}
                  onChange={handleChange}
                  onBlur={handleBlur}
                />
                {touched.title && errors.title && (
                  <p className="error-text">{errors.title}</p>
                )}
              </label>

              {/* COMPANY */}
              <label className="input-register-label">
                Company Name
                <input
                  name="company_name"
                  className={`input-register ${
                    touched.company_name && errors.company_name
                      ? "error-border"
                      : ""
                  }`}
                  placeholder="Company Name"
                  value={experienceForm.company_name}
                  onChange={handleChange}
                  onBlur={handleBlur}
                />
                {touched.company_name && errors.company_name && (
                  <p className="error-text">{errors.company_name}</p>
                )}
              </label>

              {/* DATES */}
              <div style={{ display: "flex", gap: "10px" }}>
                <label className="input-register-label">
                  Start Date
                  <input
                    type="date"
                    name="start_date"
                    className={`input-register ${
                      touched.start_date && errors.start_date
                        ? "error-border"
                        : ""
                    }`}
                    value={experienceForm.start_date}
                    onChange={handleChange}
                    onBlur={handleBlur}
                  />
                  {touched.start_date && errors.start_date && (
                    <p className="error-text">{errors.start_date}</p>
                  )}
                </label>

                <label className="input-register-label">
                  End Date
                  <input
                    type="date"
                    name="end_date"
                    className={`input-register ${
                      touched.end_date && errors.end_date ? "error-border" : ""
                    }`}
                    value={experienceForm.end_date}
                    onChange={handleChange}
                    onBlur={handleBlur}
                  />
                  {touched.end_date && errors.end_date && (
                    <p className="error-text">{errors.end_date}</p>
                  )}
                </label>
              </div>

              {/* DESCRIPTION */}
              <label className="input-register-label">
                Description
                <textarea
                  name="description"
                  className={`post-textarea ${
                    touched.description && errors.description
                      ? "error-border"
                      : ""
                  }`}
                  placeholder="Role description"
                  value={experienceForm.description}
                  onChange={handleChange}
                  onBlur={handleBlur}
                />
                {touched.description && errors.description && (
                  <p className="error-text">{errors.description}</p>
                )}
              </label>

              <button onClick={handleSave} className="prof-btn">
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
                  name="university_name"
                  className={`input-register ${
                    touched.university_name && errors.university_name
                      ? "error-border"
                      : ""
                  }`}
                  placeholder="School name"
                  value={educationForm.university_name}
                  onChange={handleChange}
                  onBlur={handleBlur}
                />
                {touched.university_name && errors.university_name && (
                  <p className="error-text">{errors.university_name}</p>
                )}
              </label>

              <div style={{ display: "flex", gap: "10px" }}>
                <label className="input-register-label">
                  Start Date
                  <input
                    type="date"
                    name="start_date"
                    className={`input-register ${
                      touched.start_date && errors.start_date
                        ? "error-border"
                        : ""
                    }`}
                    value={educationForm.start_date}
                    onChange={handleChange}
                    onBlur={handleBlur}
                  />
                  {touched.start_date && errors.start_date && (
                    <p className="error-text">{errors.start_date}</p>
                  )}
                </label>

                <label className="input-register-label">
                  End Date
                  <input
                    type="date"
                    name="end_date"
                    className={`input-register ${
                      touched.end_date && errors.end_date ? "error-border" : ""
                    }`}
                    value={educationForm.end_date}
                    onChange={handleChange}
                    onBlur={handleBlur}
                  />
                  {touched.end_date && errors.end_date && (
                    <p className="error-text">{errors.end_date}</p>
                  )}
                </label>
              </div>

              <label className="input-register-label">
                Course
                <textarea
                  name="course_name"
                  className={`post-textarea ${
                    touched.course_name && errors.course_name
                      ? "error-border"
                      : ""
                  }`}
                  placeholder="Course"
                  value={educationForm.course_name}
                  onChange={handleChange}
                  onBlur={handleBlur}
                />
                {touched.course_name && errors.course_name && (
                  <p className="error-text">{errors.course_name}</p>
                )}
              </label>

              <button onClick={handleSave} className="prof-btn">
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
                  className={`input-register ${
                    touched.project_name && errors.project_name
                      ? "error-border"
                      : ""
                  }`}
                  placeholder="Project name"
                  value={projectForm.project_name}
                  onChange={handleChange}
                  onBlur={handleBlur}
                />
                {touched.project_name && errors.project_name && (
                  <p className="error-text">{errors.project_name}</p>
                )}
              </label>

              <div style={{ display: "flex", gap: "10px" }}>
                <label className="input-register-label">
                  Start Date
                  <input
                    type="date"
                    name="start_date"
                    className={`input-register ${
                      touched.start_date && errors.start_date
                        ? "error-border"
                        : ""
                    }`}
                    value={projectForm.start_date}
                    onChange={handleChange}
                    onBlur={handleBlur}
                  />
                  {touched.start_date && errors.start_date && (
                    <p className="error-text">{errors.start_date}</p>
                  )}
                </label>

                <label className="input-register-label">
                  End Date
                  <input
                    type="date"
                    name="end_date"
                    className={`input-register ${
                      touched.end_date && errors.end_date ? "error-border" : ""
                    }`}
                    value={projectForm.end_date}
                    onChange={handleChange}
                    onBlur={handleBlur}
                  />
                  {touched.end_date && errors.end_date && (
                    <p className="error-text">{errors.end_date}</p>
                  )}
                </label>
              </div>

              <label className="input-register-label">
                Description
                <textarea
                  name="description"
                  className={`post-textarea ${
                    touched.description && errors.description
                      ? "error-border"
                      : ""
                  }`}
                  placeholder="Description"
                  value={projectForm.description}
                  onChange={handleChange}
                  onBlur={handleBlur}
                />
                {touched.description && errors.description && (
                  <p className="error-text">{errors.description}</p>
                )}
              </label>

              <button onClick={handleSave} className="prof-btn">
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
                            setSkillsTemp(skillsTemp.filter((s) => s !== skill))
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
                    <div className="flex-r gap10">
                      {/* <Select
                        className="skill-select"
                        options={filteredSkillOptions}
                        value={selectedSkill}
                        onChange={setSelectedSkill}
                        isClearable
                        isSearchable
                        placeholder="Select a skill"
                        menuPlacement="auto" // 🔥 IMPORTANT
                        menuPosition="fixed" // 🔥 IMPORTANT
                        menuPortalTarget={document.body} // 🔥 VERY IMPORTANT
                        styles={{
                          container: (base) => ({
                            ...base,
                            width: 300,
                            flex: "0 0 auto",
                          }),
                          control: (base) => ({
                            ...base,
                            minHeight: 36,
                            width: "100%",
                          }),
                          menuPortal: (base) => ({
                            ...base,
                            zIndex: 9999, // 🔥 ensures it's above modal
                          }),
                          menuList: (base) => ({
                            ...base,
                            maxHeight: 150,
                            overflowY: "auto",
                          }),
                        }}
                      /> */}
                      <CustomSelect
                        options={filteredSkillOptions}
                        value={selectedSkill}
                        onChange={setSelectedSkill}
                        placeholder="Select a skill"
                        direction="up"
                        style={{ width: "300px" }}
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
                <button onClick={handleSave} className="prof-btn">
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
                              interestsTemp.filter((s) => s !== interest),
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
                  <div className="select-container gap10">
                    <div>
                      <CustomSelect
                        options={filteredInterestOptions}
                        value={selectedInterest}
                        onChange={setSelectedInterest}
                        placeholder="Select a skill"
                        direction="up"
                        style={{ width: "300px" }}
                      />
                      {/* <Select
                        className="skill-select"
                        options={filteredInterestOptions}
                        value={selectedInterest}
                        onChange={setSelectedInterest}
                        isClearable
                        isSearchable
                        placeholder="   Select a interest"
                        menuPlacement="auto" // 🔥 IMPORTANT
                        menuPosition="fixed" // 🔥 IMPORTANT
                        menuPortalTarget={document.body} // 🔥 VERY IMPORTANT
                        styles={{
                          container: (base) => ({
                            ...base,
                            width: 300,
                            flex: "0 0 auto",
                          }),
                          control: (base) => ({
                            ...base,
                            minHeight: 36,
                            width: "100%",
                          }),
                          menuPortal: (base) => ({
                            ...base,
                            zIndex: 9999, // 🔥 ensures it's above modal
                          }),
                          menuList: (base) => ({
                            ...base,
                            maxHeight: 150,
                            overflowY: "auto",
                          }),
                        }}
                      /> */}
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
                <button onClick={handleSave} className="prof-btn">
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
            {profile.user_type === "professor" && (
              <>
                {profile.verified ? (
                  <>
                    <span className="verified-badge">✔ verified</span>
                    {profile.blog_link && (
                      <a
                        href={getBlogUrl(profile.blog_link)}
                        target="_blank"
                        rel="noreferrer"
                        className="form-button"
                        style={{ width: "fit-content" }}
                      >
                        Visit blog
                      </a>
                    )}
                  </>
                ) : (
                  <span>Not verified</span>
                )}
              </>
            )}
            {profile.course && <p>{profile.course}</p>}
            {profile.university && <p>{profile.university}</p>}

            {status ? (
              <div>{profile.location}</div>
            ) : (
              <div>
                {location.city}, {location.state}, {location.country}
              </div>
            )}
          </div>
        </div>
        {tokenDetails.user_type !== "club" && (
          <div className="prof-2">
            <h1>Have free time! Help students And earn Money</h1>

            <WeekBooking user={profile} />
          </div>
        )}
        {/* <div className="prof-2">Suggested for you</div> */}
        <div className="prof-3">
          <div className="prof-3-1">
            <h2>About</h2>
            {!profile.about ? (
              <div>
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
          <div>
            {!profile.about ? <div>Add about</div> : <div>{profile.about}</div>}
          </div>
        </div>
        <div className="prof-4">
          <p className="prof-4-p">Activity</p>
          <UserActivity userId={loggedInUserId} />
        </div>
        <div className="prof-5">
          <div className="prof-5-1">
            <h2>Experience</h2>
            {profile.experience.length < 3 && (
              <IoMdAdd onClick={() => editinfo("experience", null)} size={28} />
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
        {tokenDetails.user_type !== "club" && (
          <>
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
                  <IoMdAdd
                    onClick={() => editinfo("projects", null)}
                    size={28}
                  />
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
          </>
        )}

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
    </>
  );
}
