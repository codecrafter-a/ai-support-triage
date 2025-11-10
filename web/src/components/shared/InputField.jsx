
export default function InputField({
  id,
  label,
  type = 'text',
  value,
  onChange,
  onKeyPress,
  placeholder,
  required = false,
  autoFocus = false,
  disabled = false,
  rows,
  className = '',
  error
}) {
  const inputClasses = `w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
    error 
      ? 'border-red-500 focus:ring-red-500' 
      : 'border-gray-300 focus:ring-blue-500'
  } ${className}`;

  return (
    <div className="mb-4">
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}
      {type === 'textarea' ? (
        <textarea
          id={id}
          value={value}
          onChange={onChange}
          onKeyPress={onKeyPress}
          required={required}
          autoFocus={autoFocus}
          disabled={disabled}
          rows={rows}
          placeholder={placeholder}
          className={inputClasses}
        />
      ) : (
        <input
          id={id}
          type={type}
          value={value}
          onChange={onChange}
          onKeyPress={onKeyPress}
          required={required}
          autoFocus={autoFocus}
          disabled={disabled}
          placeholder={placeholder}
          className={inputClasses}
        />
      )}
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
}

