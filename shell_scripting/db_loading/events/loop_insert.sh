for file in data/*
do
  ./insert_event_into_db.sh $file
done