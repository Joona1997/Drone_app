
export interface Violation  {
    pilotId: string;
    firstName: string;
    lastName: string;
    phoneNumber: string;
    email: string;
    serialNumber: string;
    lastSeen: Date;
    positionY: number;
    positionX: number;
    distance: number;
}

export interface Drone  {
    serialNumber: string;
    timeStamp: Date;
    positionY: number;
    positionX: number;
    distance: number;
}

export type Pilot = {
    pilotId: string,
    firstName: string,
    lastName: string,
    phoneNumber: string,
    createdDt: Date,
    email: string
}