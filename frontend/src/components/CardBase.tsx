import React from "react";
import { outerCard, innerCard } from "./uiTokens";

type OuterProps = {
  children: React.ReactNode;
  innerClassName?: string;
};

export function OuterCard({ children, innerClassName = "" }: OuterProps) {
  return (
    <section className={outerCard}>
      <div className={`${innerCard} ${innerClassName}`}>{children}</div>
    </section>
  );
}
