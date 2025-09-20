interface ButtonSpinnerProps {
  loading: boolean;
  children: React.ReactNode;
  loadingText?: string;
  className?: string;
  disabled?: boolean;
  onClick?: () => void;
  type?: 'button' | 'submit';
}

export default function ButtonSpinner({
  loading,
  children,
  loadingText,
  className = '',
  disabled = false,
  onClick,
  type = 'button'
}: ButtonSpinnerProps) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={loading || disabled}
      className={`flex items-center justify-center gap-2 ${className} ${
        loading || disabled ? 'opacity-75 cursor-not-allowed' : ''
      }`}
    >
      {loading && (
        <div className="w-4 h-4 border-2 border-t-transparent border-white rounded-full animate-spin"></div>
      )}
      {loading ? loadingText || 'Loading...' : children}
    </button>
  );
}
