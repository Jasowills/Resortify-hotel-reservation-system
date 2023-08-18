import React, { useState, useEffect } from "react";
import { useHistory } from "react-router-dom"; // Import useHistory
import "../styles/Dashboard.css";
import { ImLeaf } from "react-icons/im";
import { Link } from "react-router-dom";
import {
  BiDoughnutChart,
  BiUser,
  BiLogOutCircle,
  BiPlusCircle,
} from "react-icons/bi";

function Sidebar() {
  const history = useHistory(); // Initialize useHistory
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  const openLogoutModal = () => {
    setIsLogoutModalOpen(true);
  };

  const closeLogoutModal = () => {
    setIsLogoutModalOpen(false);
  };

  // ...
  const continueAsAdmin = () => {
    history.push("/admin/reservation-records"); // Navigate to admin reservation records
    closeLogoutModal();
  };
  // ...

  useEffect(() => {
    const allSideMenu = document.querySelectorAll(
      "#sidebar .side-menu.top li a"
    );

    allSideMenu.forEach((item) => {
      const li = item.parentElement;

      item.addEventListener("click", function () {
        allSideMenu.forEach((i) => {
          i.parentElement.classList.remove("active");
        });
        li.classList.add("active");
      });
    });
  }, []);

  return (
    <section id="sidebar">
      <a href="#l" className="brand">
        <i className="bx bxs-dashboard">
          {" "}
          <span className="hide">
            {" "}
            <ImLeaf />
          </span>
        </i>

        <span className="logo">
          {" "}
          Resortify <ImLeaf />
        </span>
      </a>
      <ul className="side-menu top">
        <li className="active">
          <Link className="nav-link " to="/">
            <i className="bx bxs-shopping-bag-alt">
              <BiPlusCircle />
            </i>
            <span className="text">Reservation</span>
          </Link>{" "}
        </li>
        <li>
          <Link className="nav-link" to="/rooms">
            <i className="bx bxs-doughnut-chart">
              <BiDoughnutChart />
            </i>
            <span className="text">Rooms</span>
          </Link>
        </li>{" "}
        <li>
          <Link className="nav-link" to="/user-management">
            <i className="bx bxs-doughnut-chart">
              <BiUser />
            </i>
            <span className="text">UserManagement</span>
          </Link>
        </li>
      </ul>
      <ul className="side-menu">
        <li>
          <a href="#j" className="logout" onClick={openLogoutModal}>
            <i className="bx bxs-log-out-circle">
              <BiLogOutCircle />
            </i>
            <span className="text">Admin</span>
          </a>
        </li>
      </ul>

      {/* Logout Modal */}
      {isLogoutModalOpen && (
        <>
          <div className="modal-backdrop" onClick={closeLogoutModal}></div>
          <div className="logout-modal">
            <div className="modal-content">
              <p>Are you sure you want to log in as admin?</p>
              <div className="modal-buttons">
                <button className="cancel-btn" onClick={closeLogoutModal}>
                  Cancel
                </button>
                <button className="proceed-btn" onClick={continueAsAdmin}>
                  Continue as Admin
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </section>
  );
}

export default Sidebar;
