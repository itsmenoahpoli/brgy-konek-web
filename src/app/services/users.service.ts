import { Injectable } from '@angular/core';
import apiClient from '../utils/api.util';

export interface User {
  _id?: string;
  name: string;
  email: string;
  mobile_number: string;
  user_type: string;
  address: string;
  birthdate: string;
  barangay_clearance: string;
  createdAt?: string;
  updatedAt?: string;
}

@Injectable({ providedIn: 'root' })
export class UsersService {
  private endpoint = '/administrator/users';

  async getUsers(): Promise<User[] | undefined> {
    try {
      const res = await apiClient.get(this.endpoint);
      return res?.data || [];
    } catch (error) {
      return undefined;
    }
  }

  async getUser(id: string): Promise<User | null> {
    try {
      const res = await apiClient.get(`${this.endpoint}/${id}`);
      return res?.data || null;
    } catch (error) {
      return null;
    }
  }

  async createUser(user: Partial<User>): Promise<User | undefined> {
    try {
      const res = await apiClient.post(this.endpoint, user);
      return res?.data;
    } catch (error) {
      return undefined;
    }
  }

  async updateUser(id: string, user: Partial<User>): Promise<User | undefined> {
    try {
      const res = await apiClient.put(`${this.endpoint}/${id}`, user);
      return res?.data;
    } catch (error) {
      return undefined;
    }
  }

  async deleteUser(id: string): Promise<boolean> {
    try {
      await apiClient.delete(`${this.endpoint}/${id}`);
      return true;
    } catch (error) {
      return false;
    }
  }
}
