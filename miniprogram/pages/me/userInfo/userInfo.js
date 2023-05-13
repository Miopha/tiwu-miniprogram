// pages/me/userInfo/userInfo.js
const defaultAvatar = "https://mmbiz.qpic.cn/mmbiz/icTdbqWNOwNRna42FI242Lcia07jQodd2FJGIYQfG0LAJGFxM4FbnQP6yfMxBgJ0F3YRqJCJ1aPAK2dQagdusBZg/0";
const app = getApp();
var util = require('../../../utils/util.js');

Page({

  /**
   * 页面的初始数据
   */
  data: {
    avatarSrc : defaultAvatar,
    userName : "",
    school : "",
    email : ""
  },
  onChooseAvatar(e) {
    console.log(e.detail);
    wx.cloud.uploadFile({
      cloudPath: util.formatTime(new Date()).toString()+'.jpg',
      filePath: e.detail.avatarUrl
    }).then(res=>{
      console.log(res);
      let fileID = res.fileID;
      this.setData({
        avatarSrc : fileID
      });
    });
  },
  setUserName(e){
    this.setData({
      userName : e.detail.value
    });
  },
  setSchool(e){
    this.setData({
      school : e.detail.value
    });
  },
  setEMail(e){
    this.setData({
      email : e.detail.value
    });
  },
  submit(){
      wx.cloud.callFunction({
        name: "updateUserInfo",
        data: {
          avatarSrc : this.data.avatarSrc,
          userName : this.data.userName,
          school : this.data.school,
          email : this.data.email
        }
      }).then(res=>{
        wx.showToast({
          title: '提交成功',
          icon: 'success'
        });
      });
  },
  delete(){
    wx.showToast({
      title: '重置成功',
      icon: 'success'
    });
    this.setData({
      avatarSrc : defaultAvatar,
      userName : "",
      school : "",
      email : ""
    });
    this.submit();
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    wx.cloud.callFunction({
      name : "getUserInfomation"
    }).then(res=>{
      var avatarSrc, userName, email, school, autoRemove;
      try{
        avatarSrc = res.result.data.avatarSrc;
      }catch(e){
        avatarSrc = defaultAvatar;
      }
      if(res.result.data.avatarSrc){
        avatarSrc = res.result.data.avatarSrc;
      }else{
        avatarSrc = "";
      }
      if(res.result.data.userName){
        userName = res.result.data.userName;
      }else{
        userName = "";
      }
      if(res.result.data.email){
        email = res.result.data.email;
      }else{
        email = "";
      }
      if(res.result.data.school){
        school = res.result.data.school;
      }else{
        school = "";
      }
      if(res.result.data.autoRemove){
        autoRemove = res.result.data.autoRemove;
      }else{
        autoRemove = '0';
      }
      this.setData({
          avatarSrc : avatarSrc,
          userName : userName,
          email : email,
          school : school,
          autoRemove : autoRemove
      });
    });
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {

  }
})