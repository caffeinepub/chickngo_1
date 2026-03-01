import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export type PointsReward = bigint;
export type Points = bigint;
export type OfferId = bigint;
export interface Offer {
    id: OfferId;
    name: string;
    requiredPoints: PointsReward;
    rewardDescription: string;
}
export interface backendInterface {
    addOffer(name: string, requiredPoints: PointsReward, rewardDescription: string): Promise<OfferId>;
    addPoints(customerPrincipal: Principal, points: Points): Promise<void>;
    authenticate(username: string, password: string): Promise<boolean>;
    deleteOffer(offerId: OfferId): Promise<void>;
    getAllOffers(): Promise<Array<Offer>>;
    initialize(): Promise<void>;
    redeemOffer(customerPrincipal: Principal, offerId: OfferId): Promise<void>;
}
