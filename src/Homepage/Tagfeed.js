// src/components/TagFeed.jsx
import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import Feed from "./feed";
import Navbar from "./Navbar";
import { FaBookmark, FaChevronDown } from "react-icons/fa";

export default function TagFeed() {
  const { tag } = useParams();
  const navigate = useNavigate();
  const server = process.env.REACT_APP_SERVER;

  // feed expects an object: { url, params }
  const fetchUrlBuilder = (page) => ({
    url: `${server}/api/posts/tag/${encodeURIComponent(tag)}`,
    params: { page },
  });

  const newsArray = [
    "India, Canada reset diplomatic ties; 10m ago",
    "More Indians invest in mutual funds; 10m ago",
    "Big Four goes big on hiring; 5h ago • 4,851 readers",
    "More recruiters get AI savvy; 5h ago • 3,599 readers",
    "What's shaping IT deals; 5h ago • 3,294 readers",
  ];

  return (
    <>
      <div className="container-1">
        <Navbar />
      </div>
      <div className="search-cont-2">
        <div>
          <h2
            style={{
              color: "#4c6fcaff",
              padding: "5px 10px 0 20px",
              margin: "0px",
            }}
          >
            #{tag}
          </h2>

          <Feed
            key={`posts-${tag}`}
            fetchUrlBuilder={fetchUrlBuilder}
            onNavigateProfile={(id) => navigate(`/profile/${id}`)}
            onTagNavigate={(t) => navigate(`/tag/${t}`)}
            autoFetchOnMount={true}
          />
        </div>

        <div className="homecontainer-3">
          <div className="homecontainer-3-1">
            <h3>AroundU News</h3>
            <h4>Top-stories</h4>
            {newsArray.map((item, index) => {
              const [title, details] = item.split(";");
              return (
                <div key={index} className="news-item">
                  <h5>{title.trim()}</h5>
                  <p>{details?.trim()}</p>
                </div>
              );
            })}
            <div
              style={{
                display: "flex",
                alignItems: "center",
              }}
            >
              <FaChevronDown title="search" size={14} className="icon" />
              Show more
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
