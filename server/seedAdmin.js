import bcrypt from "bcryptjs";
import { config } from "./config.js";
import { connectDb } from "./db.js";
import { User } from "./models/User.js";

try {
  await connectDb();

  const email = config.adminEmail.toLowerCase().trim();
  const passwordHash = await bcrypt.hash(config.adminPassword, 12);

  const user = await User.findOneAndUpdate(
    { email },
    {
      name: config.adminName,
      email,
      passwordHash,
      role: "admin",
    },
    { returnDocument: "after", upsert: true },
  );

  console.log("Admin account ready:");
  console.log(`Email: ${user.email}`);
  console.log(`Password: ${config.adminPassword}`);
  process.exit(0);
} catch (error) {
  console.error("Unable to seed admin account.");
  console.error("Check that MongoDB is running and MONGODB_URI is correct.");
  console.error(error.message);
  process.exit(1);
}
