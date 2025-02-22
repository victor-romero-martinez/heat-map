import * as d3 from "d3";
import { useEffect, useState } from "react";
import Chart from "./components/chart";
import Title from "./components/title";
import { DataFetch, MonthlyVariance } from "./type/fetchData";

const URL =
  "https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/global-temperature.json";

function App() {
  const [dataHeat, setDataHeat] = useState<MonthlyVariance[]>([]);
  const [baseTemperature, setBaseTemperature] = useState<number>(0);

  useEffect(() => {
    d3.json<DataFetch>(URL)
      .then((d) => {
        setDataHeat(d!.monthlyVariance);
        setBaseTemperature(d!.baseTemperature);
      })
      .catch((e) => console.error(e));
  }, []);

  return (
    <>
      <div id="container">
        <Title
          type="h1"
          text="Monthly Global Land-Surface Temperature"
          id="title"
        />
        <Title
          type="h3"
          text={`1753 - 2015: base temperature ${baseTemperature}℃`}
          id="description"
        />
        <Chart data={dataHeat} baseTemperature={baseTemperature} />
      </div>
    </>
  );
}

export default App;
