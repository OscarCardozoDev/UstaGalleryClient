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
  if (error) return <div className={styles.errorState}>{error}</div>;
  if (!stats || !members) return null;

  const totalPages = Math.ceil(members.total / 10);

  return (
    <main className={styles.container}>
      {/* Header */}
      <header className={styles.header}>
        <p className={styles.headerEyebrow}>Administrative Curatorial Environment</p>
        <h1 className={styles.groupTitle}>
          {stats.name}{' '}
          <span className={styles.groupTitleAccent}>Dashboard</span>
        </h1>
        <p className={styles.profesorLine}>
          {stats.profesor.name} · Docente titular ·{' '}
          <span className={styles.categoryBadge}>{stats.category}</span>
        </p>
      </header>

      {/* KPI Bar */}
      <div className={styles.kpiBar}>
        <div className={styles.kpiCard}>
          <p className={styles.kpiLabel}>Total Estudiantes</p>
          <div className={styles.kpiValueRow}>
            <span className={styles.kpiNumber}>{stats.students.total}</span>
            <svg className={styles.kpiIcon} viewBox="0 0 24 24" fill="currentColor">
              <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/>
            </svg>
          </div>
        </div>

        <div className={styles.kpiCard}>
          <p className={styles.kpiLabel}>Obras Publicadas</p>
          <div className={styles.kpiValueRow}>
            <span className={styles.kpiNumber}>{stats.products.total}</span>
            <svg className={styles.kpiIcon} viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 3C6.48 3 2 7.48 2 13c0 5.52 4.48 10 10 10s10-4.48 10-10c0-5.52-4.48-10-10-10zm-1 17.93V19c0-.55.45-1 1-1s1 .45 1 1v1.93C9.06 20.73 7.27 19.66 6 18.1l1.37-1.37c.39-.39 1.02-.39 1.41 0 .39.39.39 1.02 0 1.41L7.42 19.5c1.1.6 2.32.96 3.58 1.06V21l1-.07zM13 19c0 .55-.45 1-1 1s-1-.45-1-1v-1.93c1.26-.1 2.48-.46 3.58-1.06l-.76-.76c-.39-.39-.39-1.02 0-1.41.39-.39 1.02-.39 1.41 0L16.6 15.1C15.33 16.66 13.54 17.73 12 17.93V19z"/>
            </svg>
          </div>
        </div>

        <div className={styles.kpiCard}>
          <p className={styles.kpiLabel}>Eventos Participados</p>
          <div className={styles.kpiValueRow}>
            <span className={styles.kpiNumber}>{stats.events.total}</span>
            <svg className={styles.kpiIcon} viewBox="0 0 24 24" fill="currentColor">
              <path d="M17 12h-5v5h5v-5zM16 1v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2h-1V1h-2zm3 18H5V8h14v11z"/>
            </svg>
          </div>
        </div>
      </div>

      {/* Main Layout */}
      <div className={styles.mainGrid}>
        {/* Left aside: status breakdowns */}
        <aside className={styles.aside}>
          <section className={styles.activityCard}>
            <h2 className={styles.cardTitle}>Estado de Obras</h2>
            <ul className={styles.statusList}>
              <StatusItem
                label="Aprobadas"
                count={stats.products.approved}
                total={stats.products.total}
                color="#6dbb7a"
              />
              <StatusItem
                label="Pendientes"
                count={stats.products.pending}
                total={stats.products.total}
                color="#c9a84c"
              />
              <StatusItem
                label="Rechazadas"
                count={stats.products.rejected}
                total={stats.products.total}
                color="#cc6666"
              />
            </ul>
          </section>

          <section className={styles.activityCard}>
            <h2 className={styles.cardTitle}>Estado de Eventos</h2>
            <ul className={styles.statusList}>
              <StatusItem
                label="Aprobados"
                count={stats.events.approved}
                total={stats.events.total}
                color="#6dbb7a"
              />
              <StatusItem
                label="Pendientes"
                count={stats.events.pending}
                total={stats.events.total}
                color="#c9a84c"
              />
              <StatusItem
                label="Cancelados"
                count={stats.events.cancelled}
                total={stats.events.total}
                color="#cc6666"
              />
              <StatusItem
                label="Completados"
                count={stats.events.completed}
                total={stats.events.total}
                color="#775a19"
              />
            </ul>
          </section>
        </aside>

        {/* Right: Students table */}
        <section className={styles.tableSection}>
          <div className={styles.tableHeader}>
            <h2 className={styles.tableTitle}>Estudiantes Participantes</h2>
            <span className={styles.tableCount}>
              {members.data.length} de {members.total}
            </span>
          </div>

          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Nombre del Estudiante</th>
                  <th>Usuario</th>
                </tr>
              </thead>
              <tbody>
                {members.data.map((member) => (
                  <tr key={member.uid}>
                    <td className={styles.nameCell}>{member.name}</td>
                    <td className={styles.usernameCell}>@{member.username}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className={styles.pagination}>
              <button
                className={styles.pageBtn}
                onClick={() => handlePageChange(page - 1)}
                disabled={page === 1}
              >
                ←
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  className={`${styles.pageBtn} ${page === p ? styles.pageBtnActive : ''}`}
                  onClick={() => handlePageChange(p)}
                >
                  {p}
                </button>
              ))}
              <button
                className={styles.pageBtn}
                onClick={() => handlePageChange(page + 1)}
                disabled={page === totalPages}
              >
                →
              </button>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

function StatusItem({
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
    <li className={styles.statusItem}>
      <div className={styles.statusAccent} />
      <div className={styles.statusBody}>
        <div className={styles.statusRow}>
          <span className={styles.statusLabel}>{label}</span>
          <span className={styles.statusCount} style={{ color }}>
            {count}
          </span>
        </div>
        <div className={styles.statusTrack}>
          <div
            className={styles.statusFill}
            style={{ width: `${pct}%`, background: color }}
          />
        </div>
      </div>
    </li>
  );
}
