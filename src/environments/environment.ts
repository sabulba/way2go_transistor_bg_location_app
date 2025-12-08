// This file can be replaced during build by using the `fileReplacements` array.
// `ng build` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  TRACKER_HOST: 'https://tracker.transistorsoft.com',
  // Public endpoint here - Choose one:
  // Option 1: webhook.site (shows requests in real-time UI)
  //CUSTOM_ENDPOINT:'https://webhook.site/2be53565-6d65-4c79-9fb9-d442e00b1785'

  // Option 2: HTTPBin (simple, no registration needed)
   //CUSTOM_ENDPOINT: 'https://httpbin.org/post'

  // Option 3: RequestBin (by Pipedream - https://requestbin.com)
  // CUSTOM_ENDPOINT: 'https://[YOUR-BIN-ID].x.pipedream.net'

  // Option 4: Beeceptor (create at https://beeceptor.com)
   //CUSTOM_ENDPOINT: 'https://way2go.free.beeceptor.com',

  // Option 5: Postman mock server (has CORS issues in browsers)
  CUSTOM_ENDPOINT: 'https://1c499191-59c1-440d-95d5-0db970f46c74.mock.pstmn.io/post'

  // Your actual server:
  // CUSTOM_ENDPOINT: 'https://test.nivut.net/A_import_files/services/wayToGoApp/gpsTracking/gpsTrackingAction.php?action=addRecord'
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/plugins/zone-error';  // Included with Angular CLI.
