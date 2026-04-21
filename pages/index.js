import { useState, useEffect, useRef } from "react";

import { MainCard } from "../components/MainCard";
import { ContentBox } from "../components/ContentBox";
import { Header } from "../components/Header";
import { DateAndTime } from "../components/DateAndTime";
import { Search } from "../components/Search";
import { MetricsBox } from "../components/MetricsBox";
import { UnitSwitch } from "../components/UnitSwitch";
import { LoadingScreen } from "../components/LoadingScreen";
import { ErrorScreen } from "../components/ErrorScreen";
import { meteoService } from "../services/meteo.service";
import { getTimeSpan } from "../services/helpers";
import { dataCity } from "../services/config";
import styles from "../styles/Home.module.css";

export const App = () => {
  const [cityInput, setCityInput] = useState("Paris");
  const [cityLat, setCityLat] = useState();
  const [cityLong, setCityLong] = useState();
  
  const [triggerFetch, setTriggerFetch] = useState(true);
  const [weatherData, setWeatherData] = useState();
  const [unitSystem, setUnitSystem] = useState("metric");
  const [reset, setReset] = useState(true);
  var latitude = 1;

  const flag = useRef(false);

  /*************data initialization********************************/
  useEffect(() => {
     meteoService
          .getGeoCoding(dataCity.city)
          .then((res) => {
            console.log(res)
            dataCity.latitude = res.results[0].latitude;
            dataCity.longitude = res.results[0].longitude;
            dataCity.country=res.results[0].country_code
            latitude=res.results[0].latitude;
          })
          .catch((err) => console.log(err));

    if (flag.current === false) {
      if (localStorage.getItem("openMeteo") != null) {
        const data = JSON.parse(localStorage.getItem("openMeteo"));
        data.current.time = parseInt(getTimeSpan(data.current.time));
        data.timezone = dataCity.timezone;
        setWeatherData({...data});
      } else {
        meteoService
          .getGeoCoding(dataCity.city)
          .then((res) => {
            dataCity.latitude = res.results[0].latitude;
            dataCity.longitude = res.results[0].longitude;
            dataCity.country = res.results[0].country_code;

            meteoService
              .getMeteoData(dataCity.latitude, dataCity.longitude)
              .then((res) => {
                localStorage.setItem("openMeteo", JSON.stringify(res));
                const data = JSON.parse(localStorage.getItem("openMeteo"));
                data.current.time = getTimeSpan(data.current.time);
                data.timezone = dataCity.timezone;
                setWeatherData({...data});
              })
              .catch((err) => console.log(err));
          })
          .catch((err) => console.log(err));
      }
    }
    return () => (flag.current = true);
  }, []);

  /***************periodic data updates***************** */

  const getMeteoData = () => {
    meteoService
      .getGeoCoding(dataCity.city)
      .then((res) => {
        dataCity.latitude = res.results[0].latitude;
        dataCity.longitude = res.results[0].longitude;
        dataCity.country = res.results[0].country_code;

        meteoService
          .getMeteoData(dataCity.latitude, dataCity.longitude)
          .then((res) => {
            localStorage.removeItem("openMeteo");
            localStorage.setItem("openMeteo", JSON.stringify(res));
            const data = JSON.parse(localStorage.getItem("openMeteo"));
            let timespan = getTimeSpan(data.current.time);
            data.current.time = timespan;
            data.timezone = dataCity.timezone;
            setWeatherData(data);
            
          })
          .catch((err) => console.log(err));
          
      })
      .catch((err) => console.log(err));
  };

 useEffect(() => {
   
    if (flag.current === false) {
      setInterval(getMeteoData, dataCity.frequencyTimer);
    }
    return () => (flag.current = true);
  }, []);

  const changeSystem = () =>
    unitSystem == "metric"
      ? setUnitSystem("imperial")
      : setUnitSystem("metric");

  return weatherData && !weatherData.message ? (
    <div className={styles.wrapper}>
      {/*console.log(weatherData)*/}
      <MainCard
        city={dataCity.city}
        country={dataCity.country}
        description={""}
        iconName={"01d"}
        unitSystem={unitSystem}
        weatherData={weatherData}
      />
      <ContentBox>
        <Header>
          <DateAndTime weatherData={weatherData} unitSystem={unitSystem} />
        </Header>
        <MetricsBox weatherData={weatherData} unitSystem={unitSystem} />
        <UnitSwitch onClick={changeSystem} unitSystem={unitSystem} />
      </ContentBox>
    </div>
  ) : weatherData && weatherData.message ? (
    <ErrorScreen errorMessage="City not found, try again!">
      {/*<Search
        onFocus={(e) => (e.target.value = "")}
        onChange={(e) => setCityInput(e.target.value)}
        onKeyDown={(e) => e.keyCode === 13 && setTriggerFetch(!triggerFetch)}
      />*/}
    </ErrorScreen>
  ) : (
    <LoadingScreen loadingMessage="Loading data..." />
  );
};
export default App;
