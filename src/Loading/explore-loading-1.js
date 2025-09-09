import "./laod.css";
export default function ExploreLoading1({ count }) {
  return (
    <>
      <div
        className="load-1"
        style={{
          display: count % 2 != 0 ? "flex" : "grid",
          flexDirection: count % 2 != 0 && "column",
        }}
      >
        {[...Array(count)].map((_, index) => (
          <div className="load-2" key={index}>
            <img className="prof-avatar" src={"/avatar.jpg"} />
            <div
              style={{ display: "flex", flexDirection: "column", gap: "10px" }}
            >
              <div className="load-4"></div>
              <div className="load-4"></div>
              <div className="load-4"></div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
