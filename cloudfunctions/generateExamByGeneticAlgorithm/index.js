// 云函数入口文件
const cloud = require('wx-server-sdk');

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV }) // 使用当前云环境
const DB = cloud.database();
const _ = DB.command;
const f1 = 1, f2 = 1;

// 云函数入口函数
exports.main = async (event, context) => {
  const task = [];
  var problems = [], promise;
  DB.collection('mzt').where({
    answer: _.exists(true)
  }).get().then(res=>{
    for(var i = 0 ; i < res.data.length ; ++i){
      problems.push(res.data[i])
    }
    DB.collection('my').where({
      answer: _.exists(true)
    }).get().then(res=>{
      for(var i = 0 ; i < res.data.length ; ++i){
        problems.push(res.data[i])
      }
      DB.collection('sx').where({
        answer: _.exists(true)
      }).get().then(res=>{
        for(var i = 0 ; i < res.data.length ; ++i){
          problems.push(res.data[i])
        }
        DB.collection('sg').where({
          answer: _.exists(true)
        }).get().then(res=>{
          for(var i = 0 ; i < res.data.length ; ++i){
            problems.push(res.data[i])
          }
          // 开始遗传算法
          for(var i = 0 ; i < problems.length ; ++i){
            // 设置难度系数
            if(!problems[i].hasOwnProperty('dif')){
              problems[i].dif = 0.5;
            }
            // 设置分数
            if(problems[i].multipleChoice){
              problems[i].score = 2;
              problems[i].type = 2;
            }else{
              problems[i].score = 1;
              problems[i].type = 1;
            }
            // 设置知识点
            problems[i].points = Math.floor(i/100)+1;
          }
          console.log('已获得题库', problems);
          // 期望试题
          var paper = {
            'totalScore' : 50,
            'Difficulty' : 0.51,
            'points' : [1, 2, 3, 4],
            'eachTypeCount' : [16,17]
          }
          // 迭代次数计数器, 适应度期望值, 最大迭代次数
          var count = 1, expect = 0.99, runCount = 5;
          var unitList = CSZQ(20, paper, problems);
          console.log('初始种群生成完成', unitList);
          console.log('-----------------------迭代开始------------------------');
          while(!isEnd(unitList, expect)){
            console.log('在第'+(count++)+'代未得到结果');
            if (count > runCount){
              console.log("计算 " + runCount + " 代仍没有结果，请重新设计条件！");
              break;
            }
            // 选择
            unitList = select(unitList, 10, count);
            console.log('在第'+(count)+'代选择完成', unitList);
            // 交叉
            unitList = Cross(unitList, 20, paper);
            console.log('在第'+(count)+'代交叉完成', unitList);
            // 是否可以结束（有符合要求试卷即可结束）
            if(isEnd(unitList, expect)) break;
            // 变异
            unitList = Change(unitList, problems, paper);
          }
          if (count <= runCount){
              console.log("在第 " + count + " 代得到结果，结果为：\n");
              console.log("期望试卷难度：" + paper.Difficulty + "\n");
              console.log(unitList, expect);
          }
          promise = unitList[getRndInteger(0, unitList.length)];
        })
      })
    })
  });
  task.push(promise);
  console.log('利用遗传算法得到的试题', task);
  return new Promise((resolve, reject)=>{
    setTimeout(()=>{
      var res = {s:promise}
      resolve(res)
    },3015)
  })
}

function Change(unitList, problemList, paper){
  var index = 0;
  for(var i = 0; i < unitList.length; ++i){
    // 随机选择一道题
    index = getRndInteger(0, unitList[i].problemList.length);
    var temp = unitList[i].problemList[index];
    // 得到这道题的知识点
    problem = {};
    // 从数据库中选择包含此题有效知识点的同类型同分数不同题号试题
    while(true){
      var rand = getRndInteger(0, problemList.length);
      if(problemList[rand].type==temp.type&&problemList[rand].score==temp.score&&problemList[rand].points==temp.points){
        unitList[i].problemList[index] = problemList[rand];
        break;
      }
    }
  }
    // 计算知识点覆盖率及适应度
    unitList = GetKPCoverage(unitList, paper);
    // 计算难度
    unitList = GetDifficultyNScore(unitList);
    // 计算适应度
    unitList = GetAdaptationDegree(unitList, paper);
    return unitList;
}

function Cross(unitList, count, paper){
  var crossedUnitList = [];
  while(crossedUnitList.length!=count){
    // 随机选择两个个体
    var indexOne = getRndInteger(0, unitList.length);
    var indexTwo = getRndInteger(0, unitList.length);
    var unitOne = {}, unitTwo = {};
    if (indexOne != indexTwo){
      unitOne = unitList[indexOne];
      unitTwo = unitList[indexTwo];
      // 随机选择一个交叉位置
      var crossPosition = getRndInteger(0, unitList.length);
      // 保证交叉的题目分数合相同
      var scoreOne = unitOne.problemList[crossPosition].score + unitOne.problemList[crossPosition+1].score;
      var scoreTwo = unitTwo.problemList[crossPosition].score + unitTwo.problemList[crossPosition+1].score;
      if(scoreOne==scoreTwo){
        // 两个新个体
        var unitNewOne = {"problemList": []}, unitNewTwo = {"problemList": []};
        for(var i = 0; i < unitOne.problemList.length ; ++i) unitNewOne.problemList.push(unitOne.problemList[i]);
        for(var i = 0; i < unitTwo.problemList.length ; ++i) unitNewTwo.problemList.push(unitTwo.problemList[i]);
        // 交换交叉位置后面两道题
        for(var i = crossPosition; i<crossPosition+2; ++i){
          unitNewOne.problemList[i] = unitTwo.problemList[i];
          unitNewTwo.problemList[i] = unitOne.problemList[i];
        }
        // 添加到新种群集合中
        unitNewOne.ID = crossedUnitList.length;
        unitNewTwo.ID = unitNewOne.ID+1;
        if(crossedUnitList.length<count){
          crossedUnitList.push(unitNewOne);
        }
        if(crossedUnitList.length<count){
          crossedUnitList.push(unitNewTwo);
        }
      }
    }
    // 过滤重复个体
    crossedUnitList = unitFilter(crossedUnitList);
  }
  // 计算知识点覆盖率及适应度
  crossedUnitList = GetKPCoverage(crossedUnitList, paper);
  // 计算难度
  crossedUnitList = GetDifficultyNScore(crossedUnitList);
  // 计算适应度
  crossedUnitList = GetAdaptationDegree(crossedUnitList, paper);
  return crossedUnitList;
}

function GetAdaptationDegree(unitList, paper){
  for(var i = 0; i < unitList.length; ++i){
    unitList[i].adaptationDegree = 1 - (1 - unitList[i].KPCoverage) * f1 - Math.abs(unitList[i].diff - paper.Difficulty) * f2;
  }
  return unitList;
}

function GetDifficultyNScore(unitList){
  for(var i = 0; i < unitList.length; ++i){
    var diff = 0.00, score = 0;
    for(var j = 0; j < unitList[i].problemList.length; ++j){
      diff += unitList[i].problemList[j].score * unitList[i].problemList[j].dif;
      score += unitList[i].problemList[j].score;
    }
    unitList[i].diff = diff/score;
    unitList[i].score = score;
  }
  return unitList;
}

function GetKPCoverage(unitList, paper){
  for(var i = 0; i < unitList.length; ++i){
    var status = 0, coverage = 0;
    for(var j = 0; j < unitList[i].problemList.length; ++j){
      status = status|(1<<(unitList[i].problemList[j].points));
    }
    while(status!=0){
      coverage += status&1;
      status >>= 1;
    }
    unitList[i].KPCoverage = coverage/paper.points.length;
  }
  return unitList;
}

function unitFilter(unitList){
  var isRepeat = new Array(unitList.length).fill(false);
  for(var i = 0; i < unitList.length; ++i){
    const set = new Set();
    for(var k = 0; k<unitList[i].problemList.length; ++k){
      set.add(unitList[i].problemList[k]._id);
    }
    for(var j = i+1; j < unitList.length; ++j){
      if(isRepeat[j]) continue;
      for(var k = 0; k<unitList[j].problemList.length; ++k){
        if(!set.has(unitList[j].problemList[k]._id)) break
        if(k==unitList[j].problemList.length-1) isRepeat[j] = true;
      }
      // console.log(unitList[i],unitList[j],'重复');
    }
  }
  var newUnitList = [];
  for(var i = 0; i < unitList.length; ++i){
    if(isRepeat[i]) continue;
    newUnitList.push(unitList[i]);
  }
  return newUnitList;
}

function select(unitList, count, cnt){
  var selectedUnitList = [], allAdaptationDegree = 0.0;
  for(var i = 0; i < unitList.length; ++i)
    allAdaptationDegree += unitList[i].adaptationDegree
  while(selectedUnitList.length!=count){
    // 选择一个0—1的随机数字
    var degree = 0.00, randDegree = Math.random()*allAdaptationDegree;
    // 选择符合要求的个体
    for(var i = 0; i < unitList.length; ++i){
      degree += unitList[i].adaptationDegree;
      if(degree>=randDegree){
        //不重复选择
        var exist = false;
        for(var j = 0; j < selectedUnitList.length; ++j){
          if(selectedUnitList[j]==unitList[i]){
            exist = true
          }
        }
        if(!exist){
          selectedUnitList.push(unitList[i]);
          break;
        }
        // break;
      }
    }
  }
  return selectedUnitList;
}

function CSZQ(count, paper, problemList){
  var unitList = [], eachTypeCount = paper.eachTypeCount;
  for(var i = 0; i < count ; ++i){
    var unit = {
      'ID': i+1,
      'adaptationDegree': 0.00,
      'sumScore': 0,
      'problemList': []
    }
    var cnt = 1;
    while((Number)(paper.totalScore)!=(Number)(unit.sumScore)){
      unit.problemList = [];
      unit.sumScore = 0;
      //各题型题目数量限制
      for (var j = 0; j < eachTypeCount.length; j++){
        var oneTypeProblem = [];
        for(var k = 0; k < problemList.length; ++k)
          if(problemList[k].type==(j+1)){
            oneTypeProblem.push(problemList[k])
          }
        for(var k = 0; k < eachTypeCount[j]; ++k){
          // 重复选择
          var index = getRndInteger(0, oneTypeProblem.length)
          unit.problemList.push(oneTypeProblem[index]);
          unit.sumScore += j+1;
        }
      }
    }
    unitList.push(unit);
  }
  return unitList;
}

function isEnd(unitList, endcondition){
  for(var i = 0; i < unitList.length; ++i){
    if(unitList[i].adaptationDegree>=endcondition){
      return true;
    }
  }
  return false;
}

// 以下函数返回 min（包含）～ max（不包含）之间的数字
function getRndInteger(min, max) {
  return Math.floor(Math.random() * (max - min) ) + min;
}