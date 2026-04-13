/**
 * API Client Wrapper
 * 
 * - Centralized HTTP requests with proper headers
 * - Error handling
 * - Token management
 * - Request/Response types
 */

import axios, { AxiosError, AxiosInstance } from 'axios'
import { BACKEND_BASE } from './constants'
import { getCrmToken, getCrmBaseUrl, updateCrmConfig, clearCrmConfig } from './storage'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ApiErrorResponse {
  ok: false
  msg: string
  code?: string | number
  data?: any
}

export interface ApiSuccessResponse<T = any> {
  ok: true
  msg: string
  data?: T
}

export type ApiResponse<T = any> = ApiSuccessResponse<T> | ApiErrorResponse

export interface MetaApiError {
  error: {
    message: string
    code: number
    type: string
  }
}

// ─── API Client Instance ──────────────────────────────────────────────────────

let apiClient: AxiosInstance | null = null

/**
 * Initialize or get API client instance
 */
function getApiClient(): AxiosInstance {
  if (!apiClient) {
    apiClient = axios.create({
      baseURL: BACKEND_BASE,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    })

    // Add authorization header automatically
    apiClient.interceptors.request.use((config) => {
      const token = getCrmToken()
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }
      return config
    })

    // Handle 401 Unauthorized
    apiClient.interceptors.response.use(
      response => response,
      error => {
        if (error.response?.status === 401) {
          clearCrmConfig()
          window.location.reload()
        }
        return Promise.reject(error)
      }
    )
  }

  return apiClient
}

// ─── Whatsapp Meta Graph API ──────────────────────────────────────────────────

/**
 * Send a text message via WhatsApp Meta API
 */
export async function sendWhatsAppMessage(
  baseUrl: string,
  phoneNumberId: string,
  accessToken: string,
  to: string,
  text: string
): Promise<ApiResponse> {
  try {
    const response = await axios.post(
      `${baseUrl}/${phoneNumberId}/messages`,
      {
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to,
        type: 'text',
        text: { preview_url: false, body: text },
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    )

    const externalId = response.data?.messages?.[0]?.id
    return {
      ok: true,
      msg: `Message sent! ID: ${externalId || 'N/A'}`,
      data: response.data,
    }
  } catch (err) {
    const axiosError = err as AxiosError<MetaApiError>
    const msg = axiosError.response?.data?.error?.message || (err as Error).message
    const code = axiosError.response?.data?.error?.code

    return {
      ok: false,
      msg: `Error ${code ? `(${code})` : ''}: ${msg}`,
      code,
      data: axiosError.response?.data,
    }
  }
}

/**
 * Send a template message via WhatsApp Meta API
 */
export async function sendWhatsAppTemplate(
  baseUrl: string,
  phoneNumberId: string,
  accessToken: string,
  to: string,
  templateName: string,
  languageCode: string,
  parameters?: string[]
): Promise<ApiResponse> {
  try {
    const components: any[] = [
      { type: 'header', parameters: [] },
    ]

    if (parameters && parameters.length > 0) {
      components.push({
        type: 'body',
        parameters: parameters.map(p => ({ type: 'text', text: p })),
      })
    }

    const response = await axios.post(
      `${baseUrl}/${phoneNumberId}/messages`,
      {
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to,
        type: 'template',
        template: {
          name: templateName,
          language: { code: languageCode },
          components: components.filter(c => c.parameters.length >= 0),
        },
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    )

    const externalId = response.data?.messages?.[0]?.id
    return {
      ok: true,
      msg: `Template sent! ID: ${externalId || 'N/A'}`,
      data: response.data,
    }
  } catch (err) {
    const axiosError = err as AxiosError<MetaApiError>
    const msg = axiosError.response?.data?.error?.message || (err as Error).message
    const code = axiosError.response?.data?.error?.code

    return {
      ok: false,
      msg: `Error ${code ? `(${code})` : ''}: ${msg}`,
      code,
      data: axiosError.response?.data,
    }
  }
}

/**
 * Test WhatsApp connection
 */
export async function testWhatsAppConnection(
  baseUrl: string,
  phoneNumberId: string,
  accessToken: string
): Promise<ApiResponse> {
  try {
    const response = await axios.get(`${baseUrl}/${phoneNumberId}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    })

    if (response.data.error) {
      return {
        ok: false,
        msg: response.data.error.message,
      }
    }

    return {
      ok: true,
      msg: `Connected — ${response.data.display_phone_number || phoneNumberId}`,
      data: response.data,
    }
  } catch (err) {
    const axiosError = err as AxiosError
    const msg = (axiosError.response?.data as any)?.error?.message || axiosError.message

    return {
      ok: false,
      msg,
    }
  }
}

// ─── CRM Backend API ──────────────────────────────────────────────────────────

/**
 * Save WhatsApp config to CRM backend
 */
export async function saveWhatsAppConfigToCrm(config: {
  phoneNumberId: string
  accessToken: string
  appSecret: string
  webhookVerifyToken: string
}): Promise<ApiResponse> {
  try {
    const client = getApiClient()
    const response = await client.post('/api/settings/integrations/whatsapp', config)

    return {
      ok: true,
      msg: '✅ Saved to CRM Backend!',
      data: response.data,
    }
  } catch (err) {
    const axiosError = err as AxiosError
    const msg = (axiosError.response?.data as any)?.message || 
                (axiosError.response?.data as any)?.error || 
                axiosError.message

    return {
      ok: false,
      msg: `❌ Error: ${msg}`,
      data: axiosError.response?.data,
    }
  }
}

/**
 * Load contacts from CRM
 */
export async function loadCrmContacts(page: number = 0, size: number = 100): Promise<ApiResponse> {
  try {
    const client = getApiClient()
    const response = await client.get(`/api/contacts?page=${page}&size=${size}`)

    return {
      ok: true,
      msg: 'Contacts loaded',
      data: response.data,
    }
  } catch (err) {
    const axiosError = err as AxiosError

    return {
      ok: false,
      msg: `Error loading contacts: ${axiosError.message}`,
      data: axiosError.response?.data,
    }
  }
}

/**
 * Send message via CRM backend
 */
export async function sendMessageViaCrm(payload: {
  contactId: string
  body: string
  templateName?: string
  templateLanguage?: string
  templateParameters?: any[]
}): Promise<ApiResponse> {
  try {
    const client = getApiClient()
    const response = await client.post('/api/whatsapp/send', payload)

    return {
      ok: true,
      msg: `CRM: Message sent! msgId=${response.data.messageId}`,
      data: response.data,
    }
  } catch (err) {
    const axiosError = err as AxiosError
    const msg = (axiosError.response?.data as any)?.message || 
                (axiosError.response?.data as any)?.error || 
                axiosError.message

    return {
      ok: false,
      msg: `CRM Error: ${msg}`,
      data: axiosError.response?.data,
    }
  }
}

/**
 * Load conversations with polling
 */
export async function loadConversations(page: number = 0, size: number = 50): Promise<ApiResponse> {
  try {
    const client = getApiClient()
    const response = await client.get(`/api/whatsapp/conversations?page=${page}&size=${size}`)

    return {
      ok: true,
      msg: 'Conversations loaded',
      data: response.data,
    }
  } catch (err) {
    const axiosError = err as AxiosError

    return {
      ok: false,
      msg: `Error loading conversations: ${axiosError.message}`,
      data: axiosError.response?.data,
    }
  }
}

/**
 * Get conversation by ID
 */
export async function getConversation(conversationId: string): Promise<ApiResponse> {
  try {
    const client = getApiClient()
    const response = await client.get(`/api/whatsapp/conversations/${conversationId}`)

    return {
      ok: true,
      msg: 'Conversation loaded',
      data: response.data,
    }
  } catch (err) {
    const axiosError = err as AxiosError

    return {
      ok: false,
      msg: `Error loading conversation: ${axiosError.message}`,
      data: axiosError.response?.data,
    }
  }
}

// ─── Generic Methods ──────────────────────────────────────────────────────────

/**
 * Make a GET request
 */
export async function apiGet<T = any>(url: string): Promise<ApiResponse<T>> {
  try {
    const client = getApiClient()
    const response = await client.get<T>(url)

    return {
      ok: true,
      msg: 'Success',
      data: response.data,
    }
  } catch (err) {
    const axiosError = err as AxiosError

    return {
      ok: false,
      msg: axiosError.message,
      data: axiosError.response?.data,
    }
  }
}

/**
 * Make a POST request
 */
export async function apiPost<T = any>(url: string, data: any): Promise<ApiResponse<T>> {
  try {
    const client = getApiClient()
    const response = await client.post<T>(url, data)

    return {
      ok: true,
      msg: 'Success',
      data: response.data,
    }
  } catch (err) {
    const axiosError = err as AxiosError

    return {
      ok: false,
      msg: axiosError.message,
      data: axiosError.response?.data,
    }
  }
}

/**
 * Make a PUT request
 */
export async function apiPut<T = any>(url: string, data: any): Promise<ApiResponse<T>> {
  try {
    const client = getApiClient()
    const response = await client.put<T>(url, data)

    return {
      ok: true,
      msg: 'Success',
      data: response.data,
    }
  } catch (err) {
    const axiosError = err as AxiosError

    return {
      ok: false,
      msg: axiosError.message,
      data: axiosError.response?.data,
    }
  }
}

/**
 * Make a DELETE request
 */
export async function apiDelete<T = any>(url: string): Promise<ApiResponse<T>> {
  try {
    const client = getApiClient()
    const response = await client.delete<T>(url)

    return {
      ok: true,
      msg: 'Success',
      data: response.data,
    }
  } catch (err) {
    const axiosError = err as AxiosError

    return {
      ok: false,
      msg: axiosError.message,
      data: axiosError.response?.data,
    }
  }
}
