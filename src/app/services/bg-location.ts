import { Injectable } from '@angular/core';
// import BackgroundGeolocation, {
//   LocationAccuracy,
//   State,
//   Subscription
// } from '@transistorsoft/capacitor-background-geolocation';

@Injectable({
  providedIn: 'root'
})
export class BgLocationService {
  ready:boolean = false;
  enabled:boolean = false;
  events:any = [];
 // gpsState:State | null = null;
  currentLocation?:any;

  constructor() { }

  // async init() {
  //
  // }
  //
  //   const config:any = {
  //     // Geolocation Config
  //     desiredAccuracy: BackgroundGeolocation.DESIRED_ACCURACY_HIGH,
  //     distanceFilter: 10,
  //     // Activity Recognition
  //     stopTimeout: 5,
  //     // Application config
  //     debug: true, // <-- enable this hear sounds for background-geolocation life-cycle.
  //     logLevel: BackgroundGeolocation.LOG_LEVEL_VERBOSE,
  //     stopOnTerminate: false,   // <-- Allow the background-service to continue tracking when user closes the app.
  //     startOnBoot: true,        // <-- Auto start tracking when device is powered-up.
  //     url: 'https://1c499191-59c1-440d-95d5-0db970f46c74.mock.pstmn.io/post',  //'https://your-server.com/location', // optional
  //     method: 'POST',
  //     autoSync: true,
  //     headers: {
  //       'Content-Type': 'application/json'
  //     }
  //
  //   //   debug: true, // shows notifications and sounds for debugging
  //   //   logLevel: BackgroundGeolocation.LOG_LEVEL_VERBOSE,
  //   //
  //   //   desiredAccuracy: BackgroundGeolocation.DESIRED_ACCURACY_HIGH,
  //   //   distanceFilter: 10, // meters
  //   //   stopOnTerminate: false, // continue after app killed
  //   //   startOnBoot: true, // auto start after phone reboot
  //   //
  //   //   url: 'https://1c499191-59c1-440d-95d5-0db970f46c74.mock.pstmn.io/post',
  //   //   //'https://your-server.com/location', // optional
  //   //   method: 'POST',
  //   //   autoSync: true,
  //   //
  //   //   headers: {
  //   //   'Content-Type': 'application/json'
  //   // }
  // }
  // BackgroundGeolocation.ready(config).then((state:State) => {
  //   this.ready = true;
  //   this.enabled = state.enabled;
  //   this.gpsState = state;
  // });
  //
  //
  //
  // BackgroundGeolocation.onLocation((location:any)=> {
  //     console.log('[BGGeo] location: ', location);
  //     this.currentLocation = location;
  //
  //     // Write to DB or send to server
  //     // this.firestore.collection('locations').add(location);
  //
  //   }, (error:any) => {
  //     console.warn('[BGGeo] location error: ', error);
  //   });
  // }
  //
  // start() {
  //   BackgroundGeolocation.start();
  //   console.log('[BGGeo] tracking started');
  // }
  //
  // stop() {
  //   BackgroundGeolocation.stop();
  //   console.log('[BGGeo] tracking stopped');
  // }

}
