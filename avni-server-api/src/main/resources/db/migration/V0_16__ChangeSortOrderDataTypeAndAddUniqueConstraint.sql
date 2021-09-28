ALTER TABLE concept_answer DROP COLUMN sort_weight;
ALTER TABLE concept_answer ADD COLUMN answer_order SMALLINT NOT NULL;