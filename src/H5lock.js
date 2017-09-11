(function(){
        window.H5lock = function(obj){
            this.height = obj.height;
            this.width = obj.width;
            this.chooseType = Number(window.localStorage.getItem('chooseType')) || obj.chooseType;
            this.devicePixelRatio = window.devicePixelRatio || 1;
        };


        H5lock.prototype.drawCle = function(x, y) { // 初始化解锁密码面板 小圆圈
            this.ctx.strokeStyle = '#87888a';//密码的点点默认的颜色
            this.ctx.lineWidth = 2;
            this.ctx.beginPath();
            this.ctx.arc(x, y, this.r, 0, Math.PI * 2, true);
            this.ctx.closePath();
            this.ctx.stroke();
        }
        H5lock.prototype.drawPoint = function(style) { // 初始化圆心
            for (var i = 0 ; i < this.lastPoint.length ; i++) {
                this.ctx.fillStyle = style;
                this.ctx.beginPath();
                this.ctx.arc(this.lastPoint[i].x, this.lastPoint[i].y, this.r / 2.5, 0, Math.PI * 2, true);
                this.ctx.closePath();
                this.ctx.fill();
            }
        }
        H5lock.prototype.drawStatusPoint = function(type) { // 初始化状态线条
            for (var i = 0 ; i < this.lastPoint.length ; i++) {
                this.ctx.strokeStyle = type;
                this.ctx.beginPath();
                this.ctx.arc(this.lastPoint[i].x, this.lastPoint[i].y, this.r, 0, Math.PI * 2, true);
                this.ctx.closePath();
                this.ctx.stroke();
            }
        }
        H5lock.prototype.drawLine = function(style, po, lastPoint) {//style:颜色 解锁轨迹
            this.ctx.beginPath();
            this.ctx.strokeStyle = style;
            this.ctx.lineWidth = 3;
            this.ctx.moveTo(this.lastPoint[0].x, this.lastPoint[0].y);

            for (var i = 1 ; i < this.lastPoint.length ; i++) {
                this.ctx.lineTo(this.lastPoint[i].x, this.lastPoint[i].y);
            }
            this.ctx.lineTo(po.x, po.y);
            this.ctx.stroke();
            this.ctx.closePath();

        }
        H5lock.prototype.createCircle = function() {// 创建解锁点的坐标，根据canvas的大小来平均分配半径

            var n = this.chooseType;
            var count = 0;
            this.r = this.ctx.canvas.width / (1 + 4 * n);// 公式计算
            this.lastPoint = [];
            this.arr = [];
            this.restPoint = [];
            var r = this.r;
            for (var i = 0 ; i < n ; i++) {
                for (var j = 0 ; j < n ; j++) {
                    count++;
                    var obj = {
                        x: j * 4 * r + 3 * r,
                        y: i * 4 * r + 3 * r,
                        index: count
                    };
                    this.arr.push(obj);
                    this.restPoint.push(obj);
                }
            }
            this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
            for (var i = 0 ; i < this.arr.length ; i++) {
                this.drawCle(this.arr[i].x, this.arr[i].y);
            }
            //return arr;
        }
        H5lock.prototype.getPosition = function(e) {// 获取touch点相对于canvas的坐标
            var rect = e.currentTarget.getBoundingClientRect();
            var po = {
                x: (e.touches[0].clientX - rect.left)*this.devicePixelRatio,
                y: (e.touches[0].clientY - rect.top)*this.devicePixelRatio
              };
            return po;
        }
        H5lock.prototype.update = function(po) {// 核心变换方法在touchmove时候调用
            this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);

            for (var i = 0 ; i < this.arr.length ; i++) { // 每帧先把面板画出来
                this.drawCle(this.arr[i].x, this.arr[i].y);
            }

            this.drawPoint('#27AED5');// 每帧花轨迹
            this.drawStatusPoint('#27AED5');// 每帧花轨迹

            this.drawLine('#27AED5',po , this.lastPoint);// 每帧画圆心

// if (this.lastPoint.length == 4) {
//     // debugger
// }

            for (var i = 0 ; i < this.restPoint.length ; i++) {
                if (Math.abs(po.x - this.restPoint[i].x) < this.r && Math.abs(po.y - this.restPoint[i].y) < this.r) {
                    this.drawPoint(this.restPoint[i].x, this.restPoint[i].y);
                    this.lastPoint.push(this.restPoint[i]);
                    this.restPoint.splice(i, 1);
                    break;
                }
            }

        }
        H5lock.prototype.checkPass = function(psw1, psw2) {// 检测密码
            var p1 = '',
            p2 = '';
            for (var i = 0 ; i < psw1.length ; i++) {
                p1 += psw1[i].index + psw1[i].index;
            }
            for (var i = 0 ; i < psw2.length ; i++) {
                p2 += psw2[i].index + psw2[i].index;
            }
            return p1 === p2;
        }
        H5lock.prototype.storePass = function(psw) {// touchend结束之后对密码和状态的处理

            if (this.pswObj.step == 1) {
                if (this.checkPass(this.pswObj.fpassword, psw)) {
                    this.pswObj.step = 2;
                    this.pswObj.spassword = psw;
                    document.getElementById('title').innerHTML = '密码保存成功';
                    

                    this.drawStatusPoint('#2CFF26');
                     this.drawPoint('#2CFF26');
                    window.localStorage.setItem('passwordxx', JSON.stringify(this.pswObj.spassword));
                    window.localStorage.setItem('chooseType', this.chooseType);
                } else {
                    document.getElementById('title').innerHTML = '两次不一致，重新输入';
                    this.drawStatusPoint('red');
                     this.drawPoint('red');
                    delete this.pswObj.step;
                }
            } else if (this.pswObj.step == 2) {
                if (this.checkPass(this.pswObj.spassword, psw)) {
                    var title = document.getElementById("title");
                    title.style.color = "#2CFF26";
                    title.innerHTML = '解锁成功';

                    this.drawStatusPoint('#2CFF26');//小点点外圈高亮
                    this.drawPoint('#2CFF26');
                    this.drawLine('#2CFF26',this.lastPoint[this.lastPoint.length-1] , this.lastPoint);// 每帧画圆心
                    

                } else if (psw.length < 4) {
                    
                    this.drawStatusPoint('red');
                    this.drawPoint('red');
                    this.drawLine('red',this.lastPoint[this.lastPoint.length-1] , this.lastPoint);// 每帧画圆心

                    var title = document.getElementById("title");
                    title.style.color = "red";
                    title.innerHTML = '请连接4个点';

                } else {
                    this.drawStatusPoint('red');
                    this.drawPoint('red');
                    this.drawLine('red',this.lastPoint[this.lastPoint.length-1] , this.lastPoint);// 每帧画圆心


                    var title = document.getElementById("title");
                    title.style.color = "red";
                    title.innerHTML = '密码错误，您还可以输入N次';
                }
            } else {
                this.pswObj.step = 1;
                this.pswObj.fpassword = psw;
                document.getElementById('title').innerHTML = '再次输入';
            }

        }
        H5lock.prototype.makeState = function() {
            if (this.pswObj.step == 2) {
                document.getElementById('updatePassword').style.display = 'block';
                //document.getElementById('chooseType').style.display = 'none';

                var title = document.getElementById("title");
                title.style.color = "#87888a";
                title.innerHTML = '请解锁';

            } else if (this.pswObj.step == 1) {
                //document.getElementById('chooseType').style.display = 'none';
                document.getElementById('updatePassword').style.display = 'none';
            } else {
                document.getElementById('updatePassword').style.display = 'none';
                //document.getElementById('chooseType').style.display = 'block';
            }
        }
        H5lock.prototype.setChooseType = function(type){
            chooseType = type;
            init();
        }
        H5lock.prototype.updatePassword = function(){
            window.localStorage.removeItem('passwordxx');
            window.localStorage.removeItem('chooseType');
            this.pswObj = {};
            document.getElementById('title').innerHTML = '绘制解锁图案';
            this.reset();
        }
        H5lock.prototype.initDom = function(){
            var wrap = document.createElement('div');
            var str = '<h4 id="title" class="title" style="color:#87888a">请绘制您的图形密码</h4>'+
                      '<a id="updatePassword" style="position: absolute;right: 5px;top: 5px;color:#fff;font-size: 10px;display:none;">重置密码</a>';

            wrap.setAttribute('style','position: absolute;top:0;left:0;right:0;bottom:0;');
            var canvas = document.createElement('canvas');
            canvas.setAttribute('id','canvas');
            canvas.style.cssText = 'background-color: #000;display: inline-block;margin-top: 76px;';
            wrap.innerHTML = str;
            wrap.appendChild(canvas);

            var width = this.width || 320;
            var height = this.height || 320;
            
            document.body.appendChild(wrap);

            // 高清屏锁放
            canvas.style.width = width + "px";
            canvas.style.height = height + "px";
            canvas.height = height * this.devicePixelRatio;
            canvas.width = width * this.devicePixelRatio;
            

        }
        H5lock.prototype.init = function() {
            this.initDom();
            this.pswObj = window.localStorage.getItem('passwordxx') ? {
                step: 2,
                spassword: JSON.parse(window.localStorage.getItem('passwordxx'))
            } : {};
            this.lastPoint = [];
            this.makeState();
            this.touchFlag = false;
            this.canvas = document.getElementById('canvas');
            this.ctx = this.canvas.getContext('2d');
            this.createCircle();
            this.bindEvent();
        }
        H5lock.prototype.reset = function() {
            this.makeState();
            this.createCircle();
        }
        H5lock.prototype.bindEvent = function() {
            var self = this;
            this.canvas.addEventListener("touchstart", function (e) {
                e.preventDefault();// 某些android 的 touchmove不宜触发 所以增加此行代码
                 var po = self.getPosition(e);

                 for (var i = 0 ; i < self.arr.length ; i++) {
                    if (Math.abs(po.x - self.arr[i].x) < self.r && Math.abs(po.y - self.arr[i].y) < self.r) {

                        self.touchFlag = true;
                        self.drawPoint(self.arr[i].x,self.arr[i].y);
                        self.lastPoint.push(self.arr[i]);
                        self.restPoint.splice(i,1);
                        break;
                    }
                 }
             }, false);
             this.canvas.addEventListener("touchmove", function (e) {
                if (self.touchFlag) {
                    self.update(self.getPosition(e));
                }
             }, false);
             this.canvas.addEventListener("touchend", function (e) {
                 if (self.touchFlag) {
                     self.touchFlag = false;
                     self.storePass(self.lastPoint);
                     setTimeout(function(){

                        self.reset();
                    }, 1000);
                 }


             }, false);

             document.getElementById('updatePassword').addEventListener('click', function(){
                 self.updatePassword();
              });
        }
})();
