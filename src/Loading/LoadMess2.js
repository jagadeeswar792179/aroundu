import "./laod.css";
export default function LoadMess2() {
  return (
    <>
      <div className="mess-9" style={{ overflowY: "auto" }}>
        {[...Array(6)].map((_, index) => (
          <div
            key={index}
            style={{
              display: "flex",
              justifyContent: index % 2 == 0 ? "flex-end" : "flex-start", // ✅ even/odd check
              margin: "20px 0",
              gap: 8,
              alignItems: "center",
            }}
          >
            {index % 2 !== 0 && (
              <img
                src={"/avatar.jpg"}
                alt="p"
                style={{ width: 28, height: 28, borderRadius: "50%" }}
              />
            )}

            <div
              style={{
                maxWidth: "70%",
                borderRadius: 12,
                padding: "8px 12px",
                whiteSpace: "pre-wrap",
                wordBreak: "break-word",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                gap: "10px",
              }}
            >
              <div
                className="load-4"
                style={{ height: "30px", borderRadius: "20px" }}
              ></div>
            </div>
            {index % 2 === 0 && (
              <img
                src={"/avatar.jpg"}
                alt="profile"
                style={{ width: 28, height: 28, borderRadius: "50%" }}
              />
            )}
          </div>
        ))}
      </div>
    </>
  );
}
