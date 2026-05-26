try:
    import firebase_admin
    from firebase_admin import credentials, db

    cred = credentials.Certificate(
        "firebase_key.json"
    )

    if not firebase_admin._apps:
        firebase_admin.initialize_app(
            cred,
            {
                "databaseURL":
                "https://smart-farming-130fe-default-rtdb.asia-southeast1.firebasedatabase.app/"
            }
        )

    rtdb = db

    print("🔥 Firebase Connected")

except Exception as e:

    print(
        "❌ Firebase Disabled:",
        e
    )

    rtdb = None