var country="";

let getGeoCoding = async (country) => {
  const response = await fetch(
    `https://geocoding-api.open-meteo.com/v1/search?name=${country}&count=1&language=en&format=json`
  );
  const data=response.json()
  return data;
};


let getMeteoData = async (latitude, longitude) => {
  const response = await fetch(
    `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&daily=sunrise&daily=sunset&current=temperature_2m,wind_speed_10m,wind_direction_10m,relative_humidity_2m,visibility`,
  );
  const data = response.json();
  //console.log(getGeoCoding("Berlin"))
  return data;
};

export const meteoService = {
  getMeteoData,getGeoCoding
};
