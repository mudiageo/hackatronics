"use client"
import { BarChart, Bar, XAxis, YAxis } from 'recharts'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'

const NestedBarShape = (props: any) => {
  const { x, y, width, height, payload } = props;
  // Ensure we don't get negative widths
  const getWidth = (percent: number, padding: number) => Math.max(0, (percent / 100) * width - padding);
  
  return (
    <g>
      {/* Background (Recorded 100%) - Blue */}
      <rect x={x} y={y} width={width} height={height} rx={height / 2} fill="#e5e7eb" opacity={0.9} />
      
      {/* Middle (Settled) - Teal */}
      <rect 
        x={x + 4} 
        y={y + 4} 
        width={getWidth(payload.settled, 8)} 
        height={height - 8} 
        rx={(height - 8) / 2} 
        fill="#3b82f6" 
      />
      
      {/* Foreground (Attested) - Lime Green */}
      <rect 
        x={x + 8} 
        y={y + 8} 
        width={getWidth(payload.attested, 16)} 
        height={height - 16} 
        rx={(height - 16) / 2} 
        fill="#22c55e" 
      />
    </g>
  )
}

export function CoverageChart({ coverageData, coverageConfig }: any) {
  return (
    <ChartContainer config={coverageConfig} className="h-full w-full">
      <BarChart data={coverageData} layout="vertical" margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
        <XAxis type="number" hide domain={[0, 100]} />
        <YAxis dataKey="name" type="category" hide />
        <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
        {/* We only need one Bar element, it will draw all three layers using the custom shape */}
        <Bar dataKey="recorded" shape={<NestedBarShape />} />
      </BarChart>
    </ChartContainer>
  )
}
