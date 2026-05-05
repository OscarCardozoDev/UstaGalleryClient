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
      <div className={styles.cardPhotoWrap}>
        {photoUrl ? (
          <img src={photoUrl} alt={professor.name} className={styles.cardPhotoImg} />
        ) : (
          <div className={styles.cardPhotoPlaceholder}>
            <span className={styles.cardPhotoInitial}>
              {professor.name.charAt(0).toUpperCase()}
            </span>
          </div>
        )}
      </div>

      <div className={styles.cardOverlayTop}>
        <div className={styles.cardName}>{professor.name} {professor.lastName}</div>
        <div className={styles.cardRole}>{professor.role?.name ?? 'Profesor'}</div>
      </div>

      <div className={styles.cardBottom}>
        <div className={styles.cardBottomLeft}>
          <span className={styles.cardUsername}>{professor.role?.name ?? 'Sin grupo'}</span>
          <span className={`${styles.badge} ${professor.isActive ? styles.badgeActive : styles.badgeInactive}`}>
            {professor.isActive ? 'Activo' : 'Inactivo'}
          </span>
        </div>

        <div>
          {isConfirming ? (
            <div className={styles.confirmRow}>
              <button className={styles.btnConfirm} onClick={() => onConfirmDeactivate(professor.uid)}>
                Sí
              </button>
              <button className={styles.btnCancel} onClick={onCancelConfirm}>
                No
              </button>
            </div>
          ) : professor.isActive ? (
            <button className={styles.btnDeactivate} onClick={() => onDeactivateClick(professor.uid)}>
              Desactivar
            </button>
          ) : (
            <button className={styles.btnReactivate} onClick={() => onReactivateClick(professor.uid)}>
              Reactivar
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
