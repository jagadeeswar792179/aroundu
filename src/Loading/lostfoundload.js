import "./lostfound.css";
export default function LFload() {
  return (
    <>
      {[...Array(3)].map((_, index) => (
        <div class="item-card">
          <div class="meta-line">
            <span class="meta-value"></span>
          </div>
          <div class="reporter-line">
            <img src="/avatar.jpg" className="reporter-avatar" />
            <div className="flex-c" style={{ gap: "5px" }}>
              <div class="lf-3"></div>
              <div class="lf-3"></div>
            </div>
          </div>
          <div className="flex-c" style={{ gap: "10px", padding: "20px" }}>
            <div className="lf-4"></div>
            <div className="lf-4"></div>
            <div className="lf-4"></div>
          </div>
        </div>
      ))}
    </>
  );
}
