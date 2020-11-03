# Tenant Power

## Set up for development

- After cloning this repo to your computer, run `npm install`.
- Install PostGIS if you don't have it already. You can find installation instructions for most platforms [at the PostGIS website](https://postgis.net/install) under the "binary installers" heading.
- Ensure you have a Postgres server running.
- Create the development database with `createdb landlords`
- Create a `database.json` file with the connection details for your local database. Mine, for example, looks like this:
```json
{
  "dev": {
    "driver": "pg",
    "user": "postgres",
    "password": "postgres",
    "host": "localhost",
    "database": "landlords",
    "port": "5432",
    "ssl": false,
    "schema": "public"
  }
}
```
- Run `npm run migrate-dev` to migrate the database.
- There is a coresponding command for migrating the production database, `npm run migrate-prod`. This requires that the `database.json` file be expanded to include a 'prod' object, like so:
```json
{
  "dev": {
    ...
  },
  "prod": {
    "driver": "pg",
    "user": "postgres",
    "password": "postgres",
    "host": "localhost",
    "database": "landlords",
    "port": "5432",
    "ssl": false,
    "schema": "public"
  }
}
```
- Grab the [sample data](https://tenantpower.org/files/props.sql) and dump it into your development database with `psql -h localhost -d landlords -f props.sql`. This sample data covers only the City of Somerville. If you're using your own Postgres installation you may need to change the arguments to connect to the right database.
- Start the server: `node landlords.js`
- Start a server for the frontend with `npm run start`
