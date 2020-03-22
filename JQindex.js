
var nowPage = 1;      //当前展示数据的几页
var pageSize = 2;     //每一页所展示数据的条数
var allPageSize = 0;    //数据的总条数
var tableData = [];      //后端返回按页获取的数据条数
var flag = false         //加锁防止多次提交时弹出多次提示
var searchWord = ""   //通过搜索筛选出 input输入框中的数据值


//添加绑定事件
function bindEvent() {
    $('.menu-list').on('click', 'dd', function (e) {   // 给左侧学生列表添加点击事件
        $(this).siblings().removeClass('active');     //移除当前选中dd的其他兄弟元素具有active类名
        $(this).addClass('active');                  //给当前点击的元素添加上active类名 切换点击样式
        var id = $(this).data('id');               //获取自定属性data-id的类名 用于后面获取具有data-id的元素展示出来            
        if (id == 'student-list') {
            getTableData(nowPage)                      // 获取表格数据渲染右侧数据展示
        }
        $('.content').fadeOut();              //如果id名为add-student让右侧展示区淡出隐藏
        $('#' + id).fadeIn()                //让 add-student 标签淡入进来
    });

    $('#add-student-btn').on('click', function (e) {   //给左侧添加学生添加点击事件
        e.preventDefault();                           //阻止提交表单时 刷新页面的默认事件
        if (flag) {                                  //加锁防止节流 多次点击提交 返回多次提交成功信息提示
            return false
        }
        flag = true
        var data = $('#add-student-form').serializeArray()    //获取表单内容 通过serializeArray方法使表单序列化 得到类数组    
        data = formatObj(data)                               //通过formtObj函数来把data 转化为对象    
        transferData('/api/student/addStudent', data, function (res) {   //像后端发送请求存储数据到数据库
            alert('添加成功')
            $('#add-student-form')[0].reset();                //添加完成后置空表单元素
            $('.list').trigger('click');                     //自动触发列表点击事件刷新展示区数据
            flag = false
        })
    });
    $('#edit-student-btn').on('click', function (e) {      //编辑学生信息提交添加事件
        e.preventDefault();                             //阻止提交时 执行默认事件
        if (flag) {
            return false
        }
        var data = $('#edit-student-form').serializeArray();
        data = formatObj(data);
        transferData('/api/student/updateStudent', data, function (res) {
            alert('已修改成功');
            $('#edit-student-form')[0].reset();
            $('.mask').trigger('click');
            $('.list').trigger('click')

        })
    })

    $('#tbody').on('click', '.edit', function (e) {     //通过事件委托方式给 编辑学生信息 添加点击事件
        var index = $(this).data('index')             //获取到设有data-index属性的类名 获取到当前点击的索引值 精确获取到当前要编辑的数据
        renderForm(tableData[index])                //回填编辑表单的数据  
        $('.dialog').slideDown()                   //遮罩层显示出来
    })

    $('#tbody').on('click', '.del', function () {
        var index = $(this).data('index')          //获取到设有data-index属性的类名 获取到当前点击的索引值 精确获取到当前要编辑的数据
        console.log(index)
        var isDel = window.confirm('确认删除？')
        if (isDel) {
            transferData('/api/student/delBySno', {
                sNo: tableData[index].sNo              //后端要求必须传的学号参数,对应删除的数据索引的学号
            }, function (res) {                       //请求数据成功后的回调函数
                alert('删除成功')
                $('.list').trigger('click')          //自动触发列表点击事件 刷新展示数据
            })
        }
    })
    $('.mask').on('click', function (e) {         //给遮罩层添加点击事件,让遮罩层消失
        $('.dialog').slideUp()
    });

    $('#search-submit').click(function (e) {      //按关键字搜索数据
        var value = $('#search-word').val()      //获取输入到input框中的value值
        nowPage = 1                              //定义一个当前是第几页
        if (!value) {                            //判断value有值  进行过滤筛选
            getTableData(nowPage)                //如果输入框中年没值 渲染第一页的数据
        }
        searchWord = value
        getSearchTableData(searchWord)                // 有内容则 让其获取searchStudent 接口数据
    })
}



function formatObj(arr) {                    //把类数组转化成为对象
    var obj = {};
    for (var i = 0; i < arr.length; i++) {
        if (!obj[arr[i].name]) {
            obj[arr[i].name] = arr[i].value;
        }
    }
    return obj;
}


// 获取表格数据  没有过滤的数据 
function getTableData(page) {
    transferData('/api/student/findByPage', {              //按页获取数据
        page: page,
        size: pageSize
    }, function (res) {                                  //回调函数处理后端返回的数据
        allPageSize = res.data.cont;                    // 后端返回数据的总条数
        allPage = Math.ceil(allPageSize / pageSize)    // 记录当前要展示数据的总页数
        $('.turnPage').turnPage({                     // 插入翻页插件 把总页数和当前页传过去
            curPage: page,
            allPage: allPage,
            changePage: function (page) {   
                nowPage = page                      //更新当前切换的页码
                getTableData(page)                 //获取当前页码的数据
                console.log('yyyyy')
            }
        })
        tableData = res.data.findByPage               //后端返回按页获取数据的条数,保存到全局上
        renderTable(tableData)                       //渲染表格数据      
    })
}




//后端添加请求数据
function transferData(url, data, cb) {                      //
    $.ajax({                                               //通过ajax来向后端请求数据
        type: 'get',
        url: 'http://api.duyiedu.com' + url,
        data: $.extend(data, {                           //$.extend拼接对象
            appkey: 'DUYI_HC7772_1553827271965',
        }),
        dataType: 'json',
        success: function (res) {                        //像后端请求数据成功后的处理函数
            if (res.status == 'success') {
                cb(res)                                 //回调函数,对后端返回的数据进行操作
            } else {
                alert(res.msg)
            }
        }
    })
}

//回填编辑表单内容
function renderForm(data) {                   //拿到tableData对象
    var form = $('#edit-student-form')[0];   //获取到form表单 以便后面可以获取到所要改变表单的value值
    for (var prop in data) {                 //通过for in循环遍历对象 获取里面相对应的的数据
        if (form[prop]) {                    //判断form[prop]表单中是否有prop名的属性
            form[prop].value = data[prop]    //把数据回填到form表单中
        }
    }
}




//渲染表格数据
function renderTable(data) {
    var str = '';                               //采用字符串拼接方法动态创建dom
    data.forEach(function (item, index) {      //通过forEach方法循环遍历数组,动态创建DOM实现右侧展示区数据
        str += ' <tr>\
        <td>' + item.sNo + '</td>\
        <td>' + item.name + '</td> \
        <td>' + (item.sex ? '女' : '男') + '</td>\
        <td>' + item.email + '</td>\
        <td>' + (new Date().getFullYear() - item.birth) + '</td>\
        <td>' + item.phone + '</td>\
        <td>' + item.address + '</td>\
        <td>\
            <button class="btn edit" data-index=' + index + '>编辑</button>\
            <button class="btn del" data-index=' + index + '>删除</button>\
        </td>\
    </tr>';
    });
    $('#tbody').html(str);          //创建的html结构插入到页面中
}



//初始化数据
function init() {
    bindEvent()
    $('.list').trigger('click')   //通过triggger()方法触发click事件,初始化刷新数据展示
}
init()



//按关键字筛选过滤数据
function getSearchTableData(searchWord) {
    console.log(searchWord)
    transferData('/api/student/searchStudent', {
        size: pageSize,                // 当前页面展示的数据条数  
        page: nowPage,                 //当前展示的第几页
        search: searchWord,           //后端要求传入的当前所查询的关键字  参数
        sex: -1,
    }, function (res) {
        var allPage = Math.ceil(res.data.cont / pageSize)    //一共要展示的总页数
        $('#turnPage').turnPage({                           // 插入翻页插件 把总页数和当前页传过去 调用turnPage插件实现按页查询数据
            curPage: nowPage,                              //当前展示的页码
            allPage: allPage,                             //要展示数据的总页数
            changePage: function (page) {              // 切换页码时触发函数  要重新获取数据 并且当前页码保存 通过changePage方法,获取所要改变的当前页码 
                nowPage = page;                       //把当前要展示的页码 保存到全局 
                getSearchTableData()                // 执行函数 更新要展示当前页码的数据
            }
        })
        data = res.data.searchList              //像后端请求数据成功后返回当前页面的数据
        renderTable(data)                     //再次渲染表格数据
    })
}

