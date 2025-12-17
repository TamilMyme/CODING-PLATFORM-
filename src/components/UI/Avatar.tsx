import React from 'react';

interface AvatarProps {
  name: string;
  email: string;
  imageUrl?: string;
  size?: 'sm' | 'md' | 'lg';
  collapsed?: boolean;
}

const sizeMap = {
  sm: 'w-8 h-8 text-sm',
  md: 'w-12 h-12 text-base',
  lg: 'w-16 h-16 text-lg',
};

const Avatar: React.FC<AvatarProps> = ({ name, email, imageUrl, size = 'md', collapsed }) => {
  const initials = name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="flex items-center gap-3">
      {imageUrl ? (
        <img
          src={imageUrl}
          alt={name}
          className={`rounded-full object-cover ${sizeMap[size]}`}
        />
      ) : (
        <div
          className={`rounded-full flex items-center justify-center text-white font-semibold bg-[#7b1fa2] ${sizeMap[size]}`}
        >
          {initials}
        </div>
      )}
      {!collapsed && <div className="flex flex-col">
        <span className="text-sm font-semibold">{name}</span>
        <span className="text-sm">{email}</span>
      </div>}
    </div>
  );
};

export default Avatar;
