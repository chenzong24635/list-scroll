const app = getApp()

Page({
  postFlg: false,
  pageNum: 1,
  pageSize: 20,
  list:[],
  data: {
    list: []
  },
  onLoad: function() {
    this.getList();
  },
  //-------------------------监听-------------------------------------------
  //滚动到底部加载
  onReachBottom() {
    var than = this;
    if (!than.postFlg) {
      than.postFlg = true;
      than.pageNum++;
      than.getList();
    }
  },

  //滚动监听
  onPageScroll(e){
    var than = this;
    than.index = than.index ? than.index : 0;
    than.windowHeight = than.windowHeight ? than.windowHeight : wx.getSystemInfoSync().windowHeight;
    than.boundings.forEach((o,index)=>{
      if ((o.top < e.scrollTop + than.windowHeight) && (e.scrollTop + than.windowHeight <= o.bottom)){
        than.index = index;
      }
    });

    than.data.list.forEach((o,index)=>{
      if ((index == than.index || index == than.index - 1 || index == than.index - 2 || index == than.index + 1 || index == than.index + 2) && than.data.list[index] && !Array.isArray(than.data.list[index])){
        than.setData({
          [`list[${index}]`] : than.list[index]
        })
      }
      if ((index > than.index + 2 || index < than.index - 2) && Array.isArray(than.data.list[index])) {
        than.setData({
          [`list[${index}]`]: { height: than.boundings[index].height }
        })
      } 
    });
  },
  //-------------------------方法-------------------------------------------
  //获取列表
  getList() {
    var than = this;
    if (than.pageNum == 1) {
      than.setData({
        list: []
      })
    }
    wx.request({
      url: 'https://w.taopaitang.com/api/discover?page=' + than.pageNum + '&pagenum=' + than.pageSize,
      data: {},
      method:'GET',
      success(res){
        than.postFlg = false;
        //分页渲染
        than.list[than.pageNum - 1] = res.data.data.items;
        than.setData({
          [`list[${than.pageNum - 1}]`]: res.data.data.items
        })

        //计算并记录外层列表数据的边界值
        than.boundings = Array.isArray(than.boundings) ? than.boundings : [];
        var index = than.pageNum - 1;
        wx.createSelectorQuery().select(`#listitem${index}`).boundingClientRect((rect) => {
          than.boundings[index] = {
            height: rect.height,
            top: index == 0 ? rect.top : than.boundings[index - 1].top + than.boundings[ index - 1].height,
            bottom: index == 0 ? rect.bottom : than.boundings[index - 1].bottom + rect.height
          }
        }).exec();
      }
    })
  },


})