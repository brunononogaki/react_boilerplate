export default function ResponsiveTable({ children, className = "" }) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="table-container">
        <table className={`w-full divide-y divide-gray-200 responsive-table ${className}`}>
          {children}
        </table>
      </div>
    </div>
  );
}
