import axios from 'axios';
import {XMLParser} from 'fast-xml-parser'
import {Violation, Drone, Pilot} from './backendTypes'


//dictionary, testit
// Fetches, processes and stores the violation data
export class DroneViolations {
  private violations;

  constructor(){
      this.violations = new Map()
  }

  // Method for server to access violations
  public get getViolations() {
    const jsonText = JSON.stringify(Array.from(this.violations.values()));
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
      
      
      // Parsing the XML file
      const parser = new XMLParser(options);
      const parsedXml = parser.parse(data);
  
      // Time from the snapshot
      const time: Date = new Date(parsedXml.report.capture.clock.snapshotTimestamp)

      // List of drones from the parsed XML 
      const dronesJSON = parsedXml.report.capture.drone
      
      // Goes through the drones and gets users or updates them to the violations
      dronesJSON.forEach((droneJSON: Drone) => {
        const drone: Drone = {
          serialNumber: droneJSON.serialNumber,
          timeStamp: time,
          positionY: Math.round(droneJSON.positionY / 1000),
          positionX: Math.round(droneJSON.positionX / 1000),
          distance: getDistance(droneJSON)
        }
        //Check to see if drone is already in the list
        if(this.violations.has(drone.serialNumber)){
          this.updateViolation(drone)
        }
        else if (drone.distance <= 100){
          this.getUser(drone)
        }
      });
      
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
  // Combines user and drone data and pushes it to the list of violations.
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
      
      this.violations.set(drone.serialNumber, violation)
      
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
      violation.distance = drone.distance
      violation.positionX = drone.positionX
      violation.positionY = drone.positionY
    }
    this.violations.set(drone.serialNumber, violation)
  }

  // Deletes violations that are older than 10 minutes.
  deleteOld = () => {
    const timeLimit = (new Date());
    timeLimit.setMinutes(timeLimit.getMinutes() - 10);
    
    // Deletes old violations from the list
    for (const violation of this.violations.values()){
      if (violation.lastSeen.getTime() <= timeLimit.getTime()){
        this.violations.delete(violation.serialNumber)
      }
    }
  }
  
}

// Options for XML parser, so that snapShotTimeStamp can be found
const options = {
  ignoreAttributes: false,
  attributeNamePrefix : "",
  attributesGroupName : "clock"
};

// Calculates the distance between two points (The nest and the drone).
function getDistance(drone : Drone): number {
  const centerX = 250000;
  const centerY = 250000;
  const posX: number = drone.positionX
  const posY: number = drone.positionY

  const distance: number = (Math.sqrt((Math.pow(centerX-posX, 2)) + (Math.pow(centerY - posY, 2))) / 1000);
    
  return Math.round(distance)
}