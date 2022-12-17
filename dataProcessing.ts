import axios from 'axios';
import {XMLParser} from 'fast-xml-parser'
import {Violation, Drone} from './backendTypes'

// Fetches, processes and stores the violation data
export class dataProcessing {
  private violations: Violation[] = [];

  constructor(){
      this.violations = []
  }

  // Method for server to access violations
  public get getViolations() {
      return this.violations
  }

  // Gets the Drone data and processes it
  // Uses getUser() or updateUser() depending on if the drone is already on the list
  // At the end uses deleteOld to delete old users.
  updateDroneList = async () => {
    try {
      // const data: Drones XML
      const { data, status } = await axios.get<any>(
        'https://assignments.reaktor.com/birdnest/drones',
        {timeout: 2000},
      );
  
      // Parsing the XML file
      const parser = new XMLParser(options);
      let parsedXml = parser.parse(data);
  
      // Time from the snapshot
      let time: Date = new Date(parsedXml.report.capture.clock.snapshotTimestamp)

      // List of drones from the parsed XML 
      let dronesJSON = parsedXml.report.capture.drone
      
      // Goes through the drones and gets users or updates them to the violations
      for (let index in dronesJSON){
        let drone: Drone = {
          serialNumber: dronesJSON[index].serialNumber,
          timeStamp: time,
          positionY: dronesJSON[index].positionY,
          positionX: dronesJSON[index].positionX,
          distance: getDistance(dronesJSON[index])
        }
        //Check to see if drone is already in the list
        let foundInd = this.violations.findIndex(function(violation, index) {
          if(violation.serialNumber == drone.serialNumber)
            return true;
        });
        if (foundInd >= 0){
          this.updateViolation(drone, foundInd)
        }else if (drone.distance <= 100){
          this.getUser(drone)
        }   
      }
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
      // const data: User
      const { data, status } = await axios.get<any>(
        'https://assignments.reaktor.com/birdnest/pilots/'+ drone.serialNumber,
        {
          headers: {
            Accept: 'application/json',
          },
          timeout: 2000
        },
      );
  
      let violation: Violation = {
        pilotId: data.pilotId,
        firstName: data.firstName,
        lastName: data.lastName,
        phoneNumber: data.phoneNumber,
        email: data.email,
        serialNumber: drone.serialNumber,
        lastSeen: drone.timeStamp,
        positionY: drone.positionY,
        positionX: drone.positionX,
        distance: drone.distance
      }
      
      this.violations.push(violation); 
      
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
  updateViolation(drone: Drone, foundInd: number) {
      this.violations[foundInd].lastSeen = drone.timeStamp
        if(this.violations[foundInd].distance > drone.distance){
          this.violations[foundInd].distance = drone.distance
          this.violations[foundInd].positionX = drone.positionX
          this.violations[foundInd].positionY = drone.positionY
      }
    }

  // Deletes violations that are older than 10 minutes.
  deleteOld = () => {
    let date = new Date();
    date.setMinutes(date.getMinutes() - 10);
    
    // List of too old violations
    let oldViolations = this.violations.filter(violation => violation.lastSeen.getTime() <= date.getTime())

    // Splices all old violations from the list
    for (let index2 in oldViolations){
      let foundInd = this.violations.findIndex(function(violation, index) {
        if(oldViolations[index2].pilotId = violation.pilotId)
        return true;
      });
      this.violations.splice(foundInd, 1)
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
  let posX: number = drone.positionX
  let posY: number = drone.positionY

  const distance: number = (Math.sqrt((Math.pow(centerX-posX, 2)) + (Math.pow(centerY - posY, 2)))/1000);
    
  return Math.round(distance)
}