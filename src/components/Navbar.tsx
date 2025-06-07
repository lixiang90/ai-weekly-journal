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
    <nav className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b px-6 py-4 flex items-center gap-6 shadow-sm">
      <Link
        href="/"
        className={`font-bold text-xl ${
          pathname === "/" ? "text-primary" : "text-foreground"
        } hover:text-primary transition-colors`}
      >
        AI丛刊
      </Link>
      <div className="hidden md:flex items-center gap-6">
        {subjournals.map((name, index) => (
          <Link
            key={index}
            href={`/subjournal/${index}`}
            className={`text-sm font-medium ${
              pathname === `/subjournal/${index}` ? "text-primary" : "text-muted-foreground"
            } hover:text-primary transition-colors`}
          >
            {name}
          </Link>
        ))}
      </div>
      
      <div className="ml-auto flex items-center gap-4">
        <Link href="/submit">
          <Button 
            variant={!session ? "ghost" : "outline"}
            disabled={!session}
            className={!session ? 'opacity-50 cursor-not-allowed' : 'card-hover'}
          >
            投稿
          </Button>
        </Link>
        
        {session?.user?.role === 'admin' && (
          <Link href="/admin">
            <Button variant="outline" className="card-hover">
              管理后台
            </Button>
          </Link>
        )}
        
        {session ? (
          <div className="flex items-center space-x-4">
            <span className="text-sm text-muted-foreground">
              {session.user?.name || session.user?.login || session.user?.email}
            </span>
            <Button variant="ghost" onClick={() => signOut()} className="hover:bg-destructive/10 hover:text-destructive">
              退出
            </Button>
          </div>
        ) : (
          <Link href="/auth/signin">
            <Button className="card-hover">
              登录
            </Button>
          </Link>
        )}
      </div>
    </nav>
  );
}
