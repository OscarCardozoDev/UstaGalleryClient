import { sileo } from 'sileo';
import { useState, useEffect } from 'react';
import { getUsersWithoutProfile } from '../../../../../services/auth';
import { createProfessor } from '../../../../../services/users';
import type { CredentialWithoutProfile } from '../../../../../interfaces/auth';
import type { CreateProfessorDto } from '../../../../../interfaces/users';
import formsParams from '../../../../../utils/forms.params.json';
import styles from '../Professors.module.css';

interface Props {
  onProfessorCreated: () => void;
  onClose: () => void;
}

interface ProfileForm {
  name: string;
  lastName: string;
  username: string;
  gender: string;
  telNumber: string;
  description: string;
}

const EMPTY_FORM: ProfileForm = {
  name: '', lastName: '', username: '', gender: '', telNumber: '', description: '',
};

export default function CreateProfessorModal({ onProfessorCreated, onClose }: Props) {
  const [step, setStep] = useState<1 | 2>(1);
  const [credentials, setCredentials] = useState<CredentialWithoutProfile[]>([]);
  const [search, setSearch] = useState('');
  const [selectedUid, setSelectedUid] = useState<string | null>(null);
  const [form, setForm] = useState<ProfileForm>(EMPTY_FORM);
  const [errors, setErrors] = useState<Partial<ProfileForm>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);

  useEffect(() => {
    getUsersWithoutProfile()
      .then(setCredentials)
      .catch((err) => {
        sileo.error({ title: 'Error', description: err.message });
        onClose();
      })
      .finally(() => setIsFetching(false));
  }, [onClose]);

  const filtered = credentials.filter((c) =>
    c.mail.toLowerCase().includes(search.toLowerCase()),
  );

  const handleFieldChange = (field: keyof ProfileForm, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: '' }));
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<ProfileForm> = {};
    if (!form.name.trim()) newErrors.name = 'Requerido';
    if (!form.lastName.trim()) newErrors.lastName = 'Requerido';
    if (!form.username.trim()) {
      newErrors.username = 'Requerido';
    } else if (!/^[a-zA-Z0-9_]+$/.test(form.username)) {
      newErrors.username = 'Solo letras, números y guiones bajos';
    }
    if (!form.gender) newErrors.gender = 'Requerido';
    if (!form.telNumber.trim()) {
      newErrors.telNumber = 'Requerido';
    } else if (!/^\d{10}$/.test(form.telNumber)) {
      newErrors.telNumber = 'Debe tener 10 dígitos';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!selectedUid || !validateForm()) return;
    setIsLoading(true);
    try {
      const dto: CreateProfessorDto = {
        uid: selectedUid,
        name: form.name,
        lastName: form.lastName,
        username: form.username,
        gender: form.gender,
        telNumber: form.telNumber,
        description: form.description || undefined,
      };
      await createProfessor(dto);
      sileo.success({ title: 'Profesor creado', description: `${form.name} ${form.lastName}` });
      onProfessorCreated();
    } catch (err) {
      sileo.error({
        title: 'Error al crear profesor',
        description: err instanceof Error ? err.message : 'Error desconocido',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.modalOverlay} onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className={styles.modal}>
        <div className={styles.modalHeader}>
          <h3 className={styles.modalTitle}>
            Nuevo Profesor — Paso {step} de 2
          </h3>
          <button className={styles.modalClose} onClick={onClose}>✕</button>
        </div>

        {step === 1 ? (
          <div className={styles.modalBody}>
            {isFetching ? (
              <p className={styles.emptyText}>Cargando usuarios...</p>
            ) : filtered.length === 0 && search === '' ? (
              <p className={styles.emptyText}>No hay usuarios registrados sin perfil.</p>
            ) : (
              <>
                <p className={styles.modalSubtitle}>
                  Selecciona el usuario registrado al que deseas crear perfil de profesor.
                </p>
                <input
                  className={styles.searchInput}
                  placeholder="Buscar por email..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
                <div className={styles.credentialList}>
                  {filtered.length === 0 ? (
                    <p className={styles.emptyText}>Sin resultados para "{search}"</p>
                  ) : (
                    filtered.map((c) => (
                      <button
                        key={c.uid}
                        className={`${styles.credentialItem} ${selectedUid === c.uid ? styles.credentialSelected : ''}`}
                        onClick={() => setSelectedUid(c.uid)}
                      >
                        <span className={styles.credentialMail}>{c.mail}</span>
                        <span className={styles.credentialDate}>
                          {new Date(c.createdAt).toLocaleDateString('es-CO')}
                        </span>
                      </button>
                    ))
                  )}
                </div>
              </>
            )}
            <div className={styles.modalActions}>
              <button className={styles.btnSecondary} onClick={onClose}>Cancelar</button>
              <button
                className={styles.btnPrimary}
                disabled={!selectedUid}
                onClick={() => setStep(2)}
              >
                Siguiente →
              </button>
            </div>
          </div>
        ) : (
          <div className={styles.modalBody}>
            <div className={styles.formGrid}>
              <div className={styles.formField}>
                <label className={styles.formLabel}>Nombre *</label>
                <input
                  className={styles.formInput}
                  value={form.name}
                  onChange={(e) => handleFieldChange('name', e.target.value)}
                  placeholder="María"
                />
                {errors.name && <span className={styles.fieldError}>{errors.name}</span>}
              </div>
              <div className={styles.formField}>
                <label className={styles.formLabel}>Apellido *</label>
                <input
                  className={styles.formInput}
                  value={form.lastName}
                  onChange={(e) => handleFieldChange('lastName', e.target.value)}
                  placeholder="López"
                />
                {errors.lastName && <span className={styles.fieldError}>{errors.lastName}</span>}
              </div>
            </div>

            <div className={styles.formField}>
              <label className={styles.formLabel}>Usuario *</label>
              <input
                className={styles.formInput}
                value={form.username}
                onChange={(e) => handleFieldChange('username', e.target.value)}
                placeholder="maria_lopez"
              />
              {errors.username && <span className={styles.fieldError}>{errors.username}</span>}
            </div>

            <div className={styles.formGrid}>
              <div className={styles.formField}>
                <label className={styles.formLabel}>Género *</label>
                <select
                  className={styles.formInput}
                  value={form.gender}
                  onChange={(e) => handleFieldChange('gender', e.target.value)}
                >
                  <option value="">Selecciona</option>
                  {formsParams.genders.map((g) => (
                    <option key={g.value} value={g.value}>{g.label}</option>
                  ))}
                </select>
                {errors.gender && <span className={styles.fieldError}>{errors.gender}</span>}
              </div>
              <div className={styles.formField}>
                <label className={styles.formLabel}>Teléfono *</label>
                <input
                  className={styles.formInput}
                  value={form.telNumber}
                  onChange={(e) => handleFieldChange('telNumber', e.target.value.replace(/\D/g, '').slice(0, 10))}
                  placeholder="3001234567"
                />
                {errors.telNumber && <span className={styles.fieldError}>{errors.telNumber}</span>}
              </div>
            </div>

            <div className={styles.formField}>
              <label className={styles.formLabel}>Descripción</label>
              <textarea
                className={styles.formTextarea}
                value={form.description}
                onChange={(e) => handleFieldChange('description', e.target.value)}
                placeholder="Opcional..."
                rows={2}
              />
            </div>

            <div className={styles.modalActions}>
              <button className={styles.btnSecondary} onClick={() => setStep(1)}>← Atrás</button>
              <button
                className={styles.btnPrimary}
                disabled={isLoading}
                onClick={handleSubmit}
              >
                {isLoading ? 'Creando...' : 'Crear Profesor'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
