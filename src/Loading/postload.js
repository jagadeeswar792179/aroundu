import "./laod.css";
export default function PostLoad() {
  return (
    <>
      {[...Array(2)].map((_, index) => (
        <div className="feed-container" key={index}>
          <div className="feed-container-sep">
            <div className="feed-container-1">
              <div style={{ display: "flex" }}>
                <img src={"/avatar.jpg"} className="icon" alt="profile" />
                <div className="load-3">
                  <div className="load-4"></div>
                  <div className="load-4"></div>
                </div>
              </div>
            </div>
          </div>

          <div className="feed-container-2">
            <div
              style={{
                width: "498px",
                height: "500px",
                backgroundColor: "#e8e8e8ff",
              }}
            ></div>
          </div>

          <div className="feed-container-4">
            <div className="load-3" style={{ gap: "10px", paddingTop: "20px" }}>
              <div className="load-4-3"></div>
              <div className="load-4-3"></div>
            </div>
          </div>
        </div>
      ))}
    </>
  );
}
