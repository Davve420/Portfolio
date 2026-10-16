# Nasta gang: React och design

Det viktigaste att komma ihag:

- `App.jsx` bestammer vilken struktur som visas.
- `siteContent.js` innehaller text, lankar och data.
- `App.css` bestammer hur strukturen ser ut.

## Var borjar jag designa?

Startsidan finns i `SpaceLandingPage` i `src/App.jsx`.

De viktigaste CSS-klasserna ar:

- `.space-intro` - valkomsttexten
- `.space-prompt` - den korta introduktionen
- `.portal-grid` - placeringen av de tre portalerna
- `.portal-card` - varje portal som helhet
- `.portal-image` - GIF-bilden i portalen

Om du andrar `padding`, `gap`, `font-size`, `filter` eller `transform` i dessa klasser kan du direkt se hur layouten och kanslan andras.

## Hur fungerar en portal?

I `siteContent.js` finns en portal som data:

```js
{
  id: 'music',
  title: 'Digital bedroom',
  image: '/assets/portals/digiportal.gif'
}
```

`PortalCard` i `App.jsx` laser datan och skriver ut HTML for varje portal. Det betyder att samma komponent kan visa alla tre portaler utan att vi behover skriva samma markup tre ganger.

## Hur byter en lank route?

En lank som `href="#about"` andrar hash-delen av URL:en.

`useHashRoute()` laser hash-vardet och `App()` valjer sedan ratt komponent:

```jsx
route === 'about' ? <AboutPage /> : <SpaceLandingPage />
```

Det ar appens enkla navigationssystem.

## Bra arbetsordning

1. Skriv om en text i `siteContent.js` sa att den later som du.
2. Andra en liten CSS-sak i `App.css`.
3. Starta appen med `npm run dev` fran `react-app`-mappen.
4. Kontrollera mobilen och desktop.
5. Gor sedan nasta lilla andring.

## Text att arbeta med forst

Borstja med dessa delar i `siteContent.js`:

- `space.intro`
- `space.subtext`
- `about.intro`
- `about.story`
- `about.identity`
- `about.reflection`

Fragan for varje text ar: "Skulle jag saga detta till en riktig person?" Om svaret ar nej, skriv om den med enklare ord och en konkretare tanke.

## Nasta konkreta designovning

Andra bara dessa tre saker och titta pa resultatet:

```css
.space-intro h1 {
  font-size: 4rem;
  text-shadow: 0 0 28px rgba(255, 255, 255, 0.18);
}

.portal-grid {
  gap: 3rem;
}

.portal-card:hover .portal-image {
  transform: translateY(-8px) scale(1.06);
}
```

Aterstall sedan om du inte gillar resultatet. Malet ar att lara sig vilken regel som styr vilken del.
