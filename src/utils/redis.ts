import { BitmatrixStoreData } from "@bitmatrix/models";
import Redis from "ioredis";

export const fetchRedisAllData = async (client: Redis) => {
  const result = await client.keys("*");
  const valuesPromises = result.map((key: string) => client.get(key));

  const values = await Promise.all(valuesPromises);
  const parsedValues = values.map<BitmatrixStoreData>((val: string | null) => (val ? JSON.parse(val) : {}));

  return parsedValues;
};
