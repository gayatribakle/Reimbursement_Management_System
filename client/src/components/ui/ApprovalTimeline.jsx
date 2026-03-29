import { CheckCircle2, XCircle, Clock, Loader2 } from 'lucide-react';
import StatusChip from './StatusChip';

export default function ApprovalTimeline({ logs = [], steps = [], currentStepIndex = 0, expenseStatus = 'PENDING' }) {
  const buildTimeline = (steps, logs, currentStepIndex, expenseStatus) => {
    return steps.map((step, index) => {
      // Find the log for this specific step
      const log = logs.find(l => l.stepIndex === index);
      let stepStatus;
      
      if (log) {
        // Log exists -> use the actual action from log
        stepStatus = log.action; // 'APPROVED' or 'REJECTED'
      } else if (index === currentStepIndex && expenseStatus === 'PENDING') {
        // This is the current active step awaiting action
        stepStatus = 'AWAITING';
      } else if (index < currentStepIndex || expenseStatus === 'APPROVED') {
        // Past step with no log = somehow approved
        stepStatus = 'APPROVED';
      } else {
        // Future step not yet reached
        stepStatus = 'UPCOMING';
      }
      return { ...step, log, stepStatus };
    });
  };

  const timelineItems = buildTimeline(steps, logs, currentStepIndex, expenseStatus);

  const getIcon = (status) => {
    switch (status) {
      case 'APPROVED':
        return <CheckCircle2 className="w-5 h-5 text-emerald-600" />;
      case 'REJECTED':
        return <XCircle className="w-5 h-5 text-red-600" />;
      case 'AWAITING':
        return <Loader2 className="w-5 h-5 text-amber-500 animate-spin" />;
      default:
        return <Clock className="w-5 h-5 text-gray-300" />;
    }
  };

  const getBgColor = (status) => {
    switch (status) {
      case 'APPROVED':
        return 'bg-emerald-100';
      case 'REJECTED':
        return 'bg-red-100';
      case 'AWAITING':
        return 'bg-amber-100 ring-2 ring-amber-300 animate-pulse';
      default:
        return 'bg-gray-100';
    }
  };

  const getChipStatus = (status) => {
    if (status === 'APPROVED' || status === 'REJECTED') return status;
    if (status === 'AWAITING') return 'PENDING';
    return 'CANCELLED'; // Gives a gray chip for UPCOMING
  };

  const getChipLabel = (status) => {
    if (status === 'APPROVED') return 'Approved';
    if (status === 'REJECTED') return 'Rejected';
    if (status === 'AWAITING') return 'Pending';
    return 'Upcoming';
  };

  return (
    <div className="space-y-0">
      {timelineItems.map((item, index) => (
        <div key={index} className="flex gap-4">
          <div className="flex flex-col items-center">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${getBgColor(item.stepStatus)}`}>
              {getIcon(item.stepStatus)}
            </div>
            {index < timelineItems.length - 1 && (
              <div className="w-0.5 h-12 bg-outline-variant/40 my-1" />
            )}
          </div>
          <div className="flex-1 pb-6">
            <div className="flex items-center justify-between mb-0.5">
              <p className="font-medium text-on-surface text-sm">
                {item.approver?.name || item.log?.approver?.name || 'Unknown'}
              </p>
              
              <span className={`inline-flex items-center gap-1.5 rounded-full font-semibold px-2.5 py-0.5 text-[10px] sm:text-xs ${
                item.stepStatus === 'APPROVED' ? 'bg-emerald-100 text-emerald-800' :
                item.stepStatus === 'REJECTED' ? 'bg-red-100 text-red-800' :
                item.stepStatus === 'AWAITING' ? 'bg-amber-100 text-amber-800' :
                'bg-gray-100 text-gray-600'
              }`}>
                {getChipLabel(item.stepStatus)}
              </span>
            </div>
            <p className="text-xs text-on-surface-variant">{item.approver?.role || item.log?.approver?.role || ''}</p>
            
            {item.stepStatus === 'AWAITING' && (
              <p className="text-sm text-amber-600 mt-2 p-2 bg-amber-50 rounded-lg">Awaiting approval</p>
            )}

            {item.log?.comment && (
              <p className="text-sm text-on-surface-variant mt-2 bg-surface-container-low p-2 rounded-lg border border-outline-variant/30">
                "{item.log.comment}"
              </p>
            )}
            
            {item.log?.createdAt && (
              <p className="text-[11px] text-outline mt-1 font-medium">
                {new Date(item.log.createdAt).toLocaleString()}
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
