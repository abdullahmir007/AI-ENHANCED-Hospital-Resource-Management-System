import React from 'react';
import PropTypes from 'prop-types';

/**
 * StatCard component displays a single statistic with a label
 * Used in detailed report views to show key metrics
 */
const StatCard = ({ 
  label, 
  value, 
  icon, 
  color = 'blue', 
  size = 'medium',
  trend = null,
  trendDirection = null
}) => {
  // Color variants
  const colorVariants = {
    blue: {
      bg: 'bg-blue-50',
      text: 'text-blue-700',
      label: 'text-blue-600',
      border: 'border-blue-200'
    },
    green: {
      bg: 'bg-green-50',
      text: 'text-green-700',
      label: 'text-green-600',
      border: 'border-green-200'
    },
    red: {
      bg: 'bg-red-50',
      text: 'text-red-700',
      label: 'text-red-600',
      border: 'border-red-200'
    },
    yellow: {
      bg: 'bg-yellow-50',
      text: 'text-yellow-700',
      label: 'text-yellow-600',
      border: 'border-yellow-200'
    },
    purple: {
      bg: 'bg-purple-50',
      text: 'text-purple-700',
      label: 'text-purple-600',
      border: 'border-purple-200'
    },
    gray: {
      bg: 'bg-gray-50',
      text: 'text-gray-700',
      label: 'text-gray-600',
      border: 'border-gray-200'
    }
  };

  // Size variants
  const sizeVariants = {
    small: {
      padding: 'p-3',
      valueText: 'text-lg',
      labelText: 'text-xs'
    },
    medium: {
      padding: 'p-4',
      valueText: 'text-2xl',
      labelText: 'text-sm'
    },
    large: {
      padding: 'p-5',
      valueText: 'text-3xl',
      labelText: 'text-base'
    }
  };

  // Get color and size classes
  const colorClass = colorVariants[color] || colorVariants.blue;
  const sizeClass = sizeVariants[size] || sizeVariants.medium;

  // Trend direction indicator
  const renderTrendIndicator = () => {
    if (trend === null || trendDirection === null) return null;

    const trendColorClass = trendDirection === 'up' 
      ? 'text-green-500' 
      : trendDirection === 'down' 
        ? 'text-red-500' 
        : 'text-gray-500';

    return (
      <div className={`flex items-center ${trendColorClass} text-xs ml-2`}>
        {trendDirection === 'up' && (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
          </svg>
        )}
        {trendDirection === 'down' && (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        )}
        {trend}
      </div>
    );
  };

  return (
    <div 
      className={`${colorClass.bg} ${sizeClass.padding} rounded-lg shadow-sm border ${colorClass.border}`}
    >
      <div className="flex flex-col">
        <div className="flex items-center">
          <div className={`${colorClass.text} ${sizeClass.valueText} font-bold`}>
            {value}
          </div>
          {renderTrendIndicator()}
        </div>
        <div className="flex items-center mt-1">
          {icon && (
            <span className="mr-1">{icon}</span>
          )}
          <div className={`${colorClass.label} ${sizeClass.labelText}`}>
            {label}
          </div>
        </div>
      </div>
    </div>
  );
};

StatCard.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  icon: PropTypes.node,
  color: PropTypes.oneOf(['blue', 'green', 'red', 'yellow', 'purple', 'gray']),
  size: PropTypes.oneOf(['small', 'medium', 'large']),
  trend: PropTypes.string,
  trendDirection: PropTypes.oneOf(['up', 'down', 'neutral'])
};

export default StatCard;