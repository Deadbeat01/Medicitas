import type { ReactNode } from "react";

interface PageHeadingProps {
  eyebrow: ReactNode;
  title: ReactNode;
  description: ReactNode;
}

export default function PageHeading({
  eyebrow,
  title,
  description,
}: PageHeadingProps) {
  return (
    <div className="page-heading">
      <span className="eyebrow">{eyebrow}</span>
      <h1>{title}</h1>
      <p>{description}</p>
    </div>
  );
}
