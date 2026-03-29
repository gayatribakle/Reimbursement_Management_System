export default function Table({ headers, children, className = '' }) {
  return (
    <div className={`overflow-x-auto ${className}`}>
      <table className="w-full">
        <thead>
          <tr className="border-b border-outline-variant/30">
            {headers.map((header, i) => (
              <th
                key={i}
                className={`px-4 py-3 text-left text-xs font-semibold text-on-surface-variant uppercase tracking-wide ${
                  header.align === 'right' ? 'text-right' : ''
                } ${header.className || ''}`}
              >
                {header.label || header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-outline-variant/20">
          {children}
        </tbody>
      </table>
    </div>
  );
}

export function TableRow({ children, onClick, className = '' }) {
  return (
    <tr
      onClick={onClick}
      className={`hover:bg-surface-container-low/50 transition-colors ${
        onClick ? 'cursor-pointer' : ''
      } ${className}`}
    >
      {children}
    </tr>
  );
}

export function TableCell({ children, align = 'left', className = '' }) {
  return (
    <td
      className={`px-4 py-3 text-sm text-on-surface ${
        align === 'right' ? 'text-right' : ''
      } ${className}`}
    >
      {children}
    </td>
  );
}
