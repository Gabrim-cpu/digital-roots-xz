import React from 'react';
import { Award, Shield, Star, BookOpen, Mic } from 'lucide-react';

const BADGE_ICONS = {
  story_keeper: BookOpen,
  mentor: Star,
  active_listener: Mic,
  default: Award
};

export default function BadgeDisplay({ badges = [] }) {
  if (!badges || badges.length === 0) {
    return <p className="text-xs text-stone-400">No badges earned yet.</p>;
  }

  return (
    <div className="flex flex-wrap gap-2">
      {badges.map((badgeObj, i) => {
        const badgeId = typeof badgeObj === 'string' ? badgeObj : badgeObj.badge_id;
        const Icon = BADGE_ICONS[badgeId] || BADGE_ICONS.default;

        return (
          <div key={i} className="flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold bg-brand-burgundy/10 text-brand-burgundy">
            <Icon className="h-3.5 w-3.5" />
            <span className="capitalize">{badgeId.replace('_', ' ')}</span>
          </div>
        );
      })}
    </div>
  );
}
