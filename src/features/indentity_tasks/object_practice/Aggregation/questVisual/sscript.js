import { Database } from "bun:sqlite";

const db = new Database("questions.db", { safeIntegers: true, create: true })

try {

} catch(e) {
  
}