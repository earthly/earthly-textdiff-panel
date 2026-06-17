VERSION 0.8
FROM node:25-alpine3.21

deps:
  WORKDIR /diff
  COPY package.json package-lock.json tsconfig.json ./
  RUN --mount=type=cache,target=/root/.npm npm ci
  COPY --dir .config .

src:
  FROM +deps
  COPY LICENSE CHANGELOG.md ./
  COPY --dir src .

dist:
  FROM +src
  RUN npm run build
  SAVE ARTIFACT dist AS LOCAL dist
