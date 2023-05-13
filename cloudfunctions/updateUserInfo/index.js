// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV }) // 使用当前云环境
const DB = cloud.database();

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext();
  const openid = wxContext.OPENID;
  DB.collection('userInfo').doc(openid).update({
    data: {
      avatarSrc : event.avatarSrc,
      userName : event.userName,
      school : event.school,
      email : event.email
    },
    success: function(res){
      return res;
    }
  });
}