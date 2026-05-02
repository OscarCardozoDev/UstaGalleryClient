// UstaGallery/src/pages/auth/modules/UserCreation/UserCreation.tsx
import { sileo } from 'sileo';
import React, { useState, useRef, useEffect } from 'react';
import styles from './UserCreation.module.css';
import formsParams from '../../../../utils/forms.params.json';
import { createUser } from '../../../../services/users';
import { getRoles } from '../../../../services/roles';
import type { CreateStudentDto } from '../../../../interfaces/users';
import type { Role } from '../../../../interfaces/roles';

interface UserCreationProps {
  onUserCreated: () => void;
  isCreated: boolean;
}

interface UserData {
  name: string;
  lastName: string;
  username: string;
  description: string;
  gender: 'M' | 'F' | 'O' | '';
  telNumber: string;
  profileImage: File | null;
  roleId: string;
  career: string;
  semester: string;
  department: string;
}

const INITIAL_DATA: UserData = {
  name: '', lastName: '', username: '', description: '',
  gender: '', telNumber: '', profileImage: null,
  roleId: '', career: '', semester: '', department: '',
};

const UserCreation: React.FC<UserCreationProps> = ({ onUserCreated, isCreated }) => {
  const [userData, setUserData] = useState<UserData>(INITIAL_DATA);
  const [roles, setRoles] = useState<Role[]>([]);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof UserData, string>>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    getRoles()
      .then((all) => setRoles(all.filter((r) => r.slug !== 'particular')))
      .catch(() => sileo.error({ title: 'Error', description: 'No se pudieron cargar los roles' }));
  }, []);

  const selectedRole = roles.find((r) => r.uid === userData.roleId);
  const roleSlug = selectedRole?.slug ?? '';

  const showCareer = ['pregrado', 'posgrado', 'egresado'].includes(roleSlug);
  const showSemester = roleSlug === 'pregrado';
  const showDepartment = roleSlug === 'funcionario';

  const handleInputChange = (field: keyof UserData, value: string | File | null) => {
    setUserData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: '' }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      sileo.error({ title: 'Error de imagen', description: 'Por favor selecciona una imagen válida (JPG, JPEG, PNG)' });
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      sileo.error({ title: 'Error de imagen', description: 'La imagen no debe superar 2MB' });
      return;
    }
    handleInputChange('profileImage', file);
    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const fileToBase64 = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof UserData, string>> = {};

    if (!userData.name.trim()) newErrors.name = 'El nombre es obligatorio';
    if (!userData.lastName.trim()) newErrors.lastName = 'El apellido es obligatorio';
    if (!userData.username.trim()) {
      newErrors.username = 'El nombre de usuario es obligatorio';
    } else if (!/^[a-zA-Z0-9_]+$/.test(userData.username)) {
      newErrors.username = 'Solo letras, números y guiones bajos';
    }
    if (!userData.gender) newErrors.gender = 'Por favor selecciona tu género';
    if (!userData.telNumber.trim()) {
      newErrors.telNumber = 'El número de teléfono es obligatorio';
    } else if (!/^\d{10}$/.test(userData.telNumber)) {
      newErrors.telNumber = 'El teléfono debe tener 10 dígitos';
    }
    if (!userData.roleId) newErrors.roleId = 'Por favor selecciona tu rol';
    if (showCareer && !userData.career) newErrors.career = 'Por favor selecciona tu carrera';
    if (showSemester && !userData.semester) newErrors.semester = 'Por favor selecciona tu semestre';
    if (showDepartment && !userData.department.trim()) newErrors.department = 'La dependencia es obligatoria';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const buildRoleData = (): Record<string, string> => {
    if (roleSlug === 'pregrado') return { career: userData.career, semester: userData.semester };
    if (roleSlug === 'posgrado') return { career: userData.career };
    if (roleSlug === 'funcionario') return { department: userData.department };
    if (roleSlug === 'egresado') return { career: userData.career };
    return {};
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    setIsLoading(true);
    try {
      const requestData: CreateStudentDto = {
        name: userData.name,
        lastName: userData.lastName,
        username: userData.username,
        description: userData.description || undefined,
        gender: userData.gender,
        telNumber: userData.telNumber,
        roleId: userData.roleId,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        roleData: buildRoleData() as any,
      };

      if (userData.profileImage) {
        const base64Image = await fileToBase64(userData.profileImage);
        requestData.photo = {
          base64: base64Image,
          name: userData.profileImage.name,
          folder: 'profiles',
        };
      }

      const result = await createUser(requestData);
      if (result) {
        sileo.success({ title: 'Usuario creado exitosamente', description: 'Tu perfil ha sido creado' });
        onUserCreated();
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al crear usuario. Intenta nuevamente.';
      sileo.error({ title: 'Error al crear usuario', description: errorMessage });
    } finally {
      setIsLoading(false);
    }
  };

  if (isCreated) {
    return (
      <div className={styles.successContainer}>
        <div className={styles.successIcon}>✓</div>
        <h3 className={styles.successTitle}>¡Usuario Creado!</h3>
        <p className={styles.successText}>Tu perfil ha sido creado exitosamente</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <h3 className={styles.title}>Creación de Usuario</h3>
      <p className={styles.description}>Completa tu información para personalizar tu perfil</p>

      <div className={styles.form}>
        {/* Profile Image */}
        <div className={styles.imageSection}>
          <div className={styles.imageUpload} onClick={() => fileInputRef.current?.click()}>
            {imagePreview ? (
              <img src={imagePreview} alt="Preview" className={styles.imagePreview} />
            ) : (
              <div className={styles.imagePlaceholder}>
                <span className={styles.uploadIcon}>+</span>
                <span className={styles.uploadText}>Subir Foto</span>
              </div>
            )}
          </div>
          <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageChange} className={styles.fileInput} />
        </div>

        {/* Name and Last Name */}
        <div className={styles.formRow}>
          <div className={styles.formField}>
            <label className={styles.label}>Nombre <span className={styles.required}>*</span></label>
            <input type="text" value={userData.name} onChange={(e) => handleInputChange('name', e.target.value)} placeholder="Leonardo" className={styles.input} />
            {errors.name && <span className={styles.fieldError}>{errors.name}</span>}
          </div>
          <div className={styles.formField}>
            <label className={styles.label}>Apellido <span className={styles.required}>*</span></label>
            <input type="text" value={userData.lastName} onChange={(e) => handleInputChange('lastName', e.target.value)} placeholder="Patiño" className={styles.input} />
            {errors.lastName && <span className={styles.fieldError}>{errors.lastName}</span>}
          </div>
        </div>

        {/* Username */}
        <div className={styles.formField}>
          <label className={styles.label}>Nombre de Usuario <span className={styles.required}>*</span></label>
          <div className={styles.usernameInput}>
            <span className={styles.usernamePrefix}>@</span>
            <input type="text" value={userData.username} onChange={(e) => handleInputChange('username', e.target.value)} placeholder="leonardo_patino" className={styles.inputWithPrefix} />
          </div>
          {errors.username && <span className={styles.fieldError}>{errors.username}</span>}
        </div>

        {/* Description */}
        <div className={styles.formField}>
          <label className={styles.label}>Descripción</label>
          <textarea value={userData.description} onChange={(e) => handleInputChange('description', e.target.value)} placeholder="Cuéntanos sobre ti..." className={styles.textarea} rows={3} />
        </div>

        {/* Gender */}
        <div className={styles.formField}>
          <label className={styles.label}>Género <span className={styles.required}>*</span></label>
          <select value={userData.gender} onChange={(e) => handleInputChange('gender', e.target.value)} className={styles.select}>
            <option value="">Selecciona</option>
            {formsParams.genders.map((g) => (
              <option key={g.value} value={g.value}>{g.label}</option>
            ))}
          </select>
          {errors.gender && <span className={styles.fieldError}>{errors.gender}</span>}
        </div>

        {/* Phone */}
        <div className={styles.formField}>
          <label className={styles.label}>Teléfono <span className={styles.required}>*</span></label>
          <input type="tel" value={userData.telNumber} onChange={(e) => handleInputChange('telNumber', e.target.value.replace(/\D/g, '').slice(0, 10))} placeholder="3001234567" className={styles.input} />
          {errors.telNumber && <span className={styles.fieldError}>{errors.telNumber}</span>}
        </div>

        {/* Role selector */}
        <div className={styles.formField}>
          <label className={styles.label}>Rol <span className={styles.required}>*</span></label>
          <select
            value={userData.roleId}
            onChange={(e) => {
              handleInputChange('roleId', e.target.value);
              handleInputChange('career', '');
              handleInputChange('semester', '');
              handleInputChange('department', '');
            }}
            className={styles.select}
          >
            <option value="">Selecciona tu rol</option>
            {roles.map((r) => (
              <option key={r.uid} value={r.uid}>{r.name}</option>
            ))}
          </select>
          {errors.roleId && <span className={styles.fieldError}>{errors.roleId}</span>}
        </div>

        {/* Career (pregrado, posgrado, egresado) */}
        {showCareer && (
          <div className={styles.formField}>
            <label className={styles.label}>Carrera <span className={styles.required}>*</span></label>
            <select value={userData.career} onChange={(e) => handleInputChange('career', e.target.value)} className={styles.select}>
              <option value="">Selecciona tu carrera</option>
              {formsParams.degrees.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
            {errors.career && <span className={styles.fieldError}>{errors.career}</span>}
          </div>
        )}

        {/* Semester (pregrado only) */}
        {showSemester && (
          <div className={styles.formField}>
            <label className={styles.label}>Semestre <span className={styles.required}>*</span></label>
            <select value={userData.semester} onChange={(e) => handleInputChange('semester', e.target.value)} className={styles.select}>
              <option value="">Selecciona tu semestre</option>
              {formsParams.semesters.map((s) => (
                <option key={s} value={s}>Semestre {s}</option>
              ))}
            </select>
            {errors.semester && <span className={styles.fieldError}>{errors.semester}</span>}
          </div>
        )}

        {/* Department (funcionario only) */}
        {showDepartment && (
          <div className={styles.formField}>
            <label className={styles.label}>Dependencia <span className={styles.required}>*</span></label>
            <input type="text" value={userData.department} onChange={(e) => handleInputChange('department', e.target.value)} placeholder="Ej: Facultad de Ingeniería" className={styles.input} />
            {errors.department && <span className={styles.fieldError}>{errors.department}</span>}
          </div>
        )}

        <button onClick={handleSubmit} className={styles.submitButton} disabled={isLoading}>
          {isLoading ? 'Creando...' : 'Crear Perfil'}
        </button>
      </div>
    </div>
  );
};

export default UserCreation;
