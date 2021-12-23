with total_data(user_id, org_id, ind_id, subj_type_id, program_id, month, count) as (
    select i.last_modified_by_id,
           i.organisation_id,
           i.id,
           st.id,
           null,
           to_char(i.last_modified_date_time, 'Mon'),
           count(*)
    from individual i
             join subject_type st on i.subject_type_id = st.id and st.is_voided = false
    where extract(year from i.last_modified_date_time) = 2021
    group by 1, 2, 3, 4, i.last_modified_date_time

    union all

    select enl.last_modified_by_id,
           enl.organisation_id,
           individual_id,
           s.id,
           p.id,
           to_char(enl.last_modified_date_time, 'Mon'),
           count(*)
    from program_enrolment enl
             join program p on p.id = enl.program_id and p.is_voided = false
             join individual i2 on enl.individual_id = i2.id
             join subject_type s on i2.subject_type_id = s.id and s.is_voided = false
    where extract(year from enl.last_modified_date_time) = 2021
    group by 1, 2, 3, 4, 5, enl.last_modified_date_time

    union all

    select enc.last_modified_by_id,
           enc.organisation_id,
           individual_id,
           s.id,
           null,
           to_char(enc.last_modified_date_time, 'Mon'),
           count(*)
    from encounter enc
             join individual i2 on enc.individual_id = i2.id
             join subject_type s on i2.subject_type_id = s.id and s.is_voided = false
    where extract(year from enc.last_modified_date_time) = 2021
    group by 1, 2, 3, 4, enc.last_modified_date_time

    union all

    select penc.last_modified_by_id,
           penc.organisation_id,
           individual_id,
           s.id,
           p.id,
           to_char(penc.last_modified_date_time, 'Mon'),
           count(*)
    from program_encounter penc
             join program_enrolment enl on penc.program_enrolment_id = enl.id
             join program p on p.id = enl.program_id and p.is_voided = false
             join individual i2 on enl.individual_id = i2.id
             join subject_type s on i2.subject_type_id = s.id and s.is_voided = false
    where extract(year from penc.last_modified_date_time) = 2021
    group by 1, 2, 3, 4, 5, penc.last_modified_date_time
),
     by_subject_type as (
         select user_id, org_id, jsonb_agg(matrix) matrix
         from (select r.user_id,
                      r.org_id,
                      r.subj_type_id,
                      jsonb_build_object('name', t.name,
                                         'count', count(distinct ind_id)
                          ) matrix
               from total_data r
                        left join subject_type t on r.subj_type_id = t.id
               where r.subj_type_id notnull
               group by 1, 2, 3, t.name) s
         group by 1, 2
     ),
     by_program as (
         select user_id, org_id, jsonb_agg(matrix) matrix
         from (
                  select r.user_id,
                         r.org_id,
                         r.program_id,
                         jsonb_build_object('name', t.name,
                                            'count', count(distinct ind_id)
                             ) matrix
                  from total_data r
                           left join program t on r.program_id = t.id
                  where r.program_id notnull
                  group by 1, 2, 3, t.name) p
         group by 1, 2
     ),
     by_month as (
         select user_id,
                org_id,
                jsonb_agg(activities_by_month) activities_by_month,
                jsonb_agg(reach_by_month)      reach_by_month
         from (select r.user_id,
                      r.org_id,
                      jsonb_build_object('month', r.month,
                                         'count', sum(r.count)
                          ) activities_by_month,
                      jsonb_build_object('month', r.month,
                                         'count', count(distinct ind_id)
                          ) reach_by_month
               from total_data r
               group by 1, 2, r.month) s
         group by 1, 2
     ),
     total_agg as (
         select r.user_id,
                r.org_id,
                sum(r.count)           form_filled,
                count(distinct ind_id) reach
         from total_data r
         group by 1, 2
     )
insert into user_review_matrix(user_id, organisation_id, matrix, review_year)
select u.id,
       t.org_id,
       jsonb_build_object(
               'activities', t.form_filled,
               'activitiesByMonth', coalesce(activities_by_month, '[]'::jsonb),
               'reach', t.reach,
               'reachByMonth', coalesce(reach_by_month, '[]'::jsonb),
               'reachBySubjectType', coalesce(st.matrix, '[]'::jsonb),
               'reachByProgram', coalesce(p.matrix, '[]'::jsonb)
           ),
       2021
from users u
         join total_agg t on u.id = t.user_id
         left join by_subject_type st on st.user_id = u.id and st.org_id = t.org_id
         left join by_program p on p.user_id = u.id and p.org_id = t.org_id
         left join by_month m on m.user_id = u.id and m.org_id = t.org_id;
