import React from 'react';

interface PasswordStrengthProps {
  password: string;
}

interface StrengthResult {
  score: number; // 0-4
  label: string;
  color: string;
  bgColor: string;
  suggestions: string[];
}

function calculateStrength(password: string): StrengthResult {
  let score = 0;
  const suggestions: string[] = [];

  // Length check
  if (password.length >= 8) score++;
  else suggestions.push('At least 8 characters');

  if (password.length >= 12) score++;
  else if (password.length >= 8) suggestions.push('12+ characters recommended');

  // Character variety checks
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) {
    score++;
  } else {
    suggestions.push('Mix uppercase and lowercase');
  }

  if (/\d/.test(password)) {
    score++;
  } else {
    suggestions.push('Include numbers');
  }

  if (/[^a-zA-Z0-9]/.test(password)) {
    score++;
  } else {
    suggestions.push('Include special characters (!@#$%^&*)');
  }

  // Determine strength level
  let label: string;
  let color: string;
  let bgColor: string;

  if (score === 0) {
    label = 'Very Weak';
    color = 'text-red-600';
    bgColor = 'bg-red-500';
  } else if (score === 1) {
    label = 'Weak';
    color = 'text-orange-600';
    bgColor = 'bg-orange-500';
  } else if (score === 2) {
    label = 'Fair';
    color = 'text-yellow-600';
    bgColor = 'bg-yellow-500';
  } else if (score === 3) {
    label = 'Good';
    color = 'text-blue-600';
    bgColor = 'bg-blue-500';
  } else {
    label = 'Strong';
    color = 'text-green-600';
    bgColor = 'bg-green-500';
  }

  return { score, label, color, bgColor, suggestions };
}

export const PasswordStrength: React.FC<PasswordStrengthProps> = ({ password }) => {
  if (!password) return null;

  const strength = calculateStrength(password);
  const percentage = (strength.score / 5) * 100;

  return (
    <div className="mt-2">
      {/* Strength bar */}
      <div className="flex items-center gap-2 mb-2">
        <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-300 ${strength.bgColor}`}
            style={{ width: `${percentage}%` }}
          />
        </div>
        <span className={`text-sm font-medium ${strength.color}`}>
          {strength.label}
        </span>
      </div>

      {/* Suggestions */}
      {strength.suggestions.length > 0 && (
        <ul className="text-xs text-gray-600 space-y-1">
          {strength.suggestions.map((suggestion, index) => (
            <li key={index} className="flex items-start">
              <span className="text-gray-400 mr-2">•</span>
              {suggestion}
            </li>
          ))}
        </ul>
      )}

      {/* Strong password message */}
      {strength.score >= 4 && (
        <p className="text-xs text-green-600 flex items-center mt-1">
          <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          Great password!
        </p>
      )}
    </div>
  );
};
