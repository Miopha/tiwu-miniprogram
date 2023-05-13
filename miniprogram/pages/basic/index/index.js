var app = getApp();

// pages/basic/index/index.js
const DB = wx.cloud.database().collection("userInfo");
const _ = wx.cloud.database().command;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    JCTS: {
      type: Number,
      value: 0
    },
    subjects:[{
      title: '毛中特',
      abbreviation: 'mzt',
      bgcolor: [186,61,39],
      color: [245,229,169],
      icon: '/images/mzt.png',
      score: '30'
    },{
      title: '马原',
      abbreviation: 'my',
      bgcolor: [114,202,224],
      color: [255,255,255],
      icon: '/images/my.png',
      score: '30'
    },{
      title: '史纲',
      abbreviation: 'sg',
      bgcolor: [234,221,205],
      color: [0,0,0],
      icon: 'cloud://cloud1-4gyz6f7obb31c71c.636c-cloud1-4gyz6f7obb31c71c-1316702279/img/icon/sg.png',
      score: '30'
    },{
      title: '思修',
      abbreviation: 'sx',
      bgcolor: [159,118,238],
      color: [255,255,255],
      icon: 'cloud://cloud1-4gyz6f7obb31c71c.636c-cloud1-4gyz6f7obb31c71c-1316702279/img/icon/sx.png',
      score: '30'
    }],
    "CountDownDay" : Math.max(Math.floor(Math.abs((new Date("2023-12-24").getTime()-new Date().getTime()) / (24 * 60 * 60 * 1000))),0),
    m: new Date().getMonth()+1,
    d: new Date().getDate(),
    color:"#5a1216",
    showIndex: 10,
    questList: [],
    examMap: {}
  },
  panel: function (e) {
    this.data.questList[e.currentTarget.dataset.index].t = !this.data.questList[e.currentTarget.dataset.index].t
    this.setData({
      questList:this.data.questList
    })
    if (e.currentTarget.dataset.index != this.data.showIndex) {
      this.setData({
        showIndex: e.currentTarget.dataset.index,
      })
    } 
    else {
      this.setData({
        showIndex: 10
      })
    }
  },
  enterExam(e){
    var sub = this.data.examMap[e.target.dataset.exam];
    var belong = e.target.dataset.belong;
    console.log("进入考试:", sub+'_'+belong);
    wx.cloud.callFunction({
      name: "getUserInfo_subjectBelonglist",
      data: {
        sub: 'examination',
        belong: sub+'_'+belong,
        userId: app.globalData.userInfo.userId
      }
    }).then(res=>{
      var userDid;
      try{
        userDid = res.result.data['examination'][sub+'_'+belong];
      }catch(e){
        userDid = null
      }
      if(userDid&&userDid.length>1){
        console.log("有做题记录");
        console.log(userDid);
        var did = encodeURIComponent(JSON.stringify(userDid));
        wx.showModal({
          title: "进入考试",
          content: "检测到做过的记录，是否从头开始？",
          cancelText: "从头开始",
          confirmText: "继续",
          complete: (res) => {
            // 从头开始
            if (res.cancel) {
              wx.navigateTo({
                url: "/pages/basic/answerPage_exam/answerPage_exam?sub="+sub+"&belong="+belong+"&reset=1"+"&userDid="+did,
              })
            }
            // 继续
            if (res.confirm) {
              wx.navigateTo({
                url: "/pages/basic/answerPage_exam/answerPage_exam?sub="+sub+"&belong="+belong+"&reset=0"+"&userDid="+did,
              })
            }
          }
        });
      }else{
        console.log("无做题记录");
        var did = encodeURIComponent(JSON.stringify(0));
        wx.navigateTo({
          url: "/pages/basic/answerPage_exam/answerPage_exam?sub="+sub+"&belong="+belong+"&reset=0"+"&userDid="+did,
        });
      }
    })
  },
  enterDailyExersice(){
    wx.navigateTo({
      url: '/pages/basic/dailyExercisePage/dailyExercisePage',
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    wx.cloud.callFunction({
      name: "getJCTS"
    }).then(res=>{
      console.log('已获得坚持天数', res.result.data);
      try{
        if(res.result.data.JCTS)
        this.setData({
          JCTS: res.result.data.JCTS
        })
      }catch(e){}
    })
    wx.cloud.callFunction({
      name : "getExam"
    }).then(res=>{
      this.setData({
        questList : []
      })
      console.log("已获得套卷信息", res.result.data);
      for(var key in res.result.data){
        if(key=='_id') continue
        this.data.questList.push({
          'title' : key,
          'content' : res.result.data[key]
        })
      }
      this.setData({
        questList : this.data.questList
      })
    })
    wx.cloud.callFunction({
      name : 'getExamMap'
    }).then(res=>{
      console.log('已获得试卷的数据库名称', res.result.data)
      this.setData({
        examMap : res.result.data
      })
    })
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