// app.js
let DB;
App({
  onLaunch: function () {
    // 云开发环境初始化
    wx.cloud.init({
      env:"cloud1-4gyz6f7obb31c71c"
    });
    DB = wx.cloud.database();
    // 获取用户信息
    wx.cloud.callFunction({
      name : "getUserInfo"
    }).then(res=>{
      this.setUserInfo(res.result.openid);
    });
  },
  // 设置globalData里的用户信息
  setUserInfo(openid){
    this.globalData.userInfo.userId = openid;
    var userId = this.globalData.userInfo.userId;
    DB.collection('userInfo').doc(this.globalData.userInfo.userId).get({
      // 存在此用户信息
      success: function(res){
        console.log("用户",userId,"登录成功");
      },
      // 不存在此用户信息，创建
      fail: function(res){
        DB.collection('userInfo').add({
          data : {
            _id : userId
          }
        }).then(res=>{console.log("新用户信息",res._id,"创建成功")});
      }
    });
  },
  globalData: {
    userInfo: {
      userId: ''
    },
    allSubject : []
  }
});
