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
  const [cityInput, setCityInput] = useState("Berlin");
  const [triggerFetch, setTriggerFetch] = useState(true);
  const [weatherData, setWeatherData] = useState();
  const [unitSystem, setUnitSystem] = useState("metric");
  const [reset, setReset] = useState(true);

  const flag = useRef(false);

  var dataOpen = new Object();

  /*************data initialization********************************/
  useEffect(() => {
    if (flag.current === false) {
      if (localStorage.getItem("openMeteo") != null) {
        const data = JSON.parse(localStorage.getItem("openMeteo"));
        data.current.time = parseInt(getTimeSpan(data.current.time));
        data.timezone = dataCity.timezone;
        setWeatherData(data);
      } else {
        meteoService
          .getMeteoData(dataCity.latitude, dataCity.longitude)
          .then((res) => {
            localStorage.setItem("openMeteo", JSON.stringify(res));
            const data = JSON.parse(localStorage.getItem("openMeteo"));
            data.current.time = getTimeSpan(data.current.time);
            data.timezone = dataCity.timezone;
            setWeatherData(data);
          })
          .catch((err) => console.log(err));
      }
    }
    return () => (flag.current = true);
  }, []);

  /***************periodic data updates***************** */
  
  useEffect(() => {
    let i = 1;
    while (i < dataCity.numbUpdate) {
      
        setTimeout(() => {
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
              console.log(i);
            })
            .catch((err) => console.log(err));
        }, dataCity.frequencyTimer * i);
        i++;
    }
    return () => (flag.current = true);
  }, []);

  const changeSystem = () =>
    unitSystem == "metric"
      ? setUnitSystem("imperial")
      : setUnitSystem("metric");

  return weatherData && !weatherData.message ? (
    <div className={styles.wrapper}>
      {console.log(weatherData)}
      <MainCard
        city={dataCity.city}
        country={dataCity.country}
        description={"weatherData.weather[0].description"}
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
