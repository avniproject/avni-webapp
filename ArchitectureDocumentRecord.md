There are two things needed for sync.
- No records should be missed out during the process
- Next sync starts from the place it left off in the previous sync

All the records in the system could be ordered based on last modified datetime in ascending order. The problem is when two timestamps are same then database cannot guarantee the order of the records. This becomes a problem when one is paginating the results. Hence in order to help database we add additional order by id. 

Performance wise there are following concerns
1. The device should not go out of memory during the sync
2. The device shouldn't have to make too many round trips
3. The device shouldn't timeout too much when loading the data

The page size designed keeping all the three concerns above. Too small page size will cause 2 and too large page size could cause 1 & 3.
