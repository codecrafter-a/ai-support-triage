
export default function InfoField({ label, value, isMultiline = false }) {
  return (
    <div>
      <span className="font-medium">{label}:</span>{' '}
      {isMultiline ? (
        <div className="mt-2 p-3 bg-gray-50 rounded border">{value}</div>
      ) : (
        <span>{value}</span>
      )}
    </div>
  );
}

