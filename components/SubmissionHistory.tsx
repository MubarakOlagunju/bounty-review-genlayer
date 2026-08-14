"use client";

import { CheckCircle, Clock, XCircle, Inbox } from "lucide-react";

interface Submission {
  url: string;
  status: 'pending' | 'success' | 'failed';
}

export function SubmissionHistory({ submissions }: { submissions: Submission[] }) {
  // The 'return null' line has been completely removed!

  return (
    <div className="mt-8 bg-white/5 border border-gray-800 rounded-xl p-6 shadow-lg backdrop-blur-sm">
      <h3 className="text-lg font-bold text-white mb-4">Your Submissions</h3>
      
      {/* If empty, show a nice dashed placeholder */}
      {submissions.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-8 text-gray-500 bg-black/20 rounded-lg border border-gray-800/50 border-dashed">
          <Inbox className="w-8 h-8 mb-2 opacity-50" />
          <p className="text-sm">You haven't submitted any work yet.</p>
        </div>
      ) : (
        /* If there are submissions, list them out */
        <div className="space-y-3">
          {submissions.map((sub, index) => (
            <div key={index} className="flex items-center justify-between p-4 bg-black/20 rounded-lg border border-gray-800/50">
              <div className="flex flex-col truncate pr-4">
                <span className="text-sm font-medium text-gray-300 truncate">
                  {sub.url}
                </span>
              </div>
              
              <div className="flex items-center gap-2 whitespace-nowrap">
                {sub.status === 'pending' && (
                  <span className="flex items-center text-yellow-500 text-sm font-medium">
                    <Clock className="w-4 h-4 mr-1 animate-pulse" />
                    Evaluating...
                  </span>
                )}
                {sub.status === 'success' && (
                  <span className="flex items-center text-green-500 text-sm font-medium">
                    <CheckCircle className="w-4 h-4 mr-1" />
                    Success!
                  </span>
                )}
                {sub.status === 'failed' && (
                  <span className="flex items-center text-red-500 text-sm font-medium">
                    <XCircle className="w-4 h-4 mr-1" />
                    Failed
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}