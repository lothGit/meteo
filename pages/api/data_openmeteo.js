export   const  getDataOpenMeteo=()=> {
  const response =  fetch(
    `https://api.open-meteo.com/v1/forecast?latitude=52.52&longitude=13.41&current=temperature_2m,wind_speed_10m&hourly=temperature_2m,wind_direction_10m,relative_humidity_2m,wind_speed_10m`
  );
  const data = response.json();
  console.log(data);
  //res.status(200).json(data);
  
}