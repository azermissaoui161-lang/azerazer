// src/pages/admin/pages/AccueilPage.jsx
import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import userService from "../../../services/userService"
import { extractApiErrorMessage } from "../../../utils/frontendApiAdapters"
import "./AccueilPage.css"

function AccueilPage() {
  const navigate = useNavigate()

  const [userName, setUserName] = useState("Admin")
  const [searchTerm, setSearchTerm] = useState("")

  const [baseModules, setBaseModules] = useState([
    { id: 'facturation', name: 'Facturation', icon: '💰', color: '#667eea', count: 12, active: true, type: 'base', category: 'Gestion', createdAt: '2024-01-15' },
    { id: 'stock', name: 'Stock', icon: '📦', color: '#9f7aea', count: 8, active: true, type: 'base', category: 'Inventaire', createdAt: '2024-01-15' },
    { id: 'finance', name: 'Finance', icon: '💵', color: '#ed8936', count: 5, active: true, type: 'base', category: 'Comptabilité', createdAt: '2024-01-15' },
  ])
  const [customModules, setCustomModules] = useState([])

  const allModules = [...baseModules, ...customModules]
  const activeModulesCount = allModules.filter(m => m.active).length

  const pages = [
    { id: 1, name: 'Dashboard Facturation', path: '/facturation/dashboard', icon: '💰', color: '#667eea', module: 'facturation' },
    { id: 2, name: 'Dashboard Stock', path: '/stock/dashboard', icon: '📦', color: '#9f7aea', module: 'stock' },
    { id: 3, name: 'Dashboard Finance', path: '/finance/dashboard', icon: '💵', color: '#ed8936', module: 'finance' },
    { id: 4, name: 'Gestion Stock', path: '/stock', icon: '📦', color: '#9f7aea', module: 'stock' },
    { id: 5, name: 'Gestion Facturation', path: '/facturation', icon: '📋', color: '#38a169', module: 'facturation' },
    { id: 6, name: 'Gestion Finance', path: '/finance', icon: '📄', color: '#ed8936', module: 'finance' },
  ]

  const getCustomPages = () => {
    return customModules.flatMap((module, index) => [
      {
        id: 100 + (index * 2),
        name: `Dashboard ${module.name}`,
        path: `/${module.id}/dashboard`,
        icon: module.icon,
        color: module.color,
        module: module.id
      },
      {
        id: 101 + (index * 2),
        name: `Gestion ${module.name}`,
        path: `/${module.id}`,
        icon: '📋',
        color: module.color,
        module: module.id
      }
    ])
  }

  const allPages = [...pages, ...getCustomPages()]

  const getFilteredPages = () => {
    return allPages.filter(page => {
      if (!page.module) return true
      const module = allModules.find(m => m.id === page.module)
      return module ? module.active : true
    })
  }

  const displayedPages = getFilteredPages()

  const filteredPages = displayedPages.filter(page =>
    page.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  useEffect(() => {
    let active = true
    ;(async () => {
      try {
        const [profileResponse, usersResponse] = await Promise.all([
          userService.getProfile(),
          userService.getUsers({ limit: 200 })
        ])
        if (!active) return
        const profile = profileResponse?.data || profileResponse
        setUserName(profile?.firstName || "Admin")
      } catch {
        // silently ignore
      }
    })()
    return () => { active = false }
  }, [])

  return (
    <>
      <div className="accueil-main-header">
        <div>
          <h1 className="accueil-welcome-title">
            Bonjour, <span className="accueil-welcome-name">{userName}</span> 👋
          </h1>
          {activeModulesCount < allModules.length && (
            <p className="accueil-filter-indicator">
              <span className="accueil-filter-dot">•</span>
              {allModules.length - activeModulesCount} module(s) masqué(s)
            </p>
          )}
        </div>

        <div className="accueil-search-container">
          <span className="accueil-search-icon">🔍</span>
          <input
            type="text"
            placeholder="Rechercher une page..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="accueil-search-input"
          />
          {searchTerm && (
            <button onClick={() => setSearchTerm("")} className="accueil-clear-button">
              ✕
            </button>
          )}
        </div>
      </div>

      {searchTerm && (
        <div className="accueil-search-results">
          <p className="accueil-results-count">
            {filteredPages.length} résultat{filteredPages.length > 1 ? 's' : ''}
          </p>
          <div className="accueil-results-list">
            {filteredPages.map(page => (
              <div
                key={page.id}
                onClick={() => navigate(page.path)}
                className={`accueil-result-item ${page.module && !allModules.find(m => m.id === page.module)?.active ? 'accueil-result-item-hidden' : ''}`}
                style={{ backgroundColor: page.color }}
              >
                <span>{page.icon}</span>
                {page.name}
                {page.module && !allModules.find(m => m.id === page.module)?.active && (
                  <span className="accueil-hidden-badge">Masqué</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="accueil-modules-grid">
        {baseModules.filter(m => m.active).map(module => (
          <div key={module.id} className="accueil-module-card">
            <div className="accueil-module-icon" style={{ backgroundColor: module.color }}>
              <span>{module.icon}</span>
            </div>
            <h3 className="accueil-module-title">{module.name}</h3>
            <p className="accueil-module-stats">{module.count} actions récentes</p>
            <div className="accueil-module-actions">
              <button
                onClick={() => navigate(`/${module.id}/dashboard`)}
                className="accueil-module-button"
              >
                Dashboard
              </button>
              <button
                onClick={() => navigate(`/${module.id}`)}
                className="accueil-module-button-secondary"
              >
                Gestion
              </button>
            </div>
          </div>
        ))}

        {customModules.filter(m => m.active).map(module => (
          <div key={module.id} className="accueil-module-card">
            <div className="accueil-module-icon" style={{ backgroundColor: module.color }}>
              <span>{module.icon}</span>
            </div>
            <h3 className="accueil-module-title">{module.name}</h3>
            <p className="accueil-module-stats"> </p>
            <div className="accueil-module-actions">
              <button
                onClick={() => navigate(`/${module.id}/dashboard`)}
                className="accueil-module-button"
              >
                Dashboard
              </button>
              <button
                onClick={() => navigate(`/${module.id}`)}
                className="accueil-module-button-secondary"
              >
                Gestion
              </button>
            </div>
          </div>
        ))}
      </div>

      {allModules.filter(m => m.active).length === 0 && (
        <div className="accueil-no-active-modules">
          <p>Aucun module actif. Allez dans <strong>Gestion des modules</strong> pour activer des modules.</p>
        </div>
      )}
    </>
  )
}

export default AccueilPage