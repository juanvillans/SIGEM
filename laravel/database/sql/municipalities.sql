--
-- PostgreSQL database dump
--

-- Dumped from database version 14.13 (Ubuntu 14.13-0ubuntu0.22.04.1)
-- Dumped by pg_dump version 14.13 (Ubuntu 14.13-0ubuntu0.22.04.1)

-- SET statement_timeout = 0;
-- SET lock_timeout = 0;
-- SET idle_in_transaction_session_timeout = 0;
-- SET client_encoding = 'SQL_ASCII';
-- SET standard_conforming_strings = on;
-- SELECT pg_catalog.set_config('search_path', '', false);
-- SET check_function_bodies = false;
-- SET xmloption = content;
-- SET client_min_messages = warning;
-- SET row_security = off;

-- SET default_tablespace = '';

-- SET default_table_access_method = heap;

-- --
-- -- Name: municipalities; Type: TABLE; Schema: public; Owner: postgres
-- --

-- -- CREATE TABLE public.municipalities (
-- --     id bigint NOT NULL,
-- --     name character varying(255) NOT NULL
-- -- );


-- ALTER TABLE public.municipalities OWNER TO postgres;

-- --
-- -- Name: municipalities_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
-- --

-- CREATE SEQUENCE public.municipalities_id_seq
--     START WITH 1
--     INCREMENT BY 1
--     NO MINVALUE
--     NO MAXVALUE
--     CACHE 1;


-- ALTER TABLE public.municipalities_id_seq OWNER TO postgres;

-- --
-- -- Name: municipalities_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
-- --

-- ALTER SEQUENCE public.municipalities_id_seq OWNED BY public.municipalities.id;


-- --
-- -- Name: municipalities id; Type: DEFAULT; Schema: public; Owner: postgres
-- --

-- ALTER TABLE ONLY public.municipalities ALTER COLUMN id SET DEFAULT nextval('public.municipalities_id_seq'::regclass);


--
-- Data for Name: municipalities; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.municipalities VALUES (1, 'ACOSTA');
INSERT INTO public.municipalities VALUES (2, 'BOLíVAR');
INSERT INTO public.municipalities VALUES (3, 'BUCHIVACOA');
INSERT INTO public.municipalities VALUES (4, 'CACIQUE MANAURE');
INSERT INTO public.municipalities VALUES (5, 'CARIRUBANA');
INSERT INTO public.municipalities VALUES (6, 'COLINA');
INSERT INTO public.municipalities VALUES (7, 'DABAJURO');
INSERT INTO public.municipalities VALUES (8, 'DEMOCRACIA');
INSERT INTO public.municipalities VALUES (9, 'FALCóN');
INSERT INTO public.municipalities VALUES (10, 'FEDERACIóN');
INSERT INTO public.municipalities VALUES (11, 'JACURA');
INSERT INTO public.municipalities VALUES (12, 'LOS TAQUES');
INSERT INTO public.municipalities VALUES (13, 'MAUROA');
INSERT INTO public.municipalities VALUES (14, 'MIRANDA');
INSERT INTO public.municipalities VALUES (15, 'MONSEñOR ITURRIZA');
INSERT INTO public.municipalities VALUES (16, 'PALMASOLA');
INSERT INTO public.municipalities VALUES (17, 'PETIT');
INSERT INTO public.municipalities VALUES (18, 'PíRITU');
INSERT INTO public.municipalities VALUES (19, 'SAN FRANCISCO');
INSERT INTO public.municipalities VALUES (20, 'JOSé LAURENCIO SILVA');
INSERT INTO public.municipalities VALUES (21, 'SUCRE');
INSERT INTO public.municipalities VALUES (22, 'TOCóPERO');
INSERT INTO public.municipalities VALUES (23, 'UNIóN');
INSERT INTO public.municipalities VALUES (24, 'URUMACO');
INSERT INTO public.municipalities VALUES (25, 'ZAMORA');


--
-- -- Name: municipalities_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
-- --

-- SELECT pg_catalog.setval('public.municipalities_id_seq', 25, true);


-- --
-- -- Name: municipalities municipalities_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
-- --

-- ALTER TABLE ONLY public.municipalities
--     ADD CONSTRAINT municipalities_pkey PRIMARY KEY (id);


--
-- PostgreSQL database dump complete
--

