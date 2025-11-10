
export default function Badge({ 
  label, 
  getColorClass, 
  className = '' 
}) {
  const colorClass = getColorClass ? getColorClass(label) : '';
  
  return (
    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${colorClass} ${className}`}>
      {label}
    </span>
  );
}

