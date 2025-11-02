/**
 * Password strength indicator component
 * Visual feedback for password strength
 */

"use client";

import { PasswordStrength } from "@/lib/types/auth";

interface PasswordStrengthProps {
  strength: PasswordStrength;
  className?: string;
}

export default function PasswordStrengthIndicator({
  strength,
  className = "",
}: PasswordStrengthProps) {
  const { strength: strengthLevel, errors, isValid } = strength;

  const strengthConfig = {
    weak: {
      color: "from-red to-red/80",
      textColor: "text-red",
      bgColor: "bg-red",
      label: "Weak",
      icon: "⚠️",
      width: "w-1/3",
    },
    medium: {
      color: "from-secondary-500 to-yellow-500",
      textColor: "text-secondary-500",
      bgColor: "bg-secondary-500",
      label: "Medium",
      icon: "🔒",
      width: "w-2/3",
    },
    strong: {
      color: "from-primary-600 to-primary-500",
      textColor: "text-primary-500",
      bgColor: "bg-primary-500",
      label: "Strong",
      icon: "✅",
      width: "w-full",
    },
  };

  const config = strengthConfig[strengthLevel];

  return (
    <div className={className}>
      <div className="space-y-3">
        {/* Strength Bar */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-light-3">Password Strength</span>
            <span className={`text-xs font-bold ${config.textColor} flex items-center gap-1`}>
              <span>{config.icon}</span>
              {config.label}
            </span>
          </div>
          <div className="h-2 bg-dark-4/50 rounded-full overflow-hidden backdrop-blur-sm border border-light-4/10">
            <div
              className={`h-full ${config.width} bg-linear-to-r ${config.color} transition-all duration-500 ease-out rounded-full shadow-lg`}
              style={{
                boxShadow: isValid ? `0 0 10px ${config.bgColor}` : 'none'
              }}
            />
          </div>
        </div>

        {/* Error Messages */}
        {!isValid && errors.length > 0 && (
          <div className="glass rounded-lg p-3 border border-red/20 animate-fadeIn">
            <p className="text-xs font-semibold text-light-1 mb-2 flex items-center gap-1">
              <svg className="w-4 h-4 text-red" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              Requirements not met:
            </p>
            <ul className="space-y-1">
              {errors.map((error, index) => (
                <li key={index} className="flex items-start gap-2 text-xs text-light-3">
                  <svg className="w-3 h-3 mt-0.5 text-red shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  <span>{error}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Success Message */}
        {isValid && (
          <div className="glass rounded-lg p-3 border border-primary-500/20 animate-fadeIn">
            <p className="text-xs font-semibold text-primary-500 flex items-center gap-2">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Great! Your password meets all requirements
            </p>
          </div>
        )}

        {/* Password Tips */}
        {!isValid && (
          <div className="text-xs text-light-4 space-y-1">
            <p className="font-medium text-light-3">💡 Password tips:</p>
            <ul className="space-y-0.5 ml-4">
              <li>• Mix uppercase and lowercase letters</li>
              <li>• Include numbers and special characters</li>
              <li>• Avoid common words or patterns</li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}