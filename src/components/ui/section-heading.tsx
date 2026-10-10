export function SectionHeading({
  id,
  eyebrow,
  title,
  lead,
}: {
  id?: string;
  eyebrow?: string;
  title: string;
  lead?: string;
}) {
  return (
    <div className="max-w-2xl">
      {eyebrow ? <p className="text-sm tracking-[0.16em] text-muted">{eyebrow}</p> : null}
      <h2 id={id} className="mt-2 text-2xl leading-tight font-medium tracking-tight text-ink md:text-3xl">
        {title}
      </h2>
      {lead ? <p className="mt-3 text-sm leading-7 text-muted md:text-base">{lead}</p> : null}
    </div>
  );
}
