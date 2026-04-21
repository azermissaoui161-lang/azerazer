import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { accountService } from '../../../services/accountService'
import {
  extractApiErrorMessage,
  mapAccountToUi,
  pickList,
} from '../../../utils/frontendApiAdapters'
import './AccountsPage.css'

const COLORS = {
  success: '#48bb78', warning: '#ed8936', danger: '#f56565', muted: '#718096',
  successBg: '#c6f6d5', warningBg: '#feebc8', dangerBg: '#fed7d7',
  mutedBg: '#edf2f7', defaultBg: '#e2e8f0'
}

const STATUS_CONFIG = {
  'actif': { color: COLORS.success, bg: COLORS.successBg },
  'inactif': { color: COLORS.muted, bg: COLORS.mutedBg },
}

const FORMAT_OPTIONS = {
  currency: { style: 'currency', currency: 'EUR' },
}

const EMPTY_ACCOUNT = {
  name: '', type: 'Banque', number: '', iban: '', bic: '',
  balance: '', status: 'actif', inMoneyFlow: false
}

const getStatusStyle = (status) => STATUS_CONFIG[status] || { color: COLORS.muted, bg: COLORS.defaultBg }

const StatusBadge = ({ status }) => {
  const style = getStatusStyle(status)
  return <span className="status-badge" style={{ background: style.bg, color: style.color }}>{status}</span>
}

const AccountForm = ({ formData, setFormData }) => {
  const fd = formData
  const set = (field, value) => setFormData({ ...fd, [field]: value })
  return (<>
    <div className="form-group"><label>Nom *</label><input type="text" value={fd.name} onChange={e => set('name', e.target.value)} required /></div>
    <div className="form-row">
      <div className="form-group"><label>Type *</label><div value={fd.type} onChange={e => set('type', e.target.value)}>
        <option value="Banque">Banque</option>
      </div>
      </div>
      <div className="form-group">
        <label>Capital *</label>
        <input type="number" value={fd.balance} onChange={e => set('balance', e.target.value)} step="0.01" required />
        <small style={{ color: '#718096' }}>Le solde sera calculé : capital + transactions validées</small>
      </div>
    </div>
    <div className="form-group"><label>Numéro de compte</label><input type="text" value={fd.number} onChange={e => set('number', e.target.value)} /></div>
    <div className="form-row">
      <div className="form-group"><label>IBAN</label><input type="text" value={fd.iban} onChange={e => set('iban', e.target.value)} /></div>
      <div className="form-group"><label>BIC</label><input type="text" value={fd.bic} onChange={e => set('bic', e.target.value)} /></div>
    </div>
    <div className="form-row">
      <div className="form-group"><label>Statut</label><select value={fd.status} onChange={e => set('status', e.target.value)}>
        <option value="actif">Actif</option><option value="inactif">Inactif</option>
      </select></div>
      <div className="form-group"></div>
    </div>
  </>)
}

function AccountsPage({ showNotif }) {
  const navigate = useNavigate()
  const notify = (msg, type) => { if (typeof showNotif === 'function') showNotif(msg, type); else if (type === 'error') window.alert(msg) }

  const [accounts, setAccounts] = useState([])
  const [modal, setModal] = useState({ isOpen: false, mode: 'add', item: null })
  const [formData, setFormData] = useState({ ...EMPTY_ACCOUNT })
  const [loading, setLoading] = useState(true)

  const formatCurrency = (amount) => (amount || 0).toLocaleString('fr-FR', FORMAT_OPTIONS.currency)

  const loadData = async () => {
    try {
      const res = await accountService.getAll({ limit: 200 })
      setAccounts(pickList(res, ['data']).map(mapAccountToUi))
    } catch (error) {
      notify(extractApiErrorMessage(error, 'Impossible de charger les comptes'), 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadData() }, [])

  const openModal = (mode, item = null) => {
    if (item && mode === 'edit') {
      setFormData({ ...item, balance: (item.capital ?? item.balance ?? 0).toString() })
    } else {
      setFormData({ ...EMPTY_ACCOUNT })
    }
    setModal({ isOpen: true, mode, item })
  }

  const closeModal = () => {
    setModal({ isOpen: false, mode: 'add', item: null })
    setFormData({ ...EMPTY_ACCOUNT })
  }

  const handleAdd = async () => {
    try {
      await accountService.create({ ...formData, inMoneyFlow: Boolean(formData.inMoneyFlow) })
      await loadData()
      closeModal()
      notify('Compte ajouté')
    } catch (error) {
      notify(extractApiErrorMessage(error, "Impossible d'ajouter le compte"), 'error')
    }
  }

  const handleUpdate = async () => {
    try {
      const targetId = modal.item?.backendId || modal.item?.id
      await accountService.update(targetId, { ...formData, inMoneyFlow: Boolean(formData.inMoneyFlow) })
      await loadData()
      closeModal()
      notify('Compte modifié')
    } catch (error) {
      notify(extractApiErrorMessage(error, 'Impossible de modifier le compte'), 'error')
    }
  }

  const handleDelete = async () => {
    try {
      const targetId = modal.item?.backendId || modal.item?.id
      await accountService.delete(targetId)
      await loadData()
      closeModal()
      notify('Compte supprimé')
    } catch (error) {
      notify(extractApiErrorMessage(error, 'Impossible de supprimer le compte'), 'error')
    }
  }

  if (loading) return <div className="finance-loading"><div className="spinner"></div><p>Chargement...</p></div>

  return (
    <div className="accounts-content">
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '12px' }}>
      </div>

      <div className="accounts-grid">
        {accounts.map(a => (
          <div key={a.id} className="account-card">
            <div className="account-card-header">
              <div className="account-icon" style={{ background: '#4299e115', color: '#4299e1' }}>
                {a.type === 'Banque' ? '🏦' : a.type === 'Épargne' ? '💰' : '📋'}
              </div>
              <div className="account-info"><h4>{a.name}</h4><p className="account-number">{a.number}</p></div>
              <StatusBadge status={a.status} />
            </div>
            <div className="account-card-body">
              <div className="account-balance"><span>Capital</span><strong>{formatCurrency(a.capital)}</strong></div>
              <div className="account-balance"><span>Solde</span><strong className={a.solde >= 0 ? 'text-success' : 'text-danger'}>{formatCurrency(a.solde)}</strong></div>
              <div className="account-type"><span>Type</span><strong>{a.type}</strong></div>
              {a.inMoneyFlow && <span className="status-badge" style={{ background: '#bee3f8', color: '#2b6cb0', fontSize: '0.7rem' }}>Money Flow</span>}
              {a.iban && <div className="account-iban"><span>IBAN</span><small>{a.iban}</small></div>}
            </div>
            <div className="account-card-footer">
              <button
                className="btn-small"
                onClick={() => {
                  if (a.name === 'Compte Revenu') {
                    navigate(`/finance/transactions`)
                  } else if (a.name === 'Compte Dépenses') {
                    navigate(`/finance/depenses?account=${encodeURIComponent(a.id)}`)
                  } else {
                    navigate(`/finance/transactions?account=${encodeURIComponent(a.id)}`)
                  }
                }}
              >
                Voir transactions
              </button>
              <button className="btn-icon" onClick={() => openModal('edit', a)}>✏️</button>
            </div>
          </div>
        ))}
      </div>

      {!accounts.length && (
        <div className="no-results"><p>Aucun compte trouvé</p></div>
      )}

      {modal.isOpen && modal.mode !== 'delete' && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{modal.mode === 'add' ? '➕ Nouveau compte' : '✏️ Modifier le compte'}</h3>
              <button className="modal-close" onClick={closeModal}>×</button>
            </div>
            <div className="modal-body">
              <AccountForm formData={formData} setFormData={setFormData} />
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={closeModal}>Annuler</button>
              <button className="btn-primary" style={{ background: '#4299e1' }}
                onClick={modal.mode === 'add' ? handleAdd : handleUpdate}>
                {modal.mode === 'add' ? 'Ajouter' : 'Modifier'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AccountsPage