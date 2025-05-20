import React from 'react';
import { 
  LineChart, 
  Line, 
  BarChart,
  Bar,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';

const ReportChart = ({ 
  data, 
  type = 'line', 
  xDataKey = 'date', 
  yDataKey = 'value',
  color = '#4f46e5',
  title = 'Chart',
  height = 300 
}) => {
  if (!data || data.length === 0) {
    return (
      <div className="bg-gray-100 h-64 w-full flex items-center justify-center rounded-lg">
        <div className="text-center">
          <p className="text-gray-500">No data available for chart</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-4 rounded-lg shadow-md">
      <h3 className="text-lg font-semibold mb-4">{title}</h3>
      <ResponsiveContainer width="100%" height={height}>
        {type === 'line' ? (
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey={xDataKey} 
              tick={{ fontSize: 12 }}
              tickFormatter={(value) => {
                // If it looks like a date string, format it to be shorter
                if (typeof value === 'string' && value.includes('-')) {
                  const date = new Date(value);
                  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                }
                return value;
              }}
            />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip 
              formatter={(value) => [`${value}${yDataKey.includes('ccupancy') ? '%' : ''}`]}
            />
            <Legend />
            <Line 
              type="monotone" 
              dataKey={yDataKey} 
              stroke={color} 
              activeDot={{ r: 8 }} 
              strokeWidth={2}
            />
          </LineChart>
        ) : (
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey={xDataKey} 
              tick={{ fontSize: 12 }}
            />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip 
              formatter={(value) => [`${value}${yDataKey.includes('ccupancy') ? '%' : ''}`]}
            />
            <Legend />
            <Bar 
              dataKey={yDataKey} 
              fill={color} 
            />
          </BarChart>
        )}
      </ResponsiveContainer>
    </div>
  );
};

export default ReportChart;