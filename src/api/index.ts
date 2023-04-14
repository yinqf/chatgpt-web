import type { AxiosProgressEvent, GenericAbortSignal } from 'axios'
import { post } from '@/utils/request'
import { useSettingStore } from '@/store'

export function fetchChatConfig<T = any>() {
  return post<T>({
    url: '/chat/config',
  })
}

export function fetchChatAPIProcess<T = any>(
  params: {
    prompt: string
    options?: { conversationId?: string; parentMessageId?: string }
    signal?: GenericAbortSignal
    onDownloadProgress?: (progressEvent: AxiosProgressEvent) => void },
) {
  const settingStore = useSettingStore()

  // base64编码
  const encoder: TextEncoder = new TextEncoder()
  const data: Uint8Array = encoder.encode(params.prompt)
  params.prompt = btoa(String.fromCharCode(...data))

  return post<T>({
    url: '/chat/chat-process',
    data: { prompt: params.prompt, options: params.options, systemMessage: settingStore.systemMessage },
    signal: params.signal,
    onDownloadProgress: params.onDownloadProgress,
  })
}

export function fetchSession<T>() {
  return post<T>({
    url: '/chat/session',
  })
}

export function fetchVerify<T>(token: string) {
  return post<T>({
    url: '/chat/verify',
    data: { token },
  })
}
