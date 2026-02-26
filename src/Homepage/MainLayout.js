import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";

export default function MainLayout() {
  return (
    <>
      <div className="container-1">
        <Navbar />
      </div>

      <div className="container-2">
        <div className="homecontainer">
          <Outlet />
        </div>
      </div>
    </>
  );
}