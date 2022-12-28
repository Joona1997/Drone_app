import axios from 'axios';
import {XMLParser} from 'fast-xml-parser'
import {Violation, Drone, Pilot} from './types'
import { Server } from 'socket.io';


// Fetches, processes and stores the violation data
export class DroneViolations {

  // Stores violations in a Map
  public violations;

  // Handles sending updates to the clients
  public io;

  constructor(io: Server){
      this.violations = new Map()
      this.io = io
  }

  // Method for server to access violations
  public get getViolations() {
    const jsonText = JSON.stringify(Array.from(this.violations.entries()));
    return jsonText
  }

  
  // Gets the Drone data and processes it
  // Uses getUser() or updateUser() depending on if the drone is already on the list
  // At the end uses deleteOld() to delete old users.
  updateDroneList = async () => {
    try {
      // const data: Drones XML
      const { data, status } = await axios.get<string>(
        'https://assignments.reaktor.com/birdnest/drones',
        {timeout: 2000},
      );
      
      // Parsed data
      const inJSON = parseXML(data)
      
      // Time from the snapshot
      const time: Date = new Date(inJSON.clock.snapshotTimestamp)
      
      // List of drones from the parsed XML 
      const dronesJSON = inJSON.drone
      
      // Goes through the drones and gets users or updates them to the violations
      dronesJSON.forEach((droneJSON: Drone) => {
        const drone: Drone = {
          serialNumber: droneJSON.serialNumber,
          timeStamp: time,
          positionY: Math.round(droneJSON.positionY / 1000),
          positionX: Math.round(droneJSON.positionX / 1000),
          distance: getDistance(droneJSON.positionY, droneJSON.positionX)
        }
        
        // Check to see if drone is already in the list
        if(this.violations.has(drone.serialNumber)){
          this.updateViolation(drone)
        }
        // Gets new user if inside violation distance
        else if (drone.distance <= 100){
          drone.distance = Math.round((drone.distance + Number.EPSILON)  * 100) / 100
          this.getUser(drone)
        }
      });
      
      // Deletes old violations
      this.deleteOld() 
      
      // "response status is: 200"
      console.log('updateDroneList response status is: ', status);
        
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.log('error message: ', error.message);
        return error.message;
      } else {
        console.log('unexpected error: ', error);
        return 'An unexpected error occurred';
      }
    }
  }

  // Gets the user data from a given drone
  // Combines user and drone data. 
  // Adds it to the violations Map and sends it to the clients.
  getUser = async (drone : Drone) => {
    try {
      // Pilot data
      const { data, status } = await axios.get<Pilot>(
        'https://assignments.reaktor.com/birdnest/pilots/'+ drone.serialNumber,
        {
          headers: {
            Accept: 'application/json',
          },
          timeout: 2000
        },
      );
      
      const violation: Violation = {
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
      }
      
      // Adds violation to local Map
      this.violations.set(drone.serialNumber, violation)

      // Sends violation to clients
      this.io.emit("newViolation", violation)
      
      //  "response status is: 200"
      console.log('getUser response status is: ', status);     
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.log('error message: ', error.message);
        return error.message;
      } else {
        console.log('unexpected error: ', error);
        return 'An unexpected error occurred';
      }
    }
  }

  // Updates violations lastSeen time. Also updates distance if new is closer.
  updateViolation(drone: Drone) {
    const violation = this.violations.get(drone.serialNumber)
    violation.lastSeen = drone.timeStamp
    if(violation.distance > drone.distance){
      violation.distance = Math.round((drone.distance + Number.EPSILON)  * 100) / 100
      violation.positionX = drone.positionX
      violation.positionY = drone.positionY
    }
    // Sends update to clients
    this.io.emit("update", violation)
    
  }

  // Deletes violations that are older than 10 minutes.
  deleteOld = () => {
    const timeLimit = (new Date());
    timeLimit.setMinutes(timeLimit.getMinutes() - 10);
    
    // Deletes old violations from the list
    for (const violation of this.violations.values()){
      if (violation.lastSeen.getTime() <= timeLimit.getTime()){
        this.violations.delete(violation.serialNumber)

        // Sends deletion order to clients
        this.io.emit("delete", violation)
      }
    }
  }
  
}

// Parses XML string
export function parseXML(data: string){
  // Parsing the XML file
  const parser = new XMLParser(options);
  const parsedXml = parser.parse(data);

  // List of drones and timeStamp from the parsed XML 
  return parsedXml.report.capture
}

// Options for XML parser, so that snapShotTimeStamp can be found
const options = {
  ignoreAttributes: false,
  attributeNamePrefix : "",
  attributesGroupName : "clock"
};

// Calculates the distance between two points (The nest and the drone).
export function getDistance(y : number, x : number): number {
  const centerX = 250000;
  const centerY = 250000;
  const distance: number = (Math.sqrt((Math.pow(centerX-x, 2)) + (Math.pow(centerY - y, 2))) / 1000);
  
  return distance
}