'use client';

import { useState } from 'react';
import { DayPlan } from '@/types/ai-planner';
import { ChevronDown, Clock, MapPin, Wallet, Utensils, Bus, Lightbulb } from 'lucide-react';

interface Props {
  day: DayPlan;
}

export function DayCard({ day }: Props) {
  const [open, setOpen] = useState(day.day === 1);

  return (
    <div className="bg-card-bg backdrop-blur-sm border border-border rounded-2xl overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-4 hover:bg-bg-surface-hover transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-primary/20 text-primary rounded-full flex items-center justify-center text-sm font-bold">
            {day.day}
          </div>
          <div className="text-left">
            <div className="text-txt font-medium">{day.title}</div>
            <div className="text-txt-muted text-xs flex items-center gap-1">
              <Wallet className="w-3 h-3" />
              {day.estimatedCost} AZN
            </div>
          </div>
        </div>
        <ChevronDown
          className={`w-5 h-5 text-txt-sec transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {open && (
        <div className="px-4 pb-4 space-y-3 border-t border-border pt-3">
          {day.activities.map((activity, i) => (
            <div key={i} className="flex items-start gap-3">
              <div className="text-xs text-primary font-mono mt-1 w-12 flex-shrink-0">
                {activity.time}
              </div>
              <div className="flex-1">
                <div className="text-txt text-sm">{activity.activity}</div>
                <div className="flex items-center gap-1 text-txt-sec text-xs mt-0.5">
                  <MapPin className="w-3 h-3" />
                  {activity.location}
                  {activity.cost > 0 && (
                    <span className="text-accent ml-1">({activity.cost} AZN)</span>
                  )}
                </div>
                {activity.tip && (
                  <div className="flex items-start gap-1 mt-1 text-yellow-400/80 text-xs">
                    <Lightbulb className="w-3 h-3 mt-0.5 flex-shrink-0" />
                    {activity.tip}
                  </div>
                )}
              </div>
            </div>
          ))}

          <div className="mt-3 pt-3 border-t border-border/50">
            <div className="flex items-center gap-1 text-txt-sec text-xs mb-2">
              <Utensils className="w-3 h-3" />
              <span className="font-medium text-txt-sec">
                {day.meals.breakfast && `🌅 ${day.meals.breakfast}`}
              </span>
            </div>
            <div className="flex items-center gap-1 text-txt-sec text-xs mb-2">
              <Utensils className="w-3 h-3" />
              <span className="font-medium text-txt-sec">
                {day.meals.lunch && `☀️ ${day.meals.lunch}`}
              </span>
            </div>
            <div className="flex items-center gap-1 text-txt-sec text-xs mb-2">
              <Utensils className="w-3 h-3" />
              <span className="font-medium text-txt-sec">
                {day.meals.dinner && `🌙 ${day.meals.dinner}`}
              </span>
            </div>
            {day.transport && (
              <div className="flex items-center gap-1 text-txt-sec text-xs">
                <Bus className="w-3 h-3" />
                {day.transport}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
