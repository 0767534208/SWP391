/**
 * CyclePrediction interface - represents cycle prediction data from API
 */
export interface CyclePredictionData {
  cyclePredictionID: string;
  menstrualCycleID: string;
  customerID: string;
  customerName: string;
  ovulationDate: string;
  fertileStartDate: string;
  fertileEndDate: string;
  nextPeriodStartDate: string;
  cycleStartDate: string;
  cycleLength: number;
}

/**
 * Definition for day status in the calendar
 */
export type CycleStatus = 'period' | 'fertile' | 'ovulation' | 'none';

/**
 * Data structure to store date ranges for different cycle phases
 */
export interface CyclePhases {
  periodDates: Date[];
  fertileDates: Date[];
  ovulationDates: Date[]; 
}
