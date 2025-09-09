import "./laod.css";
export default function LoadMessage() {
  return (
    <div>
      {[...Array(5)].map((_, index) => (
        <div className="mess-3-1">
          <div className="mess-4 conversation-item" style={{ width: 245 }}>
            <img
              src={"/avatar.jpg"}
              style={{ width: 50, height: 50, borderRadius: "50%" }}
            />
            <div style={{ flex: 1 }}>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",

                  gap: "6px",
                }}
              >
                <div className="load-4"></div>
                <div className="load-4"></div>
                <div className="load-4"></div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
