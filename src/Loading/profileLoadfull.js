import "./laod.css";
import Navbar from "../Homepage/Navbar";

export default function ProfileLoadFull() {
  return (
    <>
      <div className="container-1">
        <Navbar />
      </div>
      <div className="container-2">
        <div className="prof">
          <div className="prof-1">
            <div className="prof-11">
              <img
                src={"/avatar.jpg"}
                alt="Profile"
                style={{
                  width: 150,
                  height: 150,
                  borderRadius: "50%",
                  objectFit: "cover",
                }}
              />
            </div>
            <div className="load-3" style={{ alignItems: "flex-start" }}>
              <div className="load-4"></div>
              <div className="load-4"></div>
              <div className="load-4"></div>
            </div>
          </div>
          {[...Array(1)].map((_, index) => (
            <>
              <div
                key={index}
                className="prof-2"
                style={{
                  display: "flex",

                  gap: "30px",
                  alignItems: "center",
                  height: "120px",
                }}
              >
                <div
                  className="load-4"
                  style={{ width: "760px", height: "15px" }}
                ></div>
                <div
                  className="load-4"
                  style={{ width: "760px", height: "15px" }}
                ></div>
                <div
                  className="load-4"
                  style={{ width: "760px", height: "15px" }}
                ></div>
              </div>
              <div
                className="prof-2"
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(3, 1fr)", // two columns
                  gap: "30px",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <div
                  className="load-4"
                  style={{
                    width: "230px",
                    height: "300px",
                    backgroundColor: "#f1f1f1ff",
                  }}
                ></div>
                <div
                  className="load-4"
                  style={{
                    width: "230px",
                    height: "300px",
                    backgroundColor: "#f1f1f1ff",
                  }}
                ></div>
                <div
                  className="load-4"
                  style={{
                    width: "230px",
                    height: "300px",
                    backgroundColor: "#f1f1f1ff",
                  }}
                ></div>
              </div>
              <div
                className="prof-2"
                style={{
                  display: "flex",
                  gap: "30px",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <div className="exp-div" style={{ height: "60px" }}></div>
                <div className="exp-div" style={{ height: "60px" }}></div>
              </div>
            </>
          ))}
        </div>
      </div>
    </>
  );
}
