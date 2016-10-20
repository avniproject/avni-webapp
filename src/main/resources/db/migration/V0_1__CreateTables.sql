CREATE TABLE concept (
    id bigint NOT NULL,
    data_type character varying(255) NOT NULL,
    high_absolute double precision NOT NULL,
    high_normal double precision NOT NULL,
    low_absolute double precision NOT NULL,
    low_normal double precision NOT NULL,
    name character varying(255) NOT NULL,
    uuid character varying(255) NOT NULL
);
ALTER TABLE concept OWNER TO openchs;


CREATE TABLE followup_type (
    id bigint NOT NULL,
    name character varying(255) NOT NULL,
    concept_id bigint
);
ALTER TABLE followup_type OWNER TO openchs;

CREATE TABLE gender (
    id bigint NOT NULL,
    name character varying(255) NOT NULL,
    concept_id bigint
);
ALTER TABLE gender OWNER TO openchs;

CREATE SEQUENCE hibernate_sequence
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
ALTER TABLE hibernate_sequence OWNER TO openchs;

CREATE TABLE individual (
    id bigint NOT NULL,
    address JSONB,
    catchment_id bigint,
    date_of_birth date NOT NULL,
    date_of_birth_estimated boolean NOT NULL,
    name character varying(255) NOT NULL,
    profile JSONB,
    gender_id bigint NOT NULL
);
ALTER TABLE individual OWNER TO openchs;

CREATE TABLE individual_program_summary (
    id bigint NOT NULL,
    encounters JSONB,
    enrolment_date_time timestamp without time zone NOT NULL,
    program_id bigint NOT NULL,
    program_outcome_id bigint
);
ALTER TABLE individual_program_summary OWNER TO openchs;

CREATE TABLE observation_group (
    id bigint NOT NULL,
    encounter_time timestamp without time zone,
    observations bytea,
    individual_id bigint NOT NULL
);
ALTER TABLE observation_group OWNER TO openchs;

CREATE TABLE program (
    id bigint NOT NULL,
    name character varying(255) NOT NULL,
    concept_id bigint
);
ALTER TABLE program OWNER TO openchs;

CREATE TABLE program_outcome (
    id bigint NOT NULL,
    name character varying(255) NOT NULL,
    program_id bigint NOT NULL
);
ALTER TABLE program_outcome OWNER TO openchs;

CREATE TABLE users (
    id bigint NOT NULL
);
ALTER TABLE users OWNER TO openchs;


ALTER TABLE ONLY concept
    ADD CONSTRAINT concept_pkey PRIMARY KEY (id);
ALTER TABLE ONLY followup_type
    ADD CONSTRAINT followup_type_pkey PRIMARY KEY (id);
ALTER TABLE ONLY gender
    ADD CONSTRAINT gender_pkey PRIMARY KEY (id);
ALTER TABLE ONLY individual
    ADD CONSTRAINT individual_pkey PRIMARY KEY (id);
ALTER TABLE ONLY individual_program_summary
    ADD CONSTRAINT individual_program_summary_pkey PRIMARY KEY (id);
ALTER TABLE ONLY observation_group
    ADD CONSTRAINT observation_group_pkey PRIMARY KEY (id);
ALTER TABLE ONLY program_outcome
    ADD CONSTRAINT program_outcome_pkey PRIMARY KEY (id);
ALTER TABLE ONLY program
    ADD CONSTRAINT program_pkey PRIMARY KEY (id);
ALTER TABLE ONLY users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);
ALTER TABLE ONLY individual_program_summary
    ADD CONSTRAINT individual_program_summary_program FOREIGN KEY (program_id) REFERENCES program(id);
ALTER TABLE ONLY observation_group
    ADD CONSTRAINT observation_group_individual FOREIGN KEY (individual_id) REFERENCES individual(id);
ALTER TABLE ONLY gender
    ADD CONSTRAINT gender_concept FOREIGN KEY (concept_id) REFERENCES concept(id);
ALTER TABLE ONLY individual_program_summary
    ADD CONSTRAINT individual_program_summary_program_outcome FOREIGN KEY (program_outcome_id) REFERENCES program_outcome(id);
ALTER TABLE ONLY program_outcome
    ADD CONSTRAINT program_outcome_program FOREIGN KEY (program_id) REFERENCES program(id);
ALTER TABLE ONLY followup_type
    ADD CONSTRAINT followup_type_concept FOREIGN KEY (concept_id) REFERENCES concept(id);
ALTER TABLE ONLY individual
    ADD CONSTRAINT individual_gender FOREIGN KEY (gender_id) REFERENCES gender(id);
ALTER TABLE ONLY program
    ADD CONSTRAINT program_concept FOREIGN KEY (concept_id) REFERENCES concept(id);