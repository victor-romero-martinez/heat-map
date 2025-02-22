import * as d3 from "d3";
import { useEffect, useRef } from "react";
import { MonthlyVariance } from "../type/fetchData";

const WIDTH = 1600;
const HEIGHT = 560;
const MARGIN = { top: 20, right: 20, bottom: 100, left: 60 };
const MONTH = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];
const COLORS = [
  "#4575b4",
  "#74add1",
  "#abd9e9",
  "#e0f3f8",
  "#ffffbf",
  "#fdae61",
  "#f46d43",
  "#d73027",
];
const LEGEND = {
  width: 400,
  height: 20,
  numColors: COLORS.length,
};

const getMonth = (month: number) => MONTH[month - 1];
const differenceTemperature = (base: number, variance: number) =>
  base + variance;

interface ChartProps {
  data: MonthlyVariance[];
  baseTemperature: number;
}

export default function Chart({ data, baseTemperature }: ChartProps) {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current || data.length === 0) return;

    // Obtener años y rangos
    const yearExtend = d3.extent(data, (d) => d.year);

    if (!yearExtend[0] || !yearExtend[1]) return;
    const minYear = yearExtend[0]!;
    const maxYear = yearExtend[1]!;

    // Obtener rango de variaciones
    const varianceExtent = d3.extent(data, (d) => d.variance);
    if (!varianceExtent[0] || !varianceExtent[1]) return;

    const tempExtend = d3.extent(data, (d) =>
      differenceTemperature(baseTemperature, d.variance)
    );
    if (!tempExtend[0] || !tempExtend[1]) return;

    const invertY = [...MONTH].reverse();

    // Crear escalas
    const x = d3
      .scaleTime()
      .domain([new Date(minYear, 0, 1), new Date(maxYear, 0, 1)])
      .range([MARGIN.left, WIDTH - MARGIN.right]);

    const y = d3
      .scaleBand()
      .domain(invertY)
      .range([HEIGHT - MARGIN.bottom, MARGIN.top]);

    const colorScale = d3
      .scaleSequential(d3.interpolateRgbBasis(COLORS))
      .domain(varianceExtent);

    // agregar tooltip
    let tooltip: d3.Selection<HTMLDivElement, unknown, HTMLElement, any> =
      d3.select("#tooltip");

    // Si no existe, crearlo
    if (tooltip.empty()) {
      tooltip = d3
        .select("body")
        .append("div")
        .attr("id", "tooltip")
        .style("position", "absolute")
        .style("background-color", "rgb(145, 138, 109)")
        .style("color", "rgb(255, 212, 249)")
        .style("padding", "8px")
        .style("border-radius", "5px")
        .style("font-size", "12px")
        .style("pointer-events", "none")
        .style("opacity", 0);
    }

    const legendScale = d3.scaleLinear().domain(varianceExtent).range([0, 400]);

    // Limpiar el SVG antes de redibujar
    d3.select(svgRef.current).selectAll("*").remove();

    // Crear SVG
    const svg = d3
      .select(svgRef.current)
      .attr("width", WIDTH)
      .attr("height", HEIGHT);

    // Eje X
    svg
      .append("g")
      .attr("id", "x-axis")
      .attr("transform", `translate(0, ${HEIGHT - MARGIN.bottom})`)
      .call(d3.axisBottom(x).ticks(d3.timeYear.every(10)));

    // Eje Y
    svg
      .append("g")
      .attr("id", "y-axis")
      .attr("transform", `translate(${MARGIN.left}, 0)`)
      .call(d3.axisLeft(y));

    // Crear rectángulos del heatmap
    svg
      .append("g")
      .selectAll("rect")
      .data(data)
      .enter()
      .append("rect")
      .attr("class", "cell")
      .attr("data-month", (d) => d.month - 1)
      .attr("data-year", (d) => d.year)
      .attr("data-temp", (d) =>
        differenceTemperature(baseTemperature, d.variance)
      )
      .attr("x", (d) => x(new Date(d.year, 0, 1)))
      .attr("y", (d) => y(getMonth(d.month))!)
      .attr("width", () => {
        const startDate = new Date(minYear, 0, 1);
        const endDate = new Date(minYear + 1, 0, 1);
        return x(endDate) - x(startDate);
      })
      .attr("height", y.bandwidth())
      .attr("fill", (d) => colorScale(d.variance))
      .on("mouseover", (e, d) => {
        const temp = differenceTemperature(baseTemperature, d.variance);

        tooltip
          .style("opacity", 1)
          .html(
            `<strong>${d.year} - ${getMonth(d.month)}</strong><br/>
            Temp: ${temp.toFixed(2)}℃<br/>
            Variance: ${d.variance.toFixed(2)}℃`
          )
          .attr("data-year", d.year)
          .style("left", `${e.pageX + 10}px`)
          .style("top", `${e.pageY + 28}px`);
      })
      .on("mouseout", () => tooltip.style("opacity", 0));

    const legend = svg
      .append("g")
      .attr("id", "legend")
      .attr(
        "transform",
        `translate(${MARGIN.left}, ${HEIGHT - MARGIN.bottom + 50})`
      );

    COLORS.forEach((c, i) => {
      legend
        .append("rect")
        .attr("x", (LEGEND.width / LEGEND.numColors) * i)
        .attr("width", LEGEND.width / LEGEND.numColors)
        .attr("height", LEGEND.height)
        .attr("fill", c)
        .attr("stroke", "black");
    });

    // Agregar eje a la leyenda
    legend
      .append("g")
      .attr("transform", `translate(0, 20)`)
      .call(
        d3
          .axisBottom(legendScale)
          .ticks(COLORS.length)
          .tickFormat(d3.format(".1f"))
      );
  }, [data]);

  return <svg ref={svgRef}></svg>;
}
