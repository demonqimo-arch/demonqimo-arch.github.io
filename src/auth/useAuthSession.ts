import { useState } from 'react'
import { isUnlocked } from '../lib/localAuth'

export function useAuthSession() {
  const [loggedIn, setLoggedIn] = useState(isUnlocked())

  return {
    loggedIn,
    markLoggedIn: () => setLoggedIn(true),
  }
}
