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

Install GSI4MQTT and Forever
```
npm install -g forever

git clone https://github.com/energychain/GSI4MQTT
cd GSI4MQTT
npm install

```

Start MQTT Broker using forever
```
forever start ./index.js
```

## Based on:
- Mosca JS [https://github.com/moscajs/]
- GrünstromIndex [https://www.gruenstromindex.de/]


# GSI4MQTT -Deutsch

## Verwendung
GSI4MQTT wurde entwickelt, um es möglicht einfach zu machen im SmartHome die Geräte auf Basis des GrünstromIndex anzusteuern. Hierzu wird ein eigener MQTT Broker gestartet und
zusätzlich können Nachrichten als Client auf einen fremden Broker gesendet werden (`-c mqtt://ipandererprober:port`).

Zur einfacheren Verwendung wird eine ganze Reihe von unterschiedlichen MQTT Topics veröffentlicht, die jeweils dem eigentlichen Anwendungsfall entsprechend genutzt werden können.
