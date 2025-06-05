// components/dashboard/Cards/StatsCard.jsx
"use client";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

export function StatsCard({
  title,
  value,
  trend,
  trendColor,
  description,
  progress,
  badge,
}) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-slate-500">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-baseline">
          <span className="text-3xl font-bold">{value}</span>
          {trend && (
            <span className={`ml-2 text-sm ${trendColor} flex items-center`}>
              <i className="fas fa-arrow-up mr-1"></i>
              {trend}
            </span>
          )}
          {badge && (
            <Badge className="ml-2 bg-blue-100 text-blue-800 hover:bg-blue-100">
              {badge}
            </Badge>
          )}
        </div>
        {description && (
          <span className="ml-2 text-sm text-slate-500">{description}</span>
        )}
        {progress && <Progress value={progress} className="h-2 mt-2" />}
      </CardContent>
    </Card>
  );
}
