import React, { forwardRef } from 'react';
import type { InputHTMLAttributes } from 'react';
import './Input.css';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  fullWidth?: boolean;
  icon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, fullWidth = false, icon, className = '', ...props }, ref) => {
    const wrapperClasses = [
      'input-wrapper',
      fullWidth && 'input-wrapper--full-width',
      error && 'input-wrapper--error',
    ]
      .filter(Boolean)
      .join(' ');

    const inputClasses = ['input', icon && 'input--with-icon', className]
      .filter(Boolean)
      .join(' ');

    return (
      <div className={wrapperClasses}>
        {label && <label className="input-label">{label}</label>}
        <div className="input-container">
          {icon && <div className="input-icon">{icon}</div>}
          <input ref={ref} className={inputClasses} {...props} />
        </div>
        {error && <span className="input-error">{error}</span>}
      </div>
    );
  }
);

Input.displayName = 'Input';
