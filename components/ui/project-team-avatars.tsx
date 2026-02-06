'use client';

import { ProjectParticipantSimple } from '@/types';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from '@/components/ui/tooltip';

// Генерация инициалов для аватарки
function getInitials(participant: ProjectParticipantSimple): string {
  const first = participant.firstName?.charAt(0) || '';
  const last = participant.lastName?.charAt(0) || '';
  return (first + last).toUpperCase() || participant.id.charAt(0).toUpperCase();
}

// Форматирование имени для тултипа
function getFullName(participant: ProjectParticipantSimple): string {
  const parts = [participant.firstName, participant.lastName].filter(Boolean);
  return parts.length > 0 ? parts.join(' ') : participant.id;
}

interface ProjectTeamAvatarsProps {
  owner?: ProjectParticipantSimple;
  participants?: ProjectParticipantSimple[];
  tooltipSide?: 'top' | 'bottom';
  size?: 'sm' | 'md';
  className?: string;
}

export function ProjectTeamAvatars({
  owner,
  participants,
  tooltipSide = 'top',
  size = 'md',
  className = '',
}: ProjectTeamAvatarsProps) {
  // Ничего не рендерим если нет ни владельца, ни участников
  if (!owner && (!participants || participants.length === 0)) {
    return null;
  }

  // Размеры аватарок
  const avatarSize = size === 'sm' ? 'h-6 w-6' : 'h-8 w-8';
  const textSize = size === 'sm' ? 'text-[10px]' : 'text-xs';
  const dividerHeight = size === 'sm' ? 'h-5' : 'h-6';

  // Фильтруем участников, убираем владельца если он там есть
  const filteredParticipants = participants
    ? participants.filter((p) => p.id !== owner?.id)
    : [];

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* Аватарка владельца */}
      {owner && (
        <Tooltip delayDuration={300}>
          <TooltipTrigger asChild>
            <div>
              <Avatar className={`${avatarSize} border-2 border-background`}>
                {owner.userpic && (
                  <AvatarImage src={owner.userpic} alt={getFullName(owner)} />
                )}
                <AvatarFallback className={textSize}>
                  {getInitials(owner)}
                </AvatarFallback>
              </Avatar>
            </div>
          </TooltipTrigger>
          <TooltipContent side={tooltipSide}>
            <p>Владелец: {getFullName(owner)}</p>
          </TooltipContent>
        </Tooltip>
      )}

      {/* Разделитель и участники */}
      {filteredParticipants.length > 0 && (
        <>
          {/* Разделитель */}
          <div className={`${dividerHeight} w-px bg-border`} />

          {/* Стопка аватарок участников */}
          <div className="flex items-center group/avatars">
            {filteredParticipants.map((participant, index) => (
              <Tooltip key={participant.id} delayDuration={300}>
                <TooltipTrigger asChild>
                  <div
                    className="transition-all duration-300 ease-out -ml-2 first:ml-0 group-hover/avatars:ml-1 group-hover/avatars:first:ml-0"
                    style={{
                      zIndex: filteredParticipants.length - index,
                    }}
                  >
                    <Avatar className={`${avatarSize} border-2 border-background`}>
                      {participant.userpic && (
                        <AvatarImage
                          src={participant.userpic}
                          alt={getFullName(participant)}
                        />
                      )}
                      <AvatarFallback className={textSize}>
                        {getInitials(participant)}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                </TooltipTrigger>
                <TooltipContent side={tooltipSide}>
                  <p>{getFullName(participant)}</p>
                </TooltipContent>
              </Tooltip>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
