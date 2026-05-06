import { useState, useMemo, useCallback, useEffect } from 'react'
import ArchiveService from '../../../services/ArchiveService'
// 🛠 utils
const utils = {
  formatCurrency: a =>
    (a || 0).toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' }),

  formatDate: d =>
    d ? new Date(d).toLocaleDateString('fr-FR') : ''
}

// 🔔 notification hook
const useNotification = () => {
  const [n, setN] = useState({ show: false, message: '', type: '' })

  const show = useCallback((m, t) => {
    setN({ show: true, message: m, type: t })
    setTimeout(() => setN({ show: false, message: '', type: '' }), 3000)
  }, [])

  return { notification: n, showNotification: show }
}

export default function ArchivePage() {
  const [archiveLog, setArchiveLog] = useState([])
  const [filters, setFilters] = useState({ search: '', year: 'all' })
  const { notification, showNotification } = useNotification()

  // ✅ load archives from backend
  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await ArchiveService.getAll()
        setArchiveLog(data)
      } catch (err) {
        showNotification('Erreur chargement archives', 'error')
      }
    }

    fetchData()
  }, [])

  // 🔍 filter + sort
  const filteredArchiveLog = useMemo(() =>
    archiveLog
      .filter(e =>
        (!filters.search ||
          (e.invoiceNumber || '').toLowerCase().includes(filters.search.toLowerCase()) ||
          (e.customer || '').toLowerCase().includes(filters.search.toLowerCase())
        ) &&
        (filters.year === 'all' ||
          new Date(e.archivedAt).getFullYear().toString() === filters.year)
      )
      .sort((a, b) => new Date(b.archivedAt) - new Date(a.archivedAt)),
    [archiveLog, filters]
  )

  // 📅 years
  const availableYears = useMemo(() =>
    [...new Set(
      archiveLog.map(e => new Date(e.archivedAt).getFullYear().toString())
    )].sort().reverse(),
    [archiveLog]
  )

  // 🔄 restore from backend
  const handleRestore = async (entry) => {
    const daysSince =
      Math.floor((new Date() - new Date(entry.archivedAt)) / (1000 * 60 * 60 * 24))

    if (daysSince > 7) {
      showNotification(`Restauration impossible (${daysSince} jours)`, 'error')
      return
    }

    try {
      await ArchiveService.restore(entry._id)

      setArchiveLog(prev => prev.filter(a => a._id !== entry._id))

      showNotification(`Facture ${entry.invoiceNumber} restaurée`, 'success')
    } catch (err) {
      showNotification(err.message, 'error')
    }
  }

  return (
    <div className="archive-content">

      {/* 🔔 notification */}
      {notification.show && (
        <div className={`notification ${notification.type}`}>
          {notification.message}
        </div>
      )}

      <div className="archive-header">
        <h2>🗄️ Archive comptable</h2>
      </div>

      {/* 🔍 filters */}
      <div className="archive-filters">
        <div className="search-box large">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            placeholder="Rechercher facture ou client..."
            className="search-input"
            value={filters.search}
            onChange={e =>
              setFilters(f => ({ ...f, search: e.target.value }))
            }
          />
        </div>

        <select
          className="archive-year-filter"
          value={filters.year}
          onChange={e =>
            setFilters(f => ({ ...f, year: e.target.value }))
          }
        >
          <option value="all">Toutes les années</option>
          {availableYears.map(y => (
            <option key={y} value={y}>{y}</option>
          ))}
        </select>
      </div>

      {/* 📊 table */}
      <div className="archive-log">
        <h3>Journal des archives ({filteredArchiveLog.length})</h3>

        <table className="archive-table">
          <thead>
            <tr>
              <th>Facture</th>
              <th>Date archivage</th>
              <th>Client</th>
              <th>Montant</th>
              <th>Motif</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {filteredArchiveLog.map(e => {
              const daysSince =
                Math.floor((new Date() - new Date(e.archivedAt)) / (1000 * 60 * 60 * 24))

              const canRestore = daysSince <= 7

              return (
                <tr key={e._id}>
                  <td>{e.invoiceNumber}</td>
                  <td>{utils.formatDate(e.archivedAt)}</td>
                  <td>{e.customer || '-'}</td>
                  <td>{utils.formatCurrency(e.amount)}</td>
                  <td>{e.reason}</td>

                  <td>
                    {canRestore ? (
                      <button
                        className="btn-icon"
                        onClick={() => handleRestore(e)}
                      >
                        ↩️
                      </button>
                    ) : (
                      <span style={{ color: '#6b7280', fontSize: '0.8rem' }}>
                        Verrouillé ({daysSince}j)
                      </span>
                    )}
                  </td>
                </tr>
              )
            })}

            {filteredArchiveLog.length === 0 && (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center', padding: '2rem' }}>
                  Aucune archive
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}