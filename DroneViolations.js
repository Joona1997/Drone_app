"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDistance = exports.parseXML = exports.DroneViolations = void 0;
const axios_1 = __importDefault(require("axios"));
const fast_xml_parser_1 = require("fast-xml-parser");
// Fetches, processes and stores the violation data
class DroneViolations {
    constructor() {
        // Gets the Drone data and processes it
        // Uses getUser() or updateUser() depending on if the drone is already on the list
        // At the end uses deleteOld() to delete old users.
        this.updateDroneList = () => __awaiter(this, void 0, void 0, function* () {
            try {
                // const data: Drones XML
                const { data, status } = yield axios_1.default.get('https://assignments.reaktor.com/birdnest/drones', { timeout: 2000 });
                // Parsed data
                const inJSON = parseXML(data);
                // Time from the snapshot
                const time = new Date(inJSON.clock.snapshotTimestamp);
                // List of drones from the parsed XML 
                const dronesJSON = inJSON.drone;
                // Goes through the drones and gets users or updates them to the violations
                dronesJSON.forEach((droneJSON) => {
                    const drone = {
                        serialNumber: droneJSON.serialNumber,
                        timeStamp: time,
                        positionY: Math.round(droneJSON.positionY / 1000),
                        positionX: Math.round(droneJSON.positionX / 1000),
                        distance: getDistance(droneJSON.positionY, droneJSON.positionX)
                    };
                    // Check to see if drone is already in the list
                    if (this.violations.has(drone.serialNumber)) {
                        this.updateViolation(drone);
                    }
                    // Gets new user if inside violation distance
                    else if (drone.distance <= 100) {
                        drone.distance = Math.round(drone.distance);
                        this.getUser(drone);
                    }
                });
                this.deleteOld();
                // "response status is: 200"
                console.log('updateDroneList response status is: ', status);
            }
            catch (error) {
                if (axios_1.default.isAxiosError(error)) {
                    console.log('error message: ', error.message);
                    return error.message;
                }
                else {
                    console.log('unexpected error: ', error);
                    return 'An unexpected error occurred';
                }
            }
        });
        // Gets the user data from a given drone
        // Combines user and drone data and pushes it to the list of violations.
        this.getUser = (drone) => __awaiter(this, void 0, void 0, function* () {
            try {
                // Pilot data
                const { data, status } = yield axios_1.default.get('https://assignments.reaktor.com/birdnest/pilots/' + drone.serialNumber, {
                    headers: {
                        Accept: 'application/json',
                    },
                    timeout: 2000
                });
                const violation = {
                    pilotId: data.pilotId,
                    firstName: data.firstName,
                    lastName: data.lastName,
                    phoneNumber: data.phoneNumber,
                    email: data.email,
                    serialNumber: drone.serialNumber,
                    lastSeen: drone.timeStamp,
                    positionY: drone.positionY,
                    positionX: drone.positionX,
                    distance: drone.distance,
                };
                this.violations.set(drone.serialNumber, violation);
                //  "response status is: 200"
                console.log('getUser response status is: ', status);
            }
            catch (error) {
                if (axios_1.default.isAxiosError(error)) {
                    console.log('error message: ', error.message);
                    return error.message;
                }
                else {
                    console.log('unexpected error: ', error);
                    return 'An unexpected error occurred';
                }
            }
        });
        // Deletes violations that are older than 10 minutes.
        this.deleteOld = () => {
            const timeLimit = (new Date());
            timeLimit.setMinutes(timeLimit.getMinutes() - 10);
            // Deletes old violations from the list
            for (const violation of this.violations.values()) {
                if (violation.lastSeen.getTime() <= timeLimit.getTime()) {
                    this.violations.delete(violation.serialNumber);
                }
            }
        };
        this.violations = new Map();
    }
    // Method for server to access violations
    get getViolations() {
        const jsonText = JSON.stringify(Array.from(this.violations.values()));
        return jsonText;
    }
    // Updates violations lastSeen time. Also updates distance if new is closer.
    updateViolation(drone) {
        const violation = this.violations.get(drone.serialNumber);
        violation.lastSeen = drone.timeStamp;
        if (violation.distance > drone.distance) {
            violation.distance = Math.round(drone.distance);
            violation.positionX = drone.positionX;
            violation.positionY = drone.positionY;
        }
        this.violations.set(drone.serialNumber, violation);
    }
}
exports.DroneViolations = DroneViolations;
// Parses XML string
function parseXML(data) {
    // Parsing the XML file
    const parser = new fast_xml_parser_1.XMLParser(options);
    const parsedXml = parser.parse(data);
    // List of drones and timeStamp from the parsed XML 
    return parsedXml.report.capture;
}
exports.parseXML = parseXML;
// Options for XML parser, so that snapShotTimeStamp can be found
const options = {
    ignoreAttributes: false,
    attributeNamePrefix: "",
    attributesGroupName: "clock"
};
// Calculates the distance between two points (The nest and the drone).
function getDistance(y, x) {
    const centerX = 250000;
    const centerY = 250000;
    const distance = (Math.sqrt((Math.pow(centerX - x, 2)) + (Math.pow(centerY - y, 2))) / 1000);
    return distance;
}
exports.getDistance = getDistance;
