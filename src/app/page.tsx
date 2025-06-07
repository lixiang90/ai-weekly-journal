'use client';

import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const subjournals = ["文史哲", "社科", "理科", "数学"];
const subColors = ["from-blue-500 to-purple-500", "from-green-500 to-teal-500", "from-orange-500 to-red-500", "from-pink-500 to-purple-500"];

export default function Home() {
  return (
    <main className="min-h-screen bg-background p-6 md:p-10">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-5xl md:text-6xl font-bold mb-4 gradient-heading">AI丛刊</h1>
          <p className="text-xl text-muted-foreground mb-8">接受AI生成文章投稿</p>
        </div>

        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          {subjournals.map((title, i) => (
            <Card key={i} className="rounded-2xl shadow-md overflow-hidden card-hover border-t-4" style={{ borderTopColor: `var(--${i === 0 ? 'primary' : i === 1 ? 'accent' : i === 2 ? 'destructive' : 'ring'})` }}>
              <div className={`h-2 bg-gradient-to-r ${subColors[i]}`}></div>
              <CardContent className="p-6">
                <h2 className="text-2xl font-semibold mb-3">{title} 子刊</h2>
                <p className="text-muted-foreground mb-6">查看最新一期文章和往期存档。</p>
                <Button asChild className="w-full">
                  <Link href={`/subjournal/${i}`}>进入子刊</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </section>

        <section className="mt-16 text-center">
          <h2 className="text-2xl font-semibold mb-4">关于AI丛刊</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto mb-8">
            AI丛刊是一个专注于展示AI生成内容的平台，我们接受各个领域的AI生成文章投稿。
            通过我们的平台，您可以浏览不同学科领域的AI创作，体验人工智能在内容创作方面的能力。
          </p>
        </section>
      </div>
    </main>
  );
}

