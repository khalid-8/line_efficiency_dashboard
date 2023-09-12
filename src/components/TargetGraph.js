import React, { useEffect, useState } from 'react';
import { ArcElement, Chart, Title, registerables } from 'chart.js';
import { Bar, Doughnut, Pie } from 'react-chartjs-2';
import "./styles/targetGraph.css"
import ChartDataLabels from 'chartjs-plugin-datalabels';
import Classify from "./issuesClassifications.json"

Chart.register(ArcElement, Title)
Chart.register(ArcElement, ChartDataLabels);
Chart.register(...registerables);

export default function TargetGraph({target, actual, eff, title, report}) {
    const [doughntColor, setDougntColor] = useState()

    const completedPresentage = isNaN((actual/target)*100 )? 0 : (actual/target)*100
    const gapPresentage = isNaN(100-((actual/target) * 100))? 100 : (100-((actual/target) * 100) < 0? 0 : 100-((actual/target) * 100))


    useEffect(() => {
        if (!eff || eff === "NaN") return

        const presentage = eff.replace("%", "")
        let color
        if (parseInt(presentage) > 99) color = "green"
        else if (parseInt(presentage) > 74) color = "blue"
        else if (parseInt(presentage) > 45) color = "orange"
        else color = "red"

        setDougntColor(color)
    }, [eff])


    const labels = [
        'Actual',
        'Target',
    ]
    const data = {
        labels: labels,
        datasets: [{
            data: [completedPresentage, gapPresentage],
            backgroundColor: [
                doughntColor,
                'rgba(101, 100, 100, 0.143)'
            ],
            hoverOffset: 4,
            count: 2,
        }],
    };

    const centerText = {
        id: "centerText",
        beforeDraw(chart, args, pluginOptions){
            const {ctx, data} = chart

            ctx.save()
            
            // console.log(chart.getDatasetMeta(0))
            // console.log(data)
            ctx.font = 'bolder calc(13px + .5vw) sans-serif';
            ctx.fillStyle = chart.getDatasetMeta(0).data[0].options.backgroundColor;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(`${parseFloat(data.datasets[0].data[0]).toFixed(1)}%`, chart.getDatasetMeta(0).data[0].x, chart.getDatasetMeta(0).data[0].y)//chartArea.height/2, chartArea.width/2)
            ctx.restore();
        }
    }

    const options = {
        // legend: {
        //     display: true,
        //     position: "top"
        // },
        elements: {
            arc: {
                borderWidth: 0
            }
        },
        plugins: {
            title: {
                display: true,
                text: `${title}`,
                align: "center",
                padding: {
                    top: 10,
                    bottom: 10,
                },
                font: {
                    size: report ? 15 : 15,
                }
            },
            datalabels: {
                color: 'black',
                formatter: function(value) {
                    return value === completedPresentage? actual : target
                },
                labels: {
                    value0: {
                        font: {
                            weight: 'bold',
                            size: "12vw"
                        },
                        
                    },
                    value1: {
                        
                        font: {
                            weight: 'bold',
                            size: "12vw"
                        }
                    }
                }
            },
            legend: {
                display: false,
                maxWidth: 59
            },
        },
        cutout: '70%',
        responsive: true,
        maintainAspectRatio: false,
    } 

    if (report) options["events"] = []
    return (
        <Doughnut data={data} options={options} plugins={[centerText]}/>
    );
}

export function IssuesGraphCause({lines, cause}) {
    const [selectedItem, setSelectedItem] = useState()
    const [others, setOthers] = useState()
    const [causeItem, setCauseItem] = useState()

    useEffect(() => {
        const getIssuesTotal = async() => {
            if (!Array.isArray(lines) || lines.length < 1) return
            let selected = 0, other = 0
            lines.forEach((item) => {
                if (!Array.isArray(item.remarks) || item.remarks < 1) return
                item.remarks.forEach((remarksList) => {
                    // console.log(remarksList)
                    if (remarksList.length < 1) return
                    if (remarksList.data){
                        remarksList.data.forEach((remark) => {
                            // if (!remark?.cause) return
                            if (cause === remark?.cause ) return selected += 1
                        })
                    }
                    other += remarksList?.others.length ?? 0
                })
            })
        
            setSelectedItem(selected)
            setOthers(other)
        }

        getIssuesTotal()

        const item = Classify.issues.find((item) => item.id === cause)

        setCauseItem(item)
    }, [lines, cause])


    const labels = [
        `${causeItem?.cause}`,
        'The rest',
    ]
    const data = {
        labels: labels,
        datasets: [{
            data: [selectedItem, others],
            backgroundColor: [
                `${causeItem?.bg?.replace("0.2", "1")}`,
                'rgba(220,220,220, 0.7)'
            ],
        }],
    };


    const options = {
        plugins: {
            title: {
                display: true,
                color: "black",
                text: `${causeItem?.cause} Delays Proportion`.replace("Delay ", " "),
                align: "center",
                padding: {
                    top: 10,
                    bottom: 5,
                },
                font: {
                    size: 25,
                },
            },
            datalabels: {
                color: 'black',
                // formatter: function(value) {
                //     return value === completedPresentage? actual : target
                // },
                labels: {
                    value0: {
                        font: {
                            weight: 'bold'
                        },
                        
                    },
                    value1: {
                        
                        font: {
                            weight: 'bold'
                        }
                    }
                }
            },
        },
        responsive: true,
        maintainAspectRatio: false,
    } 

    return (
        <Pie data={data} options={options} />
    );
}

export function IssuesGraph({lines}){
    const [issues, setIssues] = useState()

    useEffect(() => {
        const getIssuesTotal = async() => {
            if (!Array.isArray(lines) || lines.length < 1) return
            let material = 0, manpower = 0, equipment = 0, method = 0, other= 0, pcomment= 0
            lines.forEach((item) => {
                // console.log(item)
                if (!Array.isArray(item.remarks) || item.remarks < 1) return
                
                item.remarks.forEach((remarksList) => {
                    if (remarksList.length < 1) return
                    if (remarksList.data){
                        remarksList.data.forEach((remark) => {
                            // if (!remark?.cause) return
                            switch(remark.cause){
                                case "material":
                                    material += 1
                                    break;
                                case "manpower":
                                    manpower += 1
                                    break;
                                case "equipment":
                                    equipment += 1
                                    break;
                                case "method":
                                    method += 1
                                    break;
                                case "prodcomment":
                                    pcomment += 1
                                    break;
                                default:
                                    other += 1
                                    break;
                            }
                        })
                    }
                    
                    // if (!remarksList?.cause) return
                    //     switch(remarksList.cause){
                    //         case "material":
                    //             material += 1
                    //             break;
                    //         case "manpower":
                    //             manpower += 1
                    //             break;
                    //         case "equipment":
                    //             equipment += 1
                    //             break;
                    //         case "method":
                    //             method += 1
                    //             break;
                    //         default:
                    //             other += 1
                    //             break;
                    //     }
                })
            })
        
            setIssues({
                "material": material, "manpower": manpower, 
                "equipment": equipment, "method": method, "other": other, "production": pcomment
            })
            
            // console.log(`"material": ${material}, "manpower": ${manpower}, "equipment": ${equipment}`)
        }

        getIssuesTotal()

    }, [lines])

    const data = {
        labels: [ 'Delays'],
        datasets: [
            {
                label: "Material Delay",
                data: [issues?.material],
                backgroundColor: 'rgba(255, 205, 86, 0.2)',
                borderColor: 'rgb(255, 205, 86)',
                borderWidth: 1
            },
            {
                label: "Man-Power-Related Delay",
                data: [issues?.manpower],
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                borderColor: 'rgb(75, 192, 192)',
                borderWidth: 1
            },
            {
                label: "Equipment Breakdown",
                data: [issues?.equipment],
                backgroundColor: 'rgba(54, 162, 235, 0.2)',
                borderColor: 'rgb(54, 162, 235)',
                borderWidth: 1
            },
            {
                label: "Method (Procedures prior and during assembly)",
                data: [issues?.method],
                backgroundColor: 'rgba(153, 102, 255, 0.2)',
                borderColor: 'rgb(153, 102, 255)',
                borderWidth: 1
            },
            {
                label: "Other",
                data: [issues?.other],
                backgroundColor: 'rgba(201, 203, 207, 0.2)',
                borderColor: 'rgb(201, 203, 207)',
                borderWidth: 1
            },
            {
                label: "Production Comment",
                data: [issues?.production],
                backgroundColor: 'rgba(229, 58, 66, 0.2)',
                borderColor: 'rgb(229, 58, 66)',
                borderWidth: 1
            },
        ]   
    }

    const options = {
        scales: {
            y: {
                ticks: {
                    precision: 0
                }
            }
        },
       
        plugins: {
            title: {
                display: true,
                color: "black",
                text: `Delay Causes`,
                align: "center",
                padding: {
                    top: 10,
                    bottom: 5,
                },
                font: {
                    size: 25,
                }
            },
            datalabels: {
                anchor: 'start',
                align: 'center',
                color: 'black',
                font: {
                    weight: 'bold',
                    size: 14,
                },
                labels: {
                    value0: {},
                    value1: {},
                    value2: {},
                    value3: {},
                    value4: {},
                }
            },
            legend: {
                display: true,
                maxWidth: 59,
                // labels: {
                //     font: {
                //         size: 10,
                //     },
                // }
            },
        },
        responsive: true,
        maintainAspectRatio: false
    } 
    return(
        <Bar data={data} options={options}/>
    )
}

// const [size, initSize] = React.useState();
// const onResize = () => {
//     const width = window.innerWidth;
//     const height = window.innerHeight;
//     initSize({
//         width: width,
//         height: height,
//     });
// };

// useEffect(() => {
//     window.addEventListener("resize", onResize);
//     return () => {
//     window.removeEventListener("resize", onResize);
//     };
// }, []);

// if (!target || target === "NaN" || !actual || target === "target" || !eff || eff === "NaN") return


//console.log(gapPresentage)
    // //console.log(eff)

    // //console.log(completedPresentage,gapPresentage)
    // Chart.register(
    //     {
    //         id: 'text',
    //         beforeDraw: function(chart, a, b) {
    //             var width = chart.width,
    //             height = chart.height,
    //             ctx = chart.ctx;

    //             ctx.restore();
    //             var fontSize = (height / 140).toFixed(2);
    //             ctx.font = fontSize + "em sans-serif";
    //             ctx.textBaseline = "middle";

    //             var text = eff,
    //             textX = Math.round((width - ctx.measureText(text).width) / 2),
    //             textY = height / 1.65;

    //             ctx.fillText(text, textX, textY);
    //             ctx.save();
    //         }
    // }
    // );