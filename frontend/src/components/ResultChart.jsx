import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, LineChart, Line, Rectangle,
} from "recharts";

function isNumeric(val) {
  return val !== null && val !== "" && !isNaN(Number(val));
}

function getTheme() {
  const dark = document.documentElement.getAttribute("data-theme") === "dark";
  return {
    barFill:       dark ? "#C8D0DA" : "#0A0A0A",
    barActive:     dark ? "#818CF8" : "#6366F1",
    grid:          dark ? "#1F2937" : "#D8D4CC",
    tick:          dark ? "#6B7280" : "#A8A09A",
    tooltipBg:     dark ? "#111827" : "#FFFFFF",
    tooltipBorder: dark ? "#1F2937" : "#E3DDD4",
    tooltipLabel:  dark ? "#E5E7EB" : "#0A0A0A",
    lineFill:      dark ? "#818CF8" : "#6366F1",
  };
}

export default function ResultChart({ columns, rows }) {
  if (!rows || rows.length < 2 || columns.length < 2) return null;

  const labelIdx = columns.findIndex((_, i) => !isNumeric(rows[0][i]));
  const valueIdx = columns.findIndex((_, i) => i !== labelIdx && isNumeric(rows[0][i]));

  if (labelIdx === -1 || valueIdx === -1) return null;

  const data = rows.slice(0, 20).map((row) => ({
    label: String(row[labelIdx]),
    value: Number(row[valueIdx]),
  }));

  const labelKey = columns[labelIdx];
  const valueKey = columns[valueIdx];
  const t = getTheme();

  const isTimeSeries = data.some((d) => /\d{4}-\d{2}/.test(d.label));

  return (
    <div className="chart-wrapper">
      <p className="chart-title">{valueKey} by {labelKey}</p>
      <ResponsiveContainer width="100%" height={200}>
        {isTimeSeries ? (
          <LineChart data={data} margin={{ top: 4, right: 12, left: -16, bottom: 32 }}>
            <CartesianGrid strokeDasharray="4 4" stroke={t.grid} vertical={false} />
            <XAxis
              dataKey="label"
              tick={{ fontSize: 10.5, fill: t.tick }}
              angle={-30}
              textAnchor="end"
              axisLine={false}
              tickLine={false}
            />
            <YAxis tick={{ fontSize: 10.5, fill: t.tick }} axisLine={false} tickLine={false} />
            <Tooltip
              contentStyle={{ background: t.tooltipBg, border: `1px solid ${t.tooltipBorder}`, borderRadius: 8, fontSize: 12.5, boxShadow: "0 4px 12px rgba(0,0,0,0.08)" }}
              labelStyle={{ color: t.tooltipLabel, fontWeight: 600 }}
              itemStyle={{ color: t.lineFill }}
            />
            <Line
              type="monotone"
              dataKey="value"
              stroke={t.lineFill}
              strokeWidth={2}
              dot={{ r: 3, fill: t.lineFill, strokeWidth: 0 }}
              activeDot={{ r: 5, strokeWidth: 0 }}
            />
          </LineChart>
        ) : (
          <BarChart
            data={data}
            margin={{ top: 4, right: 12, left: -16, bottom: 32 }}
            barCategoryGap="40%"
            barGap={4}
          >
            <CartesianGrid strokeDasharray="4 4" stroke={t.grid} vertical={false} />
            <XAxis
              dataKey="label"
              tick={{ fontSize: 10.5, fill: t.tick }}
              angle={-30}
              textAnchor="end"
              axisLine={false}
              tickLine={false}
            />
            <YAxis tick={{ fontSize: 10.5, fill: t.tick }} axisLine={false} tickLine={false} />
            <Tooltip
              contentStyle={{ background: t.tooltipBg, border: `1px solid ${t.tooltipBorder}`, borderRadius: 8, fontSize: 12.5, boxShadow: "0 4px 12px rgba(0,0,0,0.08)" }}
              labelStyle={{ color: t.tooltipLabel, fontWeight: 600 }}
              itemStyle={{ color: t.barActive }}
              cursor={{ fill: "rgba(0,0,0,0.04)" }}
            />
            <Bar
              dataKey="value"
              fill={t.barFill}
              radius={[3, 3, 0, 0]}
              maxBarSize={48}
              activeBar={<Rectangle fill={t.barActive} radius={[3, 3, 0, 0]} />}
            />
          </BarChart>
        )}
      </ResponsiveContainer>
    </div>
  );
}
