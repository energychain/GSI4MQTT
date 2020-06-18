#!/usr/bin/env node

const mosca = require('mosca');
const ArgumentParser = require('argparse').ArgumentParser;
const persist = require('node-persist');
const axios = require('axios');

const storage = persist.create({dir: 'data', ttl: 3600000});
const parser = new ArgumentParser({
  version: '1.0.0',
  addHelp:true,
  description: 'gsi4mqtt broker'
});

parser.addArgument(
  [ '--verbose' ],
  {
    help: 'Set true for verbose debugging output '
  }
);

parser.addArgument(
  [ '-z', '--zip' ],
  {
    help: 'Zipcode (Postleitzahl) in Germany'
  }
);

parser.addArgument(
  [ '-p', '--port' ],
  {
    help: 'Runs MQTT Broker on given port (default 1883)'
  }
);

const args = parser.parseArgs();

let brokerPort = 1883;
if(args.port != null) { brokerPort = args.port *1 };

let zipCode = '69256';
if(args.zip != null) { zipCode = args.zip };

let verbose = false;
if(args.verbose != null) { verbose = true };

const moscaSettings = {
  port: brokerPort,
  backend: {
    type: 'filesystem',
    json: false,
    qlobber_fsq: require("qlobber-fsq"),
    fsq_dir: "data/mqtt"
  }
};

const getGSI = async function() {
  let gsi = await storage.getItem('gsi');
  if(gsi == null) {
    let responds = await axios.get('https://api.corrently.io/core/gsi?zip='+zipCode);
    gsi = responds.data;
    storage.setItem('gsi',gsi);
    return gsi;
  } else {
    return gsi;
  }
}

const publishMessage = async function(topic,value) {
  return new Promise((resolve, reject) => {
    let message = {
      topic: topic,
      payload: ''+value,
      qos: 0,
      retain: true
    };
    server.publish(message, function() {
      if(verbose) {
        console.log('Published',message);
      }
      resolve();
    });
  })
}

const publishGSI = async function(gsi) {
 let now = new Date().getTime();
 let matrix = {}
 await publishMessage('/now',gsi.forecast[0].gsi);
 for(let i=0;i<gsi.forecast.length;i++) {
   await publishMessage('/timestamp/'+gsi.forecast[i].timeStamp,gsi.forecast[i].gsi);
   if(gsi.forecast[i].timeStamp > now) {
     await publishMessage('/relativeHours/'+Math.floor((gsi.forecast[i].timeStamp-now)/3600000),gsi.forecast[i].gsi);
   }

   // calcultate matrix
   matrix['h_'+i] = {
       timeStamp: gsi.forecast[i].timeStamp
   };
   let sum = 0;
   let t = 0;
   for(let j = i;j>0;j--) {
     sum += gsi.forecast[j].gsi;
     t++;
     matrix['h_'+i]['avg_'+j] = Math.round(sum/(t));
   }
   for(let j = i+1; j<gsi.forecast.length; j++) {
     matrix['h_'+i]['avg_'+j] = false;
   }
 }
 for(let z=1;z<24;z++) {
   let maxGsi = 0;
   let timeStamp = 0;
   for(let i=z-1;(i<24);i++) {
     if(matrix['h_'+i]['avg_'+z] > maxGsi) {
       maxGsi = matrix['h_'+i]['avg_'+z];
       timeStamp =  matrix['h_'+i].timeStamp;
     }
   }
   await publishMessage('/forHoursIn24/'+z,timeStamp);
 }
}

const setup = async function() {
  await storage.init();
  console.log('MQTT Broker running on',brokerPort);
  console.log('Serving Grünstromindex for ZIP',zipCode);

  // initial Publish of Messages on Broker start
  publishGSI(await getGSI());

  // ensure Republish of GSI values
  setInterval(async function() {
    publishGSI(await getGSI());
  },3600000);
  console.log("Sample Topics Served:");
  console.log(" mqtt://localhost:"+brokerPort+"/now - Current GSI Value");
  console.log(" mqtt://localhost:"+brokerPort+"/forHoursIn24/3 - Timestamp of best 3 hours in row within next 24");
  console.log(" mqtt://localhost:"+brokerPort+"/relativeHours/5 - GSI Value in 5 hours");
}


const server = new mosca.Server(moscaSettings);
const mqttpersistence = new mosca.persistence.Memory();
mqttpersistence.wire(server);

server.on('ready', setup);
