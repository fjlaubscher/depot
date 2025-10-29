import React from 'react';
import { Tag, TagGroup } from '@/components/ui';

interface WargearRowProps {
  name: string;
  range?: string;
  keywords?: string[];
  children?: React.ReactNode;
}

const WargearRow: React.FC<WargearRowProps> = ({ name, range, keywords, children }) => {
  return (
    <div className="flex flex-col gap-2">
      {/* Weapon name and range */}
      <div className="flex flex-col gap-1">
        <div className="flex justify-between items-center text-sm font-medium text-foreground">
          <span className="font-bold">{name}</span>
          {range && (
            <span className="text-xs font-medium text-primary-600 dark:text-primary-400">
              {range}"
            </span>
          )}
        </div>

        {/* Keywords */}
        {keywords && keywords.length > 0 && (
          <TagGroup spacing="sm">
            {keywords.map((keyword, index) => (
              <Tag key={`keyword-${index}`} variant="secondary" size="sm" className="capitalize">
                {keyword}
              </Tag>
            ))}
          </TagGroup>
        )}
      </div>

      {/* Stat cards */}
      <div className="flex gap-2 justify-center md:justify-start">{children}</div>
    </div>
  );
};

export default WargearRow;
