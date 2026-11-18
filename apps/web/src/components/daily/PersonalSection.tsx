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
      <div className="flex items-center justify-between pb-2 border-b border-[#1E1E1E] dark:border-[#1E1E1E] light:border-neutral-200">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded bg-[#141414] dark:bg-[#141414] light:bg-neutral-100 text-neutral-400 dark:text-neutral-300 light:text-neutral-700">
            <Heart className="w-3.5 h-3.5" />
          </div>
          <div>
            <h3 className="text-sm font-mono font-bold uppercase tracking-wider text-white dark:text-white light:text-neutral-900">
              Personal Life & Memories
            </h3>
            <span className="text-[10px] font-mono text-neutral-500">
              Family, connections, life milestones, travel & quiet moments
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {entries.length > 0 && (
            <Badge variant="outline" size="sm">
              {entries.length} {entries.length === 1 ? 'Moment' : 'Moments'}
            </Badge>
          )}
          <Button size="sm" variant="secondary" onClick={onAdd} icon={<Plus className="w-3 h-3" />}>
            Add Memory
          </Button>
        </div>
      </div>

      {entries.length > 0 ? (
        <div className="space-y-4">
          {entries.map((entry) => (
            <div
              key={entry.id}
              className="p-5 rounded-lg border border-[#1E1E1E] dark:border-[#1E1E1E] light:border-neutral-200 bg-[#0A0A0A] dark:bg-[#0A0A0A] light:bg-white hover:border-neutral-600 dark:hover:border-neutral-600 light:hover:border-neutral-400 transition-colors space-y-3 shadow-sm"
            >
              {/* Header */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <span className="text-base font-serif font-normal text-white dark:text-white light:text-neutral-900">
                    {entry.title}
                  </span>
                  <Badge variant="default" size="sm">
                    {entry.type}
                  </Badge>
                  {entry.location && (
                    <span className="text-xs font-mono text-neutral-400 flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-neutral-500" />
                      {entry.location}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => onEdit(entry)}
                    className="p-1.5 text-neutral-500 hover:text-white dark:hover:text-white light:hover:text-black rounded hover:bg-neutral-900 dark:hover:bg-[#161616] light:hover:bg-neutral-100 transition-colors"
                  >
                    <Edit2 className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => onDelete(entry.id)}
                    className="p-1.5 text-neutral-500 hover:text-red-400 rounded hover:bg-neutral-900 dark:hover:bg-[#161616] light:hover:bg-neutral-100 transition-colors"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>

              {/* People involved */}
              {entry.peopleInvolved && entry.peopleInvolved.length > 0 && (
                <div className="flex items-center gap-1.5 text-xs font-mono text-neutral-400">
                  <Users className="w-3 h-3 text-neutral-500" />
                  <span>With {entry.peopleInvolved.join(', ')}</span>
                </div>
              )}

              {/* Description */}
              <p className="text-xs font-serif text-neutral-300 dark:text-neutral-300 light:text-neutral-700 leading-relaxed">
                {entry.description}
              </p>

              {/* Significance */}
              {entry.significance && (
                <div className="text-xs font-serif italic text-neutral-400 dark:text-neutral-400 light:text-neutral-600 bg-[#0E0E0E] dark:bg-[#0E0E0E] light:bg-neutral-50 p-3 rounded border border-[#181818] dark:border-[#181818] light:border-neutral-200">
                  &ldquo;{entry.significance}&rdquo;
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="p-6 rounded-lg border border-dashed border-[#1E1E1E] dark:border-[#1E1E1E] light:border-neutral-200 text-center">
          <p className="text-xs font-mono text-neutral-500">
            No personal experiences or life moments documented for this day.
          </p>
          <Button
            size="sm"
            variant="ghost"
            onClick={onAdd}
            icon={<Plus className="w-3 h-3" />}
            className="mt-2 text-xs font-mono"
          >
            Add Life Moment
          </Button>
        </div>
      )}
    </section>
  );
};
