import ProfessorsSection from "./ProfessorsSection";
import PeopleSection from "./PeopleSection";
import "./explore.css";
import Navbar from "../Homepage/Navbar";
import RequestList from "./RequestList";
export default function Explore() {
  return (
    <>
      <div className="container-1">
        <Navbar />
      </div>
      <div className="container-2">
        <div className="explore-container">
          <div className="explore-1">
            {" "}
            <div className="explore-1">
              <div className="explore-1-1">
                <RequestList />
              </div>
              <div className="explore-1-2">Promoted content</div>
            </div>{" "}
          </div>
          <div className="explore-2">
            <ProfessorsSection initialSameUniversity={false} />
            <PeopleSection initialSameUniversity={true} />
          </div>
        </div>
      </div>
    </>
  );
}
