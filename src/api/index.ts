import { axiosInstance } from './axios'

import { Wfm } from '../types'
import { settings } from '../hooks';

// Docs https://warframe.market/api_docs

const api = {
  auth: {
    async login(email: string, password: string): Promise<Wfm.UserDto> {
      const { data, headers } = await axiosInstance.post('/auth/signin', { email, password });
      let access_token = headers['set-cookie'] as string | undefined
      access_token = access_token ? access_token.slice(4).split(';')[0] : undefined;
      if (!access_token) throw new Error('This shouldn\'t happen')
      await settings.set('access_token', access_token)
      return data.payload.user
    },
    async logout() {
      await settings.set('access_token', undefined)
    }
  },
  items: {
    async list(): Promise<Wfm.ItemDto[]> {
      const { data } = await axiosInstance.post('/items', {});
      return data.payload.items
    }
  },
}

export default api

export const wfmThumbnail = (thumb: string) => `https://warframe.market/static/assets/${thumb}`