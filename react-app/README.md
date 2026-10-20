# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some Oxlint rules.

## Digital Shrine data

Inspirationssamlingen kan samlas i [`src/data/shrineEntries.json`](./src/data/shrineEntries.json). Filen börjar som en tom JSON-lista. Lägg till ett objekt per post, med kommatecken mellan objekten:

```json
[
  {
    "id": "music-exempel",
    "category": "music",
    "title": "Titel eller namn",
    "creator": "Artist, författare eller person",
    "kind": "Album, film, bok, lärare ...",
    "formats": ["Live action"],
    "favorite": false,
    "whereToWatch": ["Netflix", "Amazon Prime Video"],
    "whereToWatchChecked": "2026-10-20",
    "description": "Kort, faktabaserad beskrivning av personen eller verket.",
    "note": "En kort personlig notering att visa på kortet.",
    "why": "Varför det här betyder något för mig.",
    "link": "https://example.com",
    "website": "https://example.com",
    "image": "",
    "imageAlt": "",
    "imageSource": "https://example.com"
  }
]
```

- `id` ska vara unikt för varje post, och `category` ska vara ett av: `music`, `films`, `series`, `books`, `creators`, `guides`, `people`.
- `title` är det enda fält som behöver innehåll. Sätt övriga värden till `""` om de inte passar.
- `creator`, `kind`, `description` och `why` beskriver skaparen, formatet/rollen, en kort saklig presentation och din personliga koppling. Håll beskrivningen skild från din personliga `why`-text.
- `formats` är en valfri lista med formatetiketter för serieposter. En post kan ha flera: `Live action`, `Anime`, `Western animation`, `Documentary/Nature`, `Reality/unscripted`, `Stop motion` och `Anthology`. Etiketterna kan användas för filtrering och sortering.
- `favorite` är valfritt och används för statiska favoriter, främst på serieposter. Sätt till `true` i JSON-filen för att lägga till titeln i favoritfiltret; favoriter kan inte ändras från sidan.
- `whereToWatch` är en valfri lista med streamingtjänster för serieposter. Tillgänglighet kan ändras och bör kontrolleras regelbundet; `whereToWatchChecked` anger när den senast kontrollerades. För serier utan verifierad svensk listning visas en neutral text i stället för en gissning.
- `note` är en valfri kort notering som visas separat på kortet när den är ifylld.
- `link` och `website` är valfria länkar. För dessa tre guider visas `link` som YouTube och `website` som Website. Länkar ska börja med `https://` eller `http://`.
- `image` är valfri och kan vara en webbadress eller en sökväg under `public/`, till exempel `/assets/shrine/cover.jpg`. Skriv en beskrivande `imageAlt` om du använder en bild. `imageSource` kan ange var bilden eller bildinformationen kommer ifrån.

Appen visar posterna i JSON-filen på Digital Shrine-sidan. Helt tomma mallposter hoppas över, men varje färdig post behöver ett unikt `id`, en `title` och en giltig `category`. Spotify-länkar till album och artister kan laddas i spelaren ovanför samlingen via knappen “Listen here”. Lägg till eller ändra poster i JSON-filen och publicera ändringen som vanligt. Låt JSON-strukturen vara giltig: använd dubbla citattecken och ta bort kommat efter den sista posten.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the Oxlint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and Oxlint's TypeScript related rules in your project.
