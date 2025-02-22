export interface DataFetch {
  baseTemperature: number;
  monthlyVariance: MonthlyVariance[];
}

export interface MonthlyVariance {
  year: number;
  month: number;
  variance: number;
}
