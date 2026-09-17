"use client"
import { RadialBarChart, RadialBar, PolarAngleAxis } from 'recharts'
import { ChartContainer } from '@/components/ui/chart'

export function TrustScoreCircle({ score }: { score: number }) {
  let strokeColor = "hsl(var(--primary))";
  if (score < 50) strokeColor = "hsl(var(--destructive))";
  else if (score < 80) strokeColor = "hsl(var(--alert) / 0.8)"; 
  else strokeColor = "#22c55e"; 

  const chartData = [{ name: "score", value: score, fill: strokeColor }]
  const chartConfig = { score: { label: "Trust Score", color: strokeColor } }

  return (
    <div className="relative flex items-center justify-center w-36 h-36 group">
      <ChartContainer config={chartConfig} className="w-full h-full absolute inset-0">
        <RadialBarChart
          data={chartData}
          innerRadius="75%"
          outerRadius="100%"
          startAngle={90}
          endAngle={-270}
          barSize={10}
        >
          <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />
          <RadialBar dataKey="value" cornerRadius={10} background={{ fill: 'hsl(var(--muted))', opacity: 0.3 }} />
        </RadialBarChart>
      </ChartContainer>
      
      <div className="flex flex-col items-center justify-center relative z-10 bg-background rounded-full w-24 h-24 shadow-sm border border-border">
        <span className="text-3xl font-bold text-foreground group-hover:scale-110 transition-transform">{score}</span>
        <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mt-1">Trust</span>
      </div>
    </div>
  )
}
