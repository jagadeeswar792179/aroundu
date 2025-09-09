import "./laod.css";
export default function UsercardLoad() {
  return (
    <>
      <div
        className="homecontainer-1-1"
        style={{ display: "flex", flexDirection: "column", gap: "10px" }}
      >
        <img src={"/avatar.jpg"} className="icon" alt="profile" />
        <div className="load-4"></div>
        <div className="load-4"></div>
        <div className="load-4"></div>
        <div className="load-4"></div>
      </div>
    </>
  );
}
