import axios from "axios";
import { Link, useNavigate } from "react-router-dom";

function Navbar() {
  const navigate = useNavigate();

  const getAuthHeader = () => {
    const token = localStorage.getItem("token");
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  const user = localStorage.getItem("role");
  const route = user === "ADMIN" ? "/admin" : user === "CUSTOMER" ? "/home" : "/vendor";

  const handleLogout = async() => {
    try {
      const response = await axios.post("http://localhost:8080/api/logout",{},{
          headers: getAuthHeader(),
        });

      if (response.status === 200) {
        localStorage.removeItem("token");
        navigate("/login");
      }
      console.log("Logout successful");
    } catch (error) {
      console.error("Logout failed", error);
    }
  };
  
  return (
    <nav className="navbar">
      <div className="navbar-brand">Inventory System</div>
      <div className="profile-container">
        <Link to={route} className="home-link">
          Home
        </Link>
        <div className="profile-icon-container">
          <div className="profile-icon">U</div>
          <button className="logout-button" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
