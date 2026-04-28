import type { ReactNode } from "react";
import { MapPinned, ShieldCheck, Waves } from "lucide-react";
import { OuterCard } from "../components/CardBase";
import { sectionLabel } from "../components/uiTokens";

function AboutSection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <OuterCard>
      <div className={sectionLabel}>{title}</div>
      <div className="mt-3 space-y-2 text-[14px] leading-6 text-white/74">{children}</div>
    </OuterCard>
  );
}

export function AboutPage() {
  return (
    <div className="mx-auto w-full max-w-md px-1 pb-12 pt-1 text-white sm:max-w-3xl">
      <section className="mb-4 px-1">
        <div className={sectionLabel}>OM</div>
        <p className="mt-3 max-w-[32rem] text-[15px] leading-7 text-white/68">
          HinnerJag hjälper dig snabbt se om du hinner tunnelbanan eller bussen
          innan du går.
        </p>
      </section>

      <div className="space-y-3">
        <AboutSection title="Så fungerar det">
          <div className="flex items-start gap-3">
            <Waves className="mt-0.5 h-4 w-4 shrink-0 text-emerald-300" />
            <p>Vi räknar gångtid till station eller hållplats.</p>
          </div>
          <div className="flex items-start gap-3">
            <Waves className="mt-0.5 h-4 w-4 shrink-0 text-emerald-300" />
            <p>Vi jämför med avgångar i realtid.</p>
          </div>
          <div className="flex items-start gap-3">
            <Waves className="mt-0.5 h-4 w-4 shrink-0 text-emerald-300" />
            <p>Vi visar tydligt: Missar, Gå nu eller Du hinner.</p>
          </div>
        </AboutSection>

        <AboutSection title="Data och API:er">
          <div className="flex items-start gap-3">
            <MapPinned className="mt-0.5 h-4 w-4 shrink-0 text-sky-300" />
            <p>
              Trafikdata:{" "}
              <a
                href="https://www.trafiklab.se/"
                target="_blank"
                rel="noreferrer"
                className="text-sky-300 underline decoration-white/10 underline-offset-4 transition hover:text-sky-200"
              >
                Trafiklab
              </a>{" "}
              och aktuell kollektivtrafikdata.
            </p>
          </div>
          <div className="flex items-start gap-3">
            <MapPinned className="mt-0.5 h-4 w-4 shrink-0 text-sky-300" />
            <p>Plats: webbläsarens geolocation.</p>
          </div>
          <div className="flex items-start gap-3">
            <MapPinned className="mt-0.5 h-4 w-4 shrink-0 text-sky-300" />
            <p>
              Adress:{" "}
              <a
                href="https://www.mapbox.com/"
                target="_blank"
                rel="noreferrer"
                className="text-sky-300 underline decoration-white/10 underline-offset-4 transition hover:text-sky-200"
              >
                Mapbox
              </a>{" "}
              för geocoding och reverse geocoding när det finns tillgängligt.
            </p>
          </div>
        </AboutSection>

        <AboutSection title="Säkerhet och plats">
          <div className="flex items-start gap-3">
            <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-300" />
            <p>Plats används för att visa avgångar nära dig.</p>
          </div>
          <div className="flex items-start gap-3">
            <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-300" />
            <p>Visa inte råa koordinater i UI.</p>
          </div>
          <div className="flex items-start gap-3">
            <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-300" />
            <p>Spara inte plats permanent om det inte behövs.</p>
          </div>
          <div className="flex items-start gap-3">
            <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-300" />
            <p>Använd tydlig fallback om plats saknas.</p>
          </div>
        </AboutSection>
      </div>
    </div>
  );
}

export default AboutPage;
