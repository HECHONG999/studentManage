//@___jQuery学生管理系统按页渲染数据插件
//@___2019 4 20 董美琪老师

(function ($) {
    function TurnPage(options) {
        this.father = options.father;
        this.curPage = options.curPage || 1;             //初始化展示的当前的第几页
        this.allPage = options.allPage || 1;             //一共要展示的总页数
        this.changePage = options.changePage || function () { };
        if (this.curPage > this.allPage) {              //如果当前页大于了总页数终止函数
            alert('请输入正确页码')
            return false
        }
        this.fillHTML();
        this.bindEvent();
    }

    //创建选择页面结构
    TurnPage.prototype.fillHTML = function () {
        $(this.father).empty()
        if (this.curPage > 1) {                                           //如果当前页大于1 展示上一页
            $(this.father).append('<li class="pre-page pre">上一页</li>');
        } else {
            $(this.father).remove('.pre-page')
        };

        if (this.curPage != 1 && this.curPage - 2 > 1) {                //当前页不是第一页 且当前页与第一页之差2页及以上  展示第一页
            $(this.father).append('<li class="tab-number">1</li>')
        };

        if (this.curPage - 2 > 2) {                                     //当前页的前两页如果大于第二页 则出现省略号
            $(this.father).append('<span>...</span>')
        };
        //添加中间页
        for (var i = this.curPage - 2; i < this.curPage + 2; i++) {    //渲染当前页的左右两页 当前页在1--allPage之间渲染
            if (i > 0 && i < this.allPage) {
                var oLi = $('<li class="tab-number"> ' + i + ' </li>')
                if (i == this.curPage) {                               //i 在 1 -- allPage之间渲染 当 i 等于当前页数时 添加css样式
                    oLi.addClass('cur-page')
                }
                $(this.father).append(oLi)
            }
        };
        if (this.allPage - this.curPage > 3) {         //最后页数 减去 当前页数 大于3 添加省略号
            $(this.father).append('<span>...</span>')
        }
        if (this.curPage + 2 < this.allPage) {         //当前页数 + 2 小于总页数 添加最后一页
            $(this.father).append('<li class="tab-number">' + this.allPage + '</li>')
        }
        if (this.curPage < this.allPage) {          //当前页数小于总页数 添加下一页
            $(this.father).append('<li class="next-page next">下一页</li>')
        } else {
            $(this.father).remove('.next-page')    //当前页等于总页数时 下一页消失
        }
    }

    //添加绑定事件
    TurnPage.prototype.bindEvent = function () {
        var self = this                                    //保证this指向
        $('.pre-page').on('click', function () {
            self.curPage--;                              //点击上一页时 当前页码 + 1 保存到全局 
            self.change()                               //调用change方法 在执行 changePage方法更新 
        });
        $('.next-page').on('click', function () {
            self.curPage++;
            self.change()
        });
        $('.tab-number').on('click', function () {
            var curPage = parseInt($(this).text())     //获取到当前点击的li文本当作所要渲染的页面
            self.curPage = curPage                   //获取到curPage 保存到全局 当this.changePage() 执行的时候获取当前点击切换的页面
            self.change()
        })
    }


    TurnPage.prototype.change = function () {
        this.fillHTML();                        //点击页码之后,重新更新当前要展示的页面
        this.bindEvent();
        this.changePage(this.curPage)         //通过changePage更新要展示的第几页  向后端再次请求当前点击页面的数据
    }
    $.fn.extend({                         //在jq原型上添加实列方法  $.fn.extend == $.prototype.extend
        turnPage: (function (options) {
            options.father = this;      //保存调用turnPage 方法的时候 谁调用this,this指向的是谁
            new TurnPage(options)      //通过构造函数 在原型链上添加方法
            return this               //保证jquery链式调用
        })
    })
}(jQuery))