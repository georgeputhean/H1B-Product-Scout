import React from 'react';
import { Company } from '../types';
import { ExternalLink, CheckCircle, HelpCircle, XCircle } from 'lucide-react';

interface CompanyTableProps {
  companies: Company[];
  title: string;
}

const H1BStatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const styles = {
    High: "bg-green-100 text-green-800 border-green-200",
    Medium: "bg-yellow-100 text-yellow-800 border-yellow-200",
    Low: "bg-red-100 text-red-800 border-red-200",
    Unknown: "bg-gray-100 text-gray-800 border-gray-200",
  };
  
  const icons = {
    High: <CheckCircle className="w-3 h-3 mr-1" />,
    Medium: <HelpCircle className="w-3 h-3 mr-1" />,
    Low: <XCircle className="w-3 h-3 mr-1" />,
    Unknown: <HelpCircle className="w-3 h-3 mr-1" />,
  };

  const key = status as keyof typeof styles;

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${styles[key] || styles.Unknown}`}>
      {icons[key]}
      {status}
    </span>
  );
};

export const CompanyTable: React.FC<CompanyTableProps> = ({ companies, title }) => {
  if (companies.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-lg border border-slate-200 shadow-sm">
        <p className="text-slate-500">No companies found yet for {title}. Start the research to populate this list.</p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden flex flex-col h-full">
      <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
        <h3 className="text-lg font-semibold text-slate-800">{title} <span className="text-slate-500 text-sm font-normal">({companies.length} companies)</span></h3>
      </div>
      <div className="overflow-auto custom-scrollbar flex-grow">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50 sticky top-0 z-10 shadow-sm">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Company</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Industry</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">H1B Potential</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Funding/Details</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Relevant Roles</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-slate-200">
            {companies.map((company, idx) => (
              <tr key={`${company.name}-${idx}`} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="ml-0">
                      <div className="text-sm font-medium text-slate-900">{company.name}</div>
                      <div className="text-xs text-slate-500">{company.location}</div>
                      {company.website && (
                         <a href={company.website} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline flex items-center mt-1">
                           Visit Website <ExternalLink className="w-3 h-3 ml-1" />
                         </a>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-50 text-blue-700">
                    {company.industry}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <H1BStatusBadge status={company.h1b_likelihood} />
                </td>
                <td className="px-6 py-4">
                   <div className="text-sm text-slate-900">{company.series}</div>
                   <div className="text-xs text-slate-500 mt-1 line-clamp-2 max-w-xs" title={company.reasoning}>{company.reasoning}</div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-wrap gap-1 max-w-xs">
                    {company.roles.slice(0, 3).map((role, i) => (
                      <span key={i} className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-800 border border-slate-200">
                        {role}
                      </span>
                    ))}
                    {company.roles.length > 3 && (
                      <span className="text-xs text-slate-500 ml-1">+{company.roles.length - 3} more</span>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};