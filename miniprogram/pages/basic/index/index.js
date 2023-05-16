var app = getApp();

// pages/basic/index/index.js
const DB = wx.cloud.database().collection("userInfo");
const _ = wx.cloud.database().command;
Page({
  /**
   * 页面的初始数据
   */
  data: {
    motto:["坚持把简单的事情做好就是不简单，坚持把平凡的事情做好就是不平凡，所谓成功，就是在平凡中做出不平凡的坚持", "脚下的路，无论曲折平坦，认定了别回头，迈开步子向前走，选好的事，别管成功与否，认定了别徘徊，坚持不懈去完成", "失败是什么?没有什么，只是更走近成功一步，成功是什么?就是走过了所有通向失败的路，只剩下一条路，那就是成功的路", "不要因为一次的失败而觉得自己永远都是失败，不要因为一次的错过而觉得自己就是终身错过，更加不要因为一次的摔倒而永远不想爬起来", "这些年，风风雨雨都熬过，喜怒哀乐都有过，你会发现,最难走的路，是你一个人走的，最悲伤的时刻，是你一个人挺的，最沉重的担子，是你一个人扛的", "你改变不了环境，但可以改变自己，你改变不了事实，但可以改变态度，你改变不了过去，但可以改变现在，你不能控制别人，但能够掌握自己", "别人再风光，你指望不上，眼前再狼藉，不得不继续!没人扶你的时候，要自己站直，没人帮你的时候，要自己努力，相信自己，只要你足够勇敢，没有熬不过的艰难", "人不是生来就是强者，在这个瞬息变化的世界中，我们不得不逼着自己坚强，让自己变得强大。", "要一步一步走，苦要一口一口吃，没人帮扶的时候，自己要吃得了苦，受得住累，扛得起生活，人生从来没有捷径，唯有努力才能看见彩虹", "如果你选择了放弃，就不要抱怨。因为世界是平衡的!每个人都要通过自己的努力，去决定生活的样子", "人生是一场永不落幕的演出，我们每一个人都是演员，只不过，有的人顺从自己，有的人取悦观众。", "你想要的东西都很贵，你想去的地方都很远，只有不停的努力，才能攒好足够的勇气，跨过人生中的每一场冒险。", "人生就是体验，生活就是经历，没有永远的一帆风顺，没有一直会幸福的人，风雨总会有，所以，与其自暴自弃，还不如想办法应对负面情绪。", "做错了，改正，摔倒了，爬起，失败了，重来，身在逆境中，拼才能突围，落在低谷里，闯才有转机，唯有奋发图强，才能出人头地"],
    showMotto: "",
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
      score: '24'
    },{
      title: '史纲',
      abbreviation: 'sg',
      bgcolor: [234,221,205],
      color: [0,0,0],
      icon: 'cloud://cloud1-4gyz6f7obb31c71c.636c-cloud1-4gyz6f7obb31c71c-1316702279/img/icon/sg.png',
      score: '14'
    },{
      title: '思修',
      abbreviation: 'sx',
      bgcolor: [159,118,238],
      color: [255,255,255],
      icon: 'cloud://cloud1-4gyz6f7obb31c71c.636c-cloud1-4gyz6f7obb31c71c-1316702279/img/icon/sx.png',
      score: '16'
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
  enterRandomExam(e){
    wx.navigateTo({
      url: '/pages/basic/randomExam/randomExam',
    })
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
    var randElement = this.data.motto[Math.floor(Math.random()*this.data.motto.length)];
    this.setData({
      showMotto: randElement
    });
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