import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';

const API_BASE_URL = 'http://localhost:3000/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  user?: T;
  status?: number;
}

export class ApiService {
  static async get<T>(
    url: string,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    try {
      const response: AxiosResponse<ApiResponse<T>> = await apiClient.get(
        url,
        config
      );
      return {
        ...response.data,
        status: response.status,
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Network error occurred',
        status: error.response?.status,
      };
    }
  }

  static async post<T>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    try {
      const response: AxiosResponse<ApiResponse<T>> = await apiClient.post(
        url,
        data,
        config
      );
      return {
        ...response.data,
        status: response.status,
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Network error occurred',
        status: error.response?.status,
      };
    }
  }

  static async put<T>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    try {
      const response: AxiosResponse<ApiResponse<T>> = await apiClient.put(
        url,
        data,
        config
      );
      return {
        ...response.data,
        status: response.status,
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Network error occurred',
        status: error.response?.status,
      };
    }
  }

  static async delete<T>(
    url: string,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    try {
      const response: AxiosResponse<ApiResponse<T>> = await apiClient.delete(
        url,
        config
      );
      return {
        ...response.data,
        status: response.status,
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Network error occurred',
        status: error.response?.status,
      };
    }
  }

  static async postFormData<T>(
    url: string,
    formData: FormData,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    try {
      const response: AxiosResponse<ApiResponse<T>> = await apiClient.post(
        url,
        formData,
        {
          ...config,
          headers: {
            ...config?.headers,
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      return {
        ...response.data,
        status: response.status,
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Network error occurred',
        status: error.response?.status,
      };
    }
  }
}
