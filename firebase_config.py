import firebase_admin
from firebase_admin import credentials, db

cred = credentials.Certificate("firebase_key.json")

firebase_admin.initialize_app(cred, {
    "databaseURL": "https://smart-farming-130fe-default-rtdb.asia-southeast1.firebasedatabase.app/"
})

rtdb = db
#import firebase_admin
#from firebase_admin import credentials, firestore

#cred = credentials.Certificate("firebase_key.json")
#firebase_admin.initialize_app(cred)

#db = firestore.client()
