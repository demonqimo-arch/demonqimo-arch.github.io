import { useEffect, useState } from 'react'
import { hasValidLocalToken, onUnauthorized } from '../lib/workerApi'

export function useAuthSession() {
  // 纯本地判断token有没有过期，不需要联网，不会再出现"检查登录状态卡住空白"的问题
  const [loggedIn, setLoggedIn] = useState(hasValidLocalToken())
  const [kickedOut, setKickedOut] = useState(false)

  useEffect(() => {
    // 进入主界面后，如果某次数据请求发现凭证已经失效（比如后台redeploy、或极少数情况的问题），
    // 自动弹回登录界面，而不是停留在"看起来登录了但什么数据都拿不到"的死状态
    return onUnauthorized(() => {
      setLoggedIn(false)
      setKickedOut(true)
    })
  }, [])

  return {
    loggedIn,
    kickedOut,
    markLoggedIn: () => {
      setKickedOut(false)
      setLoggedIn(true)
    },
  }
}
