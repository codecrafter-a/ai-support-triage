export default function SelectField({ 
  label, 
  value, 
  onChange, 
  options, 
  getColorClass, 
  className = '',
  disabled = false 
}) {
  const colorClass = getColorClass ? getColorClass(value) : '';
  
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <select
        value={value}
        onChange={onChange}
        disabled={disabled}
        className={`w-full px-3 py-2 border rounded-md ${colorClass} ${className}`}
      >
        {options.map(option => (
          <option key={option.value} value={option.value}>{option.label}</option>
        ))}
      </select>
    </div>
  );
}

