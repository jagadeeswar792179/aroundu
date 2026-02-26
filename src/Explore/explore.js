import ProfessorsSection from "./ProfessorsSection";
import PeopleSection from "./PeopleSection";
import "./explore.css";
import RequestList from "./RequestList";
export default function Explore() {
  return (
    <>
   
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
      
    </>
  );
}
