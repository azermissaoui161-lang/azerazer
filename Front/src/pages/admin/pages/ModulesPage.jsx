// src/pages/admin/pages/ModulesPage.jsx
import { useEffect, useState } from "react"
import userService from "../../../services/userService"
import { extractApiErrorMessage } from "../../../utils/frontendApiAdapters"
import "./ModulesPage.css"

function ModulesPage() {
  const [baseModules, setBaseModules] = useState([
    { id: 'facturation', name: 'Facturation', icon: '💰', color: '#667eea', count: 12, active: true, type: 'base', category: 'Gestion', createdAt: '2024-01-15' },
    { id: 'stock', name: 'Stock', icon: '📦', color: '#9f7aea', count: 8, active: true, type: 'base', category: 'Inventaire', createdAt: '2024-01-15' },
    { id: 'finance', name: 'Finance', icon: '💵', color: '#ed8936', count: 5, active: true, type: 'base', category: 'Comptabilité', createdAt: '2024-01-15' },
  ])
  const [customModules, setCustomModules] = useState([])
  const [moduleSearchTerm, setModuleSearchTerm] = useState("")
  const [errorMessage, setErrorMessage] = useState("")

  const allModules = [...baseModules, ...customModules]

  const filteredModules = allModules.filter(module =>
    module.name.toLowerCase().includes(moduleSearchTerm.toLowerCase()) ||
    module.category?.toLowerCase().includes(moduleSearchTerm.toLowerCase()) ||
    module.type.toLowerCase().includes(moduleSearchTerm.toLowerCase())
  )

  const moduleStats = {
    total: allModules.length,
    actifs: allModules.filter(m => m.active).length,
    inactifs: allModules.filter(m => !m.active).length,
  }

  const saveModulePreferences = async (nextBaseModules, nextCustomModules) => {
    await userService.updatePreferences('admin', {
      modules: [...nextBaseModules, ...nextCustomModules].map(module => ({
        id: module.id,
        active: module.active
      }))
    })
  }

  const loadModulePreferences = async () => {
    try {
      const preferencesResponse = await userService.getPreferences('admin').catch(() => ({ data: {} }))
      const preferences = preferencesResponse?.data || preferencesResponse
      const preferenceEntries = Array.isArray(preferences?.modules)
        ? preferences.modules
        : Object.entries(preferences?.moduleStates || {}).map(([id, active]) => ({ id, active }))

      if (!preferenceEntries.length) return

      const activeById = new Map(preferenceEntries.map((entry) => [entry.id, entry.active !== false]))
      setBaseModules(prev => prev.map(module => activeById.has(module.id) ? { ...module, active: activeById.get(module.id) } : module))
      setCustomModules(prev => prev.map(module => activeById.has(module.id) ? { ...module, active: activeById.get(module.id) } : module))
    } catch {
      // silently ignore
    }
  }

  useEffect(() => {
    loadModulePreferences()
  }, [])

  const toggleModule = async (moduleId) => {
    const nextBaseModules = baseModules.map(module =>
      module.id === moduleId ? { ...module, active: !module.active } : module
    )
    const nextCustomModules = customModules.map(module =>
      module.id === moduleId ? { ...module, active: !module.active } : module
    )

    setBaseModules(nextBaseModules)
    setCustomModules(nextCustomModules)

    try {
      await saveModulePreferences(nextBaseModules, nextCustomModules)
    } catch (error) {
      setErrorMessage(extractApiErrorMessage(error, "Impossible d'enregistrer les modules"))
      await loadModulePreferences()
    }
  }

  const toggleAllModules = async (activate) => {
    const nextBaseModules = baseModules.map(module => ({ ...module, active: activate }))
    const nextCustomModules = customModules.map(module => ({ ...module, active: activate }))

    setBaseModules(nextBaseModules)
    setCustomModules(nextCustomModules)

    try {
      await saveModulePreferences(nextBaseModules, nextCustomModules)
    } catch (error) {
      setErrorMessage(extractApiErrorMessage(error, "Impossible d'enregistrer les modules"))
      await loadModulePreferences()
    }
  }

  return (
    <div className="modules-page-container">
      <h1 className="modules-page-title">Gestion des modules</h1>

      {errorMessage && (
        <div className="modules-error-message">
          {errorMessage}
        </div>
      )}

      <div className="modules-stats-container">
        <div className="modules-stat-card">
          <span className="modules-stat-card-value">{moduleStats.total}</span>
          <span className="modules-stat-card-label">Total</span>
        </div>
        <div className="modules-stat-card modules-stat-card-green">
          <span className="modules-stat-card-value">{moduleStats.actifs}</span>
          <span className="modules-stat-card-label">Actifs</span>
        </div>
        <div className="modules-stat-card modules-stat-card-red">
          <span className="modules-stat-card-value">{moduleStats.inactifs}</span>
          <span className="modules-stat-card-label">Inactifs</span>
        </div>
      </div>

      <div className="modules-toolbar">
        <div className="modules-search">
          <input
            type="text"
            placeholder="Rechercher module"
            value={moduleSearchTerm}
            onChange={(e) => setModuleSearchTerm(e.target.value)}
            className="modules-search-input"
          />
          {moduleSearchTerm && (
            <button onClick={() => setModuleSearchTerm("")} className="modules-clear-button">
              ✕
            </button>
          )}
        </div>

        <div className="modules-bulk-actions">
          <button onClick={() => toggleAllModules(true)} className="modules-bulk-button">
            ✅ Tout activer
          </button>
          <button onClick={() => toggleAllModules(false)} className="modules-bulk-button">
            ❌ Tout désactiver
          </button>
        </div>
      </div>

      <div className="modules-table-wrapper">
        <table className="modules-table">
          <thead>
            <tr>
              <th className="modules-table-header">État</th>
              <th className="modules-table-header">Icône</th>
              <th className="modules-table-header">Nom</th>
              <th className="modules-table-header">Catégorie</th>
              <th className="modules-table-header">Type</th>
              <th className="modules-table-header">Création</th>
              <th className="modules-table-header">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredModules.length > 0 ? (
              filteredModules.map(module => (
                <tr key={module.id} className="modules-table-row">
                  <td className="modules-table-cell">
                    <span className={`modules-status-badge ${module.active ? 'modules-status-badge-active' : 'modules-status-badge-inactive'}`}>
                      {module.active ? 'Actif' : 'Inactif'}
                    </span>
                  </td>
                  <td className="modules-table-cell">
                    <span className="modules-icon">{module.icon}</span>
                  </td>
                  <td className="modules-table-cell">
                    <div className="modules-name-cell">
                      <span className="modules-name-text">{module.name}</span>
                      {module.count > 0 && (
                        <span className="modules-count-badge">{module.count}</span>
                      )}
                    </div>
                  </td>
                  <td className="modules-table-cell">
                    <span className="modules-category-badge">
                      {module.category || "Général"}
                    </span>
                  </td>
                  <td className="modules-table-cell">
                    <span className={`modules-type-badge ${module.type === 'base' ? 'modules-type-badge-base' : 'modules-type-badge-custom'}`}>
                      {module.type === 'base' ? 'Base' : 'Personnalisé'}
                    </span>
                  </td>
                  <td className="modules-table-cell">
                    <span className="modules-date-text">{module.createdAt || 'N/A'}</span>
                  </td>
                  <td className="modules-table-cell">
                    <button
                      onClick={() => toggleModule(module.id)}
                      className="modules-action-button"
                      style={{
                        backgroundColor: module.active ? '#f56565' : '#48bb78'
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.backgroundColor = module.active ? '#c53030' : '#38a169'
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.backgroundColor = module.active ? '#f56565' : '#48bb78'
                      }}
                    >
                      {module.active ? 'Désactiver' : 'Activer'}
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" className="modules-no-results">
                  Aucun module trouvé
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="modules-table-footer">
        <span className="modules-footer-text">
          Affichage de {filteredModules.length} module(s) sur {allModules.length}
        </span>
      </div>
    </div>
  )
}

export default ModulesPage