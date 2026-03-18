import React, { useState, useEffect } from 'react';
import styles from './GroupSelection.module.css';
import { getAllGroups, addStudentToGroups } from '../../../../services/groups';
import type { GroupResult } from '../../../../interfaces/groups';

interface GroupSelectionProps {
  onGroupsSelected: () => void;
}

interface Group {
  id: string;
  name: string;
}

const GroupSelection: React.FC<GroupSelectionProps> = ({ 
  onGroupsSelected 
}) => {
  const [groups, setGroups] = useState<Group[]>([]);
  const [selectedGroups, setSelectedGroups] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchGroups();
  }, []);

  const fetchGroups = async () => {
    setIsLoading(true);
    setError('');

    try {
      const groupResults: GroupResult[] = await getAllGroups();

      setGroups(groupResults.map((group) => ({
        id: group.uid,
        name: group.name,
      })));

    } catch (err) {
      setError('Error al cargar los grupos. Intenta nuevamente.');
      console.error('Error fetching groups:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleGroup = (groupId: string) => {
    setSelectedGroups((prev) =>
      prev.includes(groupId)
        ? prev.filter((id) => id !== groupId)
        : [...prev, groupId]
    );
  };

  const handleSubmit = async () => {
    if (selectedGroups.length === 0) {
      setError('Por favor selecciona al menos un grupo');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const response = await addStudentToGroups({ groupIds: selectedGroups });
      if (response) {
        onGroupsSelected();
      }
    } catch (err) {
      setError('Error al unirse a los grupos. Intenta nuevamente.');
      console.error('Error joining groups:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getGroupImage = (groupName: string): string => {
    const imgName = {
      'Musica Instrumental': 'musica.jpg',
      'Dibujo y pintura': 'artes.jpg',
    };
    return `/groups/${imgName[groupName as keyof typeof imgName]}`;
  };

  if (isLoading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
        <p className={styles.loadingText}>Cargando grupos...</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <h3 className={styles.title}>Selecciona tus Grupos</h3>
      <p className={styles.description}>
        Elige los grupos de arte que te interesan. Puedes seleccionar más de uno.
      </p>

      <div className={styles.groupsGrid}>
        {groups.map((group) => {
          const isSelected = selectedGroups.includes(group.id);
          
          return (
            <div
              key={group.id}
              className={`${styles.groupCard} ${isSelected ? styles.selected : ''}`}
              onClick={() => toggleGroup(group.id)}
            >
              <div className={styles.imageContainer}>
                <img
                  src={getGroupImage(group.name)} 
                  alt={group.name}
                  onError={(e) => {
                    e.currentTarget.src = '/groups/default.jpg';
                  }}
                  className={styles.groupImage}
                />
                {isSelected && (
                  <div className={styles.checkmark}>
                    <span>✓</span>
                  </div>
                )}
              </div>
              <div className={styles.groupName}>{group.name}</div>
            </div>
          );
        })}
      </div>

      {error && <div className={styles.errorMessage}>{error}</div>}

      <button
        onClick={handleSubmit}
        className={styles.submitButton}
        disabled={isSubmitting || selectedGroups.length === 0}
      >
        {isSubmitting ? 'Guardando...' : `Unirse ${selectedGroups.length > 0 ? `(${selectedGroups.length})` : ''}`}
      </button>
    </div>
  );
};

export default GroupSelection;
