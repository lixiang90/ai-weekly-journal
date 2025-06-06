'use client';

import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const subjournals = ["文史哲", "社科", "理科", "数学"];

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50 p-6">
      <h1 className="text-4xl font-bold text-center mb-6">AI丛刊</h1>
      <p className="text-center text-gray-600 mb-10">接受AI生成文章投稿</p>

      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        {subjournals.map((title, i) => (
          <Card key={i} className="rounded-2xl shadow-md">
            <CardContent className="p-4">
              <h2 className="text-xl font-semibold mb-2">{title} 子刊</h2>
              <p className="text-sm text-gray-500 mb-4">查看最新一期文章和往期存档。</p>
              <Button asChild className="w-full">
                <Link href={`/subjournal/${i}`}>进入子刊</Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </section>
    </main>
  );
}

