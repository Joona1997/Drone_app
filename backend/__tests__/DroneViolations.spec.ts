import { DroneViolations, getDistance, parseXML } from "../src/DroneViolations";
import { Drone, Violation} from "../src/types.d";

describe("getDistance", () => {
    const Y = 350000
    const X = 250000
       
    it("return return the distance between two points", () => {
        expect(getDistance(Y, X)).toBe(100);
    });
});

describe("parseXML", () => {
    const xmlData = '<?xml version="1.0" encoding="UTF-8"?><report><deviceInformation deviceId="GUARDB1RD"><listenRange>500000</listenRange><deviceStarted>2022-12-20T15:21:53.882Z</deviceStarted><uptimeSeconds>57293</uptimeSeconds><updateIntervalMs>2000</updateIntervalMs></deviceInformation><capture snapshotTimestamp="2022-12-21T07:16:47.252Z"><drone><serialNumber>SN-GATxXVN4UI</serialNumber><model>Altitude X</model><manufacturer>DroneGoat Inc</manufacturer><mac>04:8c:09:6c:9c:0f</mac><ipv4>133.39.12.145</ipv4><ipv6>32d6:63ed:769c:a0d9:429f:e7d1:8143:3259</ipv6><firmware>7.6.7</firmware><positionY>489185.40421627177</positionY><positionX>204597.55685130172</positionX><altitude>4715.71659296625</altitude></drone>'

    it("parses xml string, check for timestamp", () => {
        expect(parseXML(xmlData).clock.snapshotTimestamp).toBe("2022-12-21T07:16:47.252Z");
    });
    it("parses xml string, check for drones serialNumber", () => {
        expect(parseXML(xmlData).drone.serialNumber).toBe("SN-GATxXVN4UI");
    });
    it("parses xml string, check for drones positionY", () => {
        expect(parseXML(xmlData).drone.positionY).toBe(489185.40421627177);
    });
    it("parses xml string, check for drones positionX", () => {
        expect(parseXML(xmlData).drone.positionX).toBe(204597.55685130172);
    });
});

describe("getUser", () => {
    const processor = new DroneViolations
    const drone: Drone = {
        serialNumber: "SN-DBZBtXSR5R",
        timeStamp: new Date(),
        positionX: 100,
        positionY: 100,
        distance: 150,
    }

    const vio: Violation = {
        pilotId: "P-REh9qYIG9A",
        firstName: "Wayne",
        lastName: "Jakubowski",
        phoneNumber: "+210862175106",
        email: "wayne.jakubowski@example.com",
        serialNumber: "SN-DBZBtXSR5R",
        lastSeen: drone.timeStamp,
        positionX: 100,
        positionY: 100,
        distance: 150,
    }
    
       
    it("processor.violations.set() adds a new violation", async () => {
        await expect(processor.getUser(drone)).resolves.toBe(vio);
    });

});


