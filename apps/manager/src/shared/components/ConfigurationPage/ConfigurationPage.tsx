import React, { useState } from 'react';
import { Divider } from '@dhis2/ui';
import i18n from "@dhis2/d2-i18n";
import { ImportSection } from './components/ImportSection';
import { ExportSection } from './components/ExportSection';
import { LogSection } from './components/LogSection';
import { LogEntry } from './utils/configurationUtils';

export function ConfigurationPage() {
    const [logs, setLogs] = useState<LogEntry[]>([]);

    return (
        <div className="p-4">
            <h2 className="text-xl font-medium mb-4">{i18n.t('Configuration Management')}</h2>
            <ExportSection setLogs={setLogs} />
            <Divider className="my-6" />
            <ImportSection setLogs={setLogs} />
            <Divider className="my-6" />
            <LogSection logs={logs} />
        </div>
    );
}
