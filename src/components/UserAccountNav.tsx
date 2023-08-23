'use client';

import { User } from '@prisma/client';
import React from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@radix-ui/react-dropdown-menu';
import Link from 'next/link';
import { signOut } from 'next-auth/react';
import { Button } from './ui/button';
import { LogOut } from 'lucide-react';
import UserAvatar from './UserAvatar';

type Props = {
  user: Pick<User, 'name' | 'image' | 'email'>;
};

const UserAccountNav = ({ user }: Props) => {
  return (
    <DropdownMenu>
      {/* TODO:select the best height */}
      <DropdownMenuTrigger className="h-10 w-10">
        {/* user avatar */}
        <UserAvatar user={user} />
        <DropdownMenuContent className="bg-white" align="end">
          <div className="flex items-center justify-start gap-2 p-2">
            <div className="flex flex-col space-y-1 leading-none">
              {user.name && <p className="font-medium">{user.name}</p>}
              {user.email && (
                <p className="w-[200px] truncate text-sm text-zinc-700">
                  {user.email}
                </p>
              )}
            </div>
          </div>

          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <Link href="/">More</Link>
          </DropdownMenuItem>

          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={e => {
              e.preventDefault();
              signOut().catch(console.error);
            }}
            className="inline-flex items-center text-red-600 cursor-pointer"
          >
            Sign Out
            <LogOut className="w-4 h-4 ml-2" />
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenuTrigger>
    </DropdownMenu>
  );
};

export default UserAccountNav;
