// src/components/TagFeed.jsx
import { useParams, useNavigate } from "react-router-dom";
import Feed from "./feed";

import LostFound from "../LostFound/LostFound";

export default function TagFeed() {
  const { tag } = useParams();
  const navigate = useNavigate();
  const server = process.env.REACT_APP_SERVER;

  // feed expects an object: { url, params }
  const fetchUrlBuilder = (page) => ({
    url: `${server}/api/posts/tag/${encodeURIComponent(tag)}`,
    params: { page },
  });



  return (
    <>
   
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
        <LostFound />
      </div>
    </>
  );
}
