'use client';

import React from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

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
    <div className="w-full glass-card overflow-x-auto">
      <table className="w-full text-sm text-left">
        <thead className="text-xs text-slate-300 uppercase bg-slate-800/50 border-b border-white/10">
          <tr>
            {columns.map((col) => (
              <th 
                key={col.key} 
                scope="col" 
                className={cn("px-6 py-4 font-semibold tracking-wider", 
                  col.align === 'center' ? 'text-center' : col.align === 'right' ? 'text-right' : 'text-left'
                )}
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, i) => (
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
          {data.length === 0 && (
            <tr>
              <td colSpan={columns.length} className="px-6 py-8 text-center text-slate-400">
                No data available.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
