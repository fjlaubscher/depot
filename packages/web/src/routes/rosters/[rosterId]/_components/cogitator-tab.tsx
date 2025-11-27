import { useState } from 'react';
import type { FC } from 'react';
import ReactMarkdown from 'react-markdown';
import { Play } from 'lucide-react';

import type { depot } from '@depot/core';
import { Button } from '@/components/ui';

type CogitatorTabProps = {
  roster: depot.Roster;
};

const CogitatorTab: FC<CogitatorTabProps> = ({ roster }) => {
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

  const handleRunCogitator = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/cogitator', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          task: 'roster-analysis',
          roster
        })
      });

      if (!response.ok) {
        throw new Error(`Cogitator returned ${response.status}`);
      }

      const data = (await response.json()) as { output?: string; error?: string };
      if (!data.output) {
        throw new Error(data.error || 'Cogitator did not return any output.');
      }

      setAnalysis(data.output);
      setLastUpdated(new Date().toLocaleTimeString());
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to run cogitator.';
      console.error('Cogitator error', error);
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const buttonLabel = analysis ? 'Repeat data-rite' : 'Begin data-rite';

  return (
    <div className="flex flex-col gap-3">
      <div className="surface-warning border border-warning text-warning-strong rounded-lg p-4 max-w-2xl">
        <div className="flex items-center gap-3">
          <img src="/depot.svg" alt="Cogitator icon" className="w-16 h-16 flex-shrink-0" />
          <p className="text-xs text-foreground">
            Ask the depot Cogitator to perform a tactical data-rite on this roster and suggest
            adjustments. This is an experimental AI assistant and may make mistakes or rely on
            outdated rules—treat its output as advice, not absolute truth.
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Button
          variant="secondary"
          onClick={() => void handleRunCogitator()}
          disabled={loading}
          className="flex items-center gap-2"
        >
          <Play size={16} aria-hidden="true" />
          <span>{loading ? 'Consulting the machine-spirit.' : buttonLabel}</span>
        </Button>
        {lastUpdated && <p className="text-xs text-subtle">Last updated at {lastUpdated}</p>}
      </div>

      {error && <p className="text-xs text-subtle">Error: {error}</p>}

      {loading && !analysis && (
        <div className="markdown-content mt-2 space-y-2 animate-pulse">
          <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-1/3" />
          <div className="h-3 bg-gray-200 dark:bg-gray-800 rounded w-full" />
          <div className="h-3 bg-gray-200 dark:bg-gray-800 rounded w-5/6" />
          <div className="h-3 bg-gray-200 dark:bg-gray-800 rounded w-2/3" />
        </div>
      )}

      {analysis && (
        <div className="markdown-content mt-2">
          <ReactMarkdown>{analysis}</ReactMarkdown>
        </div>
      )}
    </div>
  );
};

export default CogitatorTab;
