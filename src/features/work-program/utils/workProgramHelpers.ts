import type {
  WorkProgram,
  ViewType,
} from '../types/workProgram'

/*
|--------------------------------------------------------------------------
| HAS SCHEDULE
|--------------------------------------------------------------------------
*/

export function hasSchedule(
  item: WorkProgram,
  day: number
) {
  return item.scheduled_dates?.includes(
    day
  )
}

/*
|--------------------------------------------------------------------------
| GET DAYS
|--------------------------------------------------------------------------
*/

export function getDays(
  viewType: ViewType,
  weekIndex: number,
  month: number,
  year: number
) {

  /*
  |--------------------------------------------------------------------------
  | MONTHLY
  |--------------------------------------------------------------------------
  */

  if (
    viewType === 'monthly'
  ) {

    return Array.from(
      {
        length: new Date(
          year,
          month,
          0
        ).getDate(),
      },

      (_, i) => i + 1
    )
  }

  /*
  |--------------------------------------------------------------------------
  | WEEKLY
  |--------------------------------------------------------------------------
  */

  const start =
    weekIndex * 7 + 1

  return Array.from(
    { length: 7 },

    (_, i) => start + i
  ).filter(
    (day) =>

      day <=

      new Date(
        year,
        month,
        0
      ).getDate()
  )
}