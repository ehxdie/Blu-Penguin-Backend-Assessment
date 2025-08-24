import app from './app';
import dotenv from 'dotenv';
import { port } from './config';

dotenv.config();

app.listen(port, async () => {
  console.log(`App is running at http://localhost:${port}`);
});
