// ������ͼʵ��
var map = new BMap.Map("myMap", { enableMapClick: false });
//���Ĵ�ʡΪ��ͼ���ģ���ʾ�㼶Ϊ13
map.centerAndZoom("�Ĵ�ʡ", 13);
//�������������ŵ�ͼ
map.enableScrollWheelZoom(true);
setTimeout(function () {
    map.enableDragging(); //���������ק
}, 2000);
var index = 0;
var myGeo = new BMap.Geocoder();
//��Ҫ����������ʾ�ĵ�ַ
var adds = [
    "�����",
    "������",
    "������",
    "�׼ҹ�",
    "������",
    "����",
    "�Ϻ�ʪ�ع�԰"
];
var blist = [];
var districtLoading = 0;

function getBoundary() {
    //����ָ����ʾ����˫������Ȫ��
    addDistrict("�ɶ���˫����");
    addDistrict("�ɶ�����Ȫ����");
}

function addDistrict(districtName) {
    //ʹ�ü����������Ƽ��ع���
    districtLoading++;
    var bdary = new BMap.Boundary();
    bdary.get(districtName, function (rs) { //��ȡ��������
        var count = rs.boundaries.length; //��������ĵ��ж��ٸ�
        if (count === 0) {
            alert('δ�ܻ�ȡ��ǰ������������');
            return;
        }
        for (var i = 0; i < count; i++) {
            blist.push({ points: rs.boundaries[i], name: districtName });
        };
        //������������������-1
        districtLoading--;
        if (districtLoading == 0) {
            //ȫ������ɺ󻭶˵�
            drawBoundary();
        }
    });
}

function drawBoundary() {
    //������������ĵ�����
    var pointArray = [];

    /*���ڱβ����ط���
     *˼·: �������й���ͼ���⻭һȦ��Ȧס���������е��й�������Ȼ���ٽ�ÿ���պ�����ϲ���������ȫ�����������ǡ�
     *      ������������һ��������������ǵıպ϶����*/
    //�����й����������˵㣬��Ϊ��һ��
    var pNW = { lat: 59.0, lng: 73.0 }
    var pNE = { lat: 59.0, lng: 136.0 }
    var pSE = { lat: 3.0, lng: 136.0 }
    var pSW = { lat: 3.0, lng: 73.0 }
    //�����������һ�αպ϶���Σ������������ټ�һ����Ϊ֮�󻭱պ���������
    var pArray = [];
    pArray.push(pNW);
    pArray.push(pSW);
    pArray.push(pSE);
    pArray.push(pNE);
    pArray.push(pNW);
    //ѭ����Ӹ��պ�����
    for (var i = 0; i < blist.length; i++) {
        //�����ʾ�ñ�ǩ��
        var label = new BMap.Label(blist[i].name, { offset: new BMap.Size(20, -10) });
        label.hide();
        map.addOverlay(label);

        //��Ӷ���β㲢��ʾ
        var ply = new BMap.Polygon(blist[i].points, { strokeWeight: 2, strokeColor: "#5185E6", fillOpacity: 0.01, lColor: " #FFFFFF" }); //��������θ�����
        ply.name = blist[i].name;
        ply.label = label;
        map.addOverlay(ply);

        //�������ӵ���Ұ��Χ��
        var path = ply.getPath();
        pointArray = pointArray.concat(path);
        //���պ�����ӵ��ڱβ��ϣ�ÿ��������Ҫ�ټ�һ����������Ϊ�´���ӵ��������һ�ε��յ�
        pArray = pArray.concat(path);
        pArray.push(pArray[0]);
    }

    //�޶���ʾ������Ҫ����api��
    var boundply = new BMap.Polygon(pointArray);
    BMapLib.AreaRestriction.setBounds(map, boundply.getBounds());
    map.setViewport(pointArray); //������Ұ 

    //����ڱβ�(������������ֲ���ɫ)
    var plyall = new BMap.Polygon(pArray, { strokeOpacity: 0.0000001, strokeColor: "#fff", strokeWeight: 0.00001, lColor: "#ffffff", fillOpacity: 1 }); //��������θ�����
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
    }, "�ɶ���");
}
// ��д�Զ��庯��,������ע
function addMarker(point, label) {
    //ʹ���Զ���ͼ������ע�㣬���Ϊ8 10
    var myIcon = new BMap.Icon("marker_red_sprite2.png", new BMap.Size(8, 10));
    var marker = new BMap.Marker(point, { icon: myIcon });
    map.addOverlay(marker);
    marker.setLabel(label);
    label.setStyle({
        display: "none"
    })
    marker.addEventListener("mouseover", function (e) {
        var label = this.getLabel();
        //����label����ʽ������û�й���Ҫ������ʾ��������
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

