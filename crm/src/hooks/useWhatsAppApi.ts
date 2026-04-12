/**
 * useWhatsAppApi - WhatsApp API integration hook
 *
 * Features:
 * - Fetch API wrapper with error handling
 * - Type-safe API responses
 * - Automatic retry on network errors
 * - Loading/error state management
 * - Support for direct Meta API or CRM backend
 */

import { useState, useCallback } from 'react'
import { WhatsAppConfig, CRMConfig } from '@/utils/storage'

interface ApiErrorResponse {
  error?: {
    code: number
    message: string
  }
  message?: string
  ok: boolean
}

interface UseWhatsAppApiOptions {
  config?: WhatsAppConfig
  crmConfig?: CRMConfig
  retries?: number // default: 2
}

interface UseWhatsAppApiState {
  loading: boolean;
  error: string | null;
  data: any;
}

/**
 * Hook for making WhatsApp API calls with error handling and retry logic
 *
 * @param options - Configuration options (config, crmConfig, retries)
 *
 * @example
 * ```tsx
 * const api = useWhatsAppApi({ config, retries: 3 })
 *
 * // Send direct via Meta API
 * const { data, error, loading } = await api.send({
 *   type: 'text',
 *   to: '14155552345',
 *   text: 'Hello!'
 * })
 *
 * // Or use CRM backend
 * const result = await api.sendViaCRM({
 *   recipient: '14155552345',
 *   message: 'Hello via CRM!'
 * })
 * ```
 */
export function useWhatsAppApi(options: UseWhatsAppApiOptions = {}) {
  const { config, crmConfig, retries = 2 } = options;

  const [state, setState] = useState<UseWhatsAppApiState>({
    loading: false,
    error: null,
    data: null,
  });

  // Generic API call with retry logic
  const callApi = useCallback(
    async <T,>(url: string, init: RequestInit = {}): Promise<T | null> => {
      setState({ loading: true, error: null, data: null });

      let lastError: Error | null = null;

      for (let attempt = 0; attempt <= retries; attempt++) {
        try {
          const response = await fetch(url, {
            ...init,
            headers: {
              'Content-Type': 'application/json',
              ...init.headers,
            },
          });

          if (!response.ok) {
            const errorData = (await response.json()) as ApiErrorResponse;
            throw new Error(
              errorData.error?.message ||
                errorData.message ||
                `HTTP ${response.status}`
            );
          }

          const data = (await response.json()) as T;
          setState({ loading: false, error: null, data });
          return data;
        } catch (error) {
          lastError = error instanceof Error ? error : new Error(String(error));

          // Don't retry on last attempt
          if (attempt === retries) {
            setState({
              loading: false,
              error: lastError.message,
              data: null,
            });
          } else {
            // Exponential backoff: 1s, 2s, 4s
            const delay = Math.pow(2, attempt) * 1000;
            await new Promise((resolve) => setTimeout(resolve, delay));
          }
        }
      }

      return null;
    },
    [retries]
  );

  // Send text message via Meta Graph API
  const sendTextDirect = useCallback(
    async (to: string, text: string) => {
      if (!config?.phoneNumberId || !config?.accessToken) {
        setState({
          loading: false,
          error: 'WhatsApp config not available',
          data: null,
        });
        return null;
      }

      const url = `${config.baseUrl}/${config.phoneNumberId}/messages`;
      const body = {
        messaging_product: 'whatsapp',
        to,
        type: 'text',
        text: { body: text },
      };

      return callApi<{ messages: Array<{ id: string }> }>(url, {
        method: 'POST',
        body: JSON.stringify(body),
        headers: {
          Authorization: `Bearer ${config.accessToken}`,
        },
      });
    },
    [config, callApi]
  );

  // Send template message via Meta Graph API
  const sendTemplateDirect = useCallback(
    async (
      to: string,
      templateName: string,
      languageCode: string = 'en',
      parameters: string[] = []
    ) => {
      if (!config?.phoneNumberId || !config?.accessToken) {
        setState({
          loading: false,
          error: 'WhatsApp config not available',
          data: null,
        });
        return null;
      }

      const url = `${config.baseUrl}/${config.phoneNumberId}/messages`;
      const body = {
        messaging_product: 'whatsapp',
        to,
        type: 'template',
        template: {
          name: templateName,
          language: { code: languageCode },
          ...(parameters.length > 0 && {
            components: [
              {
                type: 'body',
                parameters: parameters.map((p) => ({ type: 'text', text: p })),
              },
            ],
          }),
        },
      };

      return callApi<{ messages: Array<{ id: string }> }>(url, {
        method: 'POST',
        body: JSON.stringify(body),
        headers: {
          Authorization: `Bearer ${config.accessToken}`,
        },
      });
    },
    [config, callApi]
  );

  // Send via CRM backend
  const sendViaCRM = useCallback(
    async (payload: {
      recipient: string;
      message: string;
      templateId?: string;
      type?: 'text' | 'template';
    }) => {
      if (!crmConfig?.baseUrl) {
        setState({
          loading: false,
          error: 'CRM config not available',
          data: null,
        });
        return null;
      }

      const url = `${crmConfig.baseUrl}/api/whatsapp/send`;

      return callApi<{ success: boolean; messageId?: string }>(url, {
        method: 'POST',
        body: JSON.stringify(payload),
        headers: {
          Authorization: `Bearer ${localStorage.getItem('auth-token') || ''}`,
        },
      });
    },
    [crmConfig, callApi]
  );

  // Get message status
  const getMessageStatus = useCallback(
    async (messageId: string) => {
      if (!config?.accessToken) {
        setState({
          loading: false,
          error: 'WhatsApp config not available',
          data: null,
        });
        return null;
      }

      const url = `${config.baseUrl}/${messageId}`;

      return callApi<{ status: string; timestamp: string }>(url, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${config.accessToken}`,
        },
      });
    },
    [config, callApi]
  );

  // Get conversations (CRM backend)
  const getConversations = useCallback(
    async (workspaceId: string) => {
      if (!crmConfig?.baseUrl) {
        setState({
          loading: false,
          error: 'CRM config not available',
          data: null,
        });
        return null;
      }

      const url = `${crmConfig.baseUrl}/api/conversations?workspaceId=${workspaceId}`;

      return callApi<Array<{ id: string; contactId: string; lastMessage: string }>>(url, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('auth-token') || ''}`,
        },
      });
    },
    [crmConfig, callApi]
  );

  return {
    ...state,
    sendTextDirect,
    sendTemplateDirect,
    sendViaCRM,
    getMessageStatus,
    getConversations,
  };
}
