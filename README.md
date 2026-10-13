# Fragekatalog India Initiative Real Estate GmbH

Statische Website ohne Server: eine anonyme Umfrage (`index.html`) und eine Auswertung der Schnittmenge (`auswertung.html`).

## 1. Auf GitHub hochladen und als Unterseite veröffentlichen

1. Neues Repository auf github.com anlegen (z. B. `fragekatalog`).
2. Diesen Ordner hochladen: `git remote add origin <URL>` und `git push -u origin main`, oder auf GitHub „uploading an existing file“ nutzen.
3. Repository → Settings → Pages → Branch `main`, Ordner `/ (root)` → Save.
4. Die Seite ist danach erreichbar unter `https://<benutzername>.github.io/fragekatalog/`.
   Hast du eine eigene Domain auf GitHub Pages, liegt sie als Unterseite unter `deine-domain.de/fragekatalog/`.

Hinweis: In einem öffentlichen Repository sind Fragen und Code sichtbar, nie aber die Antworten. Mit GitHub Pro/Team kann das Repository privat bleiben. Die Seiten enthalten `noindex`, tauchen also nicht in Suchmaschinen auf. Den Link nur an die fünf Personen schicken.

## 2. Antworten einsammeln

**Variante A: Supabase (empfohlen, ein Link, vollautomatisch) – bereits eingerichtet, `config.js` ist ausgefüllt**

1. Kostenloses Projekt auf supabase.com anlegen.
2. SQL Editor → Inhalt von `supabase.sql` einfügen → Run.
3. Project Settings → API: `Project URL` und den öffentlichen Key (`anon` bzw. `publishable`) kopieren. Niemals den `service_role` Key verwenden.
4. In `config.js` beides eintragen, committen, pushen.
5. Die Antworten stehen im Table Editor unter `antworten`. Dort „Export → JSON“ wählen und die Datei in `auswertung.html` ziehen. Nur die neutrale Person sollte Zugang zum Supabase-Konto haben.

**Variante B: ohne Dienst**

`config.js` leer lassen. Am Ende lädt jede Person eine `.json` Datei herunter und schickt sie an die neutrale Person. Das ist einfacher, aber weniger anonym (Absender sichtbar).

## 3. Auswerten

`auswertung.html` öffnen (auch lokal per Doppelklick möglich), alle `.json` Dateien hineinziehen. Die Seite zeigt je Frage: Einig, Spanne, Konflikt oder Nie-Veto, und exportiert eine CSV. Freitexte werden gemischt dargestellt. Bei weniger als 3 Antworten warnt sie.

## 4. Fragen ändern

Alle Fragen stehen in `questions.js`. Typen: `text`, `scale`, `single`, `multi`, `matrix`, `matrixscale`.
