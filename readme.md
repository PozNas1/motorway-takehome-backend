# Steps to run:

1. Install nodeJS (tested using v19.0.1)
   [Download link](https://nodejs.org/en/download)
2. Install Docker:
   [Download link](https://docs.docker.com/get-docker/)
3. To initialize this project, run `docker compose up` from the root of this project. This will build and seed the database. By default the database runs on port `5432` and is also exposed on `5432`, if you want to change this you can update `docker-compose.yml`.
4. Install all dependencies
   `npm i`
5. Run the app!
   `npm run start`

#### PS: if you want to open app in the watch mode use `npm run serve`
