import React, { useState, useEffect } from 'react';
import { sendVerificationCode, verifyCode } from '../../../../services/auth';
import styles from './EmailVerification.module.css';

interface EmailVerificationProps {
  onVerified: (isVerified: boolean) => void;
  isVerified: boolean;
  setOpenSnackbar: (
    type: 'error' | 'success' | 'warning',
    message: { title: string; description: string },
  ) => void;
}

const EmailVerification: React.FC<EmailVerificationProps> = ({
  onVerified,
  isVerified,
  setOpenSnackbar,
}) => {
  const [verificationCode, setVerificationCode] = useState('');
  const [isCodeSent, setIsCodeSent] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    sendVerificationCode()
      .then(() => {
        if (!cancelled) setIsCodeSent(true);
      })
      .catch(() => {
        if (!cancelled)
          setOpenSnackbar('error', {
            title: 'Error al enviar el código',
            description: 'No se pudo enviar el correo. Intenta nuevamente.',
          });
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => { cancelled = true; };
  }, []);

  const handleSendCode = async () => {
    setIsLoading(true);
    try {
      await sendVerificationCode();
      setIsCodeSent(true);
      setOpenSnackbar('success', {
        title: 'Código enviado',
        description: 'Revisa tu correo electrónico',
      });
    } catch (err) {
      setOpenSnackbar('error', {
        title: 'Error al enviar el código',
        description: 'No se pudo enviar el correo. Intenta nuevamente.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    if (!verificationCode) {
      setOpenSnackbar('warning', {
        title: 'Código requerido',
        description: 'Por favor ingresa el código de verificación',
      });
      return;
    }

    if (verificationCode.length !== 6) {
      setOpenSnackbar('warning', {
        title: 'Código inválido',
        description: 'El código debe tener 6 dígitos',
      });
      return;
    }

    setIsLoading(true);
    try {
      await verifyCode(verificationCode);
      setOpenSnackbar('success', {
        title: 'Correo verificado',
        description: 'Tu correo ha sido verificado exitosamente',
      });
      onVerified(true);
    } catch (err) {
      setOpenSnackbar('error', {
        title: 'Código incorrecto',
        description: (err as Error).message || 'Código incorrecto. Verifica e intenta nuevamente.',
      });
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
        {!isCodeSent
          ? 'Enviando código a tu correo registrado...'
          : 'Ingresa el código de 6 dígitos enviado a tu correo registrado'}
      </p>

      {!isCodeSent ? (
        <div className={styles.formGroup}>
          {isLoading && (
            <button className={styles.primaryButton} disabled>
              Enviando...
            </button>
          )}
          {!isLoading && !isCodeSent && (
            <button onClick={handleSendCode} className={styles.primaryButton}>
              Reintentar
            </button>
          )}
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
              onClick={handleSendCode}
              className={styles.linkButton}
              disabled={isLoading}
            >
              Reenviar código
            </button>
          </div>
        </div>
      )}

    </div>
  );
};

export default EmailVerification;
