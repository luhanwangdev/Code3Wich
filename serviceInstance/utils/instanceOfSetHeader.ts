import { ResultSetHeader } from "mysql2";

function instanceOfSetHeader(object: any): object is ResultSetHeader {
  return "insertId" in object;
}

export default instanceOfSetHeader;
