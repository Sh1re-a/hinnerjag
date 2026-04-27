import React from "react";
import { outerCard } from "./uiTokens";

type OuterProps = {
  children: React.ReactNode;
  innerClassName?: string;
};

export function OuterCard({ children, innerClassName = "" }: OuterProps) {
  return <section className={`${outerCard} ${innerClassName}`}>{children}</section>;
}
