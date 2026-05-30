# ToDo (React Native + Expo)

A simple mobile to-do app with **My Day**, **Tomorrow**, and **repeating tasks**.

## Features

- **My Day** — tasks scheduled for today (one-time due today, or recurring rules that match today)
- **Tomorrow** — tasks scheduled for tomorrow
- **Repeat** — daily, weekdays, weekends, once a week, selected weekdays, or selected days of the month

Tasks are stored locally with AsyncStorage.

## Deploy to Vercel (use on iPhone via Safari)

1. Push this repo to GitHub and connect it on [vercel.com](https://vercel.com).
2. Vercel reads `vercel.json` automatically:
   - **Build:** `npx expo export -p web`
   - **Output:** `dist`
3. Open your `*.vercel.app` URL in **Safari** → **Share** → **Add to Home Screen**.

If the site downloads a file instead of showing the app, redeploy after pulling the latest commit (must include `vercel.json`).

## Run on your phone

1. Install dependencies (already done if you cloned after setup):

   ```bash
   npm install
   ```

2. Start the dev server:

   ```bash
   npm start
   ```

3. Install **Expo Go** on your Android or iOS device.
4. Scan the QR code from the terminal (same Wi‑Fi as your PC).

## Scripts

| Command        | Description              |
|----------------|--------------------------|
| `npm start`    | Expo dev server          |
| `npm run android` | Open on Android emulator |
| `npm run web`  | Run in browser (limited) |

## Project layout

```
src/
  types/task.ts       — Task & recurrence types
  utils/dates.ts      — Date helpers
  utils/recurrence.ts — When a task appears on a date
  storage/tasks.ts    — AsyncStorage
  context/TaskContext.tsx
  components/         — UI pieces
  screens/HomeScreen.tsx
```
