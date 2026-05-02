import type { UserWithRelations } from '../../../../../interfaces/users';
import styles from '../Professors.module.css';

interface Props {
  professor: UserWithRelations;
  confirmingUid: string | null;
  onDeactivateClick: (uid: string) => void;
  onReactivateClick: (uid: string) => void;
  onConfirmDeactivate: (uid: string) => void;
  onCancelConfirm: () => void;
}

export default function ProfessorCard({
  professor,
  confirmingUid,
  onDeactivateClick,
  onReactivateClick,
  onConfirmDeactivate,
  onCancelConfirm,
}: Props) {
  const isConfirming = confirmingUid === professor.uid;
  const photoUrl = professor.photo?.url;

  return (
    <div className={`${styles.card} ${!professor.isActive ? styles.cardInactive : ''}`}>
      <div className={styles.cardHeader}>
        <div className={styles.avatar}>
          {photoUrl ? (
            <img src={photoUrl} alt={professor.name} className={styles.avatarImg} />
          ) : (
            <span className={styles.avatarInitial}>
              {professor.name.charAt(0).toUpperCase()}
            </span>
          )}
        </div>
        <div className={styles.cardInfo}>
          <div className={styles.cardName}>{professor.name} {professor.lastName}</div>
          <div className={styles.cardUsername}>@{professor.username}</div>
        </div>
        <span className={`${styles.badge} ${professor.isActive ? styles.badgeActive : styles.badgeInactive}`}>
          {professor.isActive ? 'Activo' : 'Inactivo'}
        </span>
      </div>

      <div className={styles.cardDetails}>
        <span>📱 {professor.telNumber}</span>
        <span>🎭 {professor.role?.name ?? 'Profesor Particular'}</span>
      </div>

      {isConfirming ? (
        <div className={styles.confirmRow}>
          <span className={styles.confirmText}>¿Desactivar?</span>
          <button
            className={styles.btnConfirm}
            onClick={() => onConfirmDeactivate(professor.uid)}
          >
            Sí
          </button>
          <button
            className={styles.btnCancel}
            onClick={onCancelConfirm}
          >
            No
          </button>
        </div>
      ) : professor.isActive ? (
        <button
          className={styles.btnDeactivate}
          onClick={() => onDeactivateClick(professor.uid)}
        >
          Desactivar
        </button>
      ) : (
        <button
          className={styles.btnReactivate}
          onClick={() => onReactivateClick(professor.uid)}
        >
          Reactivar
        </button>
      )}
    </div>
  );
}
