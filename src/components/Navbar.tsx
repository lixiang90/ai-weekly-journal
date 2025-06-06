// src/components/Navbar.tsx
"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from 'next-auth/react';
import { Button } from '@/components/ui/button';

const subjournals = ["文史哲", "社科", "理科", "数学"];

export default function Navbar() {
  const pathname = usePathname();
  const { data: session } = useSession();

  return (
    <nav className="sticky top-0 z-50 bg-white shadow-sm border-b px-6 py-3 flex items-center gap-6">
      <Link
        href="/"
        className={`font-bold text-lg ${
          pathname === "/" ? "text-blue-600" : "text-gray-800"
        }`}
      >
        AI丛刊
      </Link>
      {subjournals.map((name, index) => (
        <Link
          key={index}
          href={`/subjournal/${index}`}
          className={`text-sm ${
            pathname === `/subjournal/${index}` ? "text-blue-600 font-medium" : "text-gray-600"
          } hover:text-blue-500`}
        >
          {name}
        </Link>
      ))}
      
      <div className="ml-auto flex items-center gap-4">
        <Link href="/submit">
          <Button 
            variant="outline" 
            disabled={!session}
            className={!session ? 'opacity-50 cursor-not-allowed' : ''}
          >
            投稿
          </Button>
        </Link>
        
        {session?.user?.role === 'admin' && (
          <Link href="/admin">
            <Button variant="outline">
              管理后台
            </Button>
          </Link>
        )}
        
        {session ? (
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600">
              {session.user?.name || session.user?.login || session.user?.email}
            </span>
            <Button variant="ghost" onClick={() => signOut()}>
              退出
            </Button>
          </div>
        ) : (
          <Link href="/auth/signin">
            <Button>
              登录
            </Button>
          </Link>
        )}
      </div>
    </nav>
  );
}
