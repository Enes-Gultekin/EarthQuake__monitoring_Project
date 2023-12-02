<?php
    //id, country, date, magnitude, latitude, longitude, total_deaths, total_damage
    $connect=pg_connect("host=localhost port=5093 dbname=EarthQuakeDb user=postgres password=password " );
    $query='SELECT * FROM "MyTable" ';
    $result=pg_query( $connect,$query);
    
    $rows = pg_fetch_all($result);
    $earthquake_json=json_encode($rows,true);
    pg_close($connect);
    exit($earthquake_json);

?>