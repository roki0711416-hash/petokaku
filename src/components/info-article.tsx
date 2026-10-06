import type { ReactNode } from "react";
import { Breadcrumbs } from "@/components/breadcrumbs";

export function InfoArticle({
  title,
  path,
  lead,
  draft = false,
  children,
}: {
  title: string;
  path: string;
  lead: string;
  draft?: boolean;
  children: ReactNode;
}) {
  return (
    <article className="mx-auto max-w-3xl px-4 py-10">
      <Breadcrumbs
        items={[
          { label: "ホーム", href: "/" },
          { label: title, href: path, current: true },
        ]}
      />
      <h1 className="mt-6 text-3xl font-bold md:text-4xl">{title}</h1>
      <p className="mt-4 text-muted">{lead}</p>
      {draft ? (
        <p className="mt-6 rounded-3xl border border-clay/30 bg-sand px-4 py-3 text-sm leading-7">
          この文章は公開前の下書きです。法律の助言ではありません。サイトを公開する前に、実際の運営方法と合っているか確認してください。
        </p>
      ) : null}
      <div className="mt-8 grid gap-4 leading-8">{children}</div>
    </article>
  );
}
