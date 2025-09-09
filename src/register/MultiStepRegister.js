import React, { useState, useEffect } from "react";
import axios from "axios";
import Select from "react-select";
import "./MultiStepRegister.css";
import PasswordInput from "../utils/PasswordInput";
import OtpInput from "../utils/OtpInput";
import { useNavigate } from "react-router-dom";

const RegisterForm = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [userType, setUserType] = useState("");
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    gender: "",
    specialization: "",
    course: "",
    duration: "",
    birthDay: "",
    birthMonth: "",
    birthYear: "",
    university: "",
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

  const universityOptions = [
    "Harvard University",
    "Stanford University",
    "MIT",
    "University of Oxford",
    "University of Cambridge",
    "Other",
  ].map((u) => ({ value: u, label: u }));

  useEffect(() => {
    if (formData.birthMonth && formData.birthYear) {
      const monthIndex = months.indexOf(formData.birthMonth);
      // Ensure birthYear is a number for Date()
      const daysInMonth = new Date(
        Number(formData.birthYear),
        monthIndex + 1,
        0
      ).getDate();
      setDays(Array.from({ length: daysInMonth }, (_, i) => i + 1));
    } else {
      setDays([]);
    }
  }, [formData.birthMonth, formData.birthYear]);

  const handleChange = (selected) => {
    if (selected.length <= 4) {
      setSelectedOptions(selected);
    }
  };

  // Extracted finish handler (calls API and navigates to "/")
  const handleFinish = async () => {
    const dob = `${formData.birthYear}-${(
      "0" +
      (months.indexOf(formData.birthMonth) + 1)
    ).slice(-2)}-${("0" + formData.birthDay).slice(-2)}`;
    const interests = selectedOptions.map((opt) => opt.value);
    const errors = [];

    if (!formData.university) errors.push("University is required");
    if (
      !formData.firstName ||
      !formData.lastName ||
      !formData.email ||
      !formData.gender ||
      !userType ||
      !dob.includes("-")
    )
      errors.push("Missing required personal info");

    if (userType === "student" && (!formData.course || !formData.duration)) {
      errors.push("Course and duration are required for students");
    }

    if (userType === "professor" && !formData.specialization) {
      errors.push("Specialization is required for professors");
    }

    if (interests.length === 0 || interests.length > 4) {
      errors.push("Select up to 4 interests");
    }

    if (!formData.password || !formData.confirmPassword) {
      errors.push("Password and confirm password are required");
    } else if (formData.password !== formData.confirmPassword) {
      errors.push("Passwords do not match");
    }

    if (errors.length > 0) {
      alert(errors.join("\n"));
      return;
    }

    const payload = {
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      password: formData.password,
      gender: formData.gender,
      userType,
      dob,
      university: formData.university,
      interests,
      ...(userType === "student" && {
        course: formData.course,
        duration: formData.duration,
      }),
      ...(userType === "professor" && {
        specialization: formData.specialization,
      }),
    };

    try {
      setLoading(true);
      await axios.post(
        "https://aroundubackend.onrender.com/api/auth/register",
        payload
      );
      alert("Registration successful! You can now login.");

      // navigate to root and replace history entry
      navigate("/", { replace: true });
    } catch (err) {
      alert("Error: " + (err.response?.data?.msg || err.message));
    } finally {
      setLoading(false);
    }
  };

  const renderStepOne = () => (
    <div className="form-step">
      {/* <h2>personal info</h2> */}

      <div style={{ display: "flex", gap: "10px" }}>
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
        Email
        <input
          placeholder="Email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          className="input-register"
        />
      </label>

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
          >
            <option value="" disabled>
              Select Role
            </option>
            <option value="student">Student</option>
            <option value="professor">Professor</option>
          </select>
        </div>

        <div>
          <label className="label-register">Gender:</label>
          <div className="gender-options">
            <label>
              <input
                type="radio"
                name="gender"
                checked={formData.gender === "male"}
                onChange={() => setFormData({ ...formData, gender: "male" })}
              />
              Male
            </label>
            <label>
              <input
                type="radio"
                name="gender"
                checked={formData.gender === "female"}
                onChange={() => setFormData({ ...formData, gender: "female" })}
              />
              Female
            </label>
          </div>
        </div>
      </div>

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
              userType,
              formData.gender,
              formData.birthDay,
              formData.birthMonth,
              formData.birthYear,
            ];
            if (required.some((r) => !r))
              return alert("Please fill all required fields");
            setStep(2);
          }}
        >
          Next
        </button>
      </div>
    </div>
  );

  const renderStepTwo = () => (
    <div className="form-step">
      {/* <h2> Academic Info</h2> */}

      <label>University:</label>
      <Select
        options={universityOptions}
        value={universityOptions.find(
          (opt) => opt.value === formData.university
        )}
        onChange={(selected) =>
          setFormData({ ...formData, university: selected?.value || "" })
        }
      />

      {userType === "student" && (
        <>
          <label>Course:</label>
          <Select
            options={[
              { value: "Computer Science", label: "Computer Science" },
              {
                value: "Mechanical Engineering",
                label: "Mechanical Engineering",
              },
              {
                value: "Business Administration",
                label: "Business Administration",
              },
              { value: "Economics", label: "Economics" },
              { value: "Psychology", label: "Psychology" },
              { value: "Other", label: "Other" },
            ]}
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

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              gap: "20px",
            }}
          >
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

            <label className="label-register">
              Expected Graduation Date
              <input type="month" className="input-register" />
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
            value={
              formData.specialization
                ? {
                    value: formData.specialization,
                    label: formData.specialization,
                  }
                : null
            }
            onChange={(selected) =>
              setFormData({
                ...formData,
                specialization: selected?.value || "",
              })
            }
            isSearchable
            placeholder="Select or search specialization"
          />
        </>
      )}

      <label>Interests (Max 4):</label>
      <Select
        options={interestOptions}
        isMulti
        closeMenuOnSelect={false}
        value={selectedOptions}
        onChange={handleChange}
        isOptionDisabled={(option) =>
          selectedOptions.length >= 4 &&
          !selectedOptions.find((s) => s.value === option.value)
        }
      />

      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <button onClick={() => setStep(1)} className="form-button">
          Back
        </button>
        <button onClick={() => setStep(3)} className="form-button">
          Next
        </button>
      </div>
    </div>
  );

  const renderStepThree = () => (
    <div className="form-step">
      <div>
        <OtpInput />
      </div>

      <h2>Password Setup</h2>

      <input
        type="password"
        value={formData.password}
        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
        placeholder="Password"
        className="input-register"
      />

      <PasswordInput
        value={formData.confirmPassword}
        onChange={(e) =>
          setFormData({ ...formData, confirmPassword: e.target.value })
        }
        placeholder="Confirm Password"
      />

      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <button onClick={() => setStep(2)} className="form-button">
          Back
        </button>

        <button
          className="form-button"
          onClick={handleFinish}
          disabled={loading}
        >
          {loading ? "Finishing..." : "Finish"}
        </button>
      </div>
    </div>
  );

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
        backgroundColor: "#f2f2f2",
      }}
    >
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
