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
import { dataCity } from "../services/config";
import styles from "../styles/Home.module.css";

export const App = () => {
  const [cityInput, setCityInput] = useState("Berlin");
  const [triggerFetch, setTriggerFetch] = useState(true);
  const [weatherData, setWeatherData] = useState();
  const [unitSystem, setUnitSystem] = useState("metric");
  const [weatherDataOpen, setWeatherDataOpen] = useState([]);
  const [coordCity, setCoordCity] = useState({
    city: "Berlin",
    country: "DE",
    latitude: 52.52,
    longitude: 13.41,
    lastDataUpdateTime: "",
    timezone: 3600,
    currentTime: 1774190066,
  });

  const flag = useRef(false);

  var dataOpen = new Object();

  /*************data initialization********************************/
  useEffect(() => {
    console.log(dataCity)
    if (flag.current === false) {
      if (localStorage.getItem("openMeteo") != null) {
        const data = JSON.parse(localStorage.getItem("openMeteo"));
        data.current.time = dataCity.currentTime;
        data.timezone = dataCity.timezone;
        setWeatherData(data);
        console.log(JSON.parse(localStorage.getItem("openMeteo")));
      } else {
        meteoService
          .getMeteoData()
          .then((res) => {
            localStorage.setItem("openMeteo", JSON.stringify(res));
            const data =  JSON.parse(localStorage.getItem("openMeteo"));
            data.current.time = dataCity.currentTime;
            data.timezone = dataCity.timezone;
            setWeatherData(data);
          })
          .catch((err) => console.log(err));
      }
    }
    return () => (flag.current = true);
  }, []);

  /***************periodic data updates***************** */
  //let eventTracked = false;
  useEffect(() => {
    let i=1;
    let numbUpdate=10;
    while(i<dataCity.numbUpdate){
      let timer=5000;
    setTimeout(() => {
      meteoService
        .getMeteoData()
        .then((res) => {
          localStorage.removeItem("openMeteo");
          localStorage.setItem("openMeteo", JSON.stringify(res));
          const data=  JSON.parse(localStorage.getItem("openMeteo"))
          data.current.time = dataCity.currentTime;
          data.timezone = dataCity.timezone;
          setWeatherData(data);
          console.log("api:"+ timer);
        })
        .catch((err) => console.log(err));
    }, dataCity.frequencyTimer*i);
    i++;
  }
  }, []);
  //eventTracked = true;

  const changeSystem = () =>
    unitSystem == "metric"
      ? setUnitSystem("imperial")
      : setUnitSystem("metric");

  return weatherData && !weatherData.message ? (
    <div className={styles.wrapper}>
      <MainCard
        city={coordCity.city}
        country={coordCity.country}
        description={"weatherData.weather[0].description"}
        iconName={"01d"}
        unitSystem={unitSystem}
        weatherData={weatherData}
        weatherDataOpen={weatherDataOpen}
      />
      <ContentBox>
        <Header>
          <DateAndTime weatherData={weatherData} unitSystem={unitSystem} />
          {/* <Search
            placeHolder="Search a city..."
            value={cityInput}
            onFocus={(e) => {
              e.target.value = "";
              e.target.placeholder = "";
            }}
            onChange={(e) => setCityInput(e.target.value)}
            onKeyDown={(e) => {
              e.keyCode === 13 && setTriggerFetch(!triggerFetch);
              e.target.placeholder = "Search a city...";
            }}
          />*/}
        </Header>
        <MetricsBox
          weatherData={weatherData}
          unitSystem={unitSystem}
          weatherDataOpen={weatherDataOpen}
        />
        {/*<UnitSwitch onClick={changeSystem} unitSystem={unitSystem} />*/}
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
