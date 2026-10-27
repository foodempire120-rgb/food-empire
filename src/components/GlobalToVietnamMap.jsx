import React, { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import { feature } from "topojson-client";
import { Package, Award, Globe2, Clock } from "lucide-react";

const stats = [
  {
    value: "148",
    label: "products across 7 categories",
    icon: Package,
    color: "text-emerald-600",
    bg: "bg-emerald-50 border-emerald-100"
  },
  {
    value: "60+",
    label: "brands, from leading international producers",
    icon: Award,
    color: "text-amber-600",
    bg: "bg-amber-50 border-amber-100"
  },
  {
    value: "22",
    label: "countries of origin — Australia, USA, Canada, Japan, NZ, Europe & more",
    icon: Globe2,
    color: "text-blue-600",
    bg: "bg-blue-50 border-blue-100"
  },
  {
    value: "Same-day",
    label: "delivery for in-stock items; the rest in 24–48h",
    icon: Clock,
    color: "text-rose-600",
    bg: "bg-rose-50 border-rose-100"
  }
];

// Source countries with coordinates, matching geo names, and distinct color palette
const sourceCountries = [
  { name: "Australia", geoName: "Australia", color: "#3B82F6", coords: [133.7751, -25.2744] },
  { name: "USA", geoName: "United States of America", color: "#10B981", coords: [-95.7129, 37.0902] },
  { name: "Japan", geoName: "Japan", color: "#F59E0B", coords: [138.2529, 36.2048] },
  { name: "Italy", geoName: "Italy", color: "#8B5CF6", coords: [12.5674, 41.8719] },
  { name: "Canada", geoName: "Canada", color: "#06B6D4", coords: [-106.3468, 56.1304] },
  { name: "Spain", geoName: "Spain", color: "#EC4899", coords: [-3.7492, 40.4637] },
  { name: "Brazil", geoName: "Brazil", color: "#14B8A6", coords: [-51.9253, -14.235] },
  { name: "Chile", geoName: "Chile", color: "#F97316", coords: [-71.543, -35.6751] },
  { name: "India", geoName: "India", color: "#6366F1", coords: [78.9629, 20.5937] },
  { name: "New Zealand", geoName: "New Zealand", color: "#84CC16", coords: [174.886, -40.9006] },
  { name: "China", geoName: "China", color: "#E11D48", coords: [104.1954, 35.8617] },
  { name: "France", geoName: "France", color: "#0284C7", coords: [2.2137, 46.2276] },
  { name: "Poland", geoName: "Poland", color: "#A855F7", coords: [19.1451, 51.9194] },
  { name: "Germany", geoName: "Germany", color: "#EAB308", coords: [10.4515, 51.1657] },
  { name: "Netherlands", geoName: "Netherlands", color: "#F43F5E", coords: [5.2913, 52.1326] },
  { name: "Ireland", geoName: "Ireland", color: "#22C55E", coords: [-8.2439, 53.4129] },
  { name: "UK", geoName: "United Kingdom", color: "#64748B", coords: [-3.436, 55.3781] },
  { name: "Norway", geoName: "Norway", color: "#0D9488", coords: [8.4689, 60.472] },
  { name: "Thailand", geoName: "Thailand", color: "#D97706", coords: [100.9925, 15.87] },
  { name: "Singapore", geoName: "Singapore", color: "#4F46E5", coords: [103.8198, 1.3521] },
  { name: "Argentina", geoName: "Argentina", color: "#2563EB", coords: [-63.6167, -38.4161] },
];

const vietnamCoords = [108.2772, 14.0583];
const VIETNAM_COLOR = "#DC2626"; // Crimson Red

// Create lookup map for fast country styling
const countryColorMap = new Map();
sourceCountries.forEach((c) => {
  countryColorMap.set(c.geoName, c.color);
  countryColorMap.set(c.name, c.color);
});
countryColorMap.set("Vietnam", VIETNAM_COLOR);

const GlobalToVietnamMap = () => {
  const ref = useRef();
  const [geographies, setGeographies] = useState([]);
  const [activeCountry, setActiveCountry] = useState(null);

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

    const svg = d3
      .select(ref.current)
      .attr("viewBox", `0 0 ${width} ${height}`)
      .style("max-width", "100%")
      .style("height", "auto");

    svg.selectAll("*").remove();

    const projection = d3
      .geoMercator()
      .scale(120) // smaller = more zoomed out
      .translate([width / 2, height / 1.4]); // center Asia/Australia

    const pathGen = d3.geoPath().projection(projection);

    // Draw countries with colors
    svg
      .append("g")
      .selectAll("path")
      .data(geographies)
      .join("path")
      .attr("d", pathGen)
      .attr("fill", (d) => {
        const countryName = d.properties?.name;
        return countryColorMap.get(countryName) || "#e5e7eb";
      })
      .attr("stroke", (d) => {
        const countryName = d.properties?.name;
        return countryColorMap.has(countryName) ? "#ffffff" : "#d1d5db";
      })
      .attr("stroke-width", 0.6)
      .attr("opacity", (d) => {
        const countryName = d.properties?.name;
        return countryColorMap.has(countryName) ? 0.95 : 0.65;
      });

    // Draw red arcs (network lines to Vietnam)
    sourceCountries.forEach((city) => {
      const sc = projection(city.coords);
      const vc = projection(vietnamCoords);
      const mid = [(sc[0] + vc[0]) / 2, (sc[1] + vc[1]) / 2 - 80];

      const curve = d3.line().curve(d3.curveBasis)([sc, mid, vc]);

      svg
        .append("path")
        .attr("d", curve)
        .attr("stroke", "#d90429")
        .attr("fill", "none")
        .attr("stroke-width", 1.2)
        .attr("opacity", 0.65);
    });

    // Draw node marker circles for source countries colored with their specific country color
    sourceCountries.forEach((city) => {
      const pos = projection(city.coords);
      svg
        .append("circle")
        .attr("cx", pos[0])
        .attr("cy", pos[1])
        .attr("r", 3.5)
        .attr("fill", city.color)
        .attr("stroke", "#ffffff")
        .attr("stroke-width", 1);
    });

    // Vietnam destination marker
    const vc = projection(vietnamCoords);
    svg
      .append("circle")
      .attr("cx", vc[0])
      .attr("cy", vc[1])
      .attr("r", 6)
      .attr("fill", VIETNAM_COLOR)
      .attr("stroke", "#ffffff")
      .attr("stroke-width", 1.5);

    // Subtle pulsing ring around Vietnam
    svg
      .append("circle")
      .attr("cx", vc[0])
      .attr("cy", vc[1])
      .attr("r", 10)
      .attr("fill", "none")
      .attr("stroke", VIETNAM_COLOR)
      .attr("stroke-width", 1.5)
      .attr("opacity", 0.7);

  }, [geographies]);

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-6">
          Global to Vietnam Network
        </h2>

        {/* 4 Key Network Statistics placed directly below the title */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-10">
          {stats.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="bg-white rounded-2xl p-5 border border-gray-200/80 shadow-xs hover:shadow-md hover:border-gray-300 transition-all duration-300 flex flex-col justify-between"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center border ${item.bg}`}>
                    <Icon className={`w-5 h-5 ${item.color}`} />
                  </div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
                    0{idx + 1}
                  </span>
                </div>
                <div>
                  <div className={`text-2xl sm:text-3xl font-extrabold tracking-tight mb-1 text-gray-900`}>
                    {item.value}
                  </div>
                  <p className="text-xs sm:text-sm text-gray-600 font-medium leading-snug">
                    {item.label}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Map Container */}
        <div className="bg-slate-50/50 rounded-2xl p-4 shadow-sm border border-gray-100">
          <svg ref={ref} className="w-full h-auto"></svg>
        </div>

        {/* Color Legend Defining Countries Below the Map */}
        <div className="mt-8">
          <h3 className="text-center text-sm font-semibold uppercase tracking-wider text-gray-500 mb-4">
            Network Country Legend
          </h3>

          <div className="flex flex-wrap justify-center items-center gap-2.5 max-w-5xl mx-auto">
            {/* Vietnam Destination Pill */}
            <div
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-50 border border-red-200 shadow-xs font-semibold text-xs text-red-900"
            >
              <span
                className="w-3 h-3 rounded-full shrink-0 shadow-xs ring-2 ring-red-300"
                style={{ backgroundColor: VIETNAM_COLOR }}
              />
              <span>Vietnam (Hub)</span>
            </div>

            {/* Sourcing Countries */}
            {sourceCountries.map((country) => (
              <div
                key={country.name}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-gray-200/80 shadow-xs hover:border-gray-300 transition-all text-xs text-gray-700 font-medium"
              >
                <span
                  className="w-3 h-3 rounded-full shrink-0 shadow-xs"
                  style={{ backgroundColor: country.color }}
                />
                <span>{country.name}</span>
              </div>
            ))}
          </div>
        </div>

        <p className="text-center text-gray-600 mt-8 text-base max-w-4xl mx-auto leading-relaxed">
          Our global sourcing network spans 20+ countries across the Americas, Europe, Asia, and Oceania — delivering world-class beef, lamb, poultry, seafood, potatoes, and pantry essentials directly to Vietnam from Australia, USA, Japan, Italy, Canada, Spain, Brazil, Chile, India, New Zealand, China, France, Poland, Germany, UK, Norway, Thailand, Singapore, and Argentina.
        </p>
      </div>
    </section>
  );
};

export default GlobalToVietnamMap;

