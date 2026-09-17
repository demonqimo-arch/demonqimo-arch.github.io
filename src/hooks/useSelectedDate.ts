import { format } from 'date-fns'
import { useSearchParams } from 'react-router-dom'

export function useSelectedDate() {
  const [searchParams, setSearchParams] = useSearchParams()
  const dateIso = searchParams.get('date') ?? format(new Date(), 'yyyy-MM-dd')

  const setDateIso = (next: string) => {
    const params = new URLSearchParams(searchParams)
    params.set('date', next)
    setSearchParams(params)
  }

  return { dateIso, setDateIso }
}
