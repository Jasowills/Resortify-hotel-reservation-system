import React, { useState, useEffect } from "react";
import { useHistory } from "react-router-dom";
import { BiLogOutCircle, BiPlusCircle, BiUser } from "react-icons/bi";
import { ImLeaf } from "react-icons/im";
import { Link } from "react-router-dom";

function AdminSidebar() {
  const history = useHistory();
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  const openLogoutModal = () => {
    setIsLogoutModalOpen(true);
  };

  const closeLogoutModal = () => {
    setIsLogoutModalOpen(false);
  };

  const continueAsAdmin = () => {
    history.push("/");
    closeLogoutModal();
  };

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
          <span className="hide">
            {" "}
            <ImLeaf />
          </span>
        </i>

        <span className="logo">
          Resortify <ImLeaf />
        </span>
      </a>
      <ul className="side-menu top">
        <li className="active">
          <Link className="nav-link" to="/admin/reservation-records">
            <i className="bx bxs-shopping-bag-alt">
              <BiPlusCircle />
            </i>
            <span className="text">Reservation Records</span>
          </Link>{" "}
        </li>
        <li className="">
          <Link className="nav-link" to="/admin/user-management">
            <i className="bx bxs-shopping-bag-alt">
              <BiUser />
            </i>
            <span className="text">User-Management</span>
          </Link>{" "}
        </li>
      </ul>
      <ul className="side-menu">
        <li>
          <a href="#j" className="logout" onClick={openLogoutModal}>
            <i className="bx bxs-log-out-circle">
              <BiLogOutCircle />
            </i>
            <span className="text">Switch to user</span>
          </a>
        </li>
      </ul>

      {isLogoutModalOpen && (
        <>
          <div className="modal-backdrop" onClick={closeLogoutModal}></div>
          <div className="logout-modal">
            <div className="modal-content">
              <p>Are you sure you want to Continue as User?</p>
              <div className="modal-buttons">
                <button className="cancel-btn" onClick={closeLogoutModal}>
                  Cancel
                </button>
                <button className="proceed-btn" onClick={continueAsAdmin}>
                  Continue as User
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </section>
  );
}

export default AdminSidebar;
