"use client"
import { BarChart, Bar, XAxis, YAxis } from 'recharts'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'

export function CoverageChart({ coverageData, coverageConfig }: any) {
  return (
    <ChartContainer config={coverageConfig} className="h-full w-full">
      <BarChart data={coverageData} layout="vertical" stackOffset="expand">
        <XAxis type="number" hide domain={[0, 100]} />
        <YAxis dataKey="name" type="category" hide />
        <ChartTooltip content={<ChartTooltipContent hideLabel />} />
        <Bar dataKey="attested" stackId="a" fill="var(--color-attested)" />
        <Bar dataKey="settledOnly" stackId="a" fill="var(--color-settledOnly)" />
        <Bar dataKey="recordedOnly" stackId="a" fill="var(--color-recordedOnly)" />
      </BarChart>
    </ChartContainer>
  )
}
