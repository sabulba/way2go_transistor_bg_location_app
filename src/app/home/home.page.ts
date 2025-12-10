import {
  NavController,
  AlertController,
} from '@ionic/angular';

import {
  Component,
  OnInit,
  OnDestroy,
  NgZone,
  AfterContentInit,
  inject,
} from '@angular/core';

import { Router } from '@angular/router';

import { Preferences } from '@capacitor/preferences';

import BackgroundGeolocation, {
  Location,
  HttpEvent,
  GeofenceEvent,
  MotionActivityEvent,
  ProviderChangeEvent,
  MotionChangeEvent,
  ConnectivityChangeEvent,
  AuthorizationEvent,
  TransistorAuthorizationToken,
  Subscription
} from "../capacitor-background-geolocation";

import {environment} from "../../environments/environment";
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: true,
  imports: [IonicModule, FormsModule, CommonModule]
})

export class HomePage implements OnInit, OnDestroy, AfterContentInit {

  // Injected dependencies
  private navCtrl = inject(NavController);
  private router = inject(Router);
  private zone = inject(NgZone);
  private alertController = inject(AlertController);

  // UI State
  enabled: boolean | undefined;
  isMoving: boolean | undefined;

  // ion-list datasource
  events: any;

  subscriptions: any;

  constructor() {
    this.events = [];
    this.subscriptions = [];
  }

  subscribe(subscription:Subscription) {
    this.subscriptions.push(subscription);
  }

  unsubscribe() {
    this.subscriptions.forEach((subscription:any) => subscription.remove() );
    this.subscriptions = [];
  }

  ngOnInit() {
    console.log('ngOnInit');
  }

  ngAfterContentInit() {
    console.log('ngAfterContentInit');
    this.configureBackgroundGeolocation();
  }

  ionViewWillEnter() {
    console.log('ionViewWillEnter');
  }

  ngOnDestroy() {
    this.unsubscribe();
  }

  async configureBackgroundGeolocation() {
    console.log('Starting BackgroundGeolocation configuration...');
    console.log('Target endpoint:', environment.CUSTOM_ENDPOINT);

    // Step 1:  Listen to BackgroundGeolocation events.
    this.subscribe(BackgroundGeolocation.onEnabledChange(this.onEnabledChange.bind(this)));
    this.subscribe(BackgroundGeolocation.onLocation(this.onLocation.bind(this)));
    this.subscribe(BackgroundGeolocation.onMotionChange(this.onMotionChange.bind(this)));
    this.subscribe(BackgroundGeolocation.onGeofence(this.onGeofence.bind(this)));
    this.subscribe(BackgroundGeolocation.onActivityChange(this.onActivityChange.bind(this)));
    this.subscribe(BackgroundGeolocation.onHttp(this.onHttp.bind(this)));
//    this.subscribe(BackgroundGeolocation.onHttpFailure(this.onHttpFailure.bind(this)));
    this.subscribe(BackgroundGeolocation.onProviderChange(this.onProviderChange.bind(this)));
    this.subscribe(BackgroundGeolocation.onPowerSaveChange(this.onPowerSaveChange.bind(this)));
    this.subscribe(BackgroundGeolocation.onConnectivityChange(this.onConnectivityChange.bind(this)));
    this.subscribe(BackgroundGeolocation.onAuthorization(this.onAuthorization.bind(this)));

    // Determine which endpoint to use
    const useCustomEndpoint = environment.CUSTOM_ENDPOINT && environment.CUSTOM_ENDPOINT.trim() !== '';
    const targetUrl = useCustomEndpoint ? environment.CUSTOM_ENDPOINT : environment.TRACKER_HOST + '/api/locations';

    console.log('[config] Using endpoint:', targetUrl);

    // Simplified configuration for testing
    const config: any = {
      reset: true,
      debug: true,
      logLevel: BackgroundGeolocation.LOG_LEVEL_VERBOSE,
      desiredAccuracy: BackgroundGeolocation.DESIRED_ACCURACY_HIGH,
      distanceFilter: 0,  // Send every location update
      stopTimeout: 1,
      stopOnTerminate: false,
      startOnBoot: false,

      // HTTP Configuration
      url: 'https://1c499191-59c1-440d-95d5-0db970f46c74.mock.pstmn.io/post',//environment.CUSTOM_ENDPOINT,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },

      // Sync settings - batch 10 locations before sending
      autoSync: true,
      autoSyncThreshold: 10,  // Wait for 10 locations before syncing
      batchSync: true,        // Enable batching
      maxBatchSize: 10,       // Batch up to 10 locations
      maxDaysToPersist: 2,

      // Location settings
      locationUpdateInterval: 5000,
      fastestLocationUpdateInterval: 1000,

      // [Android] backgroundPermissionRationale for Always permission.
      backgroundPermissionRationale: {
        title: "Allow {applicationName} to access this device's location even when closed or not in use.",
        message: "This app collects location data to enable recording your trips to work and calculate distance-travelled.",
        positiveAction: 'Change to "{backgroundPermissionOptionLabel}"',
        negativeAction: 'Cancel'
      }
    };

    console.log('Config:', JSON.stringify(config, null, 2));

    //for PRODUCTION MODE-  Only add authorization if using the tracker host (not a custom endpoint)
    // if (!useCustomEndpoint) {
    //   const orgname = (await Preferences.get({key: 'orgname'})).value;
    //   const username = (await Preferences.get({key: 'username'})).value;
    //
    //   const token:TransistorAuthorizationToken = await BackgroundGeolocation.findOrCreateTransistorAuthorizationToken(
    //     orgname || 'way2go',
    //     username || 'roy_b',
    //     environment.TRACKER_HOST
    //   );
    //
    //   config.authorization = {
    //     strategy: 'jwt',
    //     accessToken: token.accessToken,
    //     refreshToken: token.refreshToken,
    //     refreshUrl: environment.TRACKER_HOST + '/api/refresh_token',
    //     refreshPayload: {
    //       refresh_token: '{refreshToken}'
    //     },
    //     expires: token.expires
    //   };
    // }

    // Configure the plugin
    try {
      BackgroundGeolocation.ready(config).then(async (state) => {
        console.log("[ready] success", state);
        this.addEvent('State', new Date(), state);
        this.zone.run(() => {
          this.isMoving = state.isMoving;
          this.enabled = state.enabled;
        });
        await BackgroundGeolocation.start();
      });
    } catch (error) {
      this.addEvent('ConfigError', new Date(), error);
    }
  }
  // Return to Home screen (app switcher)
  onClickHome() {
    this.navCtrl.navigateBack('/home');
  }

  // #start / #stop tracking
  onToggleEnabled() {
    if (this.enabled) {
      BackgroundGeolocation.start();
    } else {
      BackgroundGeolocation.stop();
    }
  }

  // Fetch the current position
  async onClickGetCurrentPosition() {

    try {
      // Get location with persist=true so it gets sent to server
      const location = await new Promise<Location>((resolve, reject) => {
        BackgroundGeolocation.getCurrentPosition(
          {persist: true, samples: 1, timeout: 30},
          (location) => resolve(location),
          (error) => reject(error)
        );
      });

      console.log('Got location:', location);
      console.log('Lat:', location.coords.latitude, 'Lng:', location.coords.longitude);

      // Check database count
      const count = await BackgroundGeolocation.getCount();
      console.log(' Locations in database:', count);

      // Force sync
      if (count > 0) {
        console.log('Forcing sync of', count, 'location(s)...');
        try {
          const synced = await BackgroundGeolocation.sync();
          console.log(' Synced', synced, 'location(s) to server');
        } catch (syncError) {
          console.error('Sync failed:', syncError);
          // Manual fallback send
          await this.manualSendLocation(location);
        }
      } else {
        console.warn('⚠No locations in database to sync');
      }
    } catch (error) {
      console.error('getCurrentPosition error:', error);
    }
  }

  // Change plugin state between stationary / tracking
  onClickChangePace() {
    this.isMoving = !this.isMoving;
    BackgroundGeolocation.changePace(this.isMoving);
  }

  // Clear the list of events from ion-list
  onClickClear() {
    this.events = [];
  }

  // Manual send location to server (fallback)
  async manualSendLocation(location: Location) {
    console.log('Manually sending location to server...');

    const payload = {
      location: {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        accuracy: location.coords.accuracy,
        altitude: location.coords.altitude,
        speed: location.coords.speed,
        heading: location.coords.heading,
        timestamp: location.timestamp
      },
      uuid: location.uuid,
      is_moving: location.is_moving,
      event: location.event,
      manual_send: true
    };

    try {
      const response = await fetch(environment.CUSTOM_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      console.log('Manual send status:', response.status);
      const text = await response.text();
      console.log('Manual send response:', text);

      alert(`Location sent manually!\nStatus: ${response.status}`);
    } catch (error: any) {
      console.error('Manual send failed:', error);
      alert(`Manual send failed: ${error.message}`);
    }
  }

  // Test HTTP connectivity to mock server
  async testMockServer() {
    console.log('Testing connection to mock server...');
    console.log('Target URL:', environment.CUSTOM_ENDPOINT);

    const testData = {
      test: 'manual_test',
      timestamp: new Date().toISOString(),
      latitude: 32.7157,
      longitude: 34.9897
    };

    try {
      const response = await fetch(environment.CUSTOM_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(testData)
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', response.headers);

      // Get the response as text first to see what we're getting
      const responseText = await response.text();
      console.log('Response text:', responseText);

      // Try to parse as JSON
      try {
        const data = JSON.parse(responseText);
        console.log('Response data:', data);
        alert(`Mock server test SUCCESS!\nStatus: ${response.status}\nResponse: ${JSON.stringify(data, null, 2)}`);
      } catch (parseError) {
        console.error('Response is not JSON:', responseText.substring(0, 200));
        alert(`Mock server returned HTML (not JSON)!\nStatus: ${response.status}\nThis likely means CORS is blocking or endpoint is wrong.\nCheck console for details.`);
      }
    } catch (error: any) {
      console.error('Test failed:', error);
      console.error(' Error details:', error.message);
      alert(`Mock server test FAILED:\n${error.message}\n\nThis is likely a CORS issue or network error.`);
    }
  }


  /// @event enabledchange
  onEnabledChange(enabled:boolean) {
    this.isMoving = false;
    this.addEvent('onEnabledChange', new Date(), {enabled: enabled});
  }

  /// @event location
  async onLocation(location:Location) {
    console.log('='.repeat(50));
    console.log(' [LOCATION EVENT]');
    console.log(' Will send to:', environment.CUSTOM_ENDPOINT);
    console.log(' Location:', {
      lat: location.coords.latitude,
      lng: location.coords.longitude,
      accuracy: location.coords.accuracy,
      timestamp: location.timestamp,
      uuid: location.uuid
    });
    console.log('='.repeat(50));

    this.addEvent('onLocation', new Date(location.timestamp), location);

    // Log database count for debugging
    const count = await BackgroundGeolocation.getCount();
    console.log('Locations in database:', count, '/ 10 (threshold)');
    console.log('Will auto-sync when count reaches 10');

    // IMPORTANT: Do NOT manually call sync() here - it defeats batching!
    // The plugin will automatically sync when autoSyncThreshold (10) is reached.
  }

  /// @event motionchange
  onMotionChange(event:MotionChangeEvent) {
    console.log('[event] motionchange, isMoving: ', event.isMoving, ', location: ', event.location);
    this.addEvent('onMotionChange', new Date(event.location.timestamp), event);
    this.isMoving = event.isMoving;
  }

  /// @event activitychange
  onActivityChange(event:MotionActivityEvent) {
    console.log('[event] activitychange: ', event);
    this.addEvent('onActivityChange', new Date(), event);
  }

  /// @event geofence
  onGeofence(event:GeofenceEvent) {
    console.log('[event] geofence: ', event);
    this.addEvent('onGeofence', new Date(event.location.timestamp), event);
  }
  /// @event http
  onHttp(response:HttpEvent) {
    console.log('='.repeat(50));
    console.log('[HTTP SUCCESS - BATCH SENT]');
    console.log('Status:', response.status);
    console.log('Success:', response.success);
    console.log('Response:', response.responseText);
    console.log('='.repeat(50));

    if (!response.success) {
      console.error('HTTP marked as not successful:', response.status);
    }
    this.addEvent('onHttp', new Date(), response);
  }

  /// @event http failure
  onHttpFailure(response:HttpEvent) {
    console.log('='.repeat(50));
    console.error(' [HTTP FAILURE]');
    console.error('Status:', response.status);
    console.error('Response:', response.responseText);
    console.error('Error:', response);
    console.log('='.repeat(50));

    this.addEvent('onHttpFailure', new Date(), response);
  }

  /// @event providerchange
  onProviderChange(provider:ProviderChangeEvent) {
    console.log('[event] providerchange', provider);
    this.addEvent('onProviderChange', new Date(), provider);
  }

  /// @event powersavechange
  onPowerSaveChange(isPowerSaveEnabled:boolean) {
    console.log('[event] powersavechange', isPowerSaveEnabled);
    this.addEvent('onPowerSaveChange', new Date(), {isPowerSaveEnabled: isPowerSaveEnabled});
  }
  /// @event connectivitychange
  onConnectivityChange(event:ConnectivityChangeEvent) {
    console.log('[event] connectivitychange connected? ', event.connected);
    this.addEvent('onConnectivityChange', new Date(), event);
  }

  /// @event authorization
  onAuthorization(event:AuthorizationEvent) {
    console.log('[event] authorization: ', event);
  }

  /// Add a record to ion-list
  private addEvent(name:any, date:any, event:any) {
    const timestamp = date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
    this.zone.run(() => {
      this.events.push({
        name: name,
        timestamp: timestamp,
        object: event,
        content: JSON.stringify(event, null, 2)
      });
    })
  }
}
