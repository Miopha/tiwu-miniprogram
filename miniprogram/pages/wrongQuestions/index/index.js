// pages/wrongQuestions/index/index.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    wrongQuestionsData: [],
    isLoading : {
      type : Number,
      value : 0
    }
  },
  /**
   * 一个异步任务
   * 1.获取用户错题
   */
  beginLoading(){
    this.setData({
      isLoading : 1
    });
    wx.showLoading({
      title : "获取数据中",
      mask : true
    });
  },
  reduceIsLoading(){
    console.log("123213");
    this.setData({
      isLoading : this.data.isLoading - 1
    });
    if(this.data.isLoading==0) wx.hideLoading();
  },
  // 获取用户错题数据
  getWrongQuestions(){
    wx.cloud.callFunction({
      name : "getWrongQuestions",
    }).then(res=>{
      console.log(res)
      console.log("已获得用户错题数据:",res.result.data.wrongQuestions);
      var data = res.result.data.wrongQuestions;
      var wrongQuestionsData = [];
      for(let yy in data){
        for(let mm in data[yy]){
          for(let dd in data[yy][mm]){
            // console.log(yy,mm,dd,data[yy][mm][dd]);
            wrongQuestionsData.push({
              y : yy,
              m : mm,
              d : dd,
              questions : data[yy][mm][dd]
            })
          }
        }
      }
      this.setData({
        wrongQuestionsData : wrongQuestionsData
      })
      this.reduceIsLoading()
    });
  },
  // 跳转到答题页面
  goto(e){
    console.log(e.target.dataset);
    var wrongQuestionsData = encodeURIComponent(JSON.stringify(this.data.wrongQuestionsData[e.target.dataset.index].questions));
    var y = e.target.dataset.y, m = e.target.dataset.m, d = e.target.dataset.d;
    console.log('ceshi', this.data.wrongQuestionsData[e.target.dataset.index].questions);
    wx.navigateTo({
      url: '/pages/wrongQuestions/answerPage/answerPage?questions='+wrongQuestionsData+'&y='+y+'&m='+m+'&d='+d,
    });
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {

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
    this.beginLoading();
    this.getWrongQuestions();
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