const Signer = require("tiktok-signature");
import fetch, { RequestInit } from "node-fetch";

const TT_REQ_USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/107.0.0.0 Safari/537.36 Edg/107.0.1418.56";

const TT_REQ_PERM_URL =
  "https://www.tiktok.com/api/post/item_list/?WebIdLastTime=1725387734&aid=1988&app_language=en&app_name=tiktok_web&browser_language=en-US&browser_name=Mozilla&browser_online=true&browser_platform=MacIntel&browser_version=5.0 (Macintosh)&channel=tiktok_web&cookie_enabled=true&count=35&coverFormat=2&cursor=0&data_collection_enabled=true&device_id=7410483808526698016&device_platform=web_pc&focus_state=true&from_page=user&history_len=5&is_fullscreen=false&is_page_visible=true&language=en&odinId=7410483842936669216&os=mac&priority_region=&referer=https://www.google.com/&region=PL&root_referer=https://www.google.com/&screen_height=1117&screen_width=1728&secUid=MS4wLjABAAAAGu-Kg2l1tIS7B6HJ1skdamgWbjdobxERVTR2NJ0MHXg0X7E8b_Pt1E7KUp8-bSzc&tz_name=Europe/Warsaw&user_is_login=false&webcast_language=en&msToken=4plSj1K-DnpCGX4S4YB8UcoEs6Jh-jrEyjH9Ot8W0CRZUk0gSkPxIzhSLctxAGwlwMwKbVNFYO7fO6Eze0YIqYjK57eT2_wxETNqXjU197SxS3zSOx7YXkc6iGULBc0vd1vzsrPVMB5S3zM-2eF3jg==&X-Bogus=DFSzsIVOSz2AN9fbtI/AvSMK1-7s&_signature=_02B4Z6wo00001k5X6aQAAIDCNwU9tBpuJepOVe0AAPVReb";

const PARAMS = {
  aid: "1988",
  count: 35,
  secUid: "",
  cursor: "",
  cookie_enabled: true,
  screen_width: 0,
  screen_height: 0,
  browser_language: "",
  browser_platform: "",
  browser_name: "",
  browser_version: "",
  browser_online: "",
  timezone_name: "Europe/London",
};

/**
 *
 * @param userUID user secret UID
 * @param cursor position to start from to get user videos
 * @returns JSON.Object
 */

export async function getUserVideos(userUID: string, cursor: string) {
  PARAMS.secUid = userUID;
  PARAMS.cursor = cursor;

  const signer = new Signer(null, TT_REQ_USER_AGENT);
  await signer.init();

  //@ts-expect-error
  const qsObject = new URLSearchParams(PARAMS);
  const qs = qsObject.toString();
  const unsignedUrl = `https://m.tiktok.com/api/post/item_list/?${qs}`;
  const signature = await signer.sign(unsignedUrl);
  const navigator = await signer.navigator();
  await signer.close();

  const { "x-tt-params": xTtParams } = signature;
  const { user_agent: userAgent } = navigator;

  const getVideos = await fetchVideos(userAgent, xTtParams);

  if (getVideos.status !== 200) {
    throw new Error("A request to get the user's videos was not successful!");
  }
  return await getVideos.json();
}

async function fetchVideos(userAgent: string, xTtParams: string) {
  const options: RequestInit = {
    method: "GET",
    headers: {
      "user-agent": userAgent,
      "x-tt-params": xTtParams,
    },
  };

  return await fetch(TT_REQ_PERM_URL, options);
}
