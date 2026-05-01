# HinnerJag

HinnerJag är en webbapp som hjälper dig se om du hinner till tunnelbanan eller bussen innan du går. Fokus är enkelhet: öppna sidan, välj plats eller använd din nuvarande position, och få ett snabbt svar direkt.

Live: [hinnerjag.nu](https://hinnerjag.nu)

## Vad projektet gör

HinnerJag är byggt för att göra kollektivtrafik mer lättöverskådlig i vardagen. Appen visar avgångar nära dig och hjälper dig avgöra om du behöver gå nu, om du hinner i lugn och ro, eller om det börjar bli tajt.

Du kan också planera en resa mellan två platser och få ett enklare beslutsstöd innan du går.

## Funktioner

- Visar avgångar nära din nuvarande plats.
- Hjälper dig hitta närmaste tunnelbana och busshållplatser.
- Planerar resor mellan start och destination.
- Gör en snabb och tydlig bedömning av om du hinner.
- Stödjer adressökning om du inte vill använda din liveposition.

## Så fungerar det

Appen kombinerar din position eller en vald adress med trafikdata och räknar ut vad som är relevant just nu. Målet är inte att visa allt, utan att visa det viktigaste snabbt.

I praktiken betyder det att HinnerJag:

- hämtar platsinformation från webbläsaren när du tillåter det
- söker adresser och platser när du skriver in en destination
- hämtar trafikdata och reseförslag
- jämför gångtid och avgångar för att ge ett tydligt läge

## Verktyg och teknik

Projektet är inte byggt för att kännas tekniskt för användaren, men under huven används några tydliga verktyg:

| Verktyg                 | Vad det används till                          |
| ----------------------- | --------------------------------------------- |
| React                   | Bygger gränssnittet i webben                  |
| TypeScript              | Gör frontend-koden tydligare och mer stabil   |
| Vite                    | Startar och bygger frontend snabbt            |
| Spring Boot             | Driver backend och API:erna                   |
| Java 21                 | Språket bakom backend-logiken                 |
| Trafiklab / SL-data     | Hämtar avgångar och reseinformation           |
| Mapbox                  | Används för adressökning                      |
| Docker & Docker Compose | Gör det enkelt att köra hela projektet lokalt |

## Struktur i korthet

- `frontend/` innehåller webbappen.
- `backend/` innehåller API och logik för avgångar och reseplanering.
- `docker-compose.yml` används för att starta hela projektet tillsammans.

## Köra projektet lokalt

Om du bara vill få igång allt snabbt är Docker enklast:

```bash
docker compose up --build
```

Standardportar:

- Frontend: `http://localhost:3000`
- Backend: `http://localhost:8080`

Om du vill köra delarna var för sig:

```bash
cd backend
./mvnw spring-boot:run
```

```bash
cd frontend
npm install
npm run dev
```

För lokal frontend-utveckling används bland annat dessa miljövariabler:

- `VITE_API_BASE_URL`
- `VITE_MAPBOX_KEY`

## Data och källor

- Trafikdata och reseinformation kommer från Trafiklab / SL.
- Adressökning sker via Mapbox.
- Position hämtas från webbläsarens geolocation när användaren godkänner det.

## Kort beskrivning på engelska

HinnerJag is a web app that helps users quickly see whether they have enough time to catch nearby public transport. It combines live departure data, location-based search, and simple journey planning to make everyday commuting decisions faster and easier.

## Länk

Besök tjänsten här: [hinnerjag.nu](https://hinnerjag.nu)
