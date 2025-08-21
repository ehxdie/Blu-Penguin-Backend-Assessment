import app from "./app";
import dotenv from "dotenv";


dotenv.config();
const port = process.env.PORT;


app.listen(port, async () => {
    console.log(`App is running at http://localhost:${port}`);

});
