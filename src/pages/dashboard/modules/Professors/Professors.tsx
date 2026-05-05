import { sileo } from 'sileo';
import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../../context/AuthContext';
import { getActiveUsers, deactivateUser, reactivateUser } from '../../../../services/users';
import type { UserWithRelations } from '../../../../interfaces/users';
import ProfessorCard from './components/ProfessorCard';
import CreateProfessorModal from './components/CreateProfessorModal';
import styles from './Professors.module.css';

export default function ProfessorsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [professors, setProfessors] = useState<UserWithRelations[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [confirmingUid, setConfirmingUid] = useState<string | null>(null);

  // Admin guard
  useEffect(() => {
    if (user && user.userType?.name !== 'admin') {
      navigate('/dashboard/home', { replace: true });
    }
  }, [user, navigate]);

  const loadProfessors = useCallback(async () => {
    setIsLoading(true);
    try {
      const all = await getActiveUsers();
      setProfessors(all.filter((u) => u.userType?.name === 'professor'));
    } catch (err) {
      sileo.error({
        title: 'Error',
        description: err instanceof Error ? err.message : 'No se pudieron cargar los profesores',
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { loadProfessors(); }, [loadProfessors]);

  const handleDeactivateClick = (uid: string) => {
    setConfirmingUid(uid);
  };

  const handleConfirmDeactivate = async (uid: string) => {
    setConfirmingUid(null);
    try {
      await deactivateUser(uid);
      setProfessors((prev) =>
        prev.map((p) => (p.uid === uid ? { ...p, isActive: false } : p)),
      );
      const professor = professors.find((p) => p.uid === uid);
      sileo.success({
        title: 'Profesor desactivado',
        description: professor ? `${professor.name} ${professor.lastName}` : '',
      });
    } catch (err) {
      sileo.error({
        title: 'Error al desactivar',
        description: err instanceof Error ? err.message : 'Error desconocido',
      });
    }
  };

  const handleReactivate = async (uid: string) => {
    try {
      await reactivateUser(uid);
      setProfessors((prev) =>
        prev.map((p) => (p.uid === uid ? { ...p, isActive: true } : p)),
      );
      const professor = professors.find((p) => p.uid === uid);
      sileo.success({
        title: 'Profesor reactivado',
        description: professor ? `${professor.name} ${professor.lastName}` : '',
      });
    } catch (err) {
      sileo.error({
        title: 'Error al reactivar',
        description: err instanceof Error ? err.message : 'Error desconocido',
      });
    }
  };

  const handleProfessorCreated = () => {
    setIsModalOpen(false);
    loadProfessors();
  };

  const activeCount   = professors.filter((p) => p.isActive).length;
  const inactiveCount = professors.filter((p) => !p.isActive).length;

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Profesores</h1>
          <p className={styles.pageSubtitle}>
            {activeCount} activo{activeCount !== 1 ? 's' : ''}
            {inactiveCount > 0 ? ` · ${inactiveCount} inactivo${inactiveCount !== 1 ? 's' : ''}` : ''}
          </p>
        </div>
        <button className={styles.btnPrimary} onClick={() => setIsModalOpen(true)}>
          + Nuevo Profesor
        </button>
      </div>

      {isLoading ? (
        <p className={styles.loadingText}>Cargando profesores...</p>
      ) : professors.length === 0 ? (
        <p className={styles.emptyText}>No hay profesores registrados aún.</p>
      ) : (
        <div className={styles.grid}>
          {professors.map((professor) => (
            <ProfessorCard
              key={professor.uid}
              professor={professor}
              confirmingUid={confirmingUid}
              onDeactivateClick={handleDeactivateClick}
              onReactivateClick={handleReactivate}
              onConfirmDeactivate={handleConfirmDeactivate}
              onCancelConfirm={() => setConfirmingUid(null)}
            />
          ))}
        </div>
      )}

      {isModalOpen && (
        <CreateProfessorModal
          onProfessorCreated={handleProfessorCreated}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </div>
  );
}
