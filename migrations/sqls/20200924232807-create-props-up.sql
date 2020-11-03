-- Create PostGIS extension if it doesn't exist.
CREATE EXTENSION IF NOT EXISTS postgis WITH SCHEMA public;

-- Create properties table.

CREATE TABLE public.props (
    id integer NOT NULL PRIMARY KEY,
    gisid character varying,
    town character varying,
    lat double precision,
    lon double precision,
    prop_addr character varying,
    unit character varying,
    own character varying,
    co character varying,
    own_addr character varying,
    ass_val double precision,
    year character varying,
    sale_d timestamp with time zone,
    sale_p double precision,
    owners character varying,
    clst integer,
    conf double precision,
    count integer,
    geometry public.geometry(Geometry,4326)
);

-- Create spatial index on properties table.

CREATE INDEX idx_props_geometry ON public.props USING GIST (geometry);

-- Create btree index on properties table.

CREATE INDEX ix_public_props_id ON public.props USING btree (id);

-- Set owner to postgres.

ALTER TABLE public.props OWNER TO postgres;

-- Grant selection privileges to reader.

GRANT SELECT ON public.props TO reader;