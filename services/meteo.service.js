let getMeteoData=async (latitude,longitude)=>{
     const response = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,wind_speed_10m,wind_direction_10m,relative_humidity_2m,visibility`
  );
    const data = response.json();
     return data
}

export const meteoService={
    getMeteoData
}