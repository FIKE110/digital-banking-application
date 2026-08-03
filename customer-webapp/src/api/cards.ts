import client from './client';
import type { ApiResponse } from '../types';

export interface Card {
  id: string;
  userId: number;
  accountNumber: string;
  cardNumber: string;
  cardType: string;
  expiryDate: string;
  cvv: string;
  status: string;
  dailyLimit: number;
  monthlyLimit: number;
  createdAt: string;
}

export interface CreateCardRequest {
  accountNumber: string;
  cardType: string;
}

export const getCards = () =>
  client.get<ApiResponse<Card[]>>('/cards').then(r => r.data);

export const createCard = (data: CreateCardRequest) =>
  client.post<ApiResponse<Card>>('/cards', data).then(r => r.data);

export const freezeCard = (id: string) =>
  client.post<ApiResponse<Card>>(`/cards/${id}/freeze`).then(r => r.data);

export const unfreezeCard = (id: string) =>
  client.post<ApiResponse<Card>>(`/cards/${id}/unfreeze`).then(r => r.data);

export const replaceCard = (id: string) =>
  client.post<ApiResponse<Card>>(`/cards/${id}/replace`).then(r => r.data);

export const changeCardPin = (id: string, currentPin: string, newPin: string) =>
  client.put<ApiResponse<Card>>(`/cards/${id}/pin`, { currentPin, newPin }).then(r => r.data);

export const updateCardLimits = (id: string, dailyLimit: number, monthlyLimit: number) =>
  client.patch<ApiResponse<Card>>(`/cards/${id}/limits`, { dailyLimit, monthlyLimit }).then(r => r.data);
