import "./laod.css";
export default function SearchLoadingPeople() {
  return (
    <>
      <div className="search-res-people">
        {[...Array(9)].map((_, index) => (
          <div className="sload-1" key={index}>
            <img
              src={"/avatar.jpg"}
              alt="profile"
              style={{
                width: "60px",
                height: "60px",
                borderRadius: "50%",
                objectFit: "cover",
              }}
            />
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
