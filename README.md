# Mariuszu, 120 lat!

Urodzinowa kartka dla Mariusza, z okazji 60. urodzin. Osiem animowanych ekranów, życzenia od Marty i Dominika i romantyczny wieczór dla Mariusza i Gosi w Winnicach Jaworek.

## Strona

Lekki HTML, CSS i JavaScript. Bez bundlera, frameworków, analityki i zewnętrznych zapytań przy otwieraniu strony. Fonty Cormorant Garamond i Hanken Grotesk są przechowywane lokalnie. Obrazy WebP; zdjęcie finału ładowane dopiero przed jego otwarciem. Animowane są wyłącznie przezroczystość i przesunięcie. Obsługa `prefers-reduced-motion`, klawiatury, gestów i przycisku Wstecz przeglądarki. Długie ekrany można przewijać; strona działa także bez JavaScript.

## Publikacja na GitHub Pages

1. Utwórz repozytorium `mariusz` i wyślij te pliki do gałęzi `main`.
2. W repozytorium wybierz **Settings → Pages → Build and deployment → Source → GitHub Actions**.
3. Uruchom workflow **Publish birthday card** w zakładce **Actions**. Kolejne zmiany gałęzi `main` publikują się automatycznie.

Adres strony poda ukończony workflow, zwykle `https://NAZWA-KONTA.github.io/mariusz/`.

Workflow tworzy QR na podstawie rzeczywistego adresu skonfigurowanego przez GitHub Pages. Po publikacji pliki do wydruku są dostępne pod `ADRES-STRONY/qr/mariusz-60-qr.png` i `ADRES-STRONY/qr/mariusz-60-qr.svg`. QR otwiera pierwszy ekran, nie repozytorium ani ostatni slajd. PNG/SVG zawierają biały margines wymagany przy skanowaniu. Nie przycinaj go przy wydruku; zalecana szerokość minimum 3 cm.

## Zdjęcia rodzinne

Zdjęcia są zapisane jako zmniejszone pliki WebP w `assets/photos/`. Pięć zdjęć jest w galerii podróży, trzy w części rodzinnej, a jedno w części o strzelnicy. Galerie pokazują zdjęcia obok siebie i można je przewijać na telefonie. Obrazy rodzinne są ładowane dopiero po otwarciu odpowiedniego rozdziału. Ścieżki, opisy i rozmiary zdjęć znajdują się w `index.html`.

## Pełny ekran

Strona próbuje uruchomić pełny ekran przy otwarciu. Jeśli przeglądarka wymaga aktywności użytkownika, ponawia próbę po kliknięciu „Otwórz życzenia”. Przycisk „Pełny ekran” pozwala wejść ręcznie, a „Zmniejsz” wyjść. Przycisk jest ukryty, jeśli przeglądarka nie obsługuje tego trybu. Odmowa nie blokuje czytania kartki.

## Dane prezentu

Zakres: zwiedzanie winiarni i piwniczki, czterodaniowa kolacja, komentowana degustacja pięciu win podczas kolacji i dedykowany opiekun. Rok ważności od daty wystawienia oraz wcześniejsza rezerwacja telefoniczna. Bez kwoty, numeru zamówienia i kodu realizacyjnego. Data zakupu ze screena nie została użyta jako data wystawienia.

Kartka jest oprawą prezentu. Realizacja wymaga oryginalnego vouchera od Winnic Jaworek. Telefon oraz adres zostały sprawdzone na oficjalnej stronie. Aktualne warunki: https://www.winnicejaworek.pl/sklep/romantyczny-wieczor-w-winnicach-jaworek-dla-dwoch-osob/

## Weryfikacja

```sh
node --check app.js
node --check content.js
python scripts/check_site.py
```

Nie deklarujemy wyniku Google PageSpeed przed pomiarem opublikowanej strony. Kod przygotowano z myślą o szybkim pierwszym otwarciu na telefonie.

## Materiały

Fotografie pochodzą z oficjalnej strony Winnic Jaworek i służą oprawie prywatnego prezentu:

- `vineyard.webp`: https://www.winnicejaworek.pl/wp-content/uploads/2025/11/winnica.jpg
- `dinner.webp`: https://www.winnicejaworek.pl/wp-content/uploads/2025/04/Frame-910.jpg

Prawa do fotografii należą do ich właścicieli. Licencje OFL lokalnych fontów są w `assets/fonts/`.
