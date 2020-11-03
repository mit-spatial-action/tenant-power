const creds = require('./database.json'),
    fs = require("fs"),
    path = require('path')

const pg = require('pg')
pg.defaults.ssl = true;
const Pool = pg.Pool;

const pool = new Pool({
    user: creds.dev.user,
    host: creds.dev.host,
    database: creds.dev.database,
    password: creds.dev.password,
    port: creds.dev.port,
    ssl: {
        rejectUnauthorized: false
        // ca: fs.readFileSync(path.join(__dirname, 'cert/ca-certificate.crt')).toString()
    }
})

const getPropsByClst = (request, response) => {
    const clst = parseInt(request.params.clst)
    const query = `SELECT json_build_object(
        'type', 'FeatureCollection',
        'features', json_agg(ST_AsGeoJSON(t.*)::json)
        ) AS geojson
    FROM (
        SELECT p.* FROM props AS p WHERE clst=$1 ORDER BY clst ASC
    ) AS t;`
    pool.query(query, [clst], (error, results) => {
        if (error) {
            throw error
        }
        response.status(200).json(results.rows[0].geojson);
    })
}

const getPropsByLoc = (request, response) => {
    const lng = parseFloat(request.params.lng)
    const lat = parseFloat(request.params.lat)
    const cnt = parseFloat(request.params.cnt)
    const query = `SELECT json_build_object(
        'type', 'FeatureCollection',
        'features', json_agg(ST_AsGeoJSON(t.*)::json)
        ) AS geojson
    FROM ( 
        SELECT *, st_distance(ST_Transform(geometry, 2249), ST_Transform(ST_SetSRID(ST_Point($1, $2), 4326), 2249)) as d
        FROM props AS p
        ORDER BY ST_Transform(geometry, 2249) <-> ST_Transform(ST_SetSRID(ST_Point($1, $2), 4326), 2249) LIMIT $3) AS t
    WHERE t.d <= 100;`
    pool.query(query, [lng, lat, cnt], (error, results) => {
        if (error) {
            throw error
        }
        response.status(200).json(results.rows[0].geojson);
    })
}

module.exports = {
    getPropsByClst,
    getPropsByLoc,
}