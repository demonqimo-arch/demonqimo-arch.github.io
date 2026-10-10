import { useState } from 'react'
import { hasValidLocalToken } from '../lib/workerApi'

export function useAuthSession() {
  // 纯本地判断token有没有过期，不需要联网，不会再出现"检查登录状态卡住空白"的问题
  const [loggedIn, setLoggedIn] = useState(hasValidLocalToken())

  return {
    loggedIn,
    markLoggedIn: () => setLoggedIn(true),
    markLoggedOut: () => setLoggedIn(false),
  }
}
