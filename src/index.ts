import dotenv from "dotenv";
dotenv.config();
import express from "express";
import { exec } from "child_process";
const PORT = process.env.PORT || 8000;
import fs from "fs";
import path from "path";
import cron from "node-cron";

const databasesArray: {
  NAME: string;
  HOST: string;
  PORT: number;
  USER: string;
  PASSWORD: string;
}[] = JSON.parse(process.env.DATABASES_ARRAY || "[]");

const app = express();
function main() {
  databasesArray.map((item) => {
    const dir = path.join(__dirname, "dumps");
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir);
    }
    const fileName = `${item.NAME}-${new Date()
      .toISOString()
      .replace(/:/g, "-")}.sql`;
    const filePath = path.join(dir, fileName);
    exec(
      `PGPASSWORD=${item.PASSWORD} pg_dump -h ${item.HOST} -p ${item.PORT} -U ${item.USER} -d ${item.NAME} > ${filePath}`,
      async (error, stdout, stderr) => {
        if (!error) {
          const formData = new FormData();
          formData.append("chat_id", process.env.GROUP_ID ?? "");
          const fileBuffer = fs.readFileSync(filePath);
          const blob = new Blob([fileBuffer]);
          formData.append("document", blob, fileName);
          formData.append(
            "caption",
            `Backup of ${
              item.NAME
            } \n ${new Date().toLocaleDateString()} \n ✅ ✅`
          );
          try {
            await fetch(
              `https://api.telegram.org/${
                process.env.BOT_TOKEN ?? ""
              }/sendDocument`,
              {
                method: "POST",
                body: formData,
              }
            );
          } catch (error) {
            console.log(error);
          }
          fs.unlinkSync(filePath);
        } else {
          try {
            await fetch(
              `https://api.telegram.org/${
                process.env.BOT_TOKEN ?? ""
              }/sendMessage?chat_id=${
                process.env.GROUP_ID
              }&text=Failed to backup ${item.NAME} ❌`
            );
          } catch (error) {
            console.log(error);
          }
          console.log(error);
          fs.unlinkSync(filePath);
        }
      }
    );
  });
}

// cron.schedule(" * */6 * * *", () => {
//   try {
//     main();
//     console.log("first");
//   } catch (error) {}
// });

main();
app.listen(PORT, () => {
  console.log(`Server is firing up at 🔥 ${PORT}`);
});
