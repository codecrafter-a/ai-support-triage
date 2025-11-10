
export default function ActionButton({ 
  onClick, 
  label, 
  loadingLabel, 
  isLoading = false, 
  disabled = false,
  variant = 'primary', // primary, success, warning, danger
  className = '',
  type = 'button'
}) {
  const variantClasses = {
    primary: 'bg-blue-600 hover:bg-blue-700',
    success: 'bg-green-600 hover:bg-green-700',
    warning: 'bg-orange-600 hover:bg-orange-700',
    danger: 'bg-red-600 hover:bg-red-700',
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || isLoading}
      className={`px-6 py-2 text-white rounded ${variantClasses[variant]} disabled:opacity-50 ${className}`}
    >
      {isLoading ? loadingLabel : label}
    </button>
  );
}

