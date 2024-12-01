Steps followed

```
mkdir server
cd server
npm init -y
npm i typescript --save-dev
npx tsc --init
npm i express
npm i @types/express --save-dev
npm install ts-node-dev --save-dev

```

Code snippet

(package.json)
"scripts": {
"dev": "ts-node-dev --respawn server.ts",
"build" : "tsc"
"start": "npm run build && node dist/server.js",
}

(tsconfig )
"rootDir": "./",  
 "outDir": "./dist",

Then we develop the backend
Start with App.ts -> server.ts -> src/

We start with error handling
we use ErrorMiddleware in app.ts
ErrorMiddleware uses ErrorHandler whcih uses Error {statusCode ; constructor, Error.captureStackTrace}