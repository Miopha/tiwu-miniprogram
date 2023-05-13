// pages/basic/selectList/selectList.js
var app = getApp();
Page({

  /**
   * 页面的初始数据
   * didOfList[i]: 第i章节所做过的题目
   */
  data: {
    sub : String,
    did : 0,
    percent : 0,
    total : 0,
    isLoading : 0,
    list : [],
    didOfList : [],
    totalOfList: [],
    percentOfList: [],
    userDid : {}
  },
  // 返回
  navigateBack(){
    wx.navigateBack();
  },
  // 操作isLoading，实现监听
  setIsLoading(a){
    this.setData({
      isLoading : a
    });
    if(this.data.isLoading) wx.showLoading({
      title : '正在加载',
      mask : true
    })
    else wx.hideLoading();
  },
  // 初始化
  init(){
    this.setData({
      didOfList : [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
      totalOfList : [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]
    });
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(option) {
    this.setData({
      sub : option.sub
    });
    console.log("进入了科目：",this.data.sub);
  },
  goto(e){
    console.log(e.currentTarget.dataset.belong);
    var goToList = e.currentTarget.dataset.belong;
    var userDid;
    if(this.data.didOfList[goToList]==0){
      userDid = encodeURIComponent(JSON.stringify(0));
      wx.navigateTo({
        url: "/pages/basic/answerPage/answerPage?sub="+this.data.sub+"&belong="+goToList+"&reset=0"+"&userDid="+userDid,
      })
    }else{
      userDid = encodeURIComponent(JSON.stringify(this.data.userDid[goToList]));
      wx.showModal({
        title: "切换到第"+(goToList+1)+"章",
        content: "检测到做过的记录，是否从头开始？",
        cancelText: "从头开始",
        confirmText: "继续",
        complete: (res) => {
          // 从头开始
          if (res.cancel) {
            wx.navigateTo({
              url: "/pages/basic/answerPage/answerPage?sub="+this.data.sub+"&belong="+goToList+"&reset=1"+"&userDid="+userDid,
            })
          }
          // 继续
          if (res.confirm) {
            wx.navigateTo({
              url: "/pages/basic/answerPage/answerPage?sub="+this.data.sub+"&belong="+goToList+"&reset=0"+"&userDid="+userDid,
            })
          }
        }
      })
    }
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
    var that = this;
    this.init();
    // 共有2个异步任务
    this.setIsLoading(2);
    // 获取当前用户在此章节已经做过的题目数量
    wx.cloud.callFunction({
      name : "getUserDid",
      data: {
        userId: app.globalData.userInfo.userId,
        sub: this.data.sub
      }
    }).then(res1=>{
      this.setData({
        userDid : res1.result.data[this.data.sub]
      });
      console.log("已获得用户做过的题目ID",this.data.userDid);
      wx.cloud.callFunction({
        name : 'getAllQuestions',
        data :{
          sub : this.data.sub
        }
      }).then(res2=>{
        console.log("已获得题库",this.data.sub,"中全部题目的id",res2.result.data);
        const questions_info = new Set();
        var cnt = 0;
        // 把m个题库中的题目的id放入set里
        res2.result.data.forEach(function(value,index,obj){
          questions_info.add(value._id);
          try{
            that.setData({
              ['totalOfList['+value.belong+']'] : that.data.totalOfList[value.belong] + 1
            });
          }catch(e){}
        });
        // 遍历n个已做过的题目，检查是否在set中
        // i: 第i章节
        for(var i = 0 ; i < 50 ; ++i){
          var thisDid = 0;
          try{
            res1.result.data[this.data.sub][i].forEach(function(value,index,obj) {
              if(questions_info.has(value)) ++thisDid;
            });
          }catch(e){}
          cnt += thisDid;
          that.setData({
            ['didOfList['+i+']'] : thisDid
          })
        }
        // 修改已做过题目did
        this.setData({
          did : cnt,
          total : res2.result.data.length-1,
          percent : 1.0*cnt/(res2.result.data.length-1)*100,
        })
        console.log("当前题库完成进度:",this.data.percent);
        for(var i = 0 ; i < 50 ; ++i){
          that.setData({
            ['percentOfList['+i+']'] : this.data.didOfList[i]/that.data.totalOfList[i]*100
          });
        }
        this.setIsLoading(this.data.isLoading-1);
      })
    });
    // 获取题单
    wx.cloud.callFunction({
      name: "getList",
      data: {
        sub : this.data.sub
      }
    }).then(res=>{
      this.setData({
        list : res.result.data.list
      })
      this.setIsLoading(this.data.isLoading-1);
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