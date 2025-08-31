import React from 'react';
import classNames from 'classnames';

// Base table components for flexible composition
const Table: React.FC<React.TableHTMLAttributes<HTMLTableElement>> = ({
  className,
  children,
  ...props
}) => (
  <div className="overflow-x-auto">
    <table
      className={classNames(
        'min-w-full divide-y divide-gray-200 dark:divide-gray-700',
        className
      )}
      {...props}
    >
      {children}
    </table>
  </div>
);

const TableHeader: React.FC<React.HTMLAttributes<HTMLTableSectionElement>> = ({
  className,
  children,
  ...props
}) => (
  <thead
    className={classNames('bg-gray-50 dark:bg-gray-800', className)}
    {...props}
  >
    {children}
  </thead>
);

const TableBody: React.FC<React.HTMLAttributes<HTMLTableSectionElement>> = ({
  className,
  children,
  ...props
}) => (
  <tbody
    className={classNames(
      'bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700',
      className
    )}
    {...props}
  >
    {children}
  </tbody>
);

const TableRow: React.FC<React.HTMLAttributes<HTMLTableRowElement>> = ({
  className,
  children,
  ...props
}) => (
  <tr
    className={classNames('hover:bg-gray-50 dark:hover:bg-gray-800', className)}
    {...props}
  >
    {children}
  </tr>
);

const TableHead: React.FC<React.ThHTMLAttributes<HTMLTableHeaderCellElement>> = ({
  className,
  children,
  ...props
}) => (
  <th
    className={classNames(
      'px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider',
      className
    )}
    scope="col"
    {...props}
  >
    {children}
  </th>
);

const TableCell: React.FC<React.TdHTMLAttributes<HTMLTableDataCellElement>> = ({
  className,
  children,
  ...props
}) => (
  <td
    className={classNames(
      'px-3 py-4 text-sm text-gray-900 dark:text-gray-100',
      className
    )}
    {...props}
  >
    {children}
  </td>
);

// Utility classes for common table styling
export const tableStyles = {
  center: 'text-center',
  right: 'text-right',
  noWrap: 'whitespace-nowrap',
  compact: 'py-2',
  numeric: 'font-mono tabular-nums'
};

export {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell
};

export default Table;