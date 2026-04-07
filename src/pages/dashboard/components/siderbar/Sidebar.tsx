import { useState } from "react";
import { useAuth } from "../../../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import styles from "./Sidebar.module.css";

interface Props {
  groups: { uid: string; name: string }[];
  open: boolean;
  onClose: () => void;
}

export default function Sidebar({ open, onClose }: Props) {
  const navigate = useNavigate();
  const { user, currentGroup, setCurrentGroup, logout } = useAuth();
  const groups = user?.groups || [];
  const [isHovered, setIsHovered] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const sortedGroups = [...groups].sort((a, b) => {
    if (a.uid === currentGroup) return -1;
    if (b.uid === currentGroup) return 1;
    return 0;
  });

  const handleGroupClick = (group: { uid: string }) => {
    setCurrentGroup(group.uid);
  };

  const handleNavigation = (path: string) => {
    navigate(path);
    onClose();
  };

  const getGroupImage = (groupName: string): string => {
    const imgName = {
      "Musica Instrumental": "musica.jpg",
      "Dibujo y pintura": "artes.jpg",
      "Tecnica Vocal": "vocal.jpg",
    };
    return `/groups/${imgName[groupName as keyof typeof imgName]}`;
  };

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  return (
    <aside className={`${styles.sidebar} ${open ? styles.open : ""}`}>
      <div className={styles.toolbar}>
        <img src="/logo.png" alt="logo" className={styles.logo} />
      </div>

      <nav className={styles.nav}>
        <ul className={styles.list}>
          <li>
            <button
              className={styles.listItem}
              onClick={() => handleNavigation("/dashboard/home")}
            >
              <svg
                className={styles.icon}
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <rect x="3" y="3" width="7" height="7" />
                <rect x="14" y="3" width="7" height="7" />
                <rect x="14" y="14" width="7" height="7" />
                <rect x="3" y="14" width="7" height="7" />
              </svg>
              <span>Inicio</span>
            </button>
          </li>

          <li>
            <button
              className={styles.listItem}
              onClick={() => handleNavigation("/dashboard/upload")}
            >
              <svg
                className={styles.icon}
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="17 8 12 3 7 8" />
                <line x1="12" y1="3" x2="12" y2="15" />
              </svg>
              <span>Subir galería</span>
            </button>
          </li>

          {user?.userType?.name === "Profesor" && (
            <>
              <li>
                <button
                  className={styles.listItem}
                  onClick={() => handleNavigation("/dashboard/review-art")}
                >
                  <img
                    className={styles.icon}
                    src="../../../../../public/logos/art_gallery.dashboard.svg"
                    alt=""
                    width="20"
                    height="20"
                  />
                  <span>Revisar obras</span>
                </button>
              </li>

              <li>
                <button
                  className={styles.listItem}
                  onClick={() => handleNavigation("/dashboard/create-event")}
                >
                  <img
                    className={styles.icon}
                    src="../../../../../public/logos/event.dashboard.svg"
                    alt=""
                    width="20"
                    height="20"
                  />
                  <span>Crear Evento</span>
                </button>
              </li>
            </>
          )}

          <li>
            <button
              className={styles.listItem}
              onClick={() => handleNavigation("/dashboard/your-gallery")}
            >
              <img
                className={styles.icon}
                src="../../../../../public/logos/art_gallery.dashboard.svg"
                alt=""
                width="20"
                height="20"
              />
              <span>Tu galería</span>
            </button>
          </li>
        </ul>
      </nav>

      <div
        className={styles.groupsContainer}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={() => setIsOpen(!isOpen)}
      >
        {sortedGroups.map((group, index) => (
          <div
            className={`${styles.groupsCard} ${currentGroup === group.uid ? styles.selected : ""}`}
            onClick={() => handleGroupClick(group)}
            key={group.uid}
            style={{
              zIndex: `${100 - index}`,
              transform: isOpen
                ? `translateY(${index * -165}px) rotate(0deg)`
                : isHovered
                  ? `translateY(${index * -(3 ** 2)}px) rotate(${index % 2 === 0 ? -6 : 6}deg)`
                  : "translateY(0)",
            }}
          >
            <img
              src={getGroupImage(group.name)}
              className={styles.groupsBg}
              alt="gruposBg"
            />
            <h2
              className={`${styles.groupsName} text-[#171717] text-2xl font-semibold`}
            >
              {group.name}
            </h2>
          </div>
        ))}
      </div>

      <button className={`${styles.attendanceButton}`} onClick={handleLogout}>
        <svg
          className={`${styles.checkIcon}`}
          version="1.0"
          xmlns="http://www.w3.org/2000/svg"
          width="512.000000pt"
          height="512.000000pt"
          viewBox="0 0 512.000000 512.000000"
          preserveAspectRatio="xMidYMid meet"
        >
          <g
            transform="translate(0.000000,512.000000) scale(0.100000,-0.100000)"
            fill="#000000"
            stroke="none"
          >
            <path
              d="M4202 4797 l-262 -262 -608 -229 c-334 -126 -610 -232 -614 -235 -4
                  -4 -80 -216 -169 -471 l-160 -465 -185 -185 -184 -185 -100 100 -100 100 -268
                  -266 -267 -267 -100 -5 c-267 -16 -526 -137 -717 -335 -138 -144 -215 -276
                  -278 -480 -18 -57 -30 -105 -28 -106 1 -2 40 -15 85 -30 102 -34 163 -74 203
                  -133 40 -61 53 -113 48 -193 -5 -93 -34 -143 -157 -272 -162 -171 -231 -285
                  -285 -470 -23 -81 -61 -336 -51 -346 3 -3 69 2 147 11 79 9 399 46 713 82 314
                  35 609 74 657 85 397 94 712 403 815 798 18 71 26 134 30 232 l5 135 251 253
                  252 252 -103 102 -102 103 260 260 260 261 125 359 c69 197 128 362 132 365 5
                  4 229 90 498 191 l490 183 343 340 342 341 -322 322 c-178 178 -325 323 -328
                  323 -3 0 -123 -118 -268 -263z m341 -539 l-153 -153 -115 115 -115 115 152
                  152 153 153 115 -115 115 -115 -152 -152z m-538 -189 c97 -98 117 -123 105
                  -131 -8 -5 -215 -85 -460 -178 l-445 -168 -138 -398 -138 -399 -232 -233 -232
                  -232 -115 115 -115 115 207 207 208 208 145 420 c80 231 148 426 153 434 6 11
                  897 357 927 360 6 1 64 -53 130 -120z m-1865 -1844 l315 -315 -110 -110 c-60
                  -60 -114 -110 -120 -110 -5 0 -151 141 -322 312 l-313 313 112 112 c62 62 115
                  113 118 113 3 0 147 -142 320 -315z m-668 -212 l118 -118 -162 -162 -163 -163
                  108 -107 107 -108 163 163 162 162 133 -133 132 -132 0 -100 c0 -312 -175
                  -590 -455 -724 -44 -21 -107 -46 -140 -54 -58 -16 -1095 -140 -1103 -133 -5 6
                  36 84 71 136 17 25 74 90 128 145 166 173 217 275 226 460 10 184 -47 328
                  -180 459 l-80 78 24 45 c91 167 289 321 480 372 100 27 109 28 219 30 l95 1
                  117 -117z"
            />
          </g>
        </svg>
        <span>Cerrar sesión</span>
      </button>
    </aside>
  );
}
