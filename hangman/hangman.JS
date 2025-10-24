import { generate } from "random-words";
import { input } from '@inquirer/prompts';

// Generera ett slumpmässigt ord
let correctword = generate({ minLength: 1, maxLength: 10 }).toLowerCase();
let strikes = 0;  // Strike-räknare
let maxStrikes = 8; // Maximalt antal strikes
let guessedLetters = []; // Lista för gissade bokstäver
let wordProgress = Array(correctword.length).fill('_'); // Håller koll på framsteg

// Hänga gubbe-funktion
async function hangman() {
    console.log(`Ordet är ${correctword.length} bokstäver långt.`);
    
    while (strikes < maxStrikes && wordProgress.includes('_')) {
        console.log(`Gissat ord hittills: ${wordProgress.join(' ')}`);
        console.log(`Antal fel: ${strikes}/${maxStrikes}`);

        // Be användaren gissa en bokstav
        let guessedLetter = (await input({ message: 'Skriv en bokstav' })).toLowerCase();

        // Kontrollera om användaren redan gissat denna bokstav
        if (guessedLetters.includes(guessedLetter)) {
            console.log(`Du har redan gissat '${guessedLetter}'. Försök igen.`);
            continue;
        }

        // Lägg till gissningen till listan av gissade bokstäver
        guessedLetters.push(guessedLetter);

        // Om den gissade bokstaven finns i ordet
        if (correctword.includes(guessedLetter)) {
            // Uppdatera ordet med korrekt gissade bokstäver
            for (let i = 0; i < correctword.length; i++) {
                if (correctword[i] === guessedLetter) {
                    wordProgress[i] = guessedLetter;
                }
            }

            console.log(`Bra gissat! Bokstaven '${guessedLetter}' finns i ordet.`);
        } else {
            // Om fel gissning, öka strikes
            strikes++;
            console.log(`Fel! Bokstaven '${guessedLetter}' finns inte i ordet.`);
        }
    }

    // Kontrollera om användaren vunnit eller förlorat
    if (!wordProgress.includes('_')) {
        console.log(`Grattis! Du har gissat hela ordet: ${correctword}`);
    } else {
        console.log(`Tyvärr, du har fått 8 fel. Ordet var: ${correctword}`);
    } 
}

// Starta spelet
hangman();
