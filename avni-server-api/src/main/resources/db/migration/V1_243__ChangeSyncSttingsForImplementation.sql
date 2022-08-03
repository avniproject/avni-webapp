--This migration is for RWB prod only we might have to fix it manually at other places
update users set sync_settings = ('{
  "subjectTypeSyncSettings": [
    {
      "syncConcept1": "30b35ec3-634a-4534-b156-574ae6d9243d",
      "syncConcept2": null,
      "subjectTypeUUID": "a961a36a-4728-4389-9934-a052067ee6a5",
      "syncConcept1Values": '|| (sync_settings::jsonb ->> 'syncConcept1Values'::text) || ',
      "syncConcept2Values": null
    }
]}')::jsonb
where sync_settings ->> 'syncConcept1' = '30b35ec3-634a-4534-b156-574ae6d9243d';
