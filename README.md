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

- Run `npm run migrate` to migrate the database.
- Grab the sample data from (insert location here) and dump it into your development database with `psql -d landlords -f sample_data.sql` (if you're using your own Postgres installation you may need to change the arguments to connect to the right database).
- Start the server: `node landlords.js`
- Start a server for the frontend with `npm run start`
