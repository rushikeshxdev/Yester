import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  Search,
  ArrowUpDown,
  ArrowRight,
  Tag,
} from 'lucide-react';
import { useLifeOS } from '../../context/LifeOSContext';
import { EmptyState } from '../common/EmptyState';
import { getMonthName } from '../../utils/dateUtils';

type CategoryFilter = 'All' | 'Work' | 'Fitness' | 'Learning' | 'Personal' | 'Health' | 'Projects' | 'Reflection';
type SortOrder = 'newest' | 'oldest';

interface SearchResultRecord {
  id: string;
  date: string;
  dayNumber: string;
  monthShort: string;
  category: string;
  categoryColor: string;
  badge?: string;
  title: string;
  snippet: string;
  tags?: string[];
}

export const SearchView: React.FC = () => {
  const { records, navigateToJournal } = useLifeOS();
  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<CategoryFilter>('All');
  const [sortOrder, setSortOrder] = useState<SortOrder>('newest');
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Auto focus search input on mount
  useEffect(() => {
    searchInputRef.current?.focus();
  }, []);

  // Index all records into searchable items (Full-Spectrum Search Indexing)
  const allSearchItems = useMemo(() => {
    const items: SearchResultRecord[] = [];

    Object.values(records).forEach((rec) => {
      if (!rec || !rec.date) return;
      const [, m, d] = rec.date.split('-');
      const monthShort = getMonthName(parseInt(m, 10)).substring(0, 3).toUpperCase();
      const dayNumber = String(parseInt(d, 10));

      // 1. Daily Reflection / Headline
      if (rec.summary || rec.reflection?.freeformNotes) {
        items.push({
          id: `refl-main-${rec.date}`,
          date: rec.date,
          dayNumber,
          monthShort,
          category: 'Reflection',
          categoryColor: '#E5A84B',
          badge: 'Daily Reflection',
          title: rec.summary || 'Daily Reflection',
          snippet: rec.reflection?.freeformNotes || rec.summary || 'Recorded journal reflections.',
        });
      }

      // Structured Reflection: Wins & Breakthroughs
      if (rec.reflection?.wentWell) {
        items.push({
          id: `refl-win-${rec.date}`,
          date: rec.date,
          dayNumber,
          monthShort,
          category: 'Reflection',
          categoryColor: '#3FB950',
          badge: 'Win / Breakthrough',
          title: 'What Went Well',
          snippet: rec.reflection.wentWell,
        });
      }

      // Structured Reflection: Lessons Learned
      if (rec.reflection?.learned) {
        items.push({
          id: `refl-learn-${rec.date}`,
          date: rec.date,
          dayNumber,
          monthShort,
          category: 'Reflection',
          categoryColor: '#4A72B2',
          badge: 'Lesson Learned',
          title: 'Insight & Growth',
          snippet: rec.reflection.learned,
        });
      }

      // Structured Reflection: Priorities Tomorrow
      if (rec.reflection?.prioritiesTomorrow && rec.reflection.prioritiesTomorrow.length > 0) {
        items.push({
          id: `refl-priorities-${rec.date}`,
          date: rec.date,
          dayNumber,
          monthShort,
          category: 'Reflection',
          categoryColor: '#FF7138',
          badge: 'Top Priority',
          title: 'Focus for Tomorrow',
          snippet: rec.reflection.prioritiesTomorrow.join(' • '),
        });
      }

      // Structured Reflection: Areas to Improve
      if (rec.reflection?.shouldImprove) {
        items.push({
          id: `refl-improve-${rec.date}`,
          date: rec.date,
          dayNumber,
          monthShort,
          category: 'Reflection',
          categoryColor: '#E5A84B',
          badge: 'Area of Growth',
          title: 'What Could Have Gone Better',
          snippet: rec.reflection.shouldImprove,
        });
      }

      // 2. Work entries & Technologies
      rec.work?.forEach((w) => {
        const techList = w.technologiesUsed || [];
        items.push({
          id: w.id || `work-${rec.date}-${w.project}`,
          date: rec.date,
          dayNumber,
          monthShort,
          category: 'Work',
          categoryColor: '#FF7138',
          badge: w.organization,
          title: w.project ? `${w.organization} • ${w.project}` : w.organization,
          snippet:
            w.outcomeImpact ||
            (w.problemsIdentified ? `Problem: ${w.problemsIdentified}. Solution: ${w.solutionImplemented}` : '') ||
            w.tasksPerformed?.join(', ') ||
            'Work accomplishments logged.',
          tags: techList,
        });
      });

      // 3. Fitness entries & PRs
      rec.fitness?.forEach((f) => {
        const prList = f.personalRecords || [];
        const exercises = f.exercises?.map((e) => e.name) || [];
        items.push({
          id: f.id || `fit-${rec.date}-${f.workoutType}`,
          date: rec.date,
          dayNumber,
          monthShort,
          category: 'Fitness',
          categoryColor: '#4A72B2',
          badge: prList.length > 0 ? 'Personal Record' : `${f.workoutType} (${f.workoutDurationMinutes}m)`,
          title: `${f.workoutType} Workout`,
          snippet:
            (prList.length > 0 ? prList.join(' • ') + ' — ' : '') +
            (f.notes || exercises.join(', ') || f.muscleGroups?.join(', ') || 'Fitness session completed.'),
          tags: [...exercises, ...(f.muscleGroups || [])],
        });
      });

      // 4. Learning entries
      rec.learning?.forEach((l) => {
        items.push({
          id: l.id || `learn-${rec.date}-${l.subject}`,
          date: rec.date,
          dayNumber,
          monthShort,
          category: 'Learning',
          categoryColor: '#3FB950',
          badge: l.subject,
          title: `${l.subject}: ${l.technologyOrConcept}`,
          snippet:
            l.whatIUnderstood ||
            l.practicalImplementation ||
            l.notes ||
            `Studied via ${l.learningSource} for ${l.studyDurationMinutes} minutes.`,
          tags: [l.technologyOrConcept, l.learningSource],
        });
      });

      // 5. Projects
      rec.projects?.forEach((pr) => {
        items.push({
          id: pr.id || `proj-${rec.date}-${pr.projectName}`,
          date: rec.date,
          dayNumber,
          monthShort,
          category: 'Projects',
          categoryColor: '#A371F7',
          badge: `${pr.progressPercentage}% Complete`,
          title: pr.projectName,
          snippet:
            pr.tasksCompleted?.join(', ') ||
            pr.objective ||
            `Progress: ${pr.progressPercentage}%`,
          tags: pr.tasksCompleted || [],
        });
      });

      // 6. Personal
      rec.personal?.forEach((p) => {
        items.push({
          id: p.id || `pers-${rec.date}-${p.title}`,
          date: rec.date,
          dayNumber,
          monthShort,
          category: 'Personal',
          categoryColor: '#E5A84B',
          badge: p.type || 'Memory',
          title: p.title,
          snippet: p.description || 'Personal life memory recorded.',
          tags: p.peopleInvolved || [],
        });
      });

      // 7. Health
      if (rec.health && (rec.health.notes || rec.health.waterIntakeLiters || rec.health.sleepHours)) {
        items.push({
          id: `health-${rec.date}`,
          date: rec.date,
          dayNumber,
          monthShort,
          category: 'Health',
          categoryColor: '#E25950',
          badge: `Sleep ${rec.health.sleepHours || '-'}h`,
          title: 'Health & Wellness Log',
          snippet:
            rec.health.notes ||
            `Sleep: ${rec.health.sleepHours || '-'}h • Water: ${rec.health.waterIntakeLiters || '-'}L • Quality: ${rec.health.sleepQuality || 'good'}`,
        });
      }
    });

    return items;
  }, [records]);

  // Filter and sort items based on query and filters
  const filteredItems = useMemo(() => {
    const q = query.trim().toLowerCase();

    return allSearchItems
      .filter((item) => {
        // Category filter match
        if (selectedCategory !== 'All' && item.category !== selectedCategory) {
          return false;
        }

        // Query text match
        if (!q) return true;

        const titleMatch = item.title.toLowerCase().includes(q);
        const snippetMatch = item.snippet.toLowerCase().includes(q);
        const dateMatch = item.date.includes(q);
        const categoryMatch = item.category.toLowerCase().includes(q);
        const badgeMatch = item.badge?.toLowerCase().includes(q);
        const tagMatch = item.tags?.some((t) => t.toLowerCase().includes(q));

        return titleMatch || snippetMatch || dateMatch || categoryMatch || badgeMatch || tagMatch;
      })
      .sort((a, b) => {
        if (sortOrder === 'newest') {
          return b.date.localeCompare(a.date);
        } else {
          return a.date.localeCompare(b.date);
        }
      });
  }, [allSearchItems, query, selectedCategory, sortOrder]);

  const categoriesList: CategoryFilter[] = [
    'All',
    'Work',
    'Fitness',
    'Learning',
    'Personal',
    'Health',
    'Projects',
    'Reflection',
  ];

  return (
    <div className="w-full max-w-5xl mx-auto px-4 sm:px-8 py-8 space-y-6 select-none">
      {/* Prominent Search Bar (Concept Panel 8) */}
      <div className="relative">
        <div className="relative flex items-center">
          <Search className="w-5 h-5 text-neutral-400 absolute left-4 pointer-events-none" />
          <input
            ref={searchInputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search memories, technologies, wins, workouts, or keywords..."
            className="w-full pl-12 pr-28 py-3.5 rounded-2xl bg-[#0F1216] dark:bg-[#0F1216] light:bg-neutral-100 border border-[#1E232B] dark:border-[#1E232B] light:border-neutral-300 text-white dark:text-white light:text-neutral-900 placeholder:text-neutral-500 text-sm focus:outline-none focus:border-[#FF7138] focus:ring-1 focus:ring-[#FF7138] transition-all"
          />
          <div className="absolute right-4 flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#161B22] border border-[#232934] text-[11px] font-mono text-neutral-400">
            <span>Press</span>
            <kbd className="bg-[#1C222B] px-1 rounded text-white font-semibold">⌘</kbd>
            <kbd className="bg-[#1C222B] px-1 rounded text-white font-semibold">K</kbd>
          </div>
        </div>
      </div>

      {/* Category Pills & Sort Control */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#1E232B] dark:border-[#1E232B] light:border-neutral-200">
        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
          {categoriesList.map((cat) => {
            const isActive = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-mono transition-all cursor-pointer whitespace-nowrap ${
                  isActive
                    ? 'bg-[#FF7138] text-white shadow-orange-sm'
                    : 'bg-[#12161C] dark:bg-[#12161C] light:bg-neutral-100 text-neutral-400 hover:text-white dark:hover:text-white light:text-neutral-600 light:hover:text-black border border-[#1E242E] dark:border-[#1E242E] light:border-neutral-300'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>

        {/* Sort Selector */}
        <div className="flex items-center gap-2 self-end sm:self-auto">
          <ArrowUpDown className="w-3.5 h-3.5 text-neutral-500" />
          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value as SortOrder)}
            className="bg-[#12161C] dark:bg-[#12161C] light:bg-neutral-100 border border-[#1E242E] dark:border-[#1E242E] light:border-neutral-300 rounded-lg px-2.5 py-1.5 text-xs font-mono text-neutral-300 dark:text-neutral-300 light:text-neutral-700 focus:outline-none cursor-pointer"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
          </select>
        </div>
      </div>

      {/* Search Results List */}
      <div className="space-y-3 pt-2">
        {filteredItems.length > 0 ? (
          filteredItems.map((item) => (
            <div
              key={item.id}
              onClick={() => navigateToJournal(item.date)}
              className="p-4 sm:p-5 rounded-2xl bg-[#0F1216] dark:bg-[#0F1216] light:bg-neutral-50 border border-[#1E232B] dark:border-[#1E232B] light:border-neutral-200 hover:border-[#2D3542] dark:hover:border-[#2D3542] light:hover:border-neutral-300 transition-all cursor-pointer group flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              {/* Left: Date Badge + Main Title/Snippet */}
              <div className="flex items-start gap-4">
                {/* Big Date Badge (Concept Panel 8) */}
                <div className="w-14 h-14 rounded-xl bg-[#14181F] dark:bg-[#14181F] light:bg-white border border-[#222833] dark:border-[#222833] light:border-neutral-200 flex flex-col items-center justify-center flex-shrink-0 group-hover:border-[#FF7138]/50 transition-colors">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-400">
                    {item.monthShort}
                  </span>
                  <span className="text-xl font-sans font-semibold text-white dark:text-white light:text-neutral-900 leading-none mt-0.5">
                    {item.dayNumber}
                  </span>
                </div>

                {/* Content */}
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="text-sm font-sans font-medium text-white dark:text-white light:text-neutral-900 group-hover:text-[#FF7138] transition-colors">
                      {item.title}
                    </h4>
                    {item.badge && (
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#181D26] border border-[#232934] text-neutral-300">
                        {item.badge}
                      </span>
                    )}
                  </div>
                  <p className="text-xs font-sans text-neutral-400 dark:text-neutral-400 light:text-neutral-600 line-clamp-2 max-w-xl leading-relaxed">
                    {item.snippet}
                  </p>

                  {/* Matching Tags (Technologies, Exercises, etc.) */}
                  {item.tags && item.tags.length > 0 && (
                    <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
                      <Tag className="w-3 h-3 text-neutral-500" />
                      {item.tags.map((t, tidx) => (
                        <span
                          key={tidx}
                          className="text-[10px] font-mono text-neutral-400 dark:text-neutral-400 light:text-neutral-600 bg-black/20 dark:bg-black/20 light:bg-neutral-200/50 px-1.5 py-0.5 rounded"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Right: Category Pill + Navigate Arrow */}
              <div className="flex items-center gap-3 self-end sm:self-center shrink-0">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#161B22] border border-[#242A35] text-[11px] font-sans text-neutral-300">
                  <span
                    className="w-1.5 h-1.5 rounded-full"
                    style={{ backgroundColor: item.categoryColor }}
                  />
                  {item.category}
                </span>

                <ArrowRight className="w-4 h-4 text-neutral-500 group-hover:text-white group-hover:translate-x-1 transition-all" />
              </div>
            </div>
          ))
        ) : (
          <EmptyState
            title="No matching records found"
            description={
              query
                ? `No memories or logs matched "${query}". Try searching for another keyword or clear the category filter.`
                : 'Start capturing your daily activities to build your searchable life archive.'
            }
            actionText="Capture an Entry"
          />
        )}
      </div>
    </div>
  );
};
