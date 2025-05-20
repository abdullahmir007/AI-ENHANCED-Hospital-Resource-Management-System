import React from 'react';
import PropTypes from 'prop-types';

/**
 * ReportCard component displays a summary card for a specific report type
 * with key statistics and a link to view the full report
 */
const ReportCard = ({ title, description, stats, onViewFullReport }) => {
  return (
    <div className="bg-white p-5 rounded-lg shadow-md h-full">
      <div className="mb-4">
        <h3 className="font-bold text-lg text-blue-800">{title}</h3>
        <p className="text-sm text-gray-600">{description}</p>
      </div>
      
      <div className="grid grid-cols-3 gap-2 mb-4">
        {stats.map((stat, index) => (
          <div key={index} className="bg-blue-50 p-3 rounded">
            <div className="text-xl font-bold text-blue-700">{stat.value}</div>
            <div className="text-xs text-blue-600">{stat.label}</div>
          </div>
        ))}
      </div>
      
      <button 
        className="mt-2 text-blue-600 text-sm hover:text-blue-800 flex items-center"
        onClick={onViewFullReport}
      >
        View Full Report
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          className="h-4 w-4 ml-1" 
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M9 5l7 7-7 7" 
          />
        </svg>
      </button>
    </div>
  );
};

ReportCard.propTypes = {
  title: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  stats: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string.isRequired,
      value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired
    })
  ).isRequired,
  onViewFullReport: PropTypes.func.isRequired
};

export default ReportCard;