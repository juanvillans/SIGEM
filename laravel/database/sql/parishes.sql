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

--
-- Name: parishes; Type: TABLE; Schema: public; Owner: postgres
--

-- CREATE TABLE public.parishes (
--     id bigint NOT NULL,
--     name character varying(255) NOT NULL,
--     municipality_id bigint NOT NULL,
--     created_at timestamp(0) without time zone,
--     updated_at timestamp(0) without time zone
-- );


-- ALTER TABLE public.parishes OWNER TO postgres;

-- --
-- -- Name: parishes_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
-- --

-- -- CREATE SEQUENCE public.parishes_id_seq
-- --     START WITH 1
-- --     INCREMENT BY 1
-- --     NO MINVALUE
-- --     NO MAXVALUE
-- --     CACHE 1;


-- ALTER TABLE public.parishes_id_seq OWNER TO postgres;

-- --
-- -- Name: parishes_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
-- --

-- ALTER SEQUENCE public.parishes_id_seq OWNED BY public.parishes.id;


-- --
-- -- Name: parishes id; Type: DEFAULT; Schema: public; Owner: postgres
-- --

-- ALTER TABLE ONLY public.parishes ALTER COLUMN id SET DEFAULT nextval('public.parishes_id_seq'::regclass);


--
-- Data for Name: parishes; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.parishes VALUES (1, 'CAPADARE', 1, NULL, NULL);
INSERT INTO public.parishes VALUES (2, 'LA PASTORA', 1, NULL, NULL);
INSERT INTO public.parishes VALUES (3, 'LIBERTADOR', 1, NULL, NULL);
INSERT INTO public.parishes VALUES (4, 'SAN JUAN DE LOS CAYOS', 1, NULL, NULL);
INSERT INTO public.parishes VALUES (5, 'ARACUA', 2, NULL, NULL);
INSERT INTO public.parishes VALUES (6, 'LA PEñA', 2, NULL, NULL);
INSERT INTO public.parishes VALUES (7, 'SAN LUIS', 2, NULL, NULL);
INSERT INTO public.parishes VALUES (8, 'BARIRO', 3, NULL, NULL);
INSERT INTO public.parishes VALUES (9, 'BOROJó', 3, NULL, NULL);
INSERT INTO public.parishes VALUES (10, 'VALLE DE EROA', 3, NULL, NULL);
INSERT INTO public.parishes VALUES (11, 'SEQUE', 3, NULL, NULL);
INSERT INTO public.parishes VALUES (12, 'CAPATáRIDA', 3, NULL, NULL);
INSERT INTO public.parishes VALUES (13, 'GUAJIRO', 3, NULL, NULL);
INSERT INTO public.parishes VALUES (14, 'ZAZáRIDA', 3, NULL, NULL);
INSERT INTO public.parishes VALUES (15, 'CACIQUE MANAURE (YARACAL)', 4, NULL, NULL);
INSERT INTO public.parishes VALUES (16, 'NORTE', 5, NULL, NULL);
INSERT INTO public.parishes VALUES (17, 'CARIRUBANA', 5, NULL, NULL);
INSERT INTO public.parishes VALUES (18, 'SANTA ANA', 5, NULL, NULL);
INSERT INTO public.parishes VALUES (19, 'URBANA PUNTA CARDóN', 5, NULL, NULL);
INSERT INTO public.parishes VALUES (20, 'LA VELA DE CORO', 6, NULL, NULL);
INSERT INTO public.parishes VALUES (21, 'ACURIGUA', 6, NULL, NULL);
INSERT INTO public.parishes VALUES (22, 'GUAIBACOA', 6, NULL, NULL);
INSERT INTO public.parishes VALUES (23, 'MATARUCA', 6, NULL, NULL);
INSERT INTO public.parishes VALUES (24, 'LAS CALDERAS', 6, NULL, NULL);
INSERT INTO public.parishes VALUES (25, 'DABAJURO', 7, NULL, NULL);
INSERT INTO public.parishes VALUES (26, 'AGUA CLARA', 8, NULL, NULL);
INSERT INTO public.parishes VALUES (27, 'AVARIA', 8, NULL, NULL);
INSERT INTO public.parishes VALUES (28, 'PEDREGAL', 8, NULL, NULL);
INSERT INTO public.parishes VALUES (29, 'PIEDRA GRANDE', 8, NULL, NULL);
INSERT INTO public.parishes VALUES (30, 'PURURECHE', 8, NULL, NULL);
INSERT INTO public.parishes VALUES (31, 'BARAIVED', 9, NULL, NULL);
INSERT INTO public.parishes VALUES (32, 'ADICORA', 9, NULL, NULL);
INSERT INTO public.parishes VALUES (33, 'BUENA VISTA', 9, NULL, NULL);
INSERT INTO public.parishes VALUES (34, 'JADACAQUIVA', 9, NULL, NULL);
INSERT INTO public.parishes VALUES (35, 'EL VíNCULO', 9, NULL, NULL);
INSERT INTO public.parishes VALUES (36, 'EL HATO', 9, NULL, NULL);
INSERT INTO public.parishes VALUES (37, 'PUEBLO NUEVO', 9, NULL, NULL);
INSERT INTO public.parishes VALUES (38, 'MORUY', 9, NULL, NULL);
INSERT INTO public.parishes VALUES (39, 'ADAURE', 9, NULL, NULL);
INSERT INTO public.parishes VALUES (40, 'AGUA LARGA', 10, NULL, NULL);
INSERT INTO public.parishes VALUES (41, 'INDEPENDENCIA', 10, NULL, NULL);
INSERT INTO public.parishes VALUES (42, 'MAPARARí', 10, NULL, NULL);
INSERT INTO public.parishes VALUES (43, 'CHURUGUARA', 10, NULL, NULL);
INSERT INTO public.parishes VALUES (44, 'EL PAUJí', 10, NULL, NULL);
INSERT INTO public.parishes VALUES (45, 'AGUA LINDA', 11, NULL, NULL);
INSERT INTO public.parishes VALUES (46, 'ARAURIMA', 11, NULL, NULL);
INSERT INTO public.parishes VALUES (47, 'JACURA', 11, NULL, NULL);
INSERT INTO public.parishes VALUES (48, 'LOS TAQUES', 12, NULL, NULL);
INSERT INTO public.parishes VALUES (49, 'JUDIBANA', 12, NULL, NULL);
INSERT INTO public.parishes VALUES (50, 'SAN FéLIX', 13, NULL, NULL);
INSERT INTO public.parishes VALUES (51, 'MENE DE MAUROA', 13, NULL, NULL);
INSERT INTO public.parishes VALUES (52, 'CASIGUA', 13, NULL, NULL);
INSERT INTO public.parishes VALUES (53, 'SANTA ANA', 14, NULL, NULL);
INSERT INTO public.parishes VALUES (54, 'GUZMáN GUILLERMO', 14, NULL, NULL);
INSERT INTO public.parishes VALUES (55, 'MITARE', 14, NULL, NULL);
INSERT INTO public.parishes VALUES (56, 'RíO SECO', 14, NULL, NULL);
INSERT INTO public.parishes VALUES (57, 'SABANETA', 14, NULL, NULL);
INSERT INTO public.parishes VALUES (58, 'SAN ANTONIO', 14, NULL, NULL);
INSERT INTO public.parishes VALUES (59, 'SAN GABRIEL', 14, NULL, NULL);
INSERT INTO public.parishes VALUES (60, 'BOCA DEL TOCUYO', 15, NULL, NULL);
INSERT INTO public.parishes VALUES (61, 'TOCUYO DE LA COSTA', 15, NULL, NULL);
INSERT INTO public.parishes VALUES (62, 'CHICHIRIVICHE', 15, NULL, NULL);
INSERT INTO public.parishes VALUES (63, 'PALMASOLA', 16, NULL, NULL);
INSERT INTO public.parishes VALUES (64, 'CABURE', 17, NULL, NULL);
INSERT INTO public.parishes VALUES (65, 'COLINA', 17, NULL, NULL);
INSERT INTO public.parishes VALUES (66, 'CURIMAGUA', 17, NULL, NULL);
INSERT INTO public.parishes VALUES (67, 'SAN JOSé DE LA COSTA', 18, NULL, NULL);
INSERT INTO public.parishes VALUES (68, 'PíRITU', 18, NULL, NULL);
INSERT INTO public.parishes VALUES (69, 'CAPITAL SAN FRANCISCO MIRIMIRE', 19, NULL, NULL);
INSERT INTO public.parishes VALUES (70, 'TUCACAS', 20, NULL, NULL);
INSERT INTO public.parishes VALUES (71, 'BOCA DE AROA', 20, NULL, NULL);
INSERT INTO public.parishes VALUES (72, 'SUCRE', 21, NULL, NULL);
INSERT INTO public.parishes VALUES (73, 'PECAYA', 21, NULL, NULL);
INSERT INTO public.parishes VALUES (74, 'TOCóPERO', 22, NULL, NULL);
INSERT INTO public.parishes VALUES (75, 'EL CHARAL', 23, NULL, NULL);
INSERT INTO public.parishes VALUES (76, 'LAS VEGAS DEL TUY', 23, NULL, NULL);
INSERT INTO public.parishes VALUES (77, 'SANTA CRUZ DE BUCARAL', 23, NULL, NULL);
INSERT INTO public.parishes VALUES (78, 'BRUZUAL', 24, NULL, NULL);
INSERT INTO public.parishes VALUES (79, 'URUMACO', 24, NULL, NULL);
INSERT INTO public.parishes VALUES (80, 'PUERTO CUMAREBO', 25, NULL, NULL);
INSERT INTO public.parishes VALUES (81, 'LA CIéNAGA', 252, NULL, NULL);
INSERT INTO public.parishes VALUES (82, 'LA SOLEDAD', 25, NULL, NULL);
INSERT INTO public.parishes VALUES (83, 'PUEBLO CUMAREBO', 25, NULL, NULL);
INSERT INTO public.parishes VALUES (84, 'ZAZáRIDA', 25, NULL, NULL);


--
-- Name: parishes_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

-- SELECT pg_catalog.setval('public.parishes_id_seq', 84, true);


-- --
-- -- Name: parishes parishes_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
-- --

-- ALTER TABLE ONLY public.parishes
--     ADD CONSTRAINT parishes_pkey PRIMARY KEY (id);


-- --
-- PostgreSQL database dump complete
--

