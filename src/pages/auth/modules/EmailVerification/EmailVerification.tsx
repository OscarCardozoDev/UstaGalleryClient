import React, { useState } from 'react';
import styles from './EmailVerification.module.css';

interface EmailVerificationProps {
  onVerified: (isVerified: boolean) => void;
  isVerified: boolean;
}

const EmailVerification: React.FC<EmailVerificationProps> = ({ 
  onVerified, 
  isVerified 
}) => {
  const [email, setEmail] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [isCodeSent, setIsCodeSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSendCode = async () => {
    setError('');
    
    if (!email) {
      setError('Por favor ingresa tu correo electrónico');
      return;
    }

    if (!validateEmail(email)) {
      setError('Por favor ingresa un correo válido');
      return;
    }

    setIsLoading(true);

    try {
      // TODO: Llamar al servicio para enviar código de verificación
      // const response = await authService.sendVerificationCode(email);
      
      // Simulación de envío
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setIsCodeSent(true);
      setError('');
    } catch (err) {
      setError('Error al enviar el código. Intenta nuevamente.');
      console.error('Error sending verification code:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    setError('');

    if (!verificationCode) {
      setError('Por favor ingresa el código de verificación');
      return;
    }

    if (verificationCode.length !== 6) {
      setError('El código debe tener 6 dígitos');
      return;
    }

    setIsLoading(true);

    try {
      // TODO: Llamar al servicio para verificar código
      // const response = await authService.verifyCode(email, verificationCode);
      // onVerified(response.token);
      
      // Simulación de verificación exitosa
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const mockToken = 'ec7ac960-6c7c-4010-8430-e219cac64831';
      //onVerified(mockToken);
      onVerified(true);
      
    } catch (err) {
      setError('Código incorrecto. Verifica e intenta nuevamente.');
      console.error('Error verifying code:', err);
    } finally {
      setIsLoading(false);
    }
  };

  if (isVerified) {
    return (
      <div className={styles.successContainer}>
        <div className={styles.successIcon}>✓</div>
        <h3 className={styles.successTitle}>¡Correo Verificado!</h3>
        <p className={styles.successText}>
          Tu correo ha sido verificado exitosamente
        </p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <h3 className={styles.title}>Verificación de Correo</h3>
      <p className={styles.description}>
        {isCodeSent 
          ? 'Ingresa el código de 6 dígitos enviado a tu correo'
          : 'Ingresa tu correo institucional para continuar'
        }
      </p>

      {!isCodeSent ? (
        <div className={styles.formGroup}>
          <label htmlFor="email" className={styles.label}>
            Correo Electrónico
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="ejemplo@usantoto.edu.co"
            className={styles.input}
            disabled={isLoading}
          />
          <button
            onClick={handleSendCode}
            className={styles.primaryButton}
            disabled={isLoading}
          >
            {isLoading ? 'Enviando...' : 'Enviar Código'}
          </button>
        </div>
      ) : (
        <div className={styles.formGroup}>
          <label htmlFor="code" className={styles.label}>
            Código de Verificación
          </label>
          <input
            id="code"
            type="text"
            value={verificationCode}
            onChange={(e) => {
              const value = e.target.value.replace(/\D/g, '').slice(0, 6);
              setVerificationCode(value);
            }}
            placeholder="000000"
            className={styles.codeInput}
            disabled={isLoading}
            maxLength={6}
          />
          <div className={styles.codeActions}>
            <button
              onClick={handleVerifyCode}
              className={styles.primaryButton}
              disabled={isLoading}
            >
              {isLoading ? 'Verificando...' : 'Verificar'}
            </button>
            <button
              onClick={() => {
                setIsCodeSent(false);
                setVerificationCode('');
                setError('');
              }}
              className={styles.linkButton}
              disabled={isLoading}
            >
              Cambiar correo
            </button>
          </div>
        </div>
      )}

      {error && (
        <div className={styles.errorMessage}>
          {error}
        </div>
      )}
    </div>
  );
};

export default EmailVerification;
