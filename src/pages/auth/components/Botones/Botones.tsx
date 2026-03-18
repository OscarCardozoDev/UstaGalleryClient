import styles from './botones.module.css'
export const PrimaryBoton = ({ text, onClick }: { text: string, onClick: () => void }) => {
    return(
        /* From Uiverse.io by e-coders */ 

        <button className={`${styles.button} ${styles.type1} ${styles.primary}`} onClick={onClick}>
            <span className={styles.btnTxt}>{text}</span>
        </button>
    );
}

export const SecondaryBoton = ({ text, onClick }: { text: string, onClick: () => void }) => {
    return(
        /* From Uiverse.io by e-coders */ 

        <button className={`${styles.button} ${styles.type1} ${styles.secondary}`} onClick={onClick}>
            <span className={styles.btnTxt}>{text}</span>
        </button>
    );
}

export default { PrimaryBoton, SecondaryBoton };