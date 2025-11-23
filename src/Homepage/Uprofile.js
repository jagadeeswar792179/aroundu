// src/components/Uprofile.jsx
import "../profile/profile.css";
import React, { useEffect, useState } from "react";
import useLocation from "../utils/useLocation";
import UserActivity from "../profile/UserActivity";
import { useParams } from "react-router-dom";
import Navbar from "./Navbar";
import ProfileLoadFull from "../Loading/profileLoadfull";
import ProfileWeekBookings from "../slotbooking/ProfileWeekBookings";
import MessageModal from "../messgaes/MessageModal";

export default function Uprofile() {
  const { userId } = useParams();
  const [selectedPeer, setSelectedPeer] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [profileUrl, setProfileUrl] = useState(null);
  const token = localStorage.getItem("token");
  const server = process.env.REACT_APP_SERVER;

  // Send profile view to backend (always inserts a row).
  // Fire-and-forget: logs success/failure but doesn't block UI.
  const sendProfileView = async (targetId) => {
    if (!targetId) {
      console.warn("sendProfileView: no targetId provided");
      return;
    }
    console.log("sendProfileView called for target:", targetId);

    try {
      const res = await fetch(`${server}/api/profile-views`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
        body: JSON.stringify({ target_id: targetId }),
      });

      console.log("profile-views response status:", res.status);
      // Try to read JSON if any
      try {
        const json = await res.json().catch(() => null);
        if (json) console.log("profile-views response json:", json);
      } catch (e) {
        // ignore
      }

      if (!res.ok && res.status !== 204) {
        console.error("Failed to record profile view:", res.status);
      } else {
        console.log("Profile view recorded (or intentionally skipped).");
      }
    } catch (err) {
      console.error("Network or fetch error recording profile view:", err);
    }
  };

  useEffect(() => {
    if (!userId) return;

    const controller = new AbortController();
    const signal = controller.signal;

    const loadProfile = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${server}/api/user/profile/${userId}`, {
          headers: {
            Authorization: token ? `Bearer ${token}` : "",
          },
          signal,
        });

        if (!res.ok) {
          throw new Error(`Failed to load profile: ${res.status}`);
        }

        const data = await res.json();

        setProfile({
          ...data,
          experience: Array.isArray(data.experience) ? data.experience : [],
          education: Array.isArray(data.education) ? data.education : [],
          projects: Array.isArray(data.projects) ? data.projects : [],
          skills: Array.isArray(data.skills) ? data.skills : [],
          interests: Array.isArray(data.interests) ? data.interests : [],
        });
        setProfileUrl(data.profile || null);

        // record a profile view after successful profile fetch
        // (fire-and-forget)
        sendProfileView(userId);
      } catch (err) {
        if (err.name === "AbortError") {
          console.log("Profile fetch aborted");
        } else {
          console.error("Error loading profile:", err);
        }
      } finally {
        setLoading(false);
      }
    };

    loadProfile();

    return () => {
      controller.abort();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  function formatDuration(startDate, endDate) {
    if (!startDate) return "";
    const start = new Date(startDate);
    const end = endDate ? new Date(endDate) : new Date();
    const diffMonths =
      (end.getFullYear() - start.getFullYear()) * 12 +
      (end.getMonth() - start.getMonth());
    const diffYears = Math.floor(diffMonths / 12);
    if (diffMonths < 12)
      return `${diffMonths} month${diffMonths !== 1 ? "s" : ""}`;
    return `${diffYears} year${diffYears !== 1 ? "s" : ""}${
      diffMonths % 12 > 0
        ? `, ${diffMonths % 12} month${diffMonths % 12 !== 1 ? "s" : ""}`
        : ""
    }`;
  }

  if (loading) return <ProfileLoadFull />;
  if (!profile) return <div>No profile data</div>;

  return (
    <>
      <div className="container-1">
        <Navbar />
      </div>
      {selectedPeer && (
        <MessageModal
          isOpen={!!selectedPeer}
          onClose={() => setSelectedPeer(null)}
          peer={selectedPeer}
        />
      )}
      <div className="container-2">
        <div className="prof">
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
            </div>

            <div className="prof-12">
              <div>
                <b>
                  {profile.first_name} {profile.last_name}
                </b>
              </div>

              {profile.course && <p>{profile.course}</p>}
              {profile.university && <p>{profile.university}</p>}
              {profile.location && <p>{profile.location}</p>}

              <button
                onClick={() => setSelectedPeer(profile)}
                className="form-button"
                style={{ width: "fit-content" }}
              >
                Message
              </button>
            </div>
          </div>

          <div className="prof-3">
            <h2>About</h2>
            <div>{profile.about || "No bio available"}</div>
          </div>
          <div className="prof-3">
            <h2>Tutoring help</h2>
            <ProfileWeekBookings profileOwnerId={userId} />
          </div>

          <div className="prof-4">
            <h2>Activity</h2>
            <UserActivity userId={userId} />
          </div>

          <div className="prof-5">
            <h2>Experience</h2>
            {profile.experience.length > 0 ? (
              profile.experience.map((exp, i) => (
                <div key={i} className="exp-div">
                  <h3>{exp.company_name}</h3>
                  <p>
                    {exp.start_date &&
                      new Date(exp.start_date).toLocaleDateString("en-US", {
                        month: "long",
                        year: "numeric",
                      })}{" "}
                    -{" "}
                    {exp.end_date
                      ? new Date(exp.end_date).toLocaleDateString("en-US", {
                          month: "long",
                          year: "numeric",
                        })
                      : "Present"}{" "}
                    <i>{formatDuration(exp.start_date, exp.end_date)}</i>
                  </p>
                  <p>{exp.title}</p>
                  <p>{exp.description}</p>
                </div>
              ))
            ) : (
              <p>No experiences listed</p>
            )}
          </div>

          <div className="prof-6">
            <h2>Education</h2>
            {profile.education.length > 0 ? (
              profile.education.map((edu, i) => (
                <div key={i} className="exp-div">
                  <h3>{edu.university_name}</h3>
                  <p>
                    {edu.start_date &&
                      new Date(edu.start_date).toLocaleDateString("en-US", {
                        month: "long",
                        year: "numeric",
                      })}{" "}
                    -{" "}
                    {edu.end_date
                      ? new Date(edu.end_date).toLocaleDateString("en-US", {
                          month: "long",
                          year: "numeric",
                        })
                      : "Present"}{" "}
                    <i>{formatDuration(edu.start_date, edu.end_date)}</i>
                  </p>
                  <p>{edu.course_name}</p>
                </div>
              ))
            ) : (
              <p>No education listed</p>
            )}
          </div>

          <div className="prof-7">
            <h2>Projects</h2>
            {profile.projects.length > 0 ? (
              profile.projects.map((pro, i) => (
                <div key={i} className="exp-div">
                  <h3>{pro.project_name}</h3>
                  <p>
                    {pro.start_date &&
                      new Date(pro.start_date).toLocaleDateString("en-US", {
                        month: "long",
                        year: "numeric",
                      })}{" "}
                    -{" "}
                    {pro.end_date
                      ? new Date(pro.end_date).toLocaleDateString("en-US", {
                          month: "long",
                          year: "numeric",
                        })
                      : "Present"}{" "}
                    <i>{formatDuration(pro.start_date, pro.end_date)}</i>
                  </p>
                  <p>{pro.description}</p>
                </div>
              ))
            ) : (
              <p>No projects listed</p>
            )}
          </div>

          <div className="prof-8">
            <div className="prof-5-1">
              <h2>Skills</h2>
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
