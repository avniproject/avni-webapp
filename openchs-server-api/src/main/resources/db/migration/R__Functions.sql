DROP FUNCTION IF EXISTS create_db_user(inrolname text, inpassword text);
CREATE OR REPLACE FUNCTION create_db_user(inrolname text, inpassword text)
  RETURNS BIGINT AS
$BODY$
  BEGIN
    IF NOT EXISTS(SELECT rolname FROM pg_roles WHERE rolname = inrolname)
    THEN
      EXECUTE 'CREATE ROLE ' || quote_ident(inrolname) || ' NOINHERIT LOGIN PASSWORD ' || quote_literal(inpassword);
    END IF;
    EXECUTE 'GRANT ' || quote_ident(inrolname) || ' TO openchs';
    PERFORM grant_all_on_all(inrolname);
    RETURN 1;
  END
$BODY$ LANGUAGE PLPGSQL;

CREATE OR REPLACE FUNCTION jsonb_object_values_contain(obs JSONB, pattern TEXT)
  RETURNS BOOLEAN AS $$
BEGIN
  return EXISTS (select true from jsonb_each_text(obs) where value ilike pattern);
END;
$$
LANGUAGE plpgsql IMMUTABLE;

CREATE OR REPLACE FUNCTION create_audit(user_id NUMERIC)
  RETURNS INTEGER AS $$
DECLARE result INTEGER;
BEGIN
  INSERT INTO audit(created_by_id, last_modified_by_id, created_date_time, last_modified_date_time)
  VALUES(user_id, user_id, now(), now()) RETURNING id into result;
  RETURN result;
END $$
  LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION create_audit()
  RETURNS INTEGER AS 'select create_audit(1)' language sql;

  CREATE OR REPLACE FUNCTION get_observation_pattern(
      tablealise text,
      uuidkey text,
      valuetxt text)
    RETURNS text AS
  $BODY$
  DECLARE
     returnSql text;
     values text[];
     uuidTxt text;
     arrayLength integer;
     iteration integer;
  BEGIN
  iteration:=0;
   select string_to_array(valueTxt, ',') into values;
  SELECT array_length(values, 1)into arrayLength;

  returnSql:=' AND ( ';

          FOREACH uuidTxt IN ARRAY values
     LOOP
       select replace(uuidTxt,'"','') into uuidTxt;
        returnSql:=returnSql || trim(tableAlise) || '.observations ->>  ' ||''''|| trim(uuidkey) ||''''|| ' like ' || '''' || '%' || trim(uuidTxt) ||'%'||'''';
  		IF  (iteration<(arrayLength-1)) THEN
  		returnSql:=returnSql || ' OR ';

  		END IF;
        iteration:=iteration+1;
     END LOOP;
     returnSql:=returnSql || ' ) ';
          RETURN returnSql;
  END;
  $BODY$
    LANGUAGE plpgsql;


CREATE OR REPLACE FUNCTION get_outer_query(searchjson text)
  RETURNS text AS
$BODY$
DECLARE
   sqlOuterQuery text;
   pageNumber integer;
numberOfRecordPerPage integer;
sortColumn text;
sortOrder text;
pageElement json;
limitVal numeric;
offsetVal numeric;
tempVal text;

BEGIN

offsetVal:=0;
limitVal:=10;
sqlOuterQuery:='';
select searchJSON::json->>'pageElement' into pageElement;

	IF pageElement IS NOT NULL   THEN

		select pageElement->>'pageNumber' into tempVal;

			IF tempVal IS NOT NULL AND TRIM(tempVal)!='' THEN
			pageNumber:=tempVal::NUMERIC;
			ELSE
			pageNumber:=1;
			END IF;

		select pageElement->>'numberOfRecordPerPage' into tempVal;

			IF tempVal IS NOT NULL AND TRIM(tempVal)!='' THEN
			numberOfRecordPerPage:=tempVal::NUMERIC;
			ELSE
			numberOfRecordPerPage:=10;
			END IF;

			select pageElement->>'sortColumn' into tempVal;

			IF tempVal IS NOT NULL AND TRIM(tempVal)!='' AND TRIM(UPPER(tempVal))='ID' THEN
			sortColumn:=tempVal||'::NUMERIC ' ;
			ELSEIF tempVal IS NOT NULL AND TRIM(upper(tempVal))=upper('fullName') THEN
			sortColumn:='fullname';
			ELSEIF tempVal IS NOT NULL AND TRIM(upper(tempVal))=upper('subjectType') THEN
			sortColumn:='subject_type_name';
			ELSEIF tempVal IS NOT NULL AND TRIM(upper(tempVal))=upper('gender') THEN
			sortColumn:='gender_name';
			ELSEIF tempVal IS NOT NULL AND TRIM(upper(tempVal))=upper('dateOfBirth') THEN
			sortColumn:='date_of_birth::DATE';
			ELSEIF tempVal IS NOT NULL AND TRIM(upper(tempVal))=upper('addressLevel') THEN
			sortColumn:='title_lineage';
			ELSE
			sortColumn:='firstname';
			END IF;

			select pageElement->>'sortOrder' into tempVal;
			IF tempVal IS NOT NULL AND TRIM(tempVal)!='' THEN
			sortOrder:=tempVal;
			ELSE
			sortOrder:=' DESC ';
			END IF;

				ELSE
				numberOfRecordPerPage:=10;
				pageNumber:=1;
				sortColumn:='firstname';
				sortOrder:=' DESC ';

			END IF;
	    limitVal:=numberOfRecordPerPage::numeric;
		offsetVal:=(pageNumber::numeric*limitVal)-limitVal;
	    sqlOuterQuery:=' SELECT * FROM  ( TABLE  cte  ORDER  BY cte.'||trim(sortColumn) ||' '||sortOrder||'  LIMIT '|| limitVal ||' OFFSET '|| offsetVal  ||' ) sub RIGHT  JOIN (SELECT count(*) FROM cte) c(total_elements) ON true ';
        RETURN sqlOuterQuery;
END;
$BODY$
  LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION web_search_function(IN searchtext text)
  RETURNS TABLE(id text, firstname text, lastname text, fullname text, uuid text, title_lineage text, subject_type_name text, gender_name text, date_of_birth date, enrolments text, age numeric, total_elements bigint) AS
$BODY$
DECLARE
sqlQuery text;
sqlQueryBase text;
sqlQueryJoins text;
sqlOuterQuery text;
searchJSON JSONB;
textArray  text;
_key   text;
_value text;
whereClause text;
minDate text;
maxDate  text;
valueTxt text;
uuidKey text;
textConceptObj text;
registrationDateVal JSONB;
searchScope text;
conceptDataType text;
searchAll text;
widgetType text;
minValue text;
maxValue  text;
BEGIN

whereClause:=' where true=true ';
select searchText::JSONB into searchJSON;-- to cast json text to jsonb object
sqlQueryBase:='select distinct ind.id::text as id, ind.first_name::text as firstname ,ind.last_name::text as lastname,concat(ind.first_name,'' '',ind.last_name)::text as fullname,ind.uuid::text as uuid,tlv.title_lineage::text as title_lineage ,st.name::text as subject_type_name,gender.name ::text as gender_name,ind.date_of_birth::date as date_of_birth,enrolments.program_name::text as enrolments, date_part(''year''::text, age(now(), ind.date_of_birth::timestamp with time zone))::numeric as age   from individual ind ';
sqlQueryJoins:='  LEFT JOIN gender gender ON ind.gender_id=gender.id INNER JOIN subject_type st ON st.id =ind.subject_type_id INNER JOIN title_lineage_locations_view tlv ON tlv.lowestpoint_id = ind.address_id LEFT JOIN individual_program_enrolment_search_view enrolments ON ind.id=enrolments.individual_id LEFT JOIN encounter enc ON enc.individual_id=ind.id LEFT JOIN program_enrolment penr ON penr.individual_id=ind.id LEFT JOIN program_encounter penc ON penr.id = penc.program_enrolment_id   ';

select get_outer_query(searchtext)into sqlOuterQuery;

select searchJSON::json->>'searchAll' into searchAll;

IF searchAll IS NULL OR TRIM(searchAll)='' THEN
FOR _key, _value IN
       SELECT * FROM jsonb_each_text(searchJSON)
    LOOP


CASE
WHEN (_key ='subjectType') THEN
whereClause:=whereClause || ' and st.uuid = ' ||  '''' || TRIM(_value) || '''';

WHEN (_key ='name') THEN
IF _value IS NOT NULL AND _value != '' THEN
whereClause:=whereClause || ' and trim(concat(upper(ind.first_name),'' '',upper(ind.last_name))) like upper( ' ||  '''' ||'%'|| trim(_value) || '%' || '''' || ')' ;
END IF;

--Age start
WHEN (_key ='age') THEN

select _value::json->>'minValue' into minValue;
select _value::json->>'maxValue' into maxValue;

	IF (maxValue IS NOT NULL AND minValue IS NOT NULL AND minValue  != '' AND maxValue  != '')  THEN
		whereClause:=whereClause || ' and  date_part(''year''::text, age(now(), ind.date_of_birth::timestamp with time zone))::numeric >= ' ||  minValue   || ' and date_part(''year''::text, age(now(), ind.date_of_birth::timestamp with time zone))::numeric <= ' || maxValue  ;
	ELSIF minValue IS NOT NULL and minValue  != ''  THEN
		whereClause:=whereClause || ' and  date_part(''year''::text, age(now(), ind.date_of_birth::timestamp with time zone))::numeric = ' ||  minValue  ;

	END IF;
--Age end

--Gender start
WHEN (_key ='gender') THEN

	select replace(_value,'"','') into textArray;
	select substring(textArray , '\[(.+)\]') into textArray;
		IF textArray IS NOT NULL AND TRIM(textArray)!=''  THEN
		select string_agg(quote_literal(trim(elem)), ',')from unnest(string_to_array(textArray, ',')) elem into valueTxt;
		whereClause:=whereClause || ' and gender.uuid in(' || valueTxt || ')' ;
		END IF;
--END IF;
--Gender end

-- FOR REGISTRATION DATE
WHEN (_key ='registrationDate') THEN

select _value::json->>'minValue' into minDate;
select _value::json->>'maxValue' into maxDate;

	IF (maxDate IS NOT NULL AND minDate IS NOT NULL AND trim(minDate)  != '' AND trim(maxDate)  != '')  THEN
		whereClause:=whereClause || ' and  ind.registration_date >= ' || ''''|| trim(minDate)   ||'''' || '::date' || ' and ind.registration_date <= ' || ''''|| trim(maxDate) || '''' || '::date';
	ELSIF minDate IS NOT NULL and minDate  != ''  THEN
		whereClause:=whereClause || ' and  ind.registration_date = ' ||''''||  trim(minDate) || '''' || '::date' ;

	END IF;

-- for encounter date start
WHEN (_key ='encounterDate') THEN

select _value::json->>'minValue' into minDate;
select _value::json->>'maxValue' into maxDate;

	IF (maxDate IS NOT NULL AND trim(minDate) IS NOT NULL AND trim(minDate)  != '' AND trim(maxDate)  != '')  THEN
		whereClause:=whereClause || ' and  enc.encounter_date_time >= ' || ''''|| trim(minDate)   ||'''' || '::date' || ' and enc.encounter_date_time <= ' || ''''|| trim(maxDate) || '''' || '::date';
	ELSIF minDate IS NOT NULL and minDate  != ''  THEN
		whereClause:=whereClause || ' and  enc.encounter_date_time = ' ||''''||  trim(minDate) || '''' || '::date' ;

	END IF;
-- encounter date end

-- program encounter start

WHEN (_key ='programEncounterDate') THEN

select _value::json->>'minValue' into minDate;
select _value::json->>'maxValue' into maxDate;

	IF (maxDate IS NOT NULL AND minDate IS NOT NULL AND trim(minDate)  != '' AND trim(maxDate)  != '')  THEN
		whereClause:=whereClause || ' and  penc.encounter_date_time >= ' || ''''|| trim(minDate)   ||'''' || '::date' || ' and penc.encounter_date_time <= ' || ''''|| trim(maxDate) || '''' || '::date';
	ELSIF minDate IS NOT NULL and minDate  != ''  THEN
		whereClause:=whereClause || ' and  penc.encounter_date_time = ' ||''''||  trim(minDate) || '''' || '::date' ;

	END IF;

--program encounter end

--program enrolment start
WHEN (_key ='programEnrolmentDate') THEN

select _value::json->>'minValue' into minDate;
select _value::json->>'maxValue' into maxDate;

	IF (maxDate IS NOT NULL AND minDate IS NOT NULL AND trim(minDate)  != '' AND trim(maxDate)  != '')  THEN
		whereClause:=whereClause || ' and  penr.enrolment_date_time >= ' || ''''|| trim(minDate)   ||'''' || '::date' || ' and penr.enrolment_date_time <= ' || ''''|| trim(maxDate) || '''' || '::date';
	ELSIF minDate IS NOT NULL and minDate  != ''  THEN
		whereClause:=whereClause || ' and  penr.enrolment_date_time = ' ||''''||  trim(minDate) || '''' || '::date' ;

	END IF;


--program enrolment end

-- is voided start
WHEN (_key ='includeVoided') THEN
if _value then
whereClause:=whereClause || '  and ind.is_voided in( false,' || _value || ') ';
END IF;
-- iss voided end

-- address ids start

WHEN (_key ='addressIds') THEN

	IF _value IS NOT NULL  THEN
		select substring(_value , '\[(.+)\]') into textArray;
		IF textArray IS NOT NULL AND  TRIM(textArray)!='' THEN
			whereClause:=whereClause || ' and tlv.lowestpoint_id  in(' || textArray || ')' ;
		END IF;
	END IF;

--address ids

-- concept start

WHEN (_key ='concept') THEN
	FOR textConceptObj IN SELECT * FROM json_array_elements(_value::json)
	LOOP

		select textConceptObj::json->>'dataType' into conceptDataType;
		IF conceptDataType!='' AND conceptDataType='CODED' THEN
			select textConceptObj::json->>'values' into valueTxt;
			select textConceptObj::json->>'uuid' into uuidKey;
			select textConceptObj::json->>'searchScope' into searchScope;
-- for individual concept search start
		IF valueTxt IS NOT NULL AND trim(valueTxt)!='' and searchScope='INDIVIDUAL'   THEN
			select substring(valueTxt , '\[(.+)\]') into valueTxt;
			select get_observation_pattern('ind',uuidKey,valueTxt)into valueTxt;
			whereClause:=whereClause || valueTxt;

		ELSE
			select textConceptObj::json->>'value' into valueTxt;
			IF valueTxt IS NOT NULL AND trim(valueTxt)!='' THEN
				select get_observation_pattern('ind',uuidKey,valueTxt)into valueTxt;
				whereClause:=whereClause || valueTxt;
			END IF;
		END IF;
-- for individual concept search end

-- for program enrolment concept search start
		IF valueTxt IS NOT NULL AND trim(valueTxt)!='' and searchScope='PROGRAMENROLMENT'   THEN
			select substring(valueTxt , '\[(.+)\]') into valueTxt;
			select get_observation_pattern('penr',uuidKey,valueTxt)into valueTxt;
			whereClause:=whereClause || valueTxt;
		ELSE
			select textConceptObj::json->>'value' into valueTxt;
			IF valueTxt IS NOT NULL AND trim(valueTxt)!='' THEN
				select get_observation_pattern('penr',uuidKey,valueTxt)into valueTxt;
				whereClause:=whereClause || valueTxt;
			END IF;
		END IF;
-- for program enrolment concept search  end

-- for program encounter concept search start
		IF valueTxt IS NOT NULL AND trim(valueTxt)!='' and searchScope='PROGRAMENCOUNTER'   THEN
			select substring(valueTxt , '\[(.+)\]') into valueTxt;
			select get_observation_pattern('penc',uuidKey,valueTxt)into valueTxt;
			whereClause:=whereClause || valueTxt;
		ELSE
			select textConceptObj::json->>'value' into valueTxt;
				IF valueTxt IS NOT NULL AND trim(valueTxt)!='' THEN
					select get_observation_pattern('penc',uuidKey,valueTxt)into valueTxt;
					whereClause:=whereClause || valueTxt;
				END IF;
		END IF;
-- for program encounter concept search  end

-- for program encounter concept search start
		IF valueTxt IS NOT NULL AND trim(valueTxt)!='' and searchScope='ENCOUNTER'   THEN
			select substring(valueTxt , '\[(.+)\]') into valueTxt;
			select get_observation_pattern('enc',uuidKey,valueTxt)into valueTxt;
			whereClause:=whereClause || valueTxt;
		ELSE
			select textConceptObj::json->>'value' into valueTxt;
				IF valueTxt IS NOT NULL AND trim(valueTxt)!='' THEN
					select get_observation_pattern('enc',uuidKey,valueTxt)into valueTxt;
					whereClause:=whereClause || valueTxt;
				END IF;
		END IF;
-- for program encounter concept search  end
END IF;

--for text start
		IF conceptDataType!='' AND trim(conceptDataType)='TEXT' THEN
			select textConceptObj::json->>'value' into valueTxt;
			select textConceptObj::json->>'uuid' into uuidKey;
			select textConceptObj::json->>'searchScope' into searchScope;
			IF valueTxt IS NOT NULL AND TRIM(valueTxt)!='' AND trim(searchScope)='INDIVIDUAL'   THEN
				whereClause:=whereClause || ' and ind.observations ->>  ' ||''''|| trim(uuidKey) ||''''|| ' ILIKE ' || '''' ||'%'|| trim(valueTxt) || '%' ||'''' ;
			END IF;

-- for individual concept search end

-- for program enrolment concept search start


		IF valueTxt IS NOT NULL AND trim(valueTxt)!=''  AND searchScope='PROGRAMENROLMENT'  THEN
			whereClause:=whereClause || ' and penr.observations ->>  ' ||''''|| trim(uuidKey) ||''''|| ' ILIKE ' || '''' ||'%'|| trim(valueTxt) || '%'||'''' ;
		END IF;


		IF valueTxt IS NOT NULL AND trim(valueTxt)!=''  AND searchScope='PROGRAMENCOUNTER'  THEN
			whereClause:=whereClause || ' and penc.observations ->>  ' ||''''|| trim(uuidKey) ||''''|| ' ILIKE ' || '''' ||'%'|| trim(valueTxt) || '%'||'''' ;
		END IF;

		IF valueTxt IS NOT NULL AND trim(valueTxt)!=''  AND searchScope='ENCOUNTER'  THEN
			whereClause:=whereClause || ' and enc.observations ->>  ' ||''''|| trim(uuidKey) ||''''|| ' ILIKE ' || '''' ||'%'|| trim(valueTxt) || '%'||'''' ;
		END IF;
END IF;

--for text end

--Widget numeric start
		select textConceptObj::json->>'dataType' into conceptDataType;
		IF trim(conceptDataType)!='' AND trim(conceptDataType)='NUMERIC'  THEN
			select textConceptObj::json->>'widget' into widgetType;
			select textConceptObj::json->>'uuid' into uuidKey;
			select textConceptObj::json->>'searchScope' into searchScope;
-- for individual concept search start
		IF searchScope='INDIVIDUAL' AND widgetType='RANGE'  THEN
			select textConceptObj::json->>'minValue' into minValue;
			select textConceptObj::json->>'maxValue' into maxValue;
			whereClause:=whereClause || ' and (ind.observations ->>  ' ||''''|| trim(uuidKey) ||''''|| ') ::numeric >= ' || minValue||'::numeric ' ;
			whereClause:=whereClause || ' and (ind.observations ->> ' ||''''|| trim(uuidKey) ||''''|| ' )::numeric  <=  ' || maxValue||'::numeric ' ;
			ELSIF searchScope='INDIVIDUAL' AND widgetType='DEFAULT' THEN
				select textConceptObj::json->>'minValue' into minValue;
				whereClause:=whereClause || ' and (ind.observations ->>  ' ||''''|| trim(uuidKey) ||''''|| ') ::numeric = ' || minValue||'::numeric ' ;
		END IF;


		IF searchScope='PROGRAMENROLMENT' AND widgetType='RANGE'  THEN
			select textConceptObj::json->>'minValue' into minValue;
			select textConceptObj::json->>'maxValue' into maxValue;
			whereClause:=whereClause || ' and (penr.observations ->>  ' ||''''|| trim(uuidKey) ||''''|| ') ::numeric >= ' || minValue||'::numeric ' ;
			whereClause:=whereClause || ' and (penr.observations ->> ' ||''''|| trim(uuidKey) ||''''|| ' )::numeric  <=  ' || maxValue||'::numeric ' ;
			ELSIF searchScope='PROGRAMENROLMENT' AND widgetType='DEFAULT' THEN
				select textConceptObj::json->>'minValue' into minValue;
				whereClause:=whereClause || ' and (penr.observations ->>  ' ||''''|| trim(uuidKey) ||''''|| ') ::numeric = ' || minValue||'::numeric ' ;
		END IF;

		IF searchScope='ENCOUNTER' AND widgetType='RANGE'  THEN
			select textConceptObj::json->>'minValue' into minValue;
			select textConceptObj::json->>'maxValue' into maxValue;
			whereClause:=whereClause || ' and (enc.observations ->>  ' ||''''|| trim(uuidKey) ||''''|| ') ::numeric >= ' || minValue||'::numeric ' ;
			whereClause:=whereClause || ' and (enc.observations ->> ' ||''''|| trim(uuidKey) ||''''|| ' )::numeric  <=  ' || maxValue||'::numeric ' ;
			ELSIF searchScope='ENCOUNTER' AND widgetType='DEFAULT' THEN
				select textConceptObj::json->>'minValue' into minValue;
				whereClause:=whereClause || ' and (enc.observations ->>  ' ||''''|| trim(uuidKey) ||''''|| ') ::numeric = ' || minValue||'::numeric ' ;

		END IF;

		IF searchScope='PROGRAMENCOUNTER' AND widgetType='RANGE'  THEN
			select textConceptObj::json->>'minValue' into minValue;
			select textConceptObj::json->>'maxValue' into maxValue;
			whereClause:=whereClause || ' and (penc.observations ->>  ' ||''''|| trim(uuidKey) ||''''|| ') ::numeric >= ' || minValue||'::numeric ' ;
			whereClause:=whereClause || ' and (penc.observations ->> ' ||''''|| trim(uuidKey) ||''''|| ' )::numeric  <=  ' || maxValue||'::numeric ' ;
			ELSIF searchScope='PROGRAMENCOUNTER' AND widgetType='DEFAULT' THEN
				select textConceptObj::json->>'minValue' into minValue;
				whereClause:=whereClause || ' and (penc.observations ->>  ' ||''''|| trim(uuidKey) ||''''|| ') ::numeric = ' || minValue||'::numeric ' ;

		END IF;

searchScope:='';widgetType:='';

---
END IF;

--date part start
		IF conceptDataType!='' AND conceptDataType='DATE'  THEN
			select textConceptObj::json->>'widget' into widgetType;
			select textConceptObj::json->>'uuid' into uuidKey;
			select textConceptObj::json->>'searchScope' into searchScope;
-- for individual concept search start
		IF searchScope='INDIVIDUAL' AND widgetType='RANGE'  THEN
			select textConceptObj::json->>'minValue' into minValue;
			select textConceptObj::json->>'maxValue' into maxValue;
			select string_agg(quote_literal(trim(elem)), ',')from unnest(string_to_array(textArray, ',')) elem into valueTxt;
			whereClause:=whereClause || ' and (ind.observations ->>  ' ||''''|| uuidKey ||''''|| ') ::DATE >= '||'''' || minValue||''''||'::DATE ' ;
			whereClause:=whereClause || ' and (ind.observations ->> ' ||''''|| uuidKey ||''''|| ' )::DATE  <=  '||'''' || maxValue||''''||'::DATE ' ;
			ELSIF searchScope='INDIVIDUAL' AND widgetType='DEFAULT' THEN
				select textConceptObj::json->>'minValue' into minValue;
				whereClause:=whereClause || ' and (ind.observations ->>  ' ||''''|| uuidKey ||''''|| ') ::DATE = '||'''' || minValue||''''||'::DATE ' ;
		END IF;


		IF searchScope='PROGRAMENROLMENT' AND widgetType='RANGE'  THEN
			select textConceptObj::json->>'minValue' into minValue;
			select textConceptObj::json->>'maxValue' into maxValue;
			select string_agg(quote_literal(trim(elem)), ',')from unnest(string_to_array(textArray, ',')) elem into valueTxt;
			whereClause:=whereClause || ' and (penr.observations ->>  ' ||''''|| uuidKey ||''''|| ') ::DATE >= ' || '''' || minValue||'''' || '::DATE ' ;
			whereClause:=whereClause || ' and (penr.observations ->> ' ||''''|| uuidKey ||''''|| ' )::DATE  <=  ' || ''''  || maxValue||''''||'::DATE ' ;
			ELSIF searchScope='PROGRAMENROLMENT' AND widgetType='DEFAULT' THEN
				select textConceptObj::json->>'minValue' into minValue;
				whereClause:=whereClause || ' and (penr.observations ->>  ' ||''''|| uuidKey ||''''|| ') ::DATE = ' ||''''|| minValue||''''||'::DATE ' ;
		END IF;

		IF searchScope='ENCOUNTER' AND widgetType='RANGE'  THEN
			select textConceptObj::json->>'minValue' into minValue;
			select textConceptObj::json->>'maxValue' into maxValue;
			select string_agg(quote_literal(trim(elem)), ',')from unnest(string_to_array(textArray, ',')) elem into valueTxt;
			whereClause:=whereClause || ' and (enc.observations ->>  ' ||''''|| uuidKey ||''''|| ') ::DATE >= ' ||''''|| minValue||''''||'::DATE ' ;
			whereClause:=whereClause || ' and (enc.observations ->> ' ||''''|| uuidKey ||''''|| ' )::DATE  <=  ' ||''''|| maxValue||''''||'::DATE ' ;
			ELSIF searchScope='ENCOUNTER' AND widgetType='DEFAULT' THEN
				select textConceptObj::json->>'minValue' into minValue;
				whereClause:=whereClause || ' and (enc.observations ->>  ' ||''''|| uuidKey ||''''|| ') ::DATE = '||'''' || minValue||''''||'::DATE ' ;

		END IF;

		IF searchScope='PROGRAMENCOUNTER' AND widgetType='RANGE'  THEN
			select textConceptObj::json->>'minValue' into minValue;
			select textConceptObj::json->>'maxValue' into maxValue;
			select string_agg(quote_literal(trim(elem)), ',')from unnest(string_to_array(textArray, ',')) elem into valueTxt;
			whereClause:=whereClause || ' and (penc.observations ->>  ' ||''''|| uuidKey ||''''|| ') ::DATE >= '||'''' || minValue||''''||'::DATE ' ;
			whereClause:=whereClause || ' and (penc.observations ->> ' ||''''|| uuidKey ||''''|| ' )::DATE  <=  '||'''' || maxValue||''''||'::DATE ' ;
			ELSIF searchScope='PROGRAMENCOUNTER' AND widgetType='DEFAULT' THEN
				select textConceptObj::json->>'minValue' into minValue;
				whereClause:=whereClause || ' and (penc.observations ->>  ' ||''''|| uuidKey ||''''|| ') ::DATE = '||'''' || minValue||''''||'::DATE ' ;

		END IF;
searchScope:='';widgetType:='';

---
END IF;
--date part end

-- for individual concept search end


--Widget numeric end
END LOOP;
-- concept end
ELSE NULL;

END CASE;

    END LOOP;
    ELSE
whereClause:=whereClause || ' and ind.observations::text ilike '|| '''' ||  '%' || TRIM(searchAll) || '%' || '''';
whereClause:=whereClause || ' or penr.observations::text ilike '|| '''' || '%' || TRIM(searchAll) || '%' || '''';
    END IF;

sqlQuery:=sqlQueryBase || sqlQueryJoins || whereClause ;
sqlQuery:=' WITH cte AS ( ' || sqlQuery || ' ) ' || sqlOuterQuery;

  return QUERY EXECUTE sqlQuery;
END;
$BODY$
  LANGUAGE plpgsql;


