import * as firebase from 'firebase'

var firebaseConfig = {
  apiKey: "AIzaSyBsOgxRqfGbtdTZE4BKVp4omVp5Oz8AkSM",
  authDomain: "gossip-c845a.firebaseapp.com",
  databaseURL: "https://gossip-c845a.firebaseio.com",
  projectId: "gossip-c845a",
  storageBucket: "gossip-c845a.appspot.com"
};
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}
var db = firebase.firestore();
var entityDB = db.collection('entities');
var storyDB = db.collection('stories');


export { db, entityDB, storyDB }
