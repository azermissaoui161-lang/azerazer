// src/pages/admin/layout/AdminLayout.jsx
import { useEffect, useState } from "react"
import { Outlet, NavLink, useNavigate } from "react-router-dom"
import { clearAuth } from "../../../utils/auth"
import userService from "../../../services/userService"
import "./AdminLayout.css"

function AdminLayout() {
  const navigate = useNavigate()

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [userSettings, setUserSettings] = useState({
    firstName: "Admin",
    lastName: "Principal",
    email: "",
    department: ""
  })

  useEffect(() => {
    let active = true
    ;(async () => {
      try {
        const response = await userService.getProfile()
        const profile = response?.data || response
        if (!active) return
        setUserSettings(prev => ({
          ...prev,
          firstName: profile?.firstName || "Admin",
          lastName: profile?.lastName || "Principal",
          email: profile?.email || "",
          department: profile?.department || "Direction"
        }))
      } catch {
        // silently ignore profile load errors
      }
    })()
    return () => { active = false }
  }, [])

  const handleLogout = () => {
    clearAuth()
    navigate("/login")
  }

  return (
    <div className="container">
      {/* Sidebar */}
      <div 
        className="sidebar" 
        style={{ width: sidebarCollapsed ? "80px" : "280px" }}
      >
        <div className="sidebar-header">
          {!sidebarCollapsed && (
            <NavLink to="/admin/accueil" className="logo-container">
              <div className="logo-container">
                <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
                  <rect width="40" height="40" rx="10" fill="#667eea" />
                  <path d="M12 20L18 26L28 14" stroke="white" strokeWidth="3" strokeLinecap="round" />
                </svg>
                <div>
                  <h1 className="logo-title">ERP</h1>
                  <p className="logo-subtitle">Administration</p>
                </div>
              </div>
            </NavLink>
          )}
          {sidebarCollapsed && (
            <NavLink to="/admin/accueil" className="logo-collapsed">
              <div className="logo-collapsed">
                <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
                  <rect width="40" height="40" rx="10" fill="#667eea" />
                  <path d="M12 20L18 26L28 14" stroke="white" strokeWidth="3" strokeLinecap="round" />
                </svg>
              </div>
            </NavLink>
          )}
          <button
            onClick={() => setSidebarCollapsed(c => !c)}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: "4px",
              color: "#a0aec0",
              fontSize: "1.2rem",
              marginLeft: "auto"
            }}
          >
            {sidebarCollapsed ? "›" : "‹"}
          </button>
        </div>

        {!sidebarCollapsed && (
          <div className="profile-section">
            <div className="avatar">
              {userSettings.firstName?.charAt(0).toUpperCase() || "A"}
            </div>
            <div className="user-info">
              <div className="user-name">
                {userSettings.firstName} {userSettings.lastName}
              </div>
              <div className="user-email">{userSettings.email}</div>
              {userSettings.department && (
                <div className="user-department">{userSettings.department}</div>
              )}
            </div>
          </div>
        )}

        {sidebarCollapsed && (
          <div className="avatar-collapsed">
            {userSettings.firstName?.charAt(0).toUpperCase() || "A"}
          </div>
        )}

        <div className="nav-container">
          <p className={!sidebarCollapsed ? "nav-title" : "nav-title-collapsed"}>
            {!sidebarCollapsed ? "MENU" : "M"}
          </p>

          <NavLink
            to="/admin/accueil"
            style={({ isActive }) => ({
              background: isActive ? "#667eea" : "transparent",
              color: isActive ? "white" : "#4a5568",
              justifyContent: sidebarCollapsed ? "center" : "flex-start",
              padding: sidebarCollapsed ? "12px" : "12px 20px",
              marginBottom: "8px",
              gap: "12px"
            })}
            className="nav-button"
          >
            <span style={{ fontSize: "1.2rem" }}>{"\uD83C\uDFE0"}</span>
            {!sidebarCollapsed && "Page d'accueil"}
          </NavLink>

          <NavLink
            to="/admin/modules"
            style={({ isActive }) => ({
              background: isActive ? "#805ad5" : "#9f7aea",
              color: "white",
              justifyContent: sidebarCollapsed ? "center" : "flex-start",
              padding: sidebarCollapsed ? "12px" : "12px 20px",
              marginBottom: "10px",
              gap: "12px"
            })}
            className="nav-button"
          >
            <span style={{ fontSize: "1.2rem" }}>{"\uD83D\uDCCA"}</span>
            {!sidebarCollapsed && (
              <span style={{ flex: 1, textAlign: "left" }}>Gestion des modules</span>
            )}
          </NavLink>

          <NavLink
            to="/admin/accounts"
            style={({ isActive }) => ({
              background: isActive ? "#2b6cb0" : "#4299e1",
              color: "white",
              justifyContent: sidebarCollapsed ? "center" : "flex-start",
              padding: sidebarCollapsed ? "12px" : "12px 20px",
              marginBottom: "10px",
              gap: "12px"
            })}
            className="nav-button"
          >
            <span style={{ fontSize: "1.2rem" }}>{"\uD83D\uDC65"}</span>
            {!sidebarCollapsed && (
              <span style={{ flex: 1, textAlign: "left" }}>Consulter les comptes</span>
            )}
          </NavLink>

          <NavLink
            to="/admin/create-account"
            style={({ isActive }) => ({
              background: isActive ? "#38a169" : "#48bb78",
              color: "white",
              justifyContent: sidebarCollapsed ? "center" : "flex-start",
              padding: sidebarCollapsed ? "12px" : "12px 20px",
              marginBottom: "10px",
              gap: "12px"
            })}
            className="nav-button"
          >
            <span style={{ fontSize: "1.2rem" }}>{"\u2795"}</span>
            {!sidebarCollapsed && "Créer un compte"}
          </NavLink>

          <NavLink
            to="/admin/settings"
            style={({ isActive }) => ({
              background: isActive ? "#2d3748" : "#4a5568",
              color: "white",
              justifyContent: sidebarCollapsed ? "center" : "flex-start",
              padding: sidebarCollapsed ? "12px" : "12px 20px",
              marginBottom: "8px",
              gap: "12px"
            })}
            className="nav-button"
          >
            <span style={{ fontSize: "1.2rem" }}>{"\u2699\uFE0F"}</span>
            {!sidebarCollapsed && "Paramètres"}
          </NavLink>
        </div>

        <div className="logout-section">
          <button
            onClick={handleLogout}
            className="logout-button"
            style={{
              justifyContent: sidebarCollapsed ? "center" : "flex-start",
              padding: sidebarCollapsed ? "12px" : "12px 20px"
            }}
          >
            <span style={{ fontSize: "1.2rem" }}>{"\uD83D\uDEAA"}</span>
            {!sidebarCollapsed && "Déconnexion"}
          </button>
        </div>
      </div>

      {/* Main content */}
      <div 
        className="main-content" 
        style={{ marginLeft: sidebarCollapsed ? "80px" : "280px" }}
      >
        <Outlet />
      </div>
    </div>
  )
}

export default AdminLayout