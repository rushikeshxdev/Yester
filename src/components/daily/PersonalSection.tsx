import React from 'react';
import { Heart, Plus, Edit2, Trash2, MapPin, Users } from 'lucide-react';
import { PersonalEntry } from '../../types';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';

interface PersonalSectionProps {
  entries: PersonalEntry[];
  onAdd: () => void;
  onEdit: (entry: PersonalEntry) => void;
  onDelete: (entryId: string) => void;
}

export const PersonalSection: React.FC<PersonalSectionProps> = ({
  entries,
  onAdd,
  onEdit,
  onDelete,
}) => {
  return (
    <section className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-neutral-200 dark:border-[#222222]">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded bg-neutral-100 dark:bg-[#1C1C1C] text-neutral-800 dark:text-neutral-200">
            <Heart className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-mono font-bold uppercase tracking-wider text-neutral-900 dark:text-white">
              Personal Life & Memories
            </h3>
            <span className="text-[10px] font-mono text-neutral-500">
              Family, relationships, travel, conversations, life milestones
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {entries.length > 0 && (
            <Badge variant="outline" size="sm">
              {entries.length} {entries.length === 1 ? 'Moment' : 'Moments'}
            </Badge>
          )}
          <Button size="sm" variant="secondary" onClick={onAdd} icon={<Plus className="w-3.5 h-3.5" />}>
            Add Memory
          </Button>
        </div>
      </div>

      {entries.length > 0 ? (
        <div className="space-y-4">
          {entries.map((entry) => (
            <div
              key={entry.id}
              className="p-5 rounded-lg border border-neutral-200 dark:border-[#242424] bg-white dark:bg-[#131313] hover:border-neutral-300 dark:hover:border-[#303030] transition-colors space-y-3 shadow-sm"
            >
              {/* Header */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <span className="text-base font-mono font-bold text-neutral-900 dark:text-white">
                    {entry.title}
                  </span>
                  <Badge variant="default" size="sm">
                    {entry.type}
                  </Badge>
                  {entry.location && (
                    <span className="text-xs font-mono text-neutral-500 flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-neutral-400" />
                      {entry.location}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => onEdit(entry)}
                    className="p-1.5 text-neutral-400 hover:text-neutral-900 dark:hover:text-white rounded hover:bg-neutral-100 dark:hover:bg-[#1F1F1F] transition-colors"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => onDelete(entry.id)}
                    className="p-1.5 text-neutral-400 hover:text-red-500 rounded hover:bg-neutral-100 dark:hover:bg-[#1F1F1F] transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* People involved */}
              {entry.peopleInvolved && entry.peopleInvolved.length > 0 && (
                <div className="flex items-center gap-1.5 text-xs font-mono text-neutral-500">
                  <Users className="w-3.5 h-3.5 text-neutral-400" />
                  <span>With {entry.peopleInvolved.join(', ')}</span>
                </div>
              )}

              {/* Description */}
              <p className="text-xs font-mono text-neutral-700 dark:text-neutral-300 leading-relaxed">
                {entry.description}
              </p>

              {/* Significance */}
              {entry.significance && (
                <div className="text-xs font-mono text-neutral-500 dark:text-neutral-400 italic bg-neutral-50/50 dark:bg-[#161616]/50 p-2.5 rounded border border-neutral-100 dark:border-[#1C1C1C]">
                  &ldquo;{entry.significance}&rdquo;
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="p-6 rounded-lg border border-dashed border-neutral-200 dark:border-[#242424] text-center">
          <p className="text-xs font-mono text-neutral-400 dark:text-neutral-500">
            No personal experiences or life moments recorded for this date.
          </p>
          <Button
            size="sm"
            variant="ghost"
            onClick={onAdd}
            icon={<Plus className="w-3.5 h-3.5" />}
            className="mt-2 text-xs font-mono"
          >
            Add Life Moment
          </Button>
        </div>
      )}
    </section>
  );
};
