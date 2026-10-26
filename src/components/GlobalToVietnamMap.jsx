import React, { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import { feature } from "topojson-client";

const cities = [
  { name: "Australia", coords: [133.7751, -25.2744], labelOffset: [4, 4] },
  { name: "USA", coords: [-95.7129, 37.0902], labelOffset: [4, 4] },
  { name: "Japan", coords: [138.2529, 36.2048], labelOffset: [4, 4] },
  { name: "Italy", coords: [12.5674, 41.8719], labelOffset: [4, -4] },
  { name: "Canada", coords: [-106.3468, 56.1304], labelOffset: [4, 4] },
  { name: "Spain", coords: [-3.7492, 40.4637], labelOffset: [-32, 10] },
  { name: "Brazil", coords: [-51.9253, -14.235], labelOffset: [4, 4] },
  { name: "Chile", coords: [-71.543, -35.6751], labelOffset: [-28, 4] },
  { name: "India", coords: [78.9629, 20.5937], labelOffset: [-30, 4] },
  { name: "New Zealand", coords: [174.886, -40.9006], labelOffset: [4, 4] },
  { name: "China", coords: [104.1954, 35.8617], labelOffset: [4, -4] },
  { name: "France", coords: [2.2137, 46.2276], labelOffset: [-36, -4] },
  { name: "Poland", coords: [19.1451, 51.9194], labelOffset: [4, -4] },
  { name: "Germany", coords: [10.4515, 51.1657], labelOffset: [-80, -6] },
  { name: "Netherlands", coords: [5.2913, 52.1326], hideLabel: true },
  { name: "Ireland", coords: [-8.2439, 53.4129], hideLabel: true },
  { name: "UK", coords: [-3.436, 55.3781], labelOffset: [-20, -10] },
  { name: "Norway", coords: [8.4689, 60.472], labelOffset: [4, -4] },
  { name: "Thailand", coords: [100.9925, 15.87], labelOffset: [-45, 12] },
  { name: "Singapore", coords: [103.8198, 1.3521], labelOffset: [-50, 10] },
  { name: "Argentina", coords: [-63.6167, -38.4161], labelOffset: [4, 4] },
];

const vietnamCoords = [108.2772, 14.0583];

const GlobalToVietnamMap = () => {
  const ref = useRef();
  const [geographies, setGeographies] = useState([]);

  useEffect(() => {
    d3.json("https://unpkg.com/world-atlas@2/countries-110m.json").then((topo) => {
      const geo = feature(topo, topo.objects.countries).features;
      setGeographies(geo);
    });
  }, []);

  useEffect(() => {
    if (geographies.length === 0) return;

    const width = 1000;
    const height = 600;

    const svg = d3.select(ref.current)
      .attr("viewBox", `0 0 ${width} ${height}`)
      .style("max-width", "100%");

    svg.selectAll("*").remove();

    const projection = d3.geoMercator()
      .scale(120) // smaller = more zoomed out
      .translate([width / 2, height / 1.4]); // tweak to center Asia/Australia

    const pathGen = d3.geoPath().projection(projection);

    svg.append("g")
      .selectAll("path")
      .data(geographies)
      .join("path")
      .attr("d", pathGen)
      .attr("fill", "#f5f5f5")
      .attr("stroke", "#ccc");

    // draw arcs
    cities.forEach(city => {
      const sc = projection(city.coords);
      const vc = projection(vietnamCoords);
      const mid = [(sc[0] + vc[0]) / 2, (sc[1] + vc[1]) / 2 - 80];

      const curve = d3.line().curve(d3.curveBasis)([sc, mid, vc]);

      svg.append("path")
        .attr("d", curve)
        .attr("stroke", "#d90429")
        .attr("fill", "none")
        .attr("stroke-width", 1)
        .attr("opacity", 0.6);
    });

    // vietnam marker & label
    const vc = projection(vietnamCoords);
    svg.append("circle")
      .attr("cx", vc[0])
      .attr("cy", vc[1])
      .attr("r", 5)
      .attr("fill", "#d90429");

    svg.append("text")
      .attr("x", vc[0] + 8)
      .attr("y", vc[1] + 4)
      .text("Vietnam")
      .attr("fill", "#333")
      .style("font-size", "14px")
      .style("font-weight", "600");

    // labels for source countries
    cities.forEach(city => {
      const pos = projection(city.coords);
      const [offsetX, offsetY] = city.labelOffset || [4, 4];
      svg.append("circle")
        .attr("cx", pos[0])
        .attr("cy", pos[1])
        .attr("r", 2.5)
        .attr("fill", "#d90429")
        .attr("opacity", 0.75);

      if (!city.hideLabel) {
        svg.append("text")
          .attr("x", pos[0] + offsetX)
          .attr("y", pos[1] + offsetY)
          .text(city.name)
          .attr("fill", "#555")
          .style("font-size", "10px")
          .style("opacity", 0.75);
      }
    });

  }, [geographies]);

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-6">
          Global to Vietnam Network
        </h2>
        <svg ref={ref}></svg>
        <p className="text-center text-gray-600 mt-6 text-lg max-w-4xl mx-auto">
          Our global sourcing network spans 20+ countries across the Americas, Europe, Asia, and Oceania — delivering world-class beef, lamb, poultry, seafood, potatoes, and pantry essentials directly to Vietnam from Australia, USA, Japan, Italy, Canada, Spain, Brazil, Chile, India, New Zealand, China, France, Poland, Germany, UK, Norway, Thailand, Singapore, and Argentina.
        </p>
      </div>
    </section>
  );
};

export default GlobalToVietnamMap;
