import axios from "axios";
import { CycleData } from "../types";

export async function getCycleList(hospitalId: number): Promise<CycleData[]> {
  let result: CycleData[] = [];
  try {
    let response = await axios.post(`${process.env.REACT_APP_API}/cycle/list`, {
      hospitalId: hospitalId,
    });
    console.log("Cycle list response: ", response);
    if (response.status === 200) {
      result = response.data;
    }
  } catch (error) {
    console.error(error);
  }
  return result;
}

export async function mergeCycle(
  cycle: CycleData
): Promise<CycleData | undefined> {
  let response;
  try {
    let api1Result = await axios.post(
      `${process.env.REACT_APP_API}/cycle/merge`,
      cycle
    );
    console.log("Cycle merge apiResult: ", api1Result);
    if (api1Result.data.Id) {
      let api2Result = await axios.post(
        `${process.env.REACT_APP_API}/cycle/detail`,
        { Id: api1Result.data.Id }
      );
      console.log("Cycle detail apiResult: ", api2Result);
      response = api2Result.data.cycleInfo;
    }
    console.log("Returning ...");
    return response;
  } catch (error) {
    console.error(error);
  }
}
