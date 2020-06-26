<template>
    <div class="chinaMap">
        <div ref="chart" :style="{height:'840px',width:'100%'}"></div>
    </div>
</template>

<script>
    import '../../node_modules/echarts/map/js/china.js'
    import {loadAreaData} from "@/api/api";
    export default {
        name: "Visualization",
        data(){
            return{
                myChart: null,
                country:['中国','美国','英国','巴西','俄罗斯','印度','伊朗','秘鲁','意大利','西班牙','智利'],
                data:[], // 总数据
                timelineData:[], // 时间轴
                options:[], // 每个系列的数据
                barYs:[], // 条形图纵轴是国名
                barY:[], // 条形图纵轴是国名
                line1:[],
                line2:[],
                line3:[]
            }
        },
        mounted(){
            this.myChart = this.$echarts.init(this.$refs.chart);
            if (sessionStorage.getItem("data") == null){
                // [this.options, this.timelineData] = this.getData();
                this.getData();
            }else{
                // this.options = JSON.parse(sessionStorage['options']);
                // this.timelineData = JSON.parse(sessionStorage['timelineData']);
                this.data = JSON.parse(sessionStorage['data']);
                this.parseData();

            }
        },
        methods:{
            getData(){
                loadAreaData().then(res=>{
                    this.data = res;
                    sessionStorage['data'] = JSON.stringify(res)
                    this.parseData();
                });
            },

            parseData(){
                this.myChart.on('timelinechanged', (params) => {
                    // console.log(params.currentIndex)
                    console.log(this.barYs)
                    this.barY = this.barYs[params.currentIndex];
                    // console.log(this.barY)
                    this.myChart.setOption({
                        yAxis:{
                            id:0,
                            data: this.barY,
                        }
                    });
                });
                var options = []
                var timelineData = []
                for (var i in this.data){ // 每个i对应一个时间节点
                    var option = { // 每个时间节点对应一个option
                        series: [
                            {name:"",data:null}, // 地图系列 --- 国内确诊
                            {name:"",data:null}, // 条形图系列 --- 世界确诊
                            {name:"",data:null}, // 折线图系列 --- 国内确诊
                            {name:"",data:null}, // 折线图系列 --- 国内治愈
                            {name:"",data:null}, // 折线图系列 --- 国内死亡
                            {name:"",data:null}, // 玫瑰图系列 --- 湖北对比非湖北
                        ]
                    }

                    var time = this.data[i][0].updateTime; //时间节点数值
                    if (time.split('-')[2]==='01'){ //月节点
                        var month ={
                            value: time,
                            symbol:'diamond',
                            symbolSize: 16
                        }
                        timelineData.push(month);
                    }else{ // 普通日节点
                        timelineData.push(time);
                    }

                    option.series[0].name = time+"确诊情况";
                    option.series[0].data = this.convertData1(this.data[i]);

                    option.series[1].name = time+"世界主要国家确诊情况";
                    option.series[1].data = this.convertData2(this.data[i]);

                    option.series[2].name = time+"国内确诊情况趋势";
                    option.series[2].data = this.convertData3(this.data[i]);
                    option.series[3].name = time+"国内治愈情况趋势";
                    option.series[3].data = this.convertData4(this.data[i]);
                    option.series[4].name = time+"国内死亡情况趋势";
                    option.series[4].data = this.convertData5(this.data[i]);

                    option.series[5].name = time+"湖北与非湖北确诊对比";
                    option.series[5].data = this.convertData6(this.data[i]);

                    options.push(option)
                }
                this.options = options;
                this.timelineData = timelineData;
                this.drawMap();
            },

            convertData1(dateData){ //从当日数据筛选出地图需要的数据
                var convertData = dateData.map(item=>{
                    return{
                        name: item.provinceName,
                        value: item.provinceConfirmedCount
                    }
                });
                return convertData.filter(item=>{
                    return ! this.country.concat('非湖北').includes(item.name);
                });
            },

            convertData2(dateData){ //从当日数据筛选出条形图需要的数据
                var convertData = dateData.map(item=>{
                    return{
                        name: item.provinceName,
                        value: item.provinceConfirmedCount
                    }
                });
                convertData = convertData.filter(item=>{
                    return this.country.includes(item.name);
                }).sort((a,b)=>{
                    return b.value-a.value;
                });
                var barY = []
                convertData.forEach(item=>{
                    barY.push(item.name);
                });
                this.barYs.push(barY);
                return convertData
            },

            convertData3(dateData){ //从当日数据筛选出折线图1需要的数据 --- 确诊
                var convertData = dateData.map(item=>{
                    return{
                        name: item.provinceName,
                        value: item.provinceConfirmedCount
                    }
                });
                this.line1 = this.line1.concat(convertData.filter(item=>{
                    return ['中国'].includes(item.name);
                }));
                return this.line1
            },

            convertData4(dateData){ //从当日数据筛选出折线图2需要的数据 --- 治愈
                var convertData = dateData.map(item=>{
                    return{
                        name: item.provinceName,
                        value: item.provinceCuredCount
                    }
                });
                this.line2 = this.line2.concat(convertData.filter(item=>{
                    return ['中国'].includes(item.name);
                }));
                return this.line2
            },

            convertData5(dateData){ //从当日数据筛选出折线图3需要的数据 --- 死亡
                var convertData = dateData.map(item=>{
                    return{
                        name: item.provinceName,
                        value: item.provinceDeadCount
                    }
                });
                this.line3 = this.line3.concat(convertData.filter(item=>{
                    return ['中国'].includes(item.name);
                }));
                return this.line3
            },

            convertData6(dateData){ //从当日数据筛选出玫瑰图需要的数据
                var convertData = dateData.map(item=>{
                    return{
                        name: item.provinceName,
                        value: item.provinceConfirmedCount
                    }
                });
                return convertData.filter(item=>{
                    return ['湖北','非湖北'].includes(item.name);
                });
            },

            drawMap(){
                // 基于准备好的dom，初始化echarts实例
                // 绘制图表
                this.myChart.setOption({ // 进行相关配置
                    baseOption:{
                        timeline: { // 时间轴
                            axisType: 'category',
                            autoPlay: false,
                            data: this.timelineData,
                            playInterval: 1000,
                            label: {
                                formatter : function(s) {
                                    return (new Date(s)).getMonth()+1+"-"+(new Date(s)).getDate();
                                }
                            },
                            left:0,
                            right:0,
                            bottom:0
                        },
                        title: [
                            {
                                text: '新冠肺炎疫情（截止至6月23日）',
                                left:600,
                                top:0
                            },
                            {
                                text: '国内确诊情况',
                                left:660,
                                top:150
                            },
                            {
                                text: '世界确诊情况',
                                left:200,
                                top:60
                            },
                            {
                                text: '湖北与非湖北对比',
                                left:150,
                                top:480
                            },
                            {
                                text: '国内确诊趋势',
                                right:160,
                                top:430
                            },
                            {
                                text: '国内治愈与死亡趋势',
                                right:150,
                                top:60
                            }
                        ],
                        tooltip:{}, // 全局的弹窗
                        visualMap: { // 视觉通道
                            type: 'piecewise',
                            show: true,
                            pieces:[
                                {min:0, max:99, label: '确诊人数<100'},
                                {min:100, max:499, label: '100≤确诊人数<500'},
                                {min:500, max:999, label: '500≤确诊人数<1000'},
                                {min:1000, max:1999, label: '1000≤确诊人数<2000'},
                                {min:2000, max:4999, label: '2000≤确诊人数<5000'},
                                {min:5000, max:9999, label: '5000≤确诊人数<10000'},
                                {min:10000, max:19999, label: '10000≤确诊人数<20000'},
                                {min:20000, max:49999, label: '20000≤确诊人数<50000'},
                                {min:50000, label: '确诊人数≥50000'}
                            ],
                            inRange: {
                                color: ['#e5ab00', '#ffa170','#ff781e', '#ff7800',
                                    '#ff9600', '#ff5a00','#ff0000', '#c70d00',
                                    '#970000']
                            },
                            realtime: false,
                            calculable: true,
                            left:600,
                            bottom:100
                        },
                        grid:[
                            {x: '5%', y: '12%', width: '28%', height: '35%'},
                            {x2: '1%', y2: '10%', width: '30%', height: '35%'},
                            {x2: '1%', y: '12%', width: '30%', height: '35%'},
                        ],
                        xAxis: [
                            {   // 条形
                                gridIndex:0,
                                type: 'value'
                            },
                            {   // 折线
                                gridIndex:1,
                                type: 'category',
                                data: this.timelineData
                            },
                            {   // 折线
                                gridIndex:2,
                                type: 'category',
                                data: this.timelineData
                            }
                        ],
                        yAxis:[
                            {   // 条形
                                id:0,
                                gridIndex:0,
                                type: 'category',
                                data: ['中国','巴西','伊朗','意大利','西班牙','印度','智利','美国','英国','秘鲁','俄罗斯']
                            },
                            {   // 折线
                                gridIndex:1,
                                type: 'value'
                            },
                            {   // 折线
                                gridIndex:2,
                                type: 'value'
                            }
                        ],
                        geo: { // 这个是重点配置区
                            map: 'china', // 表示中国地图
                            roam: false,
                            label: {
                                normal: {
                                    show: true, // 是否显示对应地名
                                    textStyle: {
                                        color: 'rgba(0,0,0,0.4)'
                                    }
                                }
                            },
                            itemStyle: {
                                normal: { // 地图背景色、边框色
                                    areaColor: '#465471',
                                    borderColor: '#282F3C'
                                },
                                emphasis: { // 地图高亮样式
                                    areaColor: '#8796B4',
                                    shadowOffsetX: 0,
                                    shadowOffsetY: 0,
                                    shadowBlur: 20,
                                    borderWidth: 0,
                                    shadowColor: 'rgba(0, 0, 0, 0.5)'
                                }
                            },
                            top:0,
                            zoom: 0.5
                        },
                        series: [ // 系列列表
                            { // 地图
                                name: '国内疫情',
                                type: 'map',
                                geoIndex: 0,
                                tooltip: { // 鼠标移到图里面的浮动提示框
                                    trigger: 'item',
                                    formatter: '{b}<br/>累积确诊人数：{c}'
                                },
                            },
                            { // 条形图
                                name: '世界疫情',
                                type: 'bar',
                                tooltip: { // 鼠标移到图里面的浮动提示框
                                    trigger: 'item',
                                    formatter: '{b}<br/>累积确诊人数：{c}'
                                },
                                xAxisIndex: 0,
                                yAxisIndex: 0,
                            },
                            { // 折线图
                                name: '国内确诊趋势',
                                type: 'line',
                                tooltip: { // 鼠标移到图里面的浮动提示框
                                    show:true,
                                    trigger: 'axis',
                                    axisPointer: {
                                        type: 'cross',
                                        crossStyle: {
                                            color: '#999'
                                        }
                                    },
                                    formatter: '{b}<br/>累积确诊人数：{c}'
                                },
                                xAxisIndex: 1,
                                yAxisIndex: 1,
                            },
                            { // 折线图
                                name: '国内治愈趋势',
                                type: 'line',
                                tooltip: { // 鼠标移到图里面的浮动提示框
                                    show:true,
                                    trigger: 'axis',
                                    axisPointer: {
                                        type: 'cross',
                                        crossStyle: {
                                            color: '#999'
                                        }
                                    },
                                    formatter: '{b}<br/>累积治愈人数：{c}'
                                },
                                xAxisIndex: 2,
                                yAxisIndex: 2,
                            },
                            { // 折线图
                                name: '国内死亡趋势',
                                type: 'line',
                                tooltip: { // 鼠标移到图里面的浮动提示框
                                    show:true,
                                    trigger: 'axis',
                                    axisPointer: {
                                        type: 'cross',
                                        crossStyle: {
                                            color: '#999'
                                        }
                                    },
                                    formatter: '{b}<br/>累积死亡人数：{c}'
                                },

                                xAxisIndex: 2,
                                yAxisIndex: 2,
                            },
                            {   //玫瑰图
                                name: '湖北与非湖北对比',
                                type: 'pie',
                                center: ['15%', '75%'], // 中心坐标
                                roseType: 'radius', // 半径模式
                                radius: [30, 90], // 内外半径
                                tooltip: { // 鼠标移到图里面的浮动提示框
                                    trigger: 'item',
                                    formatter: '{b}<br/>累积确诊人数：{c}'
                                },
                            }
                        ]
                    },
                    options: this.options
                });
            },
        }
    }
</script>

<style scoped>
.chinaMap{
    display: flex;
    justify-content: center;
}
</style>
