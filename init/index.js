const mongoose = require("mongoose");
const initData = require("./data.js");
const Listing = require("../models/listing.js");

const dbUrl = process.env.ATLAS_DB_CONNECTION_URL;
async function main() {
  await mongoose.connect('mongodb+srv://mrakmondal6612:COuGGotxuox1Rvmn@cluster0.hqj9u7q.mongodb.net/?retryWrites=true&w=majority');
}

main()
  .then((result) => {
    console.log("Database is Connected ");
  })
  .catch((error) => {
    console.log(error);
  });

const initDB = async () => {
  await Listing.deleteMany({});
  initData.data = initData.data.map((objs) => ({
    ...objs,
    owner: "66e58bba3051edce018c5e56",
  }));
  await Listing.insertMany(initData.data);
  console.log("Data was initialized");
};
initDB();
