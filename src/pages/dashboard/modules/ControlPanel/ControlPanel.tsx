import { useState, useEffect } from 'react';
import { useAuth } from '../../../../context/AuthContext';
import { getGroupStats, getGroupMembers } from '../../../../services/groups';
import type { GroupStats, GroupMembersResult } from '../../../../interfaces/groups';
import styles from './ControlPanel.module.css';

export default function ControlPanel() {
  const { currentGroup } = useAuth();
  const [stats, setStats] = useState<GroupStats | null>(null);
  const [members, setMembers] = useState<GroupMembersResult | null>(null);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!currentGroup) return;

    setIsLoading(true);
    setError(null);

    Promise.all([
      getGroupStats(currentGroup),
      getGroupMembers(currentGroup, 1, 10),
    ])
      .then(([statsData, membersData]) => {
        setStats(statsData);
        setMembers(membersData);
        setPage(1);
      })
      .catch(() => setError('Error al cargar datos del grupo'))
      .finally(() => setIsLoading(false));
  }, [currentGroup]);

  const handlePageChange = async (newPage: number) => {
    if (!currentGroup) return;
    try {
      const data = await getGroupMembers(currentGroup, newPage, 10);
      setMembers(data);
      setPage(newPage);
    } catch {
      setError('Error al cargar página de estudiantes');
    }
  };

  if (!currentGroup) {
    return (
      <div className={styles.emptyState}>
        <p>Selecciona un grupo en el sidebar</p>
      </div>
    );
  }

  if (isLoading) return <div className={styles.loading}>Cargando...</div>;
  if (error) return <div className={styles.error}>{error}</div>;
  if (!stats || !members) return null;

  const totalPages = Math.ceil(members.total / 10);

  return (
    <main className={styles.container}>
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <span className={styles.panelLabel}>Panel de Control</span>
          <h1 className={styles.groupName}>{stats.name}</h1>
          <div className={styles.headerMeta}>
            <span className={styles.profesor}>{stats.profesor.name} · Docente titular</span>
            <span className={styles.categoryBadge}>{stats.category}</span>
          </div>
        </div>
      </header>

      <section className={styles.statsGrid}>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>Estudiantes</span>
          <span className={styles.statNumber} style={{ color: '#c9a84c' }}>
            {stats.students.total}
          </span>
        </div>

        <div className={styles.statCard}>
          <span className={styles.statLabel}>Obras</span>
          <span className={styles.statNumber}>{stats.products.total}</span>
          <div className={styles.statusBars}>
            <StatusBar label="Aprobadas" count={stats.products.approved} total={stats.products.total} color="#6dbb7a" />
            <StatusBar label="Pendientes" count={stats.products.pending} total={stats.products.total} color="#c9a84c" />
            <StatusBar label="Rechazadas" count={stats.products.rejected} total={stats.products.total} color="#cc6666" />
          </div>
        </div>

        <div className={styles.statCard}>
          <span className={styles.statLabel}>Eventos</span>
          <span className={styles.statNumber}>{stats.events.total}</span>
          <div className={styles.statusBars}>
            <StatusBar label="Aprobados" count={stats.events.approved} total={stats.events.total} color="#6dbb7a" />
            <StatusBar label="Pendientes" count={stats.events.pending} total={stats.events.total} color="#c9a84c" />
            <StatusBar label="Cancelados" count={stats.events.cancelled} total={stats.events.total} color="#cc6666" />
          </div>
        </div>
      </section>

      <section className={styles.tableSection}>
        <div className={styles.tableHeader}>
          <span className={styles.tableLabel}>Detalle Estudiantes</span>
        </div>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>NOMBRE</th>
              <th>USUARIO</th>
            </tr>
          </thead>
          <tbody>
            {members.data.map((member) => (
              <tr key={member.uid}>
                <td>{member.name}</td>
                <td className={styles.username}>@{member.username}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {totalPages > 1 && (
          <div className={styles.pagination}>
            <button onClick={() => handlePageChange(page - 1)} disabled={page === 1}>←</button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => handlePageChange(p)}
                className={page === p ? styles.activePage : ''}
              >
                {p}
              </button>
            ))}
            <button onClick={() => handlePageChange(page + 1)} disabled={page === totalPages}>→</button>
          </div>
        )}
      </section>
    </main>
  );
}

function StatusBar({
  label,
  count,
  total,
  color,
}: {
  label: string;
  count: number;
  total: number;
  color: string;
}) {
  const pct = total === 0 ? 0 : Math.round((count / total) * 100);
  return (
    <div className={styles.statusBar}>
      <div className={styles.statusBarHeader}>
        <span style={{ color }}>{label}</span>
        <span style={{ color, fontWeight: 700 }}>{count}</span>
      </div>
      <div className={styles.statusBarTrack}>
        <div className={styles.statusBarFill} style={{ width: `${pct}%`, background: color }} />
      </div>
    </div>
  );
}
