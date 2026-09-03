'use client';

import React, { useState, useMemo } from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { ChevronUp, ChevronDown, Search, ChevronLeft, ChevronRight } from 'lucide-react';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface Column {
  key: string;
  label: string;
  align?: 'left' | 'center' | 'right';
}

interface DataTableProps {
  columns: Column[];
  data: any[];
  isLoading?: boolean;
}

export function DataTable({ columns, data, isLoading }: DataTableProps) {
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);
  const [filterText, setFilterText] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;

  React.useEffect(() => {
    setCurrentPage(1);
  }, [data, filterText]);

  const sortedAndFilteredData = useMemo(() => {
    let processData = [...data];

    if (filterText) {
      processData = processData.filter(row => 
        Object.values(row).some(val => 
          String(val).toLowerCase().includes(filterText.toLowerCase())
        )
      );
    }

    if (sortConfig !== null) {
      processData.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }
    
    return processData;
  }, [data, sortConfig, filterText]);

  const totalPages = Math.max(1, Math.ceil(sortedAndFilteredData.length / rowsPerPage));
  const paginatedData = sortedAndFilteredData.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  const requestSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  if (isLoading) {
    return (
      <div className="w-full glass-card overflow-hidden animate-pulse">
        <div className="h-12 border-b border-white/10 bg-white/5"></div>
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-14 border-b border-white/5 bg-white/5"></div>
        ))}
      </div>
    );
  }

  return (
    <div className="w-full glass-card overflow-hidden flex flex-col">
      <div className="p-4 border-b border-white/10 flex items-center gap-3">
        <Search className="w-4 h-4 text-slate-400" />
        <input 
          type="text" 
          placeholder="Filter data..." 
          value={filterText}
          onChange={(e) => setFilterText(e.target.value)}
          className="bg-transparent border-none outline-none text-sm text-slate-200 placeholder-slate-500 w-full"
        />
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-slate-300 uppercase bg-slate-800/50 border-b border-white/10">
            <tr>
              {columns.map((col) => (
                <th 
                  key={col.key} 
                  scope="col" 
                  onClick={() => requestSort(col.key)}
                  className={cn("px-6 py-4 font-semibold tracking-wider cursor-pointer hover:bg-white/5 transition-colors group select-none", 
                    col.align === 'center' ? 'text-center' : col.align === 'right' ? 'text-right' : 'text-left'
                  )}
                >
                  <div className={cn("flex items-center gap-2", 
                    col.align === 'center' ? 'justify-center' : col.align === 'right' ? 'justify-end' : 'justify-start'
                  )}>
                    {col.label}
                    <div className="flex flex-col opacity-0 group-hover:opacity-50 data-[active=true]:opacity-100 transition-opacity" data-active={sortConfig?.key === col.key}>
                      <ChevronUp className={cn("w-3 h-3 -mb-1", sortConfig?.key === col.key && sortConfig.direction === 'asc' ? 'text-emerald-400' : '')} />
                      <ChevronDown className={cn("w-3 h-3", sortConfig?.key === col.key && sortConfig.direction === 'desc' ? 'text-emerald-400' : '')} />
                    </div>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paginatedData.map((row, i) => (
              <tr 
                key={row.id || i} 
                className="border-b border-white/5 hover:bg-white/5 transition-colors duration-150"
              >
                {columns.map((col) => (
                  <td 
                    key={`${row.id || i}-${col.key}`} 
                    className={cn("px-6 py-4 font-medium text-slate-200",
                      col.align === 'center' ? 'text-center' : col.align === 'right' ? 'text-right' : 'text-left'
                    )}
                  >
                    {row[col.key]}
                  </td>
                ))}
              </tr>
            ))}
            {paginatedData.length === 0 && (
              <tr>
                <td colSpan={columns.length} className="px-6 py-8 text-center text-slate-400">
                  No data available.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="p-4 border-t border-white/10 flex items-center justify-between text-sm text-slate-400 bg-slate-800/30">
        <div>
          Showing {sortedAndFilteredData.length === 0 ? 0 : (currentPage - 1) * rowsPerPage + 1} to {Math.min(currentPage * rowsPerPage, sortedAndFilteredData.length)} of {sortedAndFilteredData.length} entries
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="p-1.5 rounded-lg hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="font-medium text-slate-300">
            {currentPage} / {totalPages}
          </span>
          <button 
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="p-1.5 rounded-lg hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
