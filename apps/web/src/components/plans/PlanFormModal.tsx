import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Compass, AlertCircle } from 'lucide-react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { LifePlan, PlanCategory, PacingType, PlanMilestone } from '../../types';
import { validatePlan } from '../../services/planService';
import { generateUUID } from '../../services/storage';

interface PlanFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (plan: LifePlan) => void;
  existingPlan?: LifePlan | null;
}

const CATEGORY_OPTIONS: Array<{ id: PlanCategory; label: string }> = [
  { id: 'work', label: 'Work & Engineering' },
  { id: 'fitness', label: 'Physical & Fitness' },
  { id: 'learning', label: 'Learning & Mastery' },
  { id: 'project', label: 'Independent Projects' },
  { id: 'personal', label: 'Personal & Life' },
];

const PACING_OPTIONS: Array<{
  id: PacingType;
  label: string;
  description: string;
}> = [
  {
    id: 'linear',
    label: 'Linear Pacing',
    description: 'Steady, uniform effort distributed evenly across all days.',
  },
  {
    id: 'ramp_up',
    label: 'Ramp-up (Accelerating)',
    description: 'Starts gradual to build foundational momentum, accelerating toward target date.',
  },
  {
    id: 'front_loaded',
    label: 'Front-loaded (Sprint & Sustain)',
    description: 'High initial volume up front, tapering into sustainable maintenance.',
  },
];

export const PlanFormModal: React.FC<PlanFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  existingPlan,
}) => {
  const today = new Date().toISOString().split('T')[0];
  const defaultTargetDate = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000)
    .toISOString()
    .split('T')[0];

  const [title, setTitle] = useState('');
  const [statement, setStatement] = useState('');
  const [category, setCategory] = useState<PlanCategory>('work');
  const [startDate, setStartDate] = useState(today);
  const [targetDate, setTargetDate] = useState(defaultTargetDate);
  const [unitLabel, setUnitLabel] = useState('Sessions');
  const [targetValue, setTargetValue] = useState('100');
  const [pacingType, setPacingType] = useState<PacingType>('ramp_up');

  // Milestones builder
  const [milestones, setMilestones] = useState<PlanMilestone[]>([
    { id: 'm-1', title: 'Foundations Established', targetPercent: 25, createdAt: '', updatedAt: '' },
    { id: 'm-2', title: 'Halfway Benchmark Reached', targetPercent: 50, createdAt: '', updatedAt: '' },
    { id: 'm-3', title: 'Advanced Execution Phase', targetPercent: 75, createdAt: '', updatedAt: '' },
    { id: 'm-4', title: 'Full Intention Realized', targetPercent: 100, createdAt: '', updatedAt: '' },
  ]);

  const [newMsTitle, setNewMsTitle] = useState('');
  const [newMsPercent, setNewMsPercent] = useState('');
  const [errors, setErrors] = useState<string[]>([]);

  useEffect(() => {
    if (existingPlan) {
      setTitle(existingPlan.title);
      setStatement(existingPlan.statement);
      setCategory(existingPlan.category);
      setStartDate(existingPlan.startDate);
      setTargetDate(existingPlan.targetDate);
      setUnitLabel(existingPlan.unitLabel);
      setTargetValue(String(existingPlan.targetValue));
      setPacingType(existingPlan.pacingType);
      setMilestones(existingPlan.milestones || []);
    } else {
      setTitle('');
      setStatement('');
      setCategory('work');
      setStartDate(today);
      setTargetDate(defaultTargetDate);
      setUnitLabel('Sessions');
      setTargetValue('100');
      setPacingType('ramp_up');
      setMilestones([
        { id: 'm-1', title: 'Foundations Established', targetPercent: 25, createdAt: '', updatedAt: '' },
        { id: 'm-2', title: 'Halfway Benchmark Reached', targetPercent: 50, createdAt: '', updatedAt: '' },
        { id: 'm-3', title: 'Advanced Execution Phase', targetPercent: 75, createdAt: '', updatedAt: '' },
        { id: 'm-4', title: 'Full Intention Realized', targetPercent: 100, createdAt: '', updatedAt: '' },
      ]);
    }
    setErrors([]);
  }, [existingPlan, isOpen, today, defaultTargetDate]);

  if (!isOpen) return null;

  const handleAddMilestone = () => {
    const pct = parseInt(newMsPercent, 10);
    if (!newMsTitle.trim() || isNaN(pct) || pct <= 0 || pct > 100) {
      return;
    }
    if (milestones.some((m) => m.targetPercent === pct)) {
      setErrors(['A milestone with this percentage already exists.']);
      return;
    }

    const updated = [
      ...milestones,
      {
        id: `ms-${generateUUID()}`,
        title: newMsTitle.trim(),
        targetPercent: pct,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ].sort((a, b) => a.targetPercent - b.targetPercent);

    setMilestones(updated);
    setNewMsTitle('');
    setNewMsPercent('');
    setErrors([]);
  };

  const handleRemoveMilestone = (id: string) => {
    setMilestones(milestones.filter((m) => m.id !== id));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const now = new Date().toISOString();
    const candidatePlan: Partial<LifePlan> = {
      id: existingPlan?.id || `plan-${generateUUID()}`,
      title: title.trim(),
      statement: statement.trim(),
      category,
      startDate,
      targetDate,
      unitLabel: unitLabel.trim(),
      targetValue: parseFloat(targetValue) || 0,
      pacingType,
      milestones: milestones.sort((a, b) => a.targetPercent - b.targetPercent),
      status: existingPlan?.status || 'active',
      createdAt: existingPlan?.createdAt || now,
      updatedAt: now,
    };

    const validation = validatePlan(candidatePlan);
    if (!validation.valid) {
      setErrors(validation.errors);
      return;
    }

    onSave(candidatePlan as LifePlan);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={existingPlan ? 'Edit Life Plan' : 'Define Life Plan · Intent vs. Reality'}
      subtitle="Anchor high-leverage intentions to actual daily chronicle entries."
      maxWidth="xl"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Validation Errors banner */}
        {errors.length > 0 && (
          <div className="p-3.5 rounded-xl border border-red-500/30 bg-red-950/20 text-red-400 space-y-1 text-xs font-mono">
            <div className="flex items-center gap-2 font-bold">
              <AlertCircle className="w-4 h-4 text-red-400" />
              <span>Please resolve before saving:</span>
            </div>
            <ul className="list-disc list-inside space-y-0.5 pl-1">
              {errors.map((err, i) => (
                <li key={i}>{err}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Title & Category */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="sm:col-span-2">
            <label className="text-[11px] font-mono uppercase text-neutral-400 block mb-1">
              Plan Title *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Distributed Systems Mastery"
              className="w-full px-3 py-2 rounded-lg bg-[#14181F] dark:bg-[#14181F] light:bg-white border border-[#242A35] dark:border-[#242A35] light:border-neutral-300 text-xs font-mono text-white dark:text-white light:text-neutral-900 focus:outline-none focus:border-[#FF7138]"
            />
          </div>
          <div>
            <label className="text-[11px] font-mono uppercase text-neutral-400 block mb-1">
              Category *
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as PlanCategory)}
              className="w-full px-3 py-2 rounded-lg bg-[#14181F] dark:bg-[#14181F] light:bg-white border border-[#242A35] dark:border-[#242A35] light:border-neutral-300 text-xs font-mono text-white dark:text-white light:text-neutral-900 focus:outline-none focus:border-[#FF7138]"
            >
              {CATEGORY_OPTIONS.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Intention Statement */}
        <div>
          <label className="text-[11px] font-mono uppercase text-neutral-400 block mb-1">
            Intention Statement (The "Why" & Measurable Scope) *
          </label>
          <textarea
            rows={2}
            required
            value={statement}
            onChange={(e) => setStatement(e.target.value)}
            placeholder="e.g. Develop strong backend engineering fundamentals and architect resilient systems independently."
            className="w-full p-2.5 rounded-lg bg-[#14181F] dark:bg-[#14181F] light:bg-white border border-[#242A35] dark:border-[#242A35] light:border-neutral-300 text-xs font-mono text-white dark:text-white light:text-neutral-900 focus:outline-none focus:border-[#FF7138] resize-none"
          />
        </div>

        {/* Timeline: Start Date & Target Date */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="text-[11px] font-mono uppercase text-neutral-400 block mb-1">
              Start Date *
            </label>
            <input
              type="date"
              required
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-[#14181F] dark:bg-[#14181F] light:bg-white border border-[#242A35] dark:border-[#242A35] light:border-neutral-300 text-xs font-mono text-white dark:text-white light:text-neutral-900 focus:outline-none focus:border-[#FF7138]"
            />
          </div>
          <div>
            <label className="text-[11px] font-mono uppercase text-neutral-400 block mb-1">
              Target Completion Date *
            </label>
            <input
              type="date"
              required
              value={targetDate}
              onChange={(e) => setTargetDate(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-[#14181F] dark:bg-[#14181F] light:bg-white border border-[#242A35] dark:border-[#242A35] light:border-neutral-300 text-xs font-mono text-white dark:text-white light:text-neutral-900 focus:outline-none focus:border-[#FF7138]"
            />
          </div>
        </div>

        {/* Progress Metrics: Target Value & Unit Label */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="text-[11px] font-mono uppercase text-neutral-400 block mb-1">
              Total Target Value *
            </label>
            <input
              type="number"
              step="any"
              min="0.1"
              required
              value={targetValue}
              onChange={(e) => setTargetValue(e.target.value)}
              placeholder="e.g. 120"
              className="w-full px-3 py-2 rounded-lg bg-[#14181F] dark:bg-[#14181F] light:bg-white border border-[#242A35] dark:border-[#242A35] light:border-neutral-300 text-xs font-mono text-white dark:text-white light:text-neutral-900 focus:outline-none focus:border-[#FF7138]"
            />
          </div>
          <div>
            <label className="text-[11px] font-mono uppercase text-neutral-400 block mb-1">
              Unit Label *
            </label>
            <input
              type="text"
              required
              value={unitLabel}
              onChange={(e) => setUnitLabel(e.target.value)}
              placeholder="e.g. Engineering Hours, Running Km, Sessions"
              className="w-full px-3 py-2 rounded-lg bg-[#14181F] dark:bg-[#14181F] light:bg-white border border-[#242A35] dark:border-[#242A35] light:border-neutral-300 text-xs font-mono text-white dark:text-white light:text-neutral-900 focus:outline-none focus:border-[#FF7138]"
            />
          </div>
        </div>

        {/* Pacing Curve Selector */}
        <div className="space-y-2">
          <label className="text-[11px] font-mono uppercase text-neutral-400 block">
            Mathematical Pacing Curve (Expected Trajectory)
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {PACING_OPTIONS.map((p) => {
              const isSelected = pacingType === p.id;
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setPacingType(p.id)}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    isSelected
                      ? 'bg-[#181D25] border-[#FF7138] text-white shadow-sm light:bg-[#FCE9E0] light:border-[#E95D2B] light:text-[#191B20]'
                      : 'bg-[#111419] border-[#1E232B] text-neutral-400 hover:text-white hover:border-neutral-600 light:bg-[#F8F7F4] light:border-[#E5E3DC] light:text-[#191B20]'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-mono font-bold">{p.label}</span>
                    {isSelected && <span className="w-2 h-2 rounded-full bg-[#FF7138]" />}
                  </div>
                  <p className="text-[10px] font-sans leading-tight text-neutral-400 light:text-[#626872]">
                    {p.description}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Milestones Builder */}
        <div className="space-y-3 pt-2 border-t border-[#1C2027]">
          <div className="flex items-center justify-between">
            <label className="text-[11px] font-mono uppercase text-neutral-400 block">
              Sequential Milestones
            </label>
            <span className="text-[10px] font-mono text-neutral-500">
              Evaluated automatically from daily entries
            </span>
          </div>

          <div className="space-y-1.5">
            {milestones.map((m) => (
              <div
                key={m.id}
                className="flex items-center justify-between p-2.5 rounded-lg bg-[#14181F] border border-[#242A35] text-xs font-mono light:bg-[#F8F7F4] light:border-[#E5E3DC] light:text-[#191B20]"
              >
                <div className="flex items-center gap-3">
                  <span className="px-2 py-0.5 rounded bg-[#1F2633] light:bg-[#EBE9E3] text-[#FF7138] font-bold text-[10px]">
                    {m.targetPercent}%
                  </span>
                  <span className="text-white light:text-[#191B20] font-medium">{m.title}</span>
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveMilestone(m.id)}
                  className="p-1 text-neutral-500 hover:text-red-400 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>

          {/* Add Milestone row */}
          <div className="flex items-center gap-2">
            <input
              type="number"
              min="1"
              max="100"
              value={newMsPercent}
              onChange={(e) => setNewMsPercent(e.target.value)}
              placeholder="%"
              className="w-16 px-2.5 py-1.5 rounded-lg bg-[#14181F] border border-[#242A35] text-xs font-mono text-white text-center focus:outline-none focus:border-[#FF7138] light:bg-[#FFFFFF] light:border-[#D7D5CE] light:text-[#191B20]"
            />
            <input
              type="text"
              value={newMsTitle}
              onChange={(e) => setNewMsTitle(e.target.value)}
              placeholder="Milestone title (e.g. First Production Release)"
              className="flex-1 px-3 py-1.5 rounded-lg bg-[#14181F] border border-[#242A35] text-xs font-mono text-white focus:outline-none focus:border-[#FF7138] light:bg-[#FFFFFF] light:border-[#D7D5CE] light:text-[#191B20]"
            />
            <button
              type="button"
              onClick={handleAddMilestone}
              className="px-3 py-1.5 rounded-lg bg-[#1E232B] hover:bg-[#2A313C] text-neutral-200 text-xs font-mono flex items-center gap-1 light:bg-[#EBE9E3] light:text-[#191B20] light:hover:bg-[#D7D5CE]"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add</span>
            </button>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#1C2027]">
          <Button type="button" variant="ghost" size="sm" onClick={onClose} className="font-mono text-xs">
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            size="sm"
            icon={<Compass className="w-3.5 h-3.5" />}
            className="font-mono text-xs bg-[#FF7138] hover:bg-[#FF8352] text-white"
          >
            {existingPlan ? 'Update Plan' : 'Establish Plan'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

