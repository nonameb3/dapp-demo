interface NotificationBannerProps {
  message: string;
  type: 'info' | 'warning' | 'error' | 'success';
  onClose: () => void;
  actionButton?: {
    text: string;
    onClick: () => void;
  };
}

export default function NotificationBanner({ 
  message, 
  type, 
  onClose, 
  actionButton 
}: NotificationBannerProps) {
  const getTypeStyles = () => {
    switch (type) {
      case 'info':
        return 'bg-blue-50 border-blue-200 text-blue-800';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      case 'error':
        return 'bg-red-50 border-red-200 text-red-800';
      case 'success':
        return 'bg-green-50 border-green-200 text-green-800';
      default:
        return 'bg-blue-50 border-blue-200 text-blue-800';
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'info':
        return '🚀';
      case 'warning':
        return '⚠️';
      case 'error':
        return '❌';
      case 'success':
        return '✅';
      default:
        return 'ℹ️';
    }
  };

  return (
    <div className={`border rounded-lg p-4 mb-4 ${getTypeStyles()}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <span className="text-lg">{getIcon()}</span>
          <span className="font-medium">{message}</span>
        </div>
        <div className="flex items-center space-x-2">
          {actionButton && (
            <button
              onClick={actionButton.onClick}
              className="px-3 py-1 text-sm font-medium bg-white rounded border hover:bg-gray-50 transition-colors"
            >
              {actionButton.text}
            </button>
          )}
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}