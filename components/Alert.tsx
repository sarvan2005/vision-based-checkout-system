import React from 'react';

interface AlertProps {
  type: 'error' | 'success' | 'warning';
  title: string;
  message: string;
  onReset: () => void;
}

export const Alert: React.FC<AlertProps> = ({ type, title, message, onReset }) => {
  const isError = type === 'error';
  const isWarning = type === 'warning';
  const colors = {
    bg: isError ? 'bg-red-50' : isWarning ? 'bg-yellow-50' : 'bg-green-50',
    iconBg: isError ? 'bg-red-100' : isWarning ? 'bg-yellow-100' : 'bg-green-100',
    iconText: isError ? 'text-red-600' : isWarning ? 'text-yellow-600' : 'text-green-600',
    titleText: isError ? 'text-red-800' : isWarning ? 'text-yellow-800' : 'text-green-800',
    messageText: isError ? 'text-red-700' : isWarning ? 'text-yellow-700' : 'text-green-700',
    button: isError 
      ? 'bg-red-600 hover:bg-red-700 focus:ring-red-500' 
      : isWarning
      ? 'bg-yellow-600 hover:bg-yellow-700 focus:ring-yellow-500'
      : 'bg-green-600 hover:bg-green-700 focus:ring-green-500',
  };

  return (
    <div className={`rounded-md ${colors.bg} p-4 max-w-md w-full`}>
      <div className="flex">
        <div className="flex-shrink-0">
            {isError ? (
                <svg className={`h-6 w-6 ${colors.iconText}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            ) : isWarning ? (
                <svg className={`h-6 w-6 ${colors.iconText}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
            ) : (
                <svg className={`h-6 w-6 ${colors.iconText}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            )}
        </div>
        <div className="ml-3">
          <h3 className={`text-lg font-medium ${colors.titleText}`}>{title}</h3>
          <div className={`mt-2 text-sm ${colors.messageText}`}>
            <p>{message}</p>
          </div>
          <div className="mt-4">
            <button
              onClick={onReset}
              className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white ${colors.button} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-50`}
            >
              Start Over
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
