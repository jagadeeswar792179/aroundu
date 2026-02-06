import React, { useState, useEffect } from "react";
import axios from "axios";
import Select from "react-select";
import "./MultiStepRegister.css";
import PasswordInput from "../utils/PasswordInput";
import OtpInput from "../utils/OtpInput";
import { useNavigate } from "react-router-dom";
import { BeatLoader } from "react-spinners";
import CustomSelect from "../utils/CustomSelect";
import MultiSelectTags from "../utils/MultiSelectTags";
import { VerifiedIcon } from "lucide-react";
import {
  universityOptions,
  universityEmailDomains
} from "./universities";
const RegisterForm = () => {
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [Otpload, setOtpload] = useState(false);
  const [otpValue, setOtpValue] = useState("");
  const [checkmail, setcheckmail] = useState(false);
  const [resendTimer, setResendTimer] = useState(60); // 60 seconds countdown
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [userType, setUserType] = useState("");
  const [loading, setLoading] = useState(false);
  const server = process.env.REACT_APP_SERVER;
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    gender: "",
    other_gender: "",
    specialization: "",
    course: "",
    duration: "",
    birthDay: "",
    birthMonth: "",
    birthYear: "",
    university: "",
    universityOther: "",
    bloglink: "", // 👈 new
  });

  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 100 }, (_, i) => currentYear - i);
  const [days, setDays] = useState([]);

  const interestOptions = [
    { value: "sports", label: "Sports" },
    { value: "music", label: "Music" },
    { value: "travel", label: "Travel" },
    { value: "reading", label: "Reading" },
    { value: "technology", label: "Technology" },
    { value: "other", label: "Other" },
  ];
  const [selectedOptions, setSelectedOptions] = useState([]);
  const courseOptions = [
    // Pharma
    "Pharmacy (PharmD)",
    "Pharmacogenomics",
    "Pharmaceutical Sciences",
    "Pharmacy Clinical Research Certificate",
    "Biopharmaceutical Technology",

    // Law
    "Juris Doctor (JD)",
    "LLM in Elder Law and Estate Planning",
    "Law and Society",
    "JD/MBA",
    "JD/MSW",
    "JD/MS in Accounting & Finance",
    "JD/MS in Engineering Management",
    "JD/MS in Organizational Leadership",
    "JD/MRP (Master of Regional Planning)",

    // Engineering
    "Civil Engineering",
    "Mechanical Engineering",
    "Electrical Engineering",
    "Industrial Engineering",
    "Biomedical Engineering",
    "Construction Management",
    "Engineering Management",

    // CS
    "Computer Science",
    "Computer Engineering",
    "Information Technology",
    "Business Analytics and Information Management",
    "Cybersecurity",
    "Data Science and Statistics",
    "Computer Forensics",
    "Enterprise Resource Planning with SAP",

    // Business
    "Finance",
    "Accounting",
    "Marketing",
    "Business Analytics",
    "Management and Leadership",
    "Actuarial Science",
    "Human Resource Management",
    "Entrepreneurship",
    "Sport Management",

    // Science
    "Biology",
    "Chemistry",
    "Neuroscience",
    "Health Sciences",
    "Health Studies",
    "Forensic Biology",
    "Forensic Chemistry",
    "Mathematical Sciences",
    "Statistics",
    "Environmental Science",

    // Arts / Humanities
    "Psychology",
    "English",
    "History",
    "Political Science",
    "International Studies",
    "Creative Writing",
    "Communication",
    "Music",
    "Art",
    "Spanish",
    "Philosophy",
    "Gender and Sexuality Studies",
    "Theatre",
    "Film Studies",
    "African American Studies",
    "Latin American Studies",
    "Legal Studies",

    // Education
    "Elementary Education",
    "Secondary Education",
    "Education",
  ].map((c) => ({ value: c, label: c }));

  const getDomainForUniversity = (uni) =>
    universityEmailDomains[uni] || "wne.edu"; // default domain if unknown

  // sanitize local part a bit (optional)
  const sanitizeLocal = (s) => s.replace(/\s+/g, "").replace(/@.*/, "");

  const enforceEmailDomain = (rawValue, uni) => {
    const local = sanitizeLocal(rawValue || "");
    if (!local) return ""; // if empty, don't append anything
    return `${local}@${getDomainForUniversity(uni)}`;
  };
  useEffect(() => {
    if (!formData.university) {
      setFormData((f) => ({
        ...f,
        university: "Western New England University",
      }));
    }
  }, []);
  useEffect(() => {
    if (formData.birthMonth && formData.birthYear) {
      const monthIndex = months.indexOf(formData.birthMonth);
      if (monthIndex >= 0 && formData.birthYear) {
        const daysInMonth = new Date(
          Number(formData.birthYear),
          monthIndex + 1,
          0
        ).getDate();
        setDays(Array.from({ length: daysInMonth }, (_, i) => i + 1));
      } else {
        setDays([]);
      }
    } else {
      setDays([]);
    }
  }, [formData.birthMonth, formData.birthYear]);

  // handle multi-select interests (limit to 4)
  const handleChange = (selected) => {
    const sel = selected || [];
    if (sel.length <= 4) {
      setSelectedOptions(sel);
    } else {
      // if library allows selecting quickly, ensure we only keep first 4
      setSelectedOptions(sel.slice(0, 4));
    }
  };

  // helper to get Select value that handles custom values too
  const findOrCreateOption = (options, value) => {
    if (!value) return null;
    const found = options.find((opt) => opt.value === value);
    return found || { value, label: value };
  };

  // Extracted finish handler (calls API and navigates to "/")
  const handleFinish = async () => {
    // Basic validations
    const errors = [];

    // Validate DOB
    if (!formData.birthDay || !formData.birthMonth || !formData.birthYear) {
      errors.push("Please select a complete date of birth (day, month, year).");
    }

    // Build DOB only if valid
    let dob = "";
    if (errors.length === 0) {
      const monthIndex = months.indexOf(formData.birthMonth);
      if (monthIndex < 0) errors.push("Invalid month selected.");
      else {
        dob = `${formData.birthYear}-${("0" + (monthIndex + 1)).slice(-2)}-${(
          "0" + formData.birthDay
        ).slice(-2)}`;
      }
    }

    // required fields
    if (
      !formData.firstName ||
      !formData.lastName ||
      !formData.email ||
      !formData.gender ||
      !userType
    ) {
      errors.push("Missing required personal info.");
    }

    // if gender other but no text
    if (formData.gender === "other" && !(formData.other_gender || "").trim()) {
      errors.push("Please specify your gender in the 'Other' field.");
    }

    // university: if "Other" chosen require universityOther
    let finalUniversity = formData.university;
    if (formData.university === "Other") {
      if (!(formData.universityOther || "").trim()) {
        errors.push("Please specify your university.");
      } else {
        finalUniversity = formData.universityOther.trim();
      }
    }

    if (userType === "student" && (!formData.course || !formData.duration)) {
      errors.push("Course and duration are required for students.");
    }

    if (userType === "professor" && !formData.specialization) {
      errors.push("Specialization is required for professors.");
    }
    if (userType === "professor" && !formData.bloglink.trim()) {
      errors.push("Blog link is required for professors.");
    }

    const interests = (selectedOptions || []).map((opt) => opt.value);
    if (interests.length === 0 || interests.length > 4) {
      errors.push("Select between 1 and 4 interests.");
    }

    if (!formData.password || !formData.confirmPassword) {
      errors.push("Password and confirm password are required.");
    } else if (formData.password !== formData.confirmPassword) {
      errors.push("Passwords do not match.");
    } else if (formData.password.length < 6) {
      errors.push("Password must be at least 6 characters.");
    }

    // simple email regex

    const allowedDomains = Object.values(universityEmailDomains);
    const emailRegex = new RegExp(
      `^[^\\s@]+@(${allowedDomains
        .map((d) => d.replace(".", "\\."))
        .join("|")})$`,
      "i"
    );

    if (!emailRegex.test(formData.email)) {
      errors.push("Please enter a valid email address.");
    }

    if (errors.length > 0) {
      alert(errors.join("\n"));
      return;
    }

    const payload = {
      first_name: formData.firstName.trim(),
      last_name: formData.lastName.trim(),
      email: formData.email.trim(),
      password: formData.password,
      gender:
        formData.gender === "other"
          ? formData.other_gender.trim()
          : formData.gender,
      user_type: userType, // ✅ match backend
      dob,
      university: finalUniversity,
      interests,
      ...(userType === "student" && {
        course: formData.course,
        duration: formData.duration,
      }),
      ...(userType === "professor" && {
        specialization: formData.specialization,
        blog_link: formData.bloglink.trim(), // ✅ match DB column
      }),
    };

    try {
      setLoading(true);
      await axios.post(`${server}/api/auth/register`, payload);
      alert("Registration successful! You can now login.");
      navigate("/", { replace: true });
    } catch (err) {
      alert("Error: " + (err.response?.data?.msg || err.message));
    } finally {
      setLoading(false);
    }
  };
  const validateEmail = () => {
    const value = formData.email;
    const selectedUni = formData.university;
    const requiredDomain = universityEmailDomains[selectedUni];

    if (!value) return alert("Email is required");

    if (requiredDomain) {
      const regex = new RegExp(`^[^\\s@]+@${requiredDomain}$`, "i");
      if (!regex.test(value)) {
        return alert(`Please enter a valid ${requiredDomain} email address`);
      }
    }

    handleCheckEmail();
  };

  // 2) handleCheckEmail: set step on success
  const handleCheckEmail = async () => {
    setcheckmail(true);
    const email = (formData.email || "").trim();
    if (!email) {
      alert("Please enter your email.");
      setcheckmail(false);
      return;
    }

    try {
      console.log("Checking email:", server);
      const { data, status } = await axios.post(
        `${server}/api/auth/check-email`,
        { email }
      );
      // axios will throw for non-2xx, so here status is 2xx and data should be parsed JSON
      setcheckmail(false);
      if (data.exists) {
        alert("Email already exists.");
      } else {
        setStep(2);
      }
    } catch (err) {
      // If server returned HTML or 404 you can inspect err.response.data
      console.error(
        "Error checking email:",
        err.response?.status,
        err.response?.data || err.message
      );
      alert(
        "Something went wrong while checking email. See console for details."
      );
      setcheckmail(false);
    }
  };

  const renderStepOne = () => (
    <div className="form-step">
      <div className="register-1">
        <label className="label-register">
          FirstName
          <input
            placeholder="First Name"
            value={formData.firstName}
            onChange={(e) =>
              setFormData({ ...formData, firstName: e.target.value })
            }
            className="input-register"
          />
        </label>
        <label className="label-register">
          LastName
          <input
            placeholder="Last Name"
            value={formData.lastName}
            onChange={(e) =>
              setFormData({ ...formData, lastName: e.target.value })
            }
            className="input-register"
          />
        </label>
      </div>
      <label className="label-register">
        University:
        <CustomSelect
          options={universityOptions}
          value={findOrCreateOption(universityOptions, formData.university)}
          onChange={(selected) => {
            const newUni = selected?.value || "";
            setFormData((f) => {
              const local = sanitizeLocal(f.email || "");
              const updatedEmail = local
                ? `${local}@${getDomainForUniversity(newUni)}`
                : "";
              return { ...f, university: newUni, email: updatedEmail };
            });
          }}
        />
      </label>
      {formData.university === "Other" && (
        <div style={{ marginTop: 8 }}>
          <input
            placeholder="Email"
            value={formData.email}
            onChange={(e) => {
              let value = e.target.value;
              const selectedUni = formData.university;
              const requiredDomain = universityEmailDomains[selectedUni];

              if (requiredDomain) {
                // If user typed only username (no @)
                if (!value.includes("@")) {
                  value = value + "@" + requiredDomain;
                } else {
                  // If already contains an @, enforce correct domain
                  const [user, domain] = value.split("@");
                  if (user && domain && domain !== requiredDomain) {
                    value = user + "@" + requiredDomain;
                  }
                }
              }

              setFormData({ ...formData, email: value });
            }}
            className="input-register"
          />
        </div>
      )}
      <label className="label-register">
        Email
        <input
          placeholder="Email"
          value={formData.email}
          onChange={(e) =>
            setFormData((f) => ({
              ...f,
              email: enforceEmailDomain(
                e.target.value,
                f.university || "Western New England University"
              ),
            }))
          }
          onBlur={(e) =>
            setFormData((f) => ({
              ...f,
              email: enforceEmailDomain(
                e.target.value,
                f.university || "Western New England University"
              ),
            }))
          }
          className="input-register"
        />
      </label>

      <div className="dob-container">
        <label className="label-register">
          Date of Birth:
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              gap: "5px",
            }}
          >
            <select
              value={formData.birthYear}
              onChange={(e) =>
                setFormData({ ...formData, birthYear: e.target.value })
              }
              className="select-register"
            >
              <option value="">Year</option>
              {years.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
            <select
              value={formData.birthMonth}
              onChange={(e) =>
                setFormData({ ...formData, birthMonth: e.target.value })
              }
              className="select-register"
            >
              <option value="">Month</option>
              {months.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
            <select
              value={formData.birthDay}
              onChange={(e) =>
                setFormData({ ...formData, birthDay: e.target.value })
              }
              className="select-register"
            >
              <option value="">Day</option>
              {days.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>
        </label>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <div />
        <button
          className="form-button"
          onClick={() => {
            const required = [
              formData.firstName,
              formData.lastName,
              formData.email,
              formData.university,
              formData.birthDay,
              formData.birthMonth,
              formData.birthYear,
            ];
            if (required.some((r) => !r))
              return alert("Please fill all required fields");
            if (
              formData.gender === "other" &&
              !(formData.other_gender || "").trim()
            )
              return alert("Please specify your gender.");
            validateEmail();
          }}
        >
          {checkmail ? <BeatLoader size={10} color="#FFFFFF" /> : "Next"}
        </button>
      </div>
    </div>
  );

  const renderStepTwo = () => (
    <div className="form-step">
      <div className="role-gender-container">
        <div>
          <label htmlFor="role" className="label-register">
            Role:
          </label>
          <select
            id="role"
            value={userType}
            onChange={(e) => setUserType(e.target.value)}
            className="select-register"
            style={{
              flexGrow: 0, // don't expand with flex
              flexShrink: 0, // don't shrink when siblings expand
            }}
          >
            <option value="" disabled>
              Select Role
            </option>
            <option value="student">Student</option>
            <option value="professor">Professor</option>
          </select>
        </div>

        {/* GENDER FIELD */}
        <div>
          <label className="label-register">Gender:</label>
          <div className="gender-options">
            <label>
              <input
                type="radio"
                name="gender"
                value="male"
                checked={formData.gender === "male"}
                onChange={() =>
                  setFormData({ ...formData, gender: "male", other_gender: "" })
                }
              />
              Male
            </label>

            <label>
              <input
                type="radio"
                name="gender"
                value="female"
                checked={formData.gender === "female"}
                onChange={() =>
                  setFormData({
                    ...formData,
                    gender: "female",
                    other_gender: "",
                  })
                }
              />
              Female
            </label>

            <label>
              <input
                type="radio"
                name="gender"
                value="other"
                checked={formData.gender === "other"}
                onChange={() => setFormData({ ...formData, gender: "other" })}
              />
              Other
            </label>
          </div>

          {formData.gender === "other" && (
            <div style={{ marginTop: 8 }}>
              <input
                type="text"
                placeholder="Specify your Gender"
                value={formData.other_gender || ""}
                onChange={(e) =>
                  setFormData({ ...formData, other_gender: e.target.value })
                }
                style={{
                  width: formData.gender === "other" ? "100%" : "0px",
                  opacity: formData.gender === "other" ? 1 : 0,
                  padding: formData.gender === "other" ? "6px 8px" : "0px",
                  border:
                    formData.gender === "other" ? "1px solid #ccc" : "none",
                  borderRadius: "20px",
                  transition: "all 0.3s ease",
                  overflow: "hidden",
                }}
              />
            </div>
          )}
        </div>
      </div>

      {userType === "student" && (
        <>
          <label>Course:</label>

          <CustomSelect
            options={courseOptions}
            value={
              formData.course
                ? { value: formData.course, label: formData.course }
                : null
            }
            onChange={(selected) =>
              setFormData({ ...formData, course: selected?.value || "" })
            }
            isSearchable
            placeholder="Select or search course"
          />

          <div className="register-2">
            <label className="label-register">
              Duration:
              <select
                className="duration-select select-register"
                style={{ width: 100 }}
                value={formData.duration}
                onChange={(e) =>
                  setFormData({ ...formData, duration: e.target.value })
                }
              >
                <option value="" disabled>
                  Select
                </option>
                {[1, 2, 3, 4, 5].map((y) => (
                  <option key={y} value={y}>
                    {y} years
                  </option>
                ))}
              </select>
            </label>

            <label className="label-register ">
              Expected Graduation Date
              <input type="date" className="input-register graduate-date" />
            </label>
          </div>
        </>
      )}

      {userType === "professor" && (
        <>
          <label>Specialization:</label>
          <Select
            options={[
              {
                value: "Artificial Intelligence",
                label: "Artificial Intelligence",
              },
              { value: "Machine Learning", label: "Machine Learning" },
              { value: "Data Science", label: "Data Science" },
              { value: "Cybersecurity", label: "Cybersecurity" },
              { value: "Cloud Computing", label: "Cloud Computing" },
              { value: "Other", label: "Other" },
            ]}
            value={findOrCreateOption(
              [
                {
                  value: "Artificial Intelligence",
                  label: "Artificial Intelligence",
                },
                { value: "Machine Learning", label: "Machine Learning" },
                { value: "Data Science", label: "Data Science" },
                { value: "Cybersecurity", label: "Cybersecurity" },
                { value: "Cloud Computing", label: "Cloud Computing" },
                { value: "Other", label: "Other" },
              ],
              formData.specialization
            )}
            onChange={(selected) =>
              setFormData({
                ...formData,
                specialization: selected?.value || "",
              })
            }
            isSearchable
            placeholder="Select or search specialization"
          />

          {/* 👇 New blog link input */}
          <label className="label-register" style={{ marginTop: "10px" }}>
            Blog Link (required for professors)
            <input
              type="url"
              placeholder="https://your-blog.com"
              value={formData.bloglink}
              onChange={(e) =>
                setFormData({ ...formData, bloglink: e.target.value })
              }
              className="input-register"
            />
          </label>
        </>
      )}

      <label>Interests:</label>
      <MultiSelectTags
        options={interestOptions}
        classNamePrefix="my-select"
        value={selectedOptions}
        onChange={handleChange}
        placeholder="Please Select Upto 4"
        isOptionDisabled={(option) =>
          (selectedOptions || []).length >= 4 &&
          !(selectedOptions || []).find((s) => s.value === option.value)
        }
      />

      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <button onClick={() => setStep(1)} className="form-button">
          Back
        </button>
        <button
          onClick={() => {
            setStep(3);
          }}
          className="form-button"
        >
          Next
        </button>
      </div>
    </div>
  );

  const sendOtp = async () => {
    try {
      await axios.post(`${server}/api/AuthOtp/send-otp`, {
        email: formData.email,
      });
      setOtpSent(true);
      setResendTimer(60);
    } catch (err) {
      alert("Error sending OTP: " + err.message);
    }
  };

  useEffect(() => {
    if (step === 3 && !otpSent) sendOtp();
  }, [step, otpSent]);

  useEffect(() => {
    if (resendTimer <= 0) return;
    const interval = setInterval(() => setResendTimer((t) => t - 1), 1000);
    return () => clearInterval(interval);
  }, [resendTimer]);

  const handleVerifyOtp = async () => {
    try {
      setOtpload(true);
      const { data } = await axios.post(`${server}/api/AuthOtp/verify-otp`, {
        email: formData.email,
        otp: otpValue,
      });
      if (data.verified) {
        setOtpVerified(true);
        setOtpload(false);
      } else {
        alert("Incorrect OTP. Try again.");
      }
    } catch (err) {
      if (err.response?.data?.msg) {
        alert(err.response.data.msg);
      } else {
        alert("Error verifying OTP: " + err.message);
      }
    } finally {
      setOtpload(false);
    }
  };

  const renderStepThree = () => (
    <div className="form-step">
      {!otpVerified ? (
        <>
          <h3>OTP Verification</h3>
          <p>An OTP has been sent to {formData.email}</p>
          <OtpInput
            length={6}
            value={otpValue}
            onChange={setOtpValue}
            verified={otpVerified}
          />

          <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
            <button
              className="form-button"
              onClick={handleVerifyOtp}
              disabled={otpValue.length < 6}
            >
              {Otpload ? <BeatLoader size={10} color="white" /> : "Verify OTP"}
            </button>

            <button
              className="form-button"
              onClick={sendOtp}
              disabled={resendTimer > 0}
            >
              {resendTimer > 0 ? `Resend OTP in ${resendTimer}s` : "Resend OTP"}
            </button>
          </div>
        </>
      ) : (
        <>
          <h3>Set Your Password</h3>
          <input
            type="password"
            placeholder="Password"
            value={formData.password}
            onChange={(e) =>
              setFormData({ ...formData, password: e.target.value })
            }
            className="input-register"
          />
          <PasswordInput
            value={formData.confirmPassword}
            onChange={(e) =>
              setFormData({ ...formData, confirmPassword: e.target.value })
            }
            placeholder="Confirm Password"
          />
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginTop: "10px",
            }}
          >
            <button onClick={() => setStep(2)} className="form-button">
              Back
            </button>
            <button
              className="form-button"
              onClick={handleFinish}
              disabled={loading}
            >
              {loading ? (
                <BeatLoader size={10} color="#ffffff" />
              ) : (
                "Finish Registration"
              )}
            </button>
          </div>
        </>
      )}
    </div>
  );
  return (
    <div className="register-container">
      <div className="register-form">
        <h2>Create New Account</h2>
        {step === 1 && renderStepOne()}
        {step === 2 && renderStepTwo()}
        {step === 3 && renderStepThree()}
      </div>
    </div>
  );
};

export default RegisterForm;
