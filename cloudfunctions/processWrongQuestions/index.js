// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV }) // 使用当前云环境
const DB = cloud.database();
const _ = DB.command;

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext();
  var openid = wxContext.OPENID;
  console.log("传入信息",event);
  var modifyFile = "wrongQuestions."+event.y+"."+event.m+"."+event.d;
  console.log("要修改的日期为",modifyFile);
  if(event.newWrongQuestionsId.length==0){ // 当天不再有错题，删除当天错题记录
    return await DB.collection("userInfo").doc(openid).update({
      data : {
        [modifyFile] : _.remove()
      }
    });
  }else{ // 当天还有错题，更新当天错题记录
    return await DB.collection("userInfo").doc(openid).update({
      data : {
        [modifyFile] : event.newWrongQuestionsId
      }
    });
  }
}