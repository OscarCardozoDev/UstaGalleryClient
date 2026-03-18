import React, { useState, useRef } from 'react';
import styles from './UserCreation.module.css';
import formsParams from '../../../../utils/forms.params.json';
import { createUser } from '../../../../services/users';
import type { CreateUserDto } from '../../../../interfaces/users';

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
  idCard: string;
  degree: string; // Ahora es string simple
  semester: string;
  telNumber: string;
  profileImage: File | null;
}

const UserCreation: React.FC<UserCreationProps> = ({  
  onUserCreated, 
  isCreated 
}) => {
  const [userData, setUserData] = useState<UserData>({
    name: '',
    lastName: '',
    username: '',
    description: '',
    gender: '',
    idCard: '',
    degree: '',
    semester: '',
    telNumber: '',
    profileImage: null,
  });

  const [imagePreview, setImagePreview] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof UserData, string>>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleInputChange = (
    field: keyof UserData,
    value: string | string[] | File | null
  ) => {
    setUserData((prev) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setErrors((prev) => ({ ...prev, profileImage: 'Por favor selecciona una imagen válida' }));
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 2 * 1024 * 1024) {
        setErrors((prev) => ({ ...prev, profileImage: 'La imagen no debe superar 5MB' }));
        return;
      }

      handleInputChange('profileImage', file);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        resolve(reader.result as string);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };
  
  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof UserData, string>> = {};

    if (!userData.name.trim()) {
      newErrors.name = 'El nombre es obligatorio';
    }

    if (!userData.lastName.trim()) {
      newErrors.lastName = 'El apellido es obligatorio';
    }

    if (!userData.username.trim()) {
      newErrors.username = 'El nombre de usuario es obligatorio';
    } else if (!/^[a-zA-Z0-9_]+$/.test(userData.username)) {
      newErrors.username = 'El usuario solo puede contener letras, números y guiones bajos';
    }

    if (!userData.gender) {
      newErrors.gender = 'Por favor selecciona tu género';
    }

    if (!userData.idCard.trim()) {
      newErrors.idCard = 'La cédula es obligatoria';
    } else if (!/^\d+$/.test(userData.idCard)) {
      newErrors.idCard = 'La cédula solo puede contener números';
    }

    if (!userData.degree) {
      newErrors.degree = 'Por favor selecciona tu carrera';
    }

    if (!userData.semester) {
      newErrors.semester = 'Por favor selecciona tu semestre';
    }

    if (!userData.telNumber.trim()) {
      newErrors.telNumber = 'El número de teléfono es obligatorio';
    } else if (!/^\d{10}$/.test(userData.telNumber)) {
      newErrors.telNumber = 'El teléfono debe tener 10 dígitos';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const requestData: CreateUserDto = {
        user: {
          name: userData.name,
          lastName: userData.lastName,
          username: userData.username,
          description: userData.description || undefined,
          gender: userData.gender, // Enviar como array
          idCard: userData.idCard,
          degree: userData.degree, // Enviar como array con un elemento
          semester: userData.semester,
          telNumber: userData.telNumber,
          userTypeId: formsParams.userTypes[0].uid, // Estudiante por defecto
          isProfesor: false,
        }
      };

      // Si hay imagen, convertirla a base64
      if (userData.profileImage) {
        const base64Image = await fileToBase64(userData.profileImage);
        requestData.photo = {
          base64: base64Image,
          name: userData.profileImage.name,
          folder: 'profiles',
        };
      }
      // Llamar al servicio para crear usuario
      const result = await createUser(requestData);

      if (result) {
        onUserCreated();
      }
    } catch (err) {
      console.error('Error creating user:', err);
      const errorMessage = err instanceof Error ? err.message : 'Error al crear usuario. Intenta nuevamente.';
      setErrors({ name: errorMessage });
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
      <p className={styles.description}>
        Completa tu información para personalizar tu perfil
      </p>

      <div className={styles.form}>
        {/* Profile Image */}
        <div className={styles.imageSection}>
          <div 
            className={styles.imageUpload}
            onClick={() => fileInputRef.current?.click()}
          >
            {imagePreview ? (
              <img src={imagePreview} alt="Preview" className={styles.imagePreview} />
            ) : (
              <div className={styles.imagePlaceholder}>
                <span className={styles.uploadIcon}>+</span>
                <span className={styles.uploadText}>Subir Foto</span>
              </div>
            )}
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className={styles.fileInput}
          />
          {errors.profileImage && (
            <span className={styles.fieldError}>{errors.profileImage}</span>
          )}
        </div>

        {/* Name and Last Name */}
        <div className={styles.formRow}>
          <div className={styles.formField}>
            <label className={styles.label}>
              Nombre <span className={styles.required}>*</span>
            </label>
            <input
              type="text"
              value={userData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder="Leonardo"
              className={styles.input}
            />
            {errors.name && <span className={styles.fieldError}>{errors.name}</span>}
          </div>

          <div className={styles.formField}>
            <label className={styles.label}>
              Apellido <span className={styles.required}>*</span>
            </label>
            <input
              type="text"
              value={userData.lastName}
              onChange={(e) => handleInputChange('lastName', e.target.value)}
              placeholder="Patiño"
              className={styles.input}
            />
            {errors.lastName && <span className={styles.fieldError}>{errors.lastName}</span>}
          </div>
        </div>

        {/* Username */}
        <div className={styles.formField}>
          <label className={styles.label}>
            Nombre de Usuario <span className={styles.required}>*</span>
          </label>
          <div className={styles.usernameInput}>
            <span className={styles.usernamePrefix}>@</span>
            <input
              type="text"
              value={userData.username}
              onChange={(e) => handleInputChange('username', e.target.value)}
              placeholder="leonardo_patino"
              className={styles.inputWithPrefix}
            />
          </div>
          {errors.username && <span className={styles.fieldError}>{errors.username}</span>}
        </div>

        {/* Description */}
        <div className={styles.formField}>
          <label className={styles.label}>Descripción</label>
          <textarea
            value={userData.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            placeholder="Cuéntanos sobre ti..."
            className={styles.textarea}
            rows={3}
          />
        </div>

        {/* Gender and ID Card */}
        <div className={styles.formRow}>
          <div className={styles.formField}>
            <label className={styles.label}>
              Género <span className={styles.required}>*</span>
            </label>
            <select
              value={userData.gender}
              onChange={(e) => handleInputChange('gender', e.target.value)}
              className={styles.select}
            >
              <option value="">Selecciona</option>
              {formsParams.genders.map((gender) => (
                <option key={gender.value} value={gender.value}>
                  {gender.label}
                </option>
              ))}
            </select>
            {errors.gender && <span className={styles.fieldError}>{errors.gender}</span>}
          </div>

          <div className={styles.formField}>
            <label className={styles.label}>
              Cédula <span className={styles.required}>*</span>
            </label>
            <input
              type="text"
              value={userData.idCard}
              onChange={(e) => handleInputChange('idCard', e.target.value.replace(/\D/g, ''))}
              placeholder="1233021212"
              className={styles.input}
            />
            {errors.idCard && <span className={styles.fieldError}>{errors.idCard}</span>}
          </div>
        </div>

        {/* Degree */}
        <div className={styles.formField}>
          <label className={styles.label}>
            Carrera <span className={styles.required}>*</span>
          </label>
          <select
            value={userData.degree}
            onChange={(e) => handleInputChange('degree', e.target.value)}
            className={styles.select}
          >
            <option value="">Selecciona tu carrera</option>
            {formsParams.degrees.map((degree) => (
              <option key={degree} value={degree}>
                {degree}
              </option>
            ))}
          </select>
          {errors.degree && <span className={styles.fieldError}>{errors.degree}</span>}
        </div>

        {/* Semester */}
        <div className={styles.formField}>
          <label className={styles.label}>
            Semestre <span className={styles.required}>*</span>
          </label>
          <select
            value={userData.semester}
            onChange={(e) => handleInputChange('semester', e.target.value)}
            className={styles.select}
          >
            <option value="">Selecciona tu semestre</option>
            {formsParams.semesters.map((semester) => (
              <option key={semester} value={semester}>
                Semestre {semester}
              </option>
            ))}
          </select>
          {errors.semester && <span className={styles.fieldError}>{errors.semester}</span>}
        </div>

        {/* Phone Number */}
        <div className={styles.formField}>
          <label className={styles.label}>
            Teléfono <span className={styles.required}>*</span>
          </label>
          <input
            type="tel"
            value={userData.telNumber}
            onChange={(e) => handleInputChange('telNumber', e.target.value.replace(/\D/g, '').slice(0, 10))}
            placeholder="3001234567"
            className={styles.input}
          />
          {errors.telNumber && <span className={styles.fieldError}>{errors.telNumber}</span>}
        </div>

        <button
          onClick={handleSubmit}
          className={styles.submitButton}
          disabled={isLoading}
        >
          {isLoading ? 'Creando...' : 'Crear Perfil'}
        </button>
      </div>
    </div>
  );
};

export default UserCreation;