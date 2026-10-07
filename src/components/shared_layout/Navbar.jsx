/**
 * @file Shared application-layout component: Navbar.
 * Sections: layout-specific helpers/state and rendered navigation or shell markup.
 * Preserve responsive desktop/mobile behavior and keep feature logic out of layout components.
 */
import { Link, useNavigate } from "react-router-dom";
import useAuth from "../../auth/useAuth";

function Navbar({ onDrawerToggle }) {
  const navigate = useNavigate();
  const { session, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    navigate("/login", { replace: true });
  };

  return (
    <nav className={"health-navbar"}>
      <div className={"health-navbar-container"}>
        <button
          type={"button"}
          className={"health-navbar-drawer-toggle"}
          aria-label={"Toggle navigation drawer"}
          onClick={onDrawerToggle}
        >
          <span aria-hidden={"true"}>&#9776;</span>
        </button>
        <Link className={"health-navbar-brand"} to={"/"}>
          <img
            className={"health-navbar-logo"}
            src={"/images/logo_HR Expert.png"}
            alt={"Health Expert"}
          />
        </Link>
        <div className={"health-navbar-session"}>
          <span>{session?.username}</span>
          <button type={"button"} onClick={handleLogout}>
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
