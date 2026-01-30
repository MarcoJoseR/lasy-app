import * as path from "path";
import * as dotenv from "dotenv";

const envPath = path.resolve(process.cwd(), ".env");

console.log("[load-env] Carregando .env de:", envPath);

dotenv.config({ path: envPath });

console.log("[load-env] Variáveis carregadas.");
