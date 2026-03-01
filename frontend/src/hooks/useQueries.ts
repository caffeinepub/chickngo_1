import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { Offer, OfferId } from '../backend';

// ─── Offers ──────────────────────────────────────────────────────────────────

export function useGetAllOffers() {
  const { actor, isFetching } = useActor();

  return useQuery<Offer[]>({
    queryKey: ['offers'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllOffers();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAddOffer() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      name,
      requiredPoints,
      rewardDescription,
    }: {
      name: string;
      requiredPoints: bigint;
      rewardDescription: string;
    }) => {
      if (!actor) throw new Error('Actor not ready');
      return actor.addOffer(name, requiredPoints, rewardDescription);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['offers'] });
    },
  });
}

export function useDeleteOffer() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (offerId: OfferId) => {
      if (!actor) throw new Error('Actor not ready');
      return actor.deleteOffer(offerId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['offers'] });
    },
  });
}

// ─── Local Customer Store (in-memory, since backend has no customer CRUD) ────
// The backend does not expose customer management endpoints.
// We manage customers in localStorage as a local store.

export interface LocalCustomer {
  customerId: string;
  name: string;
  mobile: string;
  points: number;
  createdAt: string;
}

export interface LocalScan {
  customerId: string;
  pointsAdded: number;
  scanDate: string;
}

const CUSTOMERS_KEY = 'chickngo_customers';
const SCANS_KEY = 'chickngo_scans';

export function getLocalCustomers(): LocalCustomer[] {
  try {
    return JSON.parse(localStorage.getItem(CUSTOMERS_KEY) || '[]');
  } catch {
    return [];
  }
}

export function saveLocalCustomers(customers: LocalCustomer[]) {
  localStorage.setItem(CUSTOMERS_KEY, JSON.stringify(customers));
}

export function getLocalScans(): LocalScan[] {
  try {
    return JSON.parse(localStorage.getItem(SCANS_KEY) || '[]');
  } catch {
    return [];
  }
}

export function saveLocalScans(scans: LocalScan[]) {
  localStorage.setItem(SCANS_KEY, JSON.stringify(scans));
}

export function generateCustomerId(): string {
  const ts = Date.now();
  const rand = Math.floor(Math.random() * 9000) + 1000;
  return `CUST${ts}${rand}`;
}

export function useLocalCustomers() {
  return useQuery<LocalCustomer[]>({
    queryKey: ['local-customers'],
    queryFn: () => getLocalCustomers(),
    staleTime: 0,
  });
}

export function useAddLocalCustomer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ name, mobile }: { name: string; mobile: string }) => {
      const customers = getLocalCustomers();
      const duplicate = customers.find(
        (c) => c.mobile.trim() === mobile.trim()
      );
      if (duplicate) {
        throw new Error('A customer with this mobile number already exists.');
      }
      const newCustomer: LocalCustomer = {
        customerId: generateCustomerId(),
        name: name.trim(),
        mobile: mobile.trim(),
        points: 0,
        createdAt: new Date().toISOString(),
      };
      customers.push(newCustomer);
      saveLocalCustomers(customers);
      return newCustomer;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['local-customers'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
    },
  });
}

export function useAddPointsToCustomer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      customerId,
      points,
    }: {
      customerId: string;
      points: number;
    }) => {
      const customers = getLocalCustomers();
      const idx = customers.findIndex((c) => c.customerId === customerId);
      if (idx === -1) throw new Error('Customer not found');
      customers[idx].points += points;
      saveLocalCustomers(customers);

      const scans = getLocalScans();
      scans.push({
        customerId,
        pointsAdded: points,
        scanDate: new Date().toISOString(),
      });
      saveLocalScans(scans);

      return customers[idx];
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['local-customers'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
    },
  });
}

export function useDashboardStats() {
  return useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: () => {
      const customers = getLocalCustomers();
      const scans = getLocalScans();
      const today = new Date().toDateString();
      const todayScans = scans.filter(
        (s) => new Date(s.scanDate).toDateString() === today
      );
      const totalPoints = scans.reduce((sum, s) => sum + s.pointsAdded, 0);
      return {
        totalCustomers: customers.length,
        todayScans: todayScans.length,
        totalPoints,
      };
    },
    staleTime: 0,
  });
}
