import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import * as https from "https";
admin.initializeApp();

/**
 * Calculate user's travel distance in mile.
 * @param request http request
 * @returns http response: 200 with the comparison result if valid, 500 if error
 */

const earthRadiusInMiles = 3959; // approximate radius of the Earth in miles

module.exports.calculateTripMiles = functions.https.onRequest((request, response) => {
  const tripId = request.query.tripId;
  const start_coordinates = request.query.start_coordinates;
  const end_coordinates = request.query.end_coordinates;

  
  const startLat = start_coordinates.latitude;
  const startLng = start_coordinates.longitude;
  const endLat = end_coordinates.latitude;
  const endLng = end_coordinates.longitude;

  // convert degrees to radians
  const toRad = (value: number) => (value * Math.PI) / 180;

  // calculate the distance using the Haversine formula
  const deltaLat = toRad(endLat - startLat);
  const deltaLng = toRad(endLng - startLng);
  const a =
    Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
    Math.cos(toRad(startLat)) *
      Math.cos(toRad(endLat)) *
      Math.sin(deltaLng / 2) *
      Math.sin(deltaLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distanceInMiles = earthRadiusInMiles * c;

  // save the distance to the database
  admin.firestore().doc(`trips/${tripId}`).update({
    miles: distanceInMiles,
  })
      .then(() => {
        response.status(200).send("Trip miles sucessfully calculated");
      })
      .catch((error) => {
        console.log(error);
        response.status(500).send(error);
      });
});
