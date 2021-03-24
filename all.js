// 定義 DOM
const groupSortMethod = document.getElementById("groupSortMethod");
const groupTable = document.getElementById("groupTable");
const individualSortMethod = document.getElementById("individualSortMethod");
const individualTable = document.getElementById("individualTable");

// 監聽
groupSortMethod.addEventListener("change", () => {
  groupSort(formattedGroupList);
});
individualSortMethod.addEventListener("change", () => {
  individualSort(formattedGroupList);
});

const json = `https://raw.githubusercontent.com/hexschool/js-traninging-week6API/main/data.json`;
let response = [];
let formattedGroupList = [];
let formattedIndividualList = [];

// 初始化畫面
function init() {
  return axios.get(json).then(res => {
    response = res.data;
    bestGroup();
    bestIndividual();
  });
}

// 組別資料：抓取全部需要用到的資料，並組成一個個物件放到formattedGroupList裏
function bestGroup() {
  const allGroupInfo = {};
  response.forEach(item => {
    allGroupInfo[item.jsGroup]
      ? (allGroupInfo[`${item.jsGroup}`] += 1)
      : (allGroupInfo[item.jsGroup] = 1);
  });

  const totalSec = {};
  response.forEach(item => {
    totalSec[item.jsGroup]
      ? (totalSec[item.jsGroup] +=
          Number(item.practiceSecond) + Number(item.practiceMinute) * 60)
      : (totalSec[item.jsGroup] =
          Number(item.practiceSecond) + Number(item.practiceMinute) * 60);
  });

  const averageSec = {};
  for (const [group, sec] of Object.entries(totalSec)) {
    averageSec[group] = Math.floor(sec / allGroupInfo[group]);
  }

  for (const [group, submitTotal] of Object.entries(allGroupInfo)) {
    if (group !== "未分組") {
      formattedGroupList.push({
        group: group,
        submitTotal: submitTotal,
        averageSec: averageSec[group],
      });
    }
  }
  groupSort(formattedGroupList);
}

// 組別排序
function groupSort(formattedGroupList) {
  let sortList = [];
  if (groupSortMethod.value === "totalSubmit") {
    sortList = formattedGroupList.sort((a, b) => b.submitTotal - a.submitTotal);
  } else {
    sortList = formattedGroupList.sort((a, b) => a.averageSec - b.averageSec);
  }
  groupRender(sortList);
}

// 個人資料：抓取全部需要用到的資料，並組成一個個物件放到formattedIndividualList裏
function bestIndividual() {
  formattedIndividualList = response.map(item => ({
    ...item,
    practiceTotalSec:
      Number(item.practiceMinute) * 60 + Number(item.practiceSecond),
    unix: formatSubmitDate(item.timestamp),
  }));
  individualSort();
}

// 個人排序
function individualSort() {
  let sortList = [];
  if (individualSortMethod.value === "submitTime") {
    sortList = formattedIndividualList.sort((a, b) => a.unix - b.unix);
  } else {
    sortList = formattedIndividualList.sort(
      (a, b) => a.practiceTotalSec - b.practiceTotalSec
    );
  }
  individualRender(sortList);
}

// 個人資料裏的timestamp轉換（用作之後計算投稿時間排名）
function formatSubmitDate(timestamp) {
  let timestampArr = timestamp.split(" ");
  let date = timestampArr[0].split("/");
  let time = timestampArr[2].split(":");
  let year = Number(date[0]);
  let month = Number(date[1]);
  let day = Number(date[2]);
  let hour = Number(time[0]);
  let min = Number(time[1]);
  let sec = Number(time[2]);

  if (timestampArr[1] === "下午" && hour !== 12) {
    hour += 12;
  }

  if (`${month}`.length < 2) {
    month = `0${month}`;
  }
  if (`${day}`.length < 2) {
    day = `0${day}`;
  }
  if (`${hour}`.length < 2) {
    hour = `0${hour}`;
  }
  if (`${min}`.length < 2) {
    min = `0${min}`;
  }
  if (`${sec}`.length < 2) {
    sec = `0${sec}`;
  }
  let dateStr = `${year}-${month}-${day}T${hour}:${min}:${sec}`;
  let unixTimestamp = new Date(dateStr).getTime();
  return unixTimestamp;
}

// 渲染組別排名
function groupRender(list) {
  template = (item, index) => `
    <tr>
        <td>${index + 1}</th>
        <td>${item.group}</td>
        <td>${item.submitTotal}</td>
        <td>${item.averageSec}</td>
    </tr>`;
  const HTMLcontent = list.reduce((acc, curr, index) => {
    return (acc += template(curr, index));
  }, ``);
  groupTable.innerHTML = HTMLcontent;
}

// 渲染個人排名
function individualRender(list) {
  template = (item, index) => `
    <tr>
        <td>${index + 1}</th>
        <td>${item.timestamp}</th>
        <td>${item.slackName}</td>
        <td>${item.jsGroup}</td>
        <td>
            ${
              item.youtubeUrl !== ""
                ? `<a href="${item.youtubeUrl}">YouTube</a>`
                : "無"
            }
        </td>
        <td>${item.haveTen}</td>
        <td>
            <a href="${item.codepenUrl}">Codepen</a>
        </td>
        <td>${item.practiceMinute}</td>
        <td>${item.practiceSecond}</td>
    </tr>`;
  const HTMLcontent = list.reduce((acc, curr, index) => {
    return (acc += template(curr, index));
  }, ``);
  individualTable.innerHTML = HTMLcontent;
}

init();
