const admin = require("firebase-admin");
const serviceAccount = require("../serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

async function resetUsers() {
  try {
    // Delete all users
    let nextPageToken;
    do {
      const listUsersResult = await admin.auth().listUsers(1000, nextPageToken);
      for (const user of listUsersResult.users) {
        await admin.auth().deleteUser(user.uid);
        console.log(`Deleted user: ${user.email}`);
      }
      nextPageToken = listUsersResult.pageToken;
    } while (nextPageToken);

    console.log("✅ All users deleted successfully");

    // 👉 Create admin user
    const userRecord = await admin.auth().createUser({
      email: "admin@test.com",
      password: "Admin123!",
      displayName: "Admin",
    });

    console.log("✅ Admin user created:", userRecord.email);
  } catch (error) {
    console.error("❌ Error resetting users:", error);
  }
}

resetUsers();

