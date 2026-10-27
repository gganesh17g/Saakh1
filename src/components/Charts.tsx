import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Line,
  ComposedChart,
} from "recharts";
export function MoneyChart({
  data,
  field = "cash",
}: {
  data: Record<string, unknown>[];
  field?: string;
}) {
  return (
    <div className="chart">
      <ResponsiveContainer width="100%" height={230}>
        <ComposedChart data={data}>
          <defs>
            <linearGradient id="cyan" x1="0" y1="0" x2="0" y2="1">
              <stop stopColor="#49d9ff" stopOpacity={0.3} />
              <stop offset="1" stopColor="#49d9ff" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="var(--line)" vertical={false} />
          <XAxis
            dataKey={data[0]?.month ? "month" : "day"}
            tick={{ fill: "#94a3b8", fontSize: 10 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tickFormatter={(v) => `${(v / 100000).toFixed(0)}L`}
            tick={{ fill: "#94a3b8", fontSize: 10 }}
            axisLine={false}
            tickLine={false}
            width={38}
          />
          <Tooltip
            contentStyle={{
              background: "var(--card)",
              border: "1px solid var(--line)",
              borderRadius: 10,
            }}
            formatter={(v) =>
              `₹${Number(v).toLocaleString("en-IN", { maximumFractionDigits: 0 })}`
            }
          />
          <Area
            type="monotone"
            dataKey={field}
            stroke="#49d9ff"
            fill="url(#cyan)"
            strokeWidth={2}
          />
          {data[0]?.low !== undefined && (
            <Line
              dataKey="low"
              stroke="#8a7cff"
              strokeDasharray="3 4"
              dot={false}
            />
          )}
          <Line
            dataKey="selected"
            stroke="#ffbe5c"
            dot={{ r: 5, fill: "#ffbe5c" }}
            connectNulls={false}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
export function MiniChart({ values }: { values: number[] }) {
  return (
    <ResponsiveContainer width="100%" height={55}>
      <AreaChart data={values.map((v) => ({ v }))}>
        <Area dataKey="v" stroke="#36d6a0" fill="#36d6a015" strokeWidth={2} />
      </AreaChart>
    </ResponsiveContainer>
  );
}
