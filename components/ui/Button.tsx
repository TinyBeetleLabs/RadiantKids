import React from 'react';

type ButtonVariant =
  | 'primary'
  | 'secondary-pill'
  | 'dark-utility'
  | 'pearl-capsule'
  | 'store-hero';

const variantClass: Record<ButtonVariant, string> = {
  primary: 'btn-primary',
  'secondary-pill': 'btn-secondary-pill',
  'dark-utility': 'btn-dark-utility',
  'pearl-capsule': 'btn-pearl-capsule',
  'store-hero': 'btn-store-hero',
};

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  children: React.ReactNode;
}

export default function Button({
  variant = 'primary',
  className = '',
  children,
  type = 'button',
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={`${variantClass[variant]} ${className}`.trim()}
      {...props}
    >
      {children}
    </button>
  );
}
