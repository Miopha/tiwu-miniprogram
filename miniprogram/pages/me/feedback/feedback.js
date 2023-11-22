const util = require("../../../utils/util");

Page({

  /**
   * 页面的初始数据
   */
  data: {
    previewArr: [], // 保存选择的图片
    type: ["题干内容错误", "选项内容错误", "正确答案不匹配", "题目解析错误", "错别字", "其他错误"],
    status: 0,
    content: ""
  },
  changeStatus(e){
    console.log(e.currentTarget.dataset.idx);
    this.setData({
      status : this.data.status^(1<<(Number)(e.currentTarget.dataset.idx))
    });
  },
  changeContent(e){
    this.setData({
      content : e.detail.value
    });
  },

  /**
   * 删除上传图片
   */
  delReportPic: function (options) {
    let that = this;
    let pic = options.currentTarget.dataset.pic;
    let previewArrs = that.data.previewArr;
    that.removeArrElement(pic);
    that.setData({
      previewArr: previewArrs
    })
  },

  /**
   * 删除指定元素
   */
  removeArrElement: function (val) {
    let that = this;
    let previewArrs = that.data.previewArr;
    var index = previewArrs.indexOf(val);
    if (index > -1) {
      previewArrs.splice(index, 1);
    }
  },

  /**
   * 选择图片
   */
  chooseClientPic: function () {
    let that = this;
    wx.chooseImage({
      count: 4 - that.data.previewArr.length,
      sizeType: ['original', 'compressed'],
      sourceType: ['album', 'camera'],
      success: res => {
        let tempFilePaths = res.tempFilePaths;
        if (tempFilePaths.length > 0) {
          that.setData({
            previewArr: that.data.previewArr.concat(tempFilePaths)
          })
        } else {
          that.setData({
            previewArr: tempFilePaths
          })
        }
      }
    });
  },
  // 上传图片
  submit(){
    if(this.data.status==0){
      wx.showToast({
        title: '类型不能为空',
        icon: 'error'
      });
      return ;
    }else if(this.data.content==""){
      wx.showToast({
        title: '内容不能为空',
        icon: 'error'
      });
      return ;
    }
    wx.showToast({
      title: '感谢您的反馈',
      icon: 'success'
    })
    var fileIDs = [];
    for(var file in this.data.previewArr){
      wx.cloud.uploadFile({
        cloudPath: 'img/feedback/'+util.formatTime(new Date()).toString()+'.jpg',
        filePath: this.data.previewArr[file]
      }).then(res=>{
        let fileID = res.fileID;
        console.log('图片',file,'上传成功');
        fileIDs.push(fileID);
        if(fileIDs.length==this.data.previewArr.length){
          console.log(fileIDs);
          this.submitFeedback(fileIDs)
        }
      })
    }
    if(this.data.previewArr.length==0)
      this.submitFeedback(fileIDs)
  },
  submitFeedback(fileIDs){
    var type = "";
    for(var i = 0 ; i < this.data.type.length ; ++i){
      if(this.data.status&(i<<i)) type += this.data.type[i]+" ";
    }
    console.log(type);
    wx.cloud.callFunction({
      name: "submitFeedback",
      data: {
        fileIDs: fileIDs,
        type: type,
        content: this.data.content,
        currentTime: util.formatTime(new Date()).toString()
      }
    }).then(res=>{
      wx.navigateBack();
    });
  }
})