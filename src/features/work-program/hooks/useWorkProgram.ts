import {
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'

import {
  createWorkProgram,
  deleteWorkProgram,
  getLocations,
  getMasterJobs,
  getWorkPrograms,
  updateWorkProgram,
} from '@/api/workProgram'

import type {
  ViewType,
} from '../types/workProgram'

export function useWorkProgram(
  viewType: ViewType,
  month: number,
  year: number,
  category: 'plan' | 'out_plan' = 'plan'
) {

  const queryClient =
    useQueryClient()

  /*
  |--------------------------------------------------------------------------
  | WORK PROGRAMS
  |--------------------------------------------------------------------------
  */

  const workProgramsQuery =
    useQuery({

      queryKey: [
        'work-programs',
        viewType,
        month,
        year,
        category,
      ],

      queryFn: () =>
        getWorkPrograms({

          category,

          plan:
            viewType === 'all'
              ? undefined
              : viewType, 

          month,
          year,
        }),
    })

    const allWorkProgramsQuery =
      useQuery({

        queryKey: [
          'all-work-programs',
        ],

        queryFn: () =>
          getWorkPrograms(),
      })

  /*
  |--------------------------------------------------------------------------
  | MASTER JOBS
  |--------------------------------------------------------------------------
  */

  const masterJobsQuery =
    useQuery({

      queryKey: ['master-jobs'],

      queryFn: getMasterJobs,
    })

  /*
  |--------------------------------------------------------------------------
  | LOCATIONS
  |--------------------------------------------------------------------------
  */

  const locationsQuery =
    useQuery({

      queryKey: ['locations'],

      queryFn: () =>
        getLocations()
    })

  /*
  |--------------------------------------------------------------------------
  | CREATE
  |--------------------------------------------------------------------------
  */

  const createMutation =
    useMutation({

      mutationFn:
        createWorkProgram,

      onSuccess: () => {

        queryClient.invalidateQueries({
          queryKey: [
            'work-programs',
          ],
        })
      },
    })

  /*
  |--------------------------------------------------------------------------
  | UPDATE
  |--------------------------------------------------------------------------
  */

  const updateMutation =
    useMutation({

      mutationFn:
        ({
          id,
          payload,
        }: any) =>

          updateWorkProgram(
            id,
            payload
          ),

      onSuccess: () => {

        queryClient.invalidateQueries({
          queryKey: [
            'work-programs',
          ],
        })
      },
    })

  /*
  |--------------------------------------------------------------------------
  | DELETE
  |--------------------------------------------------------------------------
  */

  const deleteMutation =
    useMutation({

      mutationFn:
        deleteWorkProgram,

      onSuccess: () => {

        queryClient.invalidateQueries({
          queryKey: [
            'work-programs',
          ],
        })
      },
    })

  return {

    workProgramsQuery,

    allWorkProgramsQuery,

    masterJobsQuery,

    locationsQuery,

    createMutation,

    updateMutation,

    deleteMutation,
  }
}