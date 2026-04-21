// src/pages/admin/pages/AccountsPage.jsx
import { useEffect, useState } from "react"
import userService from "../../../services/userService"
import { extractApiErrorMessage, mapUserToAdminAccount, pickList } from "../../../utils/frontendApiAdapters"
import "./AccountsPage.css"

function AccountsPage() {
  const [accounts, setAccounts] = useState([])
  const [accountSearchTerm, setAccountSearchTerm] = useState("")
  const [errorMessage, setErrorMessage] = useState("")

  const filteredAccounts = accounts.filter(account =>
    account.firstName.toLowerCase().includes(accountSearchTerm.toLowerCase()) ||
    account.lastName.toLowerCase().includes(accountSearchTerm.toLowerCase())
  )

  const accountStats = {
    total: accounts.length,
    actifs: accounts.filter(a => a.active).length,
    inactifs: accounts.filter(a => !a.active).length,
  }

  const loadAccounts = async () => {
    try {
      const usersResponse = await userService.getUsers({ limit: 200 })
      setAccounts(pickList(usersResponse, ['data']).map(mapUserToAdminAccount))
    } catch (error) {
      setErrorMessage(extractApiErrorMessage(error, "Impossible de charger les comptes"))
    }
  }

  useEffect(() => {
    loadAccounts()
  }, [])

  const getModuleIcon = (role) => {
    const icons = {
      'admin': '👑',
      'manager': '👔',
      'user': '👤',
      'comptable': '📊',
      'commercial': '📈',
      'default': '📍'
    }
    return icons[role] || icons.default
  }

  const getRoleBadgeColor = (role) => {
    const colors = {
      'admin': '#667eea',
      'manager': '#ed8936',
      'comptable': '#48bb78',
      'commercial': '#4299e1',
      'user': '#9f7aea',
    }
    return colors[role] || '#a0aec0'
  }

  const getRoleLabel = (role) => {
    const labels = {
      'admin': 'Admin',
      'manager': 'Manager',
      'comptable': 'Comptable',
      'commercial': 'Commercial',
      'user': 'Utilisateur',
    }
    return labels[role] || role
  }

  const toggleAccountStatus = async (accountId) => {
    try {
      await userService.toggleUserStatus(accountId)
      await loadAccounts()
    } catch (error) {
      setErrorMessage(extractApiErrorMessage(error, "Impossible de modifier le statut du compte"))
    }
  }

  const toggleAllAccounts = async (activate) => {
    const accountsToUpdate = accounts.filter(account => account.active !== activate)
    if (!accountsToUpdate.length) return
    try {
      await Promise.all(accountsToUpdate.map(account => userService.toggleUserStatus(account.id)))
      await loadAccounts()
    } catch (error) {
      setErrorMessage(extractApiErrorMessage(error, "Impossible de mettre à jour les comptes"))
    }
  }

  return (
    <div className="accounts-page-container">
      <h1 className="accounts-page-title">Consulter les comptes</h1>

      {errorMessage && (
        <div className="accounts-error-message">
          {errorMessage}
        </div>
      )}

      <div className="accounts-stats-container">
        <div className="accounts-stat-card">
          <span className="accounts-stat-card-value">{accountStats.total}</span>
          <span className="accounts-stat-card-label">Total</span>
        </div>
        <div className="accounts-stat-card accounts-stat-card-green">
          <span className="accounts-stat-card-value">{accountStats.actifs}</span>
          <span className="accounts-stat-card-label">Actifs</span>
        </div>
        <div className="accounts-stat-card accounts-stat-card-red">
          <span className="accounts-stat-card-value">{accountStats.inactifs}</span>
          <span className="accounts-stat-card-label">Inactifs</span>
        </div>
      </div>

      <div className="accounts-toolbar">
        <div className="accounts-search">
          <input
            type="text"
            placeholder="Rechercher par nom..."
            value={accountSearchTerm}
            onChange={(e) => setAccountSearchTerm(e.target.value)}
            className="accounts-search-input"
          />
          {accountSearchTerm && (
            <button onClick={() => setAccountSearchTerm("")} className="accounts-clear-button">
              ✕
            </button>
          )}
        </div>

        <div className="accounts-bulk-actions">
          <button
            onClick={() => toggleAllAccounts(true)}
            className="accounts-bulk-button accounts-bulk-button-green"
          >
            ✅ Tout activer
          </button>
          <button
            onClick={() => toggleAllAccounts(false)}
            className="accounts-bulk-button accounts-bulk-button-red"
          >
            ❌ Tout désactiver
          </button>
        </div>
      </div>

      <div className="accounts-table-wrapper">
        <table className="accounts-table">
          <thead>
            <tr>
              <th className="accounts-table-header">ID</th>
              <th className="accounts-table-header">État</th>
              <th className="accounts-table-header">Utilisateur</th>
              <th className="accounts-table-header">Email</th>
              <th className="accounts-table-header">Rôle</th>
              <th className="accounts-table-header">Département</th>
              <th className="accounts-table-header">Créé le</th>
              <th className="accounts-table-header">Dernière connexion</th>
              <th className="accounts-table-header">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredAccounts.length > 0 ? (
              filteredAccounts.map(account => (
                <tr
                  key={account.id}
                  className={`accounts-table-row ${!account.active ? 'accounts-table-row-inactive' : ''}`}
                >
                  <td className="accounts-table-cell accounts-id-cell">
                    {account.id}
                  </td>
                  <td className="accounts-table-cell">
                    <span className={`accounts-status-badge ${account.active ? 'accounts-status-badge-active' : 'accounts-status-badge-inactive'}`}>
                      {account.active ? 'Actif' : 'Inactif'}
                    </span>
                  </td>
                  <td className="accounts-table-cell">
                    <div className="accounts-user-info">
                      <div 
                        className="accounts-user-avatar"
                        style={{
                          background: `linear-gradient(135deg, ${getRoleBadgeColor(account.role)}, #764ba2)`
                        }}
                      >
                        {account.firstName.charAt(0).toUpperCase()}
                      </div>
                      <span className="accounts-user-name">
                        {account.firstName} {account.lastName}
                      </span>
                    </div>
                  </td>
                  <td className="accounts-table-cell">
                    <span className="accounts-email">{account.email}</span>
                  </td>
                  <td className="accounts-table-cell">
                    <span 
                      className="accounts-role-badge"
                      style={{ backgroundColor: getRoleBadgeColor(account.role) }}
                    >
                      {getModuleIcon(account.role)} {getRoleLabel(account.role)}
                    </span>
                  </td>
                  <td className="accounts-table-cell">
                    <span className="accounts-department-badge">
                      {account.department}
                    </span>
                  </td>
                  <td className="accounts-table-cell">
                    <span className="accounts-date">{account.createdAt}</span>
                  </td>
                  <td className="accounts-table-cell">
                    <span className="accounts-date">{account.lastLogin}</span>
                  </td>
                  <td className="accounts-table-cell">
                    {account.active ? (
                      <button
                        onClick={() => toggleAccountStatus(account.id)}
                        className="accounts-action-button accounts-action-button-danger"
                      >
                        Désactiver
                      </button>
                    ) : (
                      <button
                        onClick={() => toggleAccountStatus(account.id)}
                        className="accounts-action-button accounts-action-button-success"
                      >
                        Activer
                      </button>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="9" className="accounts-no-results">
                  Aucun compte trouvé
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="accounts-table-footer">
        <span className="accounts-footer-text">
          Affichage de {filteredAccounts.length} compte(s) sur {accounts.length}
        </span>
      </div>
    </div>
  )
}

export default AccountsPage