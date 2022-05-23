There are two things needed for sync.
- No records should be missed out during the process
- Next sync starts from the place it left off in the previous sync

All the records in the system could be ordered based on last modified datetime in ascending order. The problem is when two timestamps are same then database cannot guarantee the order of the records. This becomes a problem when one is paginating the results. Hence in order to help database we add additional order by id. 

Performance wise there are following concerns
1. The device should not go out of memory during the sync
2. The device shouldn't have to make too many round trips
3. The device shouldn't timeout too much when loading the data

The page size designed keeping all the three concerns above. Too small page size will cause 2 and too large page size could cause 1 & 3.


### Concurrent sync issues and their resolution

#### Issue
When multiple users belonging to the same organisation, and responsible for the same 
set of address levels sync, at that time there can be a discrepancy between the 
data pulled by one device from a given last_modified_date_time, the actual data 
which belongs in that bracket, because of delay of flush of certain entities with applicable timestamp
being pushed into the database by the other device. This will cause those entities to 
remain unsynced forever on the other device forever.


#### Resolution
The pull of data is bounded from the parameterised last_modified_date_time passed
and the current time minus 10 seconds. The practical assumption here is that any flush 
will be completed in a period of 10 seconds.  
