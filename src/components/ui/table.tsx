import React from 'react';

interface TableProps {
  children: React.ReactNode;
  className?: string;
}

export function Table({ children, className = '' }: TableProps) {
  return (
    <div className="overflow-x-auto">
      <table className={`min-w-full divide-y divide-gray-200 ${className}`}>
        {children}
      </table>
    </div>
  );
}

export function TableHead({ children, className = '' }: TableProps) {
  return (
    <thead className={`bg-gray-50 ${className}`}>
      {children}
    </thead>
  );
}

export function TableBody({ children, className = '' }: TableProps) {
  return (
    <tbody className={`bg-white divide-y divide-gray-200 ${className}`}>
      {children}
    </tbody>
  );
}

export function TableRow({ children, className = '' }: TableProps) {
  return (
    <tr className={className}>
      {children}
    </tr>
  );
}

interface TableCellProps extends TableProps {
  align?: 'left' | 'center' | 'right';
}

export function TableHeader({ children, className = '', align = 'left' }: TableCellProps) {
  const alignClass = align === 'center' ? 'text-center' : align === 'right' ? 'text-right' : 'text-left';

  return (
    <th className={`px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider ${alignClass} ${className}`}>
      {children}
    </th>
  );
}

export function TableCell({ children, className = '', align = 'left' }: TableCellProps) {
  const alignClass = align === 'center' ? 'text-center' : align === 'right' ? 'text-right' : 'text-left';

  return (
    <td className={`px-6 py-4 whitespace-nowrap text-sm text-gray-900 ${alignClass} ${className}`}>
      {children}
    </td>
  );
}
