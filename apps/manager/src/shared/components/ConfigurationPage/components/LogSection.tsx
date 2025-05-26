import { NoticeBox } from '@dhis2/ui';
import i18n from '@dhis2/d2-i18n';
import React from 'react';
import { LogEntry } from '../utils/configurationUtils';

interface LogSectionProps {
  logs: LogEntry[];
}

export const LogSection = ({ logs }: LogSectionProps) => (
  <div>
    <h3 className="text-base mb-2">{i18n.t('Logs')}</h3>
    <div className="max-h-[300px] overflow-y-auto border border-gray-300 p-2 rounded bg-gray-50">
      {logs.length === 0 && <p className="text-gray-600 italic">{i18n.t('No logs yet. Perform an action to see logs here.')}</p>}
      {logs.map((log, index) => (
        <NoticeBox
          key={`${log.timestamp}-${index}`}
          error={log.type === 'error'}
          warning={log.type === 'warning'}
          title={log.type === 'info-low' ? 'Detail' : log.type.charAt(0).toUpperCase() + log.type.slice(1)}
          className={index > 0 ? 'mt-2' : ''}
        >
          {`[${new Date(log.timestamp).toLocaleTimeString()}] ${log.message}`}
        </NoticeBox>
      ))}
    </div>
  </div>
);