import Navbar from "../Homepage/Navbar";
import LostFound from "./LostFound";

export default function LostFoundPage() {
  return (
    <>
      <div className="container-1">
        <Navbar />
      </div>
      <div className="container-2">
        <div className="homecontainer">
          <LostFound />
        </div>
      </div>
    </>
  );
}
