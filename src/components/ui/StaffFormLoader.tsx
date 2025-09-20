interface StaffFormLoaderProps {
  title?: string;
  message?: string;
}

export function StaffFormLoader({ 
  title = "Loading Form", 
  message = "Please wait while we prepare your form..." 
}: StaffFormLoaderProps) {
  return (
    <div className="min-h-screen bg-gray-100 flex justify-center items-center">
      <div className="text-center">
        <div className="w-20 h-20 border-4 border-t-rose-500 border-rose-200 rounded-full animate-spin mx-auto mb-6"></div>
        <h3 className="text-xl font-bold text-slate-800 mb-2">{title}</h3>
        <p className="text-slate-600 font-medium">{message}</p>
        <div className="mt-4 flex items-center justify-center gap-2">
          <div className="w-2 h-2 bg-rose-500 rounded-full animate-bounce"></div>
          <div className="w-2 h-2 bg-rose-500 rounded-full animate-bounce" style={{ animationDelay: "0.1s" }}></div>
          <div className="w-2 h-2 bg-rose-500 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
        </div>
      </div>
    </div>
  );
}

interface StaffButtonProps {
  loading: boolean;
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
  type?: 'button' | 'submit';
}

export function StaffButton({ 
  loading, 
  children, 
  onClick, 
  disabled = false, 
  className = '',
  type = 'button'
}: StaffButtonProps) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={loading || disabled}
      className={`flex items-center gap-2 ${className} ${loading || disabled ? 'opacity-75 cursor-not-allowed' : ''}`}
    >
      {loading && (
        <div className="w-4 h-4 border-2 border-t-transparent border-white rounded-full animate-spin"></div>
      )}
      {children}
    </button>
  );
}
