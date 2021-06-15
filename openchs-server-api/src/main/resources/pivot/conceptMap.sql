${mapName} as (SELECT public.hstore((array_agg(c2.uuid)) :: text [], (array_agg(c2.name)) :: text []) AS map
                  FROM public.concept
                         join public.concept_answer a on concept.id = a.concept_id
                         join public.concept c2 on a.answer_concept_id = c2.id
                  where concept.uuid in (${conceptUuids}))
