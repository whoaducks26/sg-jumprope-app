hi. idk if this works well enough but we ball\
https://sg-jumprope-app.vercel.app/

# Features
1. View events, see what is it about, who is involved etc\
*if u have reccs lmk <3

## User access
1. Sign up, can ignore the verification email for now i havent fixed it yet
2. Sign in !

## Admin access
1. Same as user
2. I will manually update you as admin in my db so lmk when u create ur acc
3. Able to create events, add users who are involved etc (untested)


### notes / to do
- ui everything i will fix (maybe.. i hope i do)
- everything above
- change name/logo etc


### installation guide (dev)
this is if ur cloning this into vscode etc & running locally
0. install node/npm (recommended: nvm)
```bash
curl -fsSL https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"
nvm install --lts
```

1. create `.env.local` in the project root:
```bash
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
```

2. npm install
2. check for these files:
```
  1. tailwind.config.js
  2. postcss.config.js
  3. vite.config.js
```
4. check css file has these:
```
  @tailwind base;
  @tailwind components;
  @tailwind utilities;
```
5. npm run dev
open `http://localhost:5173`

### troubleshooting
- if it gets stuck on "Loading...": check DevTools console + verify `.env.local` has the two `VITE_SUPABASE_*` values above, then restart `npm run dev`
<br>
if u want admin access to test lmk !
