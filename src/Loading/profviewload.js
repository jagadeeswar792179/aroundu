import "./laod.css";
export default function ProfViewLoad() {
  return (
    <>
      <div className="pv-grid">
        {[...Array(4)].map((_, index) => (
          <div className="pv-card">
            <img src={"/avatar.jpg"} className="pv-avatar" alt="profile" />
            <div className="load-3">
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
