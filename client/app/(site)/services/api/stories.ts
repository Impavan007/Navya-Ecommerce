import { ENDPOINTS } from './config';
import { baseApiService } from './base';
import type { StoriesApiResponse, StoryDetailApiResponse } from '../../types/api';

export class StoriesApiService {
  async getStories(params?: { page?: number; limit?: number }): Promise<StoriesApiResponse> {
    const query = new URLSearchParams();
    if (params?.page) query.set('page', String(params.page));
    if (params?.limit) query.set('limit', String(params.limit));
    const path = query.toString() ? `${ENDPOINTS.STORIES.LIST}?${query.toString()}` : ENDPOINTS.STORIES.LIST;
    const resp = await baseApiService.get<StoriesApiResponse['data']>(path);
    return {
      success: !!resp?.data,
      message: resp?.message || 'OK',
      data: resp?.data as any,
    } as StoriesApiResponse;
  }

  async getStoryDetail(id: string, opts?: { product?: string }): Promise<StoryDetailApiResponse> {
    const query = new URLSearchParams();
    if (opts?.product) query.set('product', opts.product);
    const path = query.toString() ? `${ENDPOINTS.STORIES.LIST}/${id}?${query.toString()}` : `${ENDPOINTS.STORIES.LIST}/${id}`;
    const resp = await baseApiService.get<StoryDetailApiResponse['data']>(path);
    return {
      success: !!resp?.data,
      message: resp?.message || 'OK',
      data: resp?.data as any,
    } as StoryDetailApiResponse;
  }
}

export const storiesApiService = new StoriesApiService();


