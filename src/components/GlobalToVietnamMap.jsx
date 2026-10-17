import React, { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import { feature } from "topojson-client";

const cities = [
  { name: "Australia", coords: [151.2093, -33.8688] },   // Sydney
  { name: "USA", coords: [-95.0, 37.0] },          // New York
  { name: "India", coords: [72.8777, 19.0760] },         // Mumbai
  { name: "Canada", coords: [-100.0, 56.0] },       // Toronto
  { name: "New Zealand", coords: [174.7633, -36.8485] }, // Auckland
  { name: "China", coords: [121.4737, 31.2304] },        // Shanghai
  { name: "Spain", coords: [-3.7492, 40.4637] },        // Madrid
  { name: "Singapore", coords: [103.8198, 1.3521] },    // Singapore
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

    // optional labels for cities
    cities.forEach(city => {
      const pos = projection(city.coords);
      svg.append("text")
        .attr("x", pos[0] + 4)
        .attr("y", pos[1] + 4)
        .text(city.name)
        .attr("fill", "#555")
        .style("font-size", "10px")
        .style("opacity", 0.7);
    });

  }, [geographies]);

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-6">
          Global to Vietnam Network
        </h2>
        <svg ref={ref}></svg>
        <p className="text-center text-gray-600 mt-6 text-lg max-w-3xl mx-auto">
          Our global sourcing network brings the finest food products from Australia, USA, India, Canada, New Zealand, China, Spain, and Singapore — all the way to Vietnam.
        </p>
      </div>
    </section>
  );
};

export default GlobalToVietnamMap;
