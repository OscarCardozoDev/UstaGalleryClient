import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import styles from './GroupSelector.module.css';

export default function GroupSelector() {
  const { user, currentGroup, setCurrentGroup } = useAuth();
  const [isHovered, setIsHovered] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const groups = user?.groups || [];

  const sortedGroups = [...groups].sort((a, b) => {
    if (a.uid === currentGroup) return -1;
    if (b.uid === currentGroup) return 1;
    return 0;
  });

  const getGroupImage = (groupName: string): string => {
    const imgName: Record<string, string> = {
      'Musica Instrumental': 'musica.jpg',
      'Grupo de artes y fotografía': 'artes.jpg',
      'Tecnica Vocal': 'vocal.jpg',
    };
    return `/groups/${imgName[groupName] ?? 'default.jpg'}`;
  };

  return (
    <div
      className={styles.groupsContainer}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => setIsOpen(!isOpen)}
    >
      {sortedGroups.map((group, index) => (
        <div
          className={`${styles.groupsCard} ${currentGroup === group.uid ? styles.selected : ''}`}
          onClick={(e) => {
            e.stopPropagation();
            setCurrentGroup(group.uid);
          }}
          key={group.uid}
          style={{
            zIndex: `${100 - index}`,
            transform: isOpen
              ? `translateY(${index * -165}px) rotate(0deg)`
              : isHovered
                ? `translateY(${index * -(3 ** 2)}px) rotate(${index % 2 === 0 ? -6 : 6}deg)`
                : 'translateY(0)',
          }}
        >
          <img
            src={getGroupImage(group.name)}
            className={styles.groupsBg}
            alt="gruposBg"
          />
          <h2 className={`${styles.groupsName} text-[#171717] text-2xl font-semibold`}>
            {group.name}
          </h2>
        </div>
      ))}
    </div>
  );
}
