import express from "express";
import axios from 'axios';
import {XMLParser} from 'fast-xml-parser'

type User = {
    pilotId: string;
    firstName: string;
    lastName: string;
    phoneNumber: string;
    createdDt: string;
    email: string;
    serialNumber: string;
    timeStamp: Date;
    positionY: number;
    positionX: number;
    distance: number;
  };

var users: User[] = [] 

  async function getUser(drone : Drone) {
    try {
      // 👇️ const data: User
      const { data, status } = await axios.get<any>(
        'https://assignments.reaktor.com/birdnest/pilots/'+drone.serialNumber,
        {
          headers: {
            Accept: 'application/json',
          },
          timeout: 2000
        },
      );
  
      var user: User = {
        pilotId: data.pilotId,
        firstName: data.firstName,
        lastName: data.lastName,
        phoneNumber: data.phoneNumber,
        createdDt: data.createdDt,
        email: data.email,
        serialNumber: drone.serialNumber,
        timeStamp: drone.timeStamp,
        positionY: drone.positionY,
        positionX: drone.positionX,
        distance: drone.distance
      }
      users.push(user);
      let date = new Date();
      
      date.setMinutes(date.getMinutes() - 10);
      console.log(date)

      //bad?
      var oldUsers = users.filter(user2 => user2.timeStamp.getTime() <= date.getTime())
      console.log(oldUsers)
      console.log(users[0].timeStamp.getTime() <= date.getTime())
      for (let index2 in oldUsers){
        var foundInd = users.findIndex(function(user2, index) {
          if(oldUsers[index2].pilotId = user2.pilotId)
          return true;
        });
        users.splice(foundInd, 1)
      }
      

      //console.log(users); 
      // 👇️ "response status is: 200"
      console.log('response status is: ', status);
        
       
      
      
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
  




interface Drone  {
        serialNumber: string;
        timeStamp: Date;
        positionY: number;
        positionX: number;
        distance: number;
      };

var drones: Drone[] = [];


const parser = new XMLParser();



  async function getDrone() {
    try {
      // 👇️ const data: User
      const { data, status } = await axios.get<any>(
        'https://assignments.reaktor.com/birdnest/drones',
        {timeout: 10000
        },
      );
      
      var time: Date = new Date(data.substring(data.indexOf("stamp")+7, data.indexOf("stamp")+31))
      console.log();

      let parsedXml = parser.parse(data);
      
      console.log();
      
      var dronesJSON = parsedXml.report.capture.drone
      for (var index in dronesJSON){
        var drone: Drone = {
          serialNumber: dronesJSON[index].serialNumber,
          timeStamp: time,
          positionY: dronesJSON[index].positionY,
          positionX: dronesJSON[index].positionX,
          distance: getDistance(dronesJSON[index])
        }
        var foundInd = users.findIndex(function(user, index) {
          if(user.serialNumber == drone.serialNumber)
            return true;
        });
        //console.log(foundInd);
        if (foundInd >= 0){
          users[foundInd].distance = Math.min(drone.distance, users[foundInd].distance)
          users[foundInd].timeStamp = drone.timeStamp
          //koordinaatit ei päivity vielä
        }else if (drone.distance <= 100000){
          getUser(drone)
        }
        //drones.push(drone);
        
      }
      //console.log(drones);


      // 👇️ "response status is: 200"
      console.log('response status is: ', status);
      
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

setInterval(getDrone , 2000)
//getDrone()
setInterval(moi, 10000)
function moi(){
  console.log(users)
}
//Calculates the distance between two points.
//(The nest and the drone)
function getDistance(param : Drone): number {
    const centerX = 250000;
    const centerY = 250000;
    let posX: number = param.positionX
    let posY: number = param.positionY

    let distance: number = Math.sqrt((Math.pow(centerX-posX, 2)) + (Math.pow(centerY - posY, 2))); 
    return distance
}


const app = express();

const PORT = process.env.PORT || 4000;

app.get("/", (req: any, res: any) => res.send(users));

app.listen(PORT, () => 
console.log(`Server is running here https://localhost:${PORT}`));