# GSI4MQTT
MQTT client and broker to provide German Green Power Index (GrünstromIndex) as a service for home area networks , energy management systems and smart homes.

## Installation (Node JS)
```
npm install -g gsi4mqtt
```

## Starting Standalone  (Node JS)
```
gsimqttbroker -z <Postleitzahl>
```

## Install as Daemon

Install Forever:
```
npm install -g forever
```

Start MQTT Broker using forever
```
forever gsimqttbroker
```

## Based on:
- Mosca JS [https://github.com/moscajs/]
- GrünstromIndex [https://www.gruenstromindex.de/]
