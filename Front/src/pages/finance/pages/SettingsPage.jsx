import { useState, useEffect } from 'react'
import userService from '../../../services/userService'
import { depensesService } from '../../../services/depensesService'
import { extractApiErrorMessage } from '../../../utils/frontendApiAdapters'
import './SettingsPage.css'
const INITIAL_SETTINGS = {
  firstName: '', lastName: '', email: '', phone: '', department: '', role: '',
  currentPassword: '', newPassword: '', confirmPassword: ''
}

function SettingsPage({ showNotif }) {
  const [userSettings, setUserSettings] = useState({ ...INITIAL_SETTINGS })
  const [settingsMessage, setSettingsMessage] = useState({ type: '', text: '' })
  const [updating, setUpdating] = useState(false)
  const [loading, setLoading] = useState(true)
  const [limitSettings, setLimitSettings] = useState({
    enabled: false,
    maxMonthlyAmount: '',
    warningThresholdPercent: 80,
    currentMonthTotal: 0,
    percent: 0,
    month: '',
  })

  const loadProfile = async () => {
    try {
      const profileResponse = await userService.getProfile()
      const profile = profileResponse?.data || profileResponse
      setUserSettings(prev => ({
        ...prev,
        firstName: profile?.firstName || 'Gestionnaire',
        lastName: profile?.lastName || 'Finance',
        email: profile?.email || '',
        phone: profile?.phone || '',
        department: profile?.department || 'Finance',
        role: profile?.role || 'admin_finance',
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      }))
      const limitsResponse = await depensesService.getSettings()
      const limits = limitsResponse?.data || limitsResponse
      setLimitSettings({
        enabled: Boolean(limits?.enabled),
        maxMonthlyAmount: limits?.maxMonthlyAmount || '',
        warningThresholdPercent: limits?.warningThresholdPercent || 80,
        currentMonthTotal: limits?.currentMonthTotal || 0,
        percent: limits?.percent || 0,
        month: limits?.month || '',
      })
    } catch (error) {
      setSettingsMessage({ type: 'error', text: extractApiErrorMessage(error, 'Impossible de charger le profil') })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadProfile() }, [])

  const handleSettingsChange = (e) => setUserSettings({ ...userSettings, [e.target.name]: e.target.value })
  const handleLimitChange = (e) => {
    const { name, type, checked, value } = e.target
    setLimitSettings(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }))
  }

  const handleSaveLimitSettings = async () => {
    const maxMonthlyAmount = Number(limitSettings.maxMonthlyAmount) || 0
    const warningThresholdPercent = Number(limitSettings.warningThresholdPercent) || 80

    if (limitSettings.enabled && maxMonthlyAmount <= 0) {
      setSettingsMessage({ type: 'error', text: 'La limite mensuelle doit etre superieure a 0' })
      return
    }

    if (warningThresholdPercent < 1 || warningThresholdPercent > 100) {
      setSettingsMessage({ type: 'error', text: 'Le seuil notification doit etre entre 1 et 100%' })
      return
    }

    setUpdating(true)
    setSettingsMessage({ type: 'info', text: 'Mise a jour de la limite...' })
    try {
      const response = await depensesService.updateSettings({
        enabled: Boolean(limitSettings.enabled),
        maxMonthlyAmount,
        warningThresholdPercent,
      })
      const saved = response?.data || response
      setLimitSettings(prev => ({
        ...prev,
        ...saved,
        maxMonthlyAmount: saved.maxMonthlyAmount || '',
        warningThresholdPercent: saved.warningThresholdPercent || warningThresholdPercent,
      }))
      setSettingsMessage({ type: 'success', text: 'Limite depenses mise a jour' })
    } catch (error) {
      setSettingsMessage({ type: 'error', text: extractApiErrorMessage(error, 'Impossible de mettre a jour la limite') })
    } finally {
      setUpdating(false)
    }
  }

  const handleSaveSettings = async () => {
    if (!userSettings.firstName || !userSettings.lastName || !userSettings.email) {
      setSettingsMessage({ type: 'error', text: 'Champs obligatoires manquants' }); return
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userSettings.email)) {
      setSettingsMessage({ type: 'error', text: "Format d'email invalide" }); return
    }
    const changingPassword = userSettings.newPassword || userSettings.confirmPassword || userSettings.currentPassword
    if (changingPassword) {
      if (!userSettings.currentPassword) { setSettingsMessage({ type: 'error', text: 'Veuillez entrer votre mot de passe actuel' }); return }
      if (userSettings.newPassword !== userSettings.confirmPassword) { setSettingsMessage({ type: 'error', text: 'Les nouveaux mots de passe ne correspondent pas' }); return }
      if (userSettings.newPassword.length < 6) { setSettingsMessage({ type: 'error', text: 'Le nouveau mot de passe doit contenir au moins 6 caractères' }); return }
    }
    setUpdating(true)
    setSettingsMessage({ type: 'info', text: 'Mise à jour en cours...' })
    try {
      await userService.updateProfile({
        firstName: userSettings.firstName,
        lastName: userSettings.lastName,
        email: userSettings.email,
        phone: userSettings.phone,
        department: userSettings.department
      })
      if (changingPassword) await userService.changePassword(userSettings.currentPassword, userSettings.newPassword)
      await loadProfile()
      setSettingsMessage({ type: 'success', text: 'Profil mis à jour avec succès !' })
      setTimeout(() => setSettingsMessage({ type: '', text: '' }), 2000)
    } catch (error) {
      setSettingsMessage({ type: 'error', text: extractApiErrorMessage(error, 'Impossible de mettre a jour le profil') })
    } finally {
      setUpdating(false)
    }
  }

  if (loading) return <div className="finance-loading"><div className="spinner"></div><p>Chargement...</p></div>

  return (
    <div className="settings-tab">
      <h2>⚙️ Paramètres du profil</h2>
      {settingsMessage.text && <div className={`settings-message ${settingsMessage.type}`}>{settingsMessage.text}</div>}
      <div className="settings-form">
        <div className="settings-section">
          <h3>Informations personnelles</h3>
          <div className="settings-row">
            <div className="settings-group"><label>Prénom</label><input type="text" name="firstName" value={userSettings.firstName} onChange={handleSettingsChange} /></div>
            <div className="settings-group"><label>Nom</label><input type="text" name="lastName" value={userSettings.lastName} onChange={handleSettingsChange} /></div>
          </div>
          <div className="settings-row">
            <div className="settings-group"><label>Email</label><input type="email" name="email" value={userSettings.email} onChange={handleSettingsChange} /></div>
            <div className="settings-group"><label>Téléphone</label><input type="tel" name="phone" value={userSettings.phone} onChange={handleSettingsChange} /></div>
          </div>
        </div>
        <div className="settings-section">
          <h3>Informations professionnelles</h3>
          <div className="settings-row">
            <div className="settings-group"><label>Département</label><input type="text" name="department" value={userSettings.department} onChange={handleSettingsChange} /></div>
            <div className="settings-group"><label>Rôle</label><input type="text" value={userSettings.role} disabled style={{ backgroundColor: '#f7fafc', cursor: 'not-allowed' }} /><small>Le rôle ne peut pas être modifié</small></div>
          </div>
        </div>
        <div className="settings-section">
          <h3>Limite mensuelle des depenses</h3>
          <div className="settings-row">
            <div className="settings-group">
              <label>Activer le plafond</label>
              <label className="settings-toggle">
                <input type="checkbox" name="enabled" checked={Boolean(limitSettings.enabled)} onChange={handleLimitChange} />
                <span>Bloquer les depenses au-dessus du plafond</span>
              </label>
            </div>
            <div className="settings-group">
              <label>Plafond mensuel</label>
              <input type="number" min="0" step="0.01" name="maxMonthlyAmount" value={limitSettings.maxMonthlyAmount} onChange={handleLimitChange} />
            </div>
          </div>
          <div className="settings-row">
            <div className="settings-group">
              <label>Notification admin a partir de (%)</label>
              <input type="number" min="1" max="100" name="warningThresholdPercent" value={limitSettings.warningThresholdPercent} onChange={handleLimitChange} />
            </div>
            <div className="settings-group">
              <label>Consommation du mois</label>
              <input type="text" value={`${Number(limitSettings.currentMonthTotal || 0).toFixed(2)} / ${Number(limitSettings.maxMonthlyAmount || 0).toFixed(2)} (${Number(limitSettings.percent || 0).toFixed(1)}%)`} disabled readOnly />
            </div>
          </div>
          <button className="btn-primary" onClick={handleSaveLimitSettings} disabled={updating} style={{ background: '#4299e1' }}>
            Enregistrer la limite depenses
          </button>
        </div>
        <div className="settings-section">
          <h3>Changer le mot de passe</h3>
          <p className="settings-hint">Laissez vide si vous ne souhaitez pas changer votre mot de passe</p>
          <div className="settings-group"><label>Mot de passe actuel</label><input type="password" name="currentPassword" value={userSettings.currentPassword} onChange={handleSettingsChange} /></div>
          <div className="settings-row">
            <div className="settings-group"><label>Nouveau mot de passe</label><input type="password" name="newPassword" value={userSettings.newPassword} onChange={handleSettingsChange} /></div>
            <div className="settings-group"><label>Confirmer</label><input type="password" name="confirmPassword" value={userSettings.confirmPassword} onChange={handleSettingsChange} /></div>
          </div>
          <small>Minimum 6 caractères</small>
        </div>
        <div className="settings-actions">
          <button className="btn-primary" onClick={handleSaveSettings} disabled={updating} style={{ width: '100%', background: '#4299e1' }}>
            {updating ? 'Mise à jour en cours...' : 'Enregistrer les modifications'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default SettingsPage
