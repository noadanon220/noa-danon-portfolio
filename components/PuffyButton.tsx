
import React from 'react';

interface PuffyButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'accent' | 'outline';
  className?: string;
}

const PuffyButton: React.FC<PuffyButtonProps> = ({ 
  children, 
  variant = 'primary', 
  className = '', 
  ...props 
}) => {
  const variants = {
    primary: 'bg-indigo-500 text-white',
    secondary: 'bg-white text-indigo-600',
    accent: 'bg-pink-500 text-white',
    outline: 'bg-transparent border-2 border-indigo-500 text-indigo-600'
  };

  return (
    <button 
      className={`puffy-button px-6 py-3 rounded-2xl font-bold flex items-center justify-center gap-2 ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export default PuffyButton;
