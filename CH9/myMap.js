// 创建地图实例
var map = new BMap.Map("myMap", { enableMapClick: false });
//以四川省为地图中心，显示层级为13
map.centerAndZoom("四川省", 13);
//允许滚动鼠标缩放地图
map.enableScrollWheelZoom(true);
setTimeout(function () {
    map.enableDragging(); //两秒后开启拖拽
}, 2000);
var index = 0;
var myGeo = new BMap.Geocoder();
//需要批量解析显示的地址
var adds = [
    "煎茶镇",
    "新兴镇",
    "永安镇",
    "白家沟",
    "正兴镇",
    "万安镇",
    "南湖湿地公园"
];
var blist = [];
var districtLoading = 0;

function getBoundary() {
    //设置指定显示区域双流、龙泉驿
    addDistrict("成都市双流区");
    addDistrict("成都市龙泉驿区");
}

function addDistrict(districtName) {
    //使用计数器来控制加载过程
    districtLoading++;
    var bdary = new BMap.Boundary();
    bdary.get(districtName, function (rs) { //获取行政区域
        var count = rs.boundaries.length; //行政区域的点有多少个
        if (count === 0) {
            alert('未能获取当前输入行政区域');
            return;
        }
        for (var i = 0; i < count; i++) {
            blist.push({ points: rs.boundaries[i], name: districtName });
        };
        //加载完成区域点后计数器-1
        districtLoading--;
        if (districtLoading == 0) {
            //全加载完成后画端点
            drawBoundary();
        }
    });
}

function drawBoundary() {
    //包含所有区域的点数组
    var pointArray = [];

    /*画遮蔽层的相关方法
     *思路: 首先在中国地图最外画一圈，圈住理论上所有的中国领土，然后再将每个闭合区域合并进来，并全部连到西北角。
     *      这样就做出了一个经过多次西北角的闭合多边形*/
    //定义中国东南西北端点，作为第一层
    var pNW = { lat: 59.0, lng: 73.0 }
    var pNE = { lat: 59.0, lng: 136.0 }
    var pSE = { lat: 3.0, lng: 136.0 }
    var pSW = { lat: 3.0, lng: 73.0 }
    //向数组中添加一次闭合多边形，并将西北角再加一次作为之后画闭合区域的起点
    var pArray = [];
    pArray.push(pNW);
    pArray.push(pSW);
    pArray.push(pSE);
    pArray.push(pNE);
    pArray.push(pNW);
    //循环添加各闭合区域
    for (var i = 0; i < blist.length; i++) {
        //添加显示用标签层
        var label = new BMap.Label(blist[i].name, { offset: new BMap.Size(20, -10) });
        label.hide();
        map.addOverlay(label);

        //添加多边形层并显示
        var ply = new BMap.Polygon(blist[i].points, { strokeWeight: 2, strokeColor: "#5185E6", fillOpacity: 0.01, lColor: " #FFFFFF" }); //建立多边形覆盖物
        ply.name = blist[i].name;
        ply.label = label;
        map.addOverlay(ply);

        //将点增加到视野范围内
        var path = ply.getPath();
        pointArray = pointArray.concat(path);
        //将闭合区域加到遮蔽层上，每次添加完后要再加一次西北角作为下次添加的起点和最后一次的终点
        pArray = pArray.concat(path);
        pArray.push(pArray[0]);
    }

    //限定显示区域，需要引用api库
    var boundply = new BMap.Polygon(pointArray);
    BMapLib.AreaRestriction.setBounds(map, boundply.getBounds());
    map.setViewport(pointArray); //调整视野 

    //添加遮蔽层(描边线条，遮罩层颜色)
    var plyall = new BMap.Polygon(pArray, { strokeOpacity: 0.0000001, strokeColor: "#fff", strokeWeight: 0.00001, lColor: "#ffffff", fillOpacity: 1 }); //建立多边形覆盖物
    map.addOverlay(plyall);
}

function bdGEO() {
    var add = adds[index];
    geocodeSearch(add);
    index++;
}
getBoundary();
function geocodeSearch(add) {
    if (index < adds.length) {
        setTimeout(window.bdGEO, 400);
    }
    myGeo.getPoint(add, function (point) {
        if (point) {
            var address = new BMap.Point(point.lng, point.lat);
            addMarker(address, new BMap.Label(add, { offset: new BMap.Size(20, -10) }));
        }
    }, "成都市");
}
// 编写自定义函数,创建标注
function addMarker(point, label) {
    //使用自定义图标做标注点，宽高为8 10
    var myIcon = new BMap.Icon("marker_red_sprite2.png", new BMap.Size(8, 10));
    var marker = new BMap.Marker(point, { icon: myIcon });
    map.addOverlay(marker);
    marker.setLabel(label);
    label.setStyle({
        display: "none"
    })
    marker.addEventListener("mouseover", function (e) {
        var label = this.getLabel();
        //设置label的样式，这里没有过多要求，能显示出来就行
        label.setStyle({
            display: "block",
            borderRadius: "2px",
            border: "1px solid #5185E6",
            padding: "2px 4px"
        })
    });
    marker.addEventListener("mouseout", function (e) {
        var label = this.getLabel();
        label.setStyle({
            display: "none"
        })
    });
}
bdGEO();

