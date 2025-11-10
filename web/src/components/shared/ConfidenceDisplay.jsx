import { CONFIDENCE_THRESHOLD } from '../../constants';

export default function ConfidenceDisplay({ confidence, className = '' }) {
  const isLow = confidence < CONFIDENCE_THRESHOLD;
  const percentage = (confidence * 100).toFixed(0);
  
  return (
    <span className={`flex items-center ${isLow ? 'text-red-600 font-semibold' : 'text-gray-900'} ${className}`}>
      {isLow && '⚠️ '}
      {percentage}%
    </span>
  );
}

