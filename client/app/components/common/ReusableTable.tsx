'use client';

import { ReactNode } from 'react';
import CommonLoader from './CommonLoader';

export interface Column<T> {
  header: string;
  key: string;
  render?: (value: any, item: T) => ReactNode;
  className?: string;
  sortable?: boolean;
}

interface ReusableTableProps<T> {
  columns: Column<T>[];
  data: T[];
  loading?: boolean;
  onRowClick?: (item: T) => void;
  selectable?: boolean;
  selectedIds?: string[];
  onSelectRow?: (id: string) => void;
  onSelectAll?: (ids: string[]) => void;
  idKey?: keyof T;
  emptyMessage?: string;
  headerClassName?: string;
  isRowSelectable?: (item: T) => boolean;
}

export default function ReusableTable<T>({
  columns,
  data,
  loading = false,
  onRowClick,
  selectable = false,
  selectedIds = [],
  onSelectRow,
  onSelectAll,
  idKey = 'id' as keyof T,
  emptyMessage = "No data found",
  headerClassName = "bg-gray-50",
  isRowSelectable
}: ReusableTableProps<T>) {

  if (loading && data.length === 0) {
    return (
      <div className="flex items-center justify-center py-16">
        <CommonLoader size="md" />
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="text-center py-16">
          <div className="w-16 h-16 mx-auto mb-4 bg-gray-50 rounded-full flex items-center justify-center">
            <i className="ri-inbox-line text-3xl text-gray-300"></i>
          </div>
          <h3 className="text-lg font-medium text-gray-900">{emptyMessage}</h3>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm transition-opacity duration-300 ${loading ? 'opacity-60' : 'opacity-100'}`}>
      
      {/* Mobile Card View */}
      <div className="block md:hidden p-4 space-y-4 bg-gray-50">
        {data.map((item, rowIdx) => {
          const id = String(item[idKey]);
          const isSelected = selectedIds.includes(id);
          
          return (
            <div 
              key={id || rowIdx} 
              className={`bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden ${onRowClick ? 'cursor-pointer transition-shadow hover:shadow-md' : ''}`}
              onClick={() => onRowClick && onRowClick(item)}
            >
              {selectable && (
                <div className="bg-gray-50 px-4 py-2 border-b border-gray-200 flex items-center justify-between" onClick={(e) => e.stopPropagation()}>
                  <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider font-canela">Select Item</span>
                  {(isRowSelectable ? isRowSelectable(item) : true) ? (
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => onSelectRow && onSelectRow(id)}
                      className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                    />
                  ) : (
                    <div className="w-4 h-4" />
                  )}
                </div>
              )}
              <div className="p-4 space-y-3">
                {columns.map((column, colIdx) => (
                  <div key={colIdx} className="flex justify-between items-center text-sm font-roboto border-b border-gray-100 pb-2 last:border-0 last:pb-0">
                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider font-canela">{column.header}</span>
                    <div className="text-gray-900 flex-1 flex justify-end text-right pl-4">
                      {column.render
                        ? column.render((item as any)[column.key], item)
                        : String((item as any)[column.key])}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block overflow-x-auto custom-scrollbar pb-2">
        <table className="w-full divide-y divide-gray-200">
          <thead className={headerClassName}>
            <tr>
              {selectable && (
                <th className="w-12 px-6 py-4 text-left">
                  <input
                    type="checkbox"
                    checked={data.length > 0 && data.filter(item => isRowSelectable ? isRowSelectable(item) : true).every(item => selectedIds.includes(String(item[idKey])))}
                    onChange={() => onSelectAll && onSelectAll([])}
                    className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                  />
                </th>
              )}
              {columns.map((column, idx) => (
                <th
                  key={idx}
                  className={`px-6 py-4 text-left text-xs text-black font-semibold uppercase tracking-wider font-canela whitespace-nowrap ${column.className || ''}`}
                >
                  <div className="flex items-center space-x-1">
                    <span>{column.header}</span>
                    {column.sortable && (
                      <i className="ri-arrow-up-down-line text-gray-400"></i>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data.map((item, rowIdx) => {
              const id = String(item[idKey]);
              const isSelected = selectedIds.includes(id);

              return (
                <tr
                  key={id || rowIdx}
                  className={`hover:bg-gray-50 transition-colors ${onRowClick ? 'cursor-pointer' : ''}`}
                  onClick={() => onRowClick && onRowClick(item)}
                >
                  {selectable && (
                    <td className="px-6 py-4 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                      {(isRowSelectable ? isRowSelectable(item) : true) ? (
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => onSelectRow && onSelectRow(id)}
                          className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                        />
                      ) : (
                        <div className="w-6 h-6" /> // Placeholder to maintain alignment
                      )}
                    </td>
                  )}
                  {columns.map((column, colIdx) => (
                    <td
                      key={colIdx}
                      className={`px-6 py-4 text-sm text-gray-700 font-roboto whitespace-nowrap ${column.className || ''}`}
                    >
                      {column.render
                        ? column.render((item as any)[column.key], item)
                        : String((item as any)[column.key])}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
