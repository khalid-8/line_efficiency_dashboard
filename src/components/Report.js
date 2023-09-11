import React, { useEffect, useRef, useState } from "react";
import { useTableContext } from "../context";
import linesInfo from "./linesInfo.json";
import { CALC } from "../helpers";
import TargetGraph, { IssuesGraph, IssuesGraphCause } from "./TargetGraph";
import "./styles/report.css";
import { Button, Table } from "react-bootstrap";
import { BsDownload } from "react-icons/bs";
import { IoIosArrowDropupCircle } from "react-icons/io";
import { AiOutlineArrowUp } from "react-icons/ai";
import { intervalToDuration } from "date-fns";
import { Notify } from "./Notification";

const getTrend = (eff) => {
    const presentage = eff?.replace("%", "");
    let color;
    if (parseInt(presentage) > 99) color = "green";
    else if (parseInt(presentage) > 74) color = "blue";
    else if (parseInt(presentage) > 45) color = "orange";
    else color = "red";

    return color;
};


export function getRemarkTag(cause, styling=null){
    const style = {
        width: "fit-content",
        padding: "0 5px",
        borderRadius: "5px",
        marginBottom: "0",
        marginTop: "5px",
        fontSize: "10px",
        whiteSpace: "nowrap",
        ...styling
    };

    let tag;
    switch (cause) {
        case "material":
            tag = (
                <span
                    style={{
                        background: "rgba(255, 205, 86, 0.2)",
                        border: "1px solid rgb(255, 205, 86)",
                        ...style,
                    }}>
                    Material Delay
                </span>
            );
            break;
        case "manpower":
            tag = (
                <span
                    style={{
                        background: "rgba(75, 192, 192, 0.2)",
                        border: "1px solid rgb(75, 192, 192)",
                        ...style,
                    }}>
                    Man-Power-Related Delay
                </span>
            );
            break;
        case "equipment":
            tag = (
                <span
                    style={{
                        background: "rgba(54, 162, 235, 0.2)",
                        border: "1px solid rgb(54, 162, 235)",
                        ...style,
                    }}>
                    Equipment Breakdown
                </span>
            );
            break;
        case "method":
            tag = (
                <span
                    style={{
                        background: "rgba(153, 102, 255, 0.2)",
                        border: "1px solid rgb(153, 102, 255)",
                        ...style,
                    }}>
                    Method
                </span>
            );
            break;
        case "other":
        case "others":
            tag = (
                <span
                    style={{
                        background: "rgba(201, 203, 207, 0.2)",
                        border: "1px solid rgb(201, 203, 207)",
                        ...style,
                    }}>
                    Other
                </span>
            );
            break;
        default:
            tag = (
                <span
                    style={{
                        background: "rgba(229, 58, 66, 0.2)",
                        border: "1px solid rgb(229, 58, 66)",
                        ...style,
                    }}>
                    Production Comment
                </span>
            );
            break;
    }

    return tag;
};

function Report({ timePeriod, show, line, cause, showSpinner }) {
    // const [timePeriod, setTimePeriod] = useState()
    const [issueDate, setIssueDate] = useState(new Date().toLocaleString());
    const reportRef = useRef();

    return (
        <div className="report_bg">
            <div style={{ display: "flex", columnGap: "15px", marginBottom: "10px" }}>
                <Button variant="danger" onClick={() => show(false)}>
                    Close
                </Button>
                <Button
                    variant="outline-warning"
                    onClick={async () => {
                        const reportPeriod = intervalToDuration({
                            start: new Date(timePeriod.startDate),
                            end: new Date(timePeriod.endDate)
                        })
                        console.log(reportPeriod)
                        if (reportPeriod.years > 0 || reportPeriod.months > 0) {
                            return Notify("Can't Print a Report due to exceeding 30 Days limit, please reduce the report's time period and try again!", true, null, "Time Period Limit")
                        }
                        // return console.log(timePeriod)
                        showSpinner(true);
                        setIssueDate(new Date().toLocaleString());
                        setTimeout(async () => {
                            await CALC.downloadPDF(
                                reportRef.current,
                                `Report_${timePeriod.startDate}${timePeriod?.endDate ? "_" + timePeriod?.endDate : ""}`
                            );
                            showSpinner(false);
                        }, 1500);
                    }}>
                    <BsDownload style={{ fontSize: "30px" }} />
                </Button>
            </div>

            {line !== "false" ? (
                <SpecificReport
                    reportRef={reportRef}
                    timePeriod={timePeriod}
                    line={line}
                    cause={cause}
                    issueDate={issueDate}
                />
            ) : (
                <GeneralReport reportRef={reportRef} timePeriod={timePeriod} cause={cause} issueDate={issueDate} />
            )}
        </div>
    );
}

function highligh(lineId) {
    const el = document.getElementById(lineId);
    
    if (el) {
        console.log(el)
        el.style.setProperty("background", "#0032c860" ,"important");
        //el.style.backgroundColor = "#0032c860";

        setTimeout(() => {
            el.style.removeProperty("background")
        }, 2500);
    }
}

function GeneralReport({ reportRef, timePeriod, cause, issueDate }) {
    const [linesData, setLinesData] = useState();
    const [overAll, setOverAll] = useState();

    const { data } = useTableContext();

    useEffect(() => {
        if (!data) return;
        const dataArr = [];
        console.log(timePeriod);
        linesInfo.lines.forEach((line) => {
            dataArr.push({
                ...CALC.getReportValues(data.get(line.id), timePeriod?.startDate, timePeriod?.endDate, cause),
                name: line.name,
            });
        });
        setLinesData(dataArr);
    }, [timePeriod, data, cause]);

    useEffect(() => {
        if (!linesData || linesData.length < 1) return;
        let totalTarget = 0;
        let TotalActual = 0;
        linesData.forEach((item) => {
            totalTarget += item?.target ? parseInt(item?.target) : 0; //overallTargetCalc(item, activeView)
            TotalActual += item?.actual ? parseInt(item?.actual) : 0;
        });

        const calcuate = CALC.calcValues(totalTarget, TotalActual);
        setOverAll({ target: totalTarget, actual: TotalActual, gap: calcuate[0], eff: calcuate[1] });
    }, [linesData]);

    return (
        <div className="report_body" ref={reportRef}>
            <span
                className="go_back_up hide_print"
                onClick={() => {
                    const el = document.querySelector(".report_body");
                    if (!el) return;
                    el.scrollTo({ top: 0, behavior: "smooth" });
                }}>
                <IoIosArrowDropupCircle />
            </span>
            <div className="report_header">
                <p className="report_issued_time">Issued on: {issueDate}</p>
                <img src={`${process.env.REACT_APP_HOSTING_SUBFOLDER}/imgs/Group_black2.png`} alt="report Logo" />
                <div className="report_title">
                    <b>Lines Efficiency Report</b>
                    <small>
                        Production for {timePeriod.startDate} {timePeriod?.endDate ? `- ${timePeriod?.endDate}` : ""}
                    </small>
                </div>
            </div>

            <div>
                {linesData && linesData.length > 6 && (
                    <>
                        <div className="graphs_row">
                            {linesData.slice(0, 3).map((item, i) => (
                                <span
                                    key={JSON.stringify(item)}
                                    className="report_line-eff"
                                    onClick={() => {
                                        document
                                            .getElementById(`table_${item?.lineId}`)
                                            ?.scrollIntoView({ behavior: "smooth", block: "center", inline: "center" });
                                        highligh(`table_${item?.lineId}`);
                                    }}>
                                    <TargetGraph
                                        target={item?.target}
                                        actual={item?.actual}
                                        eff={item?.eff}
                                        title={`${item?.name?.replace("LINE -", "")}`}
                                        report={true}
                                    />
                                </span>
                            ))}
                        </div>

                        <div className="graphs_row">
                            <span
                                className="report_line-eff"
                                onClick={() => {
                                    document
                                        .getElementById(`table_line4`)
                                        ?.scrollIntoView({ behavior: "smooth", block: "center", inline: "center" });
                                    highligh(`table_line4`);
                                }}>
                                <TargetGraph
                                    target={linesData[3]?.target}
                                    actual={linesData[3]?.actual}
                                    eff={linesData[3]?.eff}
                                    title={`${linesData[3]?.name?.replace("LINE -", "")}`}
                                    report={true}
                                />
                            </span>
                            <span className="report_overall-eff report_line-eff">
                                <TargetGraph
                                    target={overAll?.target}
                                    actual={overAll?.actual}
                                    eff={overAll?.eff}
                                    title={`Overall efficiency`}
                                    report={true}
                                />
                            </span>
                            <span
                                className="report_line-eff"
                                onClick={() => {
                                    document
                                        .getElementById(`table_line5`)
                                        ?.scrollIntoView({ behavior: "smooth", block: "center", inline: "center" });
                                    highligh(`table_line5`);
                                }}>
                                <TargetGraph
                                    target={linesData[4]?.target}
                                    actual={linesData[4]?.actual}
                                    eff={linesData[4]?.eff}
                                    title={`${linesData[4]?.name?.replace("LINE -", "")}`}
                                    report={true}
                                />
                            </span>
                        </div>

                        <div className="graphs_row">
                            {linesData.slice(5, linesData.length).map((item, i) => (
                                <span
                                    key={JSON.stringify(item)}
                                    className="report_line-eff"
                                    onClick={() => {
                                        document
                                            .getElementById(`table_${item?.lineId}`)
                                            ?.scrollIntoView({ behavior: "smooth", block: "center", inline: "center" });
                                        highligh(`table_${item?.lineId}`);
                                    }}>
                                    <TargetGraph
                                        target={item?.target}
                                        actual={item?.actual}
                                        eff={item?.eff}
                                        title={`${item?.name?.replace("LINE -", "")}`}
                                        report={true}
                                    />
                                </span>
                            ))}
                        </div>
                    </>
                )}
            </div>

            <div className="report_tables">
                {linesData && linesData.length > 6 && (
                    <>
                        {linesData.map((item, i) => (
                            <>
                                <b>{item.name}</b>
                                {console.log(item)}
                                <Table
                                    responsive
                                    striped
                                    bordered
                                    hover
                                    className="main_info_table"
                                    id={`table_${item?.lineId === "line3"? "line5" : (item?.lineId === "line5"? "line3" : item?.lineId)}`}>
                                    <thead>
                                        <tr>
                                            <th>Line Target</th>
                                            <th>Actual Production</th>
                                            <th>Gap</th>
                                            <th>Trend</th>
                                            <th>Efficiency</th>
                                            <th>Absentees</th>
                                            <th>Total Shift Hrs</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            <td>{item?.target}</td>
                                            <td>{item?.actual}</td>
                                            <td>{item?.gap}</td>
                                            <td>
                                                <img
                                                    src={`${process.env.REACT_APP_HOSTING_SUBFOLDER}/imgs/${getTrend(
                                                        item?.eff
                                                    )}_arrow.png`}
                                                    style={{ width: "15px" }}
                                                    alt="trend direction"
                                                />
                                            </td>
                                            <td>{item?.eff}</td>
                                            <td>{item?.manpower?.abs ? item?.manpower?.abs : item?.abs}</td>
                                            <td>{item?.totalHrs}</td>
                                        </tr>
                                    </tbody>
                                </Table>
                                {item.remarks && item.remarks.length > 0 && item?.remarks && item?.remarks?.show && (
                                    <p
                                        className="hide_print"
                                        style={{ cursor: "pointer", color: "blue" }}
                                        onClick={() => {
                                            console.log(`remarks_${item?.lineId}`);
                                            document.getElementById(`remarks_${item?.lineId}`).scrollIntoView({
                                                behavior: "smooth",
                                                block: "start",
                                                inline: "center",
                                            });
                                            highligh(`remarks_${item?.lineId}`);
                                        }}>
                                        Remarks
                                    </p>
                                )}
                            </>
                        ))}
                        <b>Overall</b>
                        <Table responsive striped bordered hover className="main_info_table">
                            <thead>
                                <tr>
                                    <th>Line Target</th>
                                    <th>Actual Production</th>
                                    <th>Gap</th>
                                    <th>Trend</th>
                                    <th>Efficiency</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>{overAll?.target}</td>
                                    <td>{overAll?.actual}</td>
                                    <td>{overAll?.gap}</td>
                                    <td>
                                        <img
                                            src={`${process.env.REACT_APP_HOSTING_SUBFOLDER}/imgs/${getTrend(
                                                overAll?.eff
                                            )}_arrow.png`}
                                            style={{ width: "15px" }}
                                            alt="trend direction"
                                        />
                                    </td>
                                    <td>{overAll?.eff}</td>
                                </tr>
                            </tbody>
                        </Table>
                    </>
                )}
            </div>

            <div className="report_issues_graph">
                {cause !== "false" ? (
                    <IssuesGraphCause lines={linesData} cause={cause} />
                ) : (
                    <IssuesGraph lines={linesData} />
                )}
            </div>

            <ShowReportRemarks linesData={linesData} />
        </div>
    );
}

function SpecificReport({ reportRef, timePeriod, line, cause, issueDate }) {
    const [linesData, setLinesData] = useState();

    const { data } = useTableContext();

    useEffect(() => {
        if (!data) return;
        const dataArr = [];
        console.log(line);
        const lineData = linesInfo.lines.find((item) => item.id === line);
        if (!lineData) return;
        dataArr.push({
            ...CALC.getReportValues(data.get(line), timePeriod?.startDate, timePeriod?.endDate, cause),
            name: lineData.name,
        });

        setLinesData(dataArr);
    }, [timePeriod, data, line, cause]);

    // useEffect(() => {
    //     if (!Array.isArray(linesData) || linesData?.length < 1) return
    //     remarks = linesData.map((item) => {
    //         console.log(item)
    //         console.log("HERE1")
    //         if (!Array.isArray(item.remarks) || item.remarks < 1) return
    //         item.remarks.map((remarksList) => {
    //             if (remarksList.length < 1) return
    //             console.log(remarksList)
    //             console.log("HERE2")
    //             remarksList?.items?.map((remark) => {
    //                 console.log(remark)
    //                 if (!remark?.cause) return
    //                 console.log("Added")
    //                 return <p>{remark?.text}</p>
    //             })
    //         })
    //     })

    //     console.log(remarks)
    // }, [linesData])

    return (
        <div className="report_body" ref={reportRef}>
            <span
                className="go_back_up hide_print"
                onClick={() => {
                    const el = document.querySelector(".report_body");
                    if (!el) return;
                    el.scrollTo({ top: 0, behavior: "smooth" });
                }}>
                <IoIosArrowDropupCircle />
            </span>
            <div className="report_header">
                <p className="report_issued_time">Issued on: {issueDate}</p>
                <img src={`${process.env.REACT_APP_HOSTING_SUBFOLDER}/imgs/Group_black2.png`} alt="report Logo" />

                <div className="report_title">
                    <b>Lines Efficiency Report</b>
                    <small>
                        Production for {timePeriod.startDate} {timePeriod?.endDate ? `- ${timePeriod?.endDate}` : ""}
                    </small>
                </div>
            </div>

            <div>
                {linesData && linesData.length > 0 && (
                    <>
                        <div className="graphs_row">
                            {linesData.map((item, i) => (
                                <span key={JSON.stringify(item)} className="report_line-eff">
                                    <TargetGraph
                                        target={item?.target}
                                        actual={item?.actual}
                                        eff={item?.eff}
                                        title={`${item?.name?.replace("LINE -", "")}`}
                                        report={true}
                                    />
                                </span>
                            ))}
                        </div>
                    </>
                )}
            </div>

            <div className="report_tables">
                {linesData && linesData.length > 0 && (
                    <>
                        {linesData.map((item, i) => (
                            <>
                                <b>{item.name}</b>
                                {console.log(item) }
                                <Table
                                    responsive
                                    striped
                                    bordered
                                    hover
                                    className="main_info_table"
                                    id={`table_${item?.lineId}`}>
                                    <thead>
                                        <tr>
                                            <th>Line Target</th>
                                            <th>Actual Production</th>
                                            <th>Gap</th>
                                            <th>Trend</th>
                                            <th>Efficiency</th>
                                            <th>Absentees</th>
                                            <th>Total Shift Hrs</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            <td>{item?.target}</td>
                                            <td>{item?.actual}</td>
                                            <td>{item?.gap}</td>
                                            <td>
                                                <img
                                                    src={`${process.env.REACT_APP_HOSTING_SUBFOLDER}/imgs/${getTrend(
                                                        item?.eff
                                                    )}_arrow.png`}
                                                    style={{ width: "15px" }}
                                                    alt="trend direction"
                                                />
                                            </td>
                                            <td>{item?.eff}</td>
                                            <td>{item?.manpower?.abs ? item?.manpower?.abs : item?.abs}</td>
                                            <td>{item?.totalHrs}</td>
                                        </tr>
                                    </tbody>
                                </Table>
                                {item?.remarks && item?.remarks?.show && (
                                    <p
                                        className="hide_print"
                                        style={{ cursor: "pointer", color: "blue" }}
                                        onClick={() => {
                                            console.log(`remarks_${item?.lineId}`);
                                            document.getElementById(`remarks_${item?.lineId}`).scrollIntoView({
                                                behavior: "smooth",
                                                block: "start",
                                                inline: "center",
                                            });
                                        }}>
                                        Remarks
                                    </p>
                                )}
                            </>
                        ))}
                    </>
                )}
            </div>

            <div className="report_issues_graph mb-2">
                {cause ? <IssuesGraphCause lines={linesData} cause={cause} /> : <IssuesGraph lines={linesData} />}
            </div>

            <ShowReportRemarks linesData={linesData} />
        </div>
    );
}

function ShowReportRemarks({ linesData }) {
    console.log(linesData);
    const convertHours = (time) => {
        if (!time) return time;
        if (time?.split(":")[0] > 11)
            return `${parseInt(time?.split(":")[0]) === 12 ? 12 : parseInt(time?.split(":")[0]) - 12}:${
                time?.split(":")[1]
            }PM`;
        return `${time?.split(":")[0] === "00" ? "12:" + time?.split(":")[1] : time}AM`;
    };

    return (
        <div className="mt-4 mb-2">
            <h4 style={{ color: "red", textAlign: "center" }}>Remarks:</h4>
            {Array.isArray(linesData) &&
                linesData?.length > 0 &&
                linesData.map((item) => {
                    return (
                        <div style={{ position: "relative" }} key={JSON.stringify(item)}>
                            {Array.isArray(item?.remarks) && item?.remarks.length > 0 && item?.remarks?.show && (
                                <div>
                                    <h4 id={`remarks_${item?.lineId}`} className="mt-4 text-center">
                                        {item?.name}
                                    </h4>
                                    <span
                                        className="hide_print"
                                        style={{
                                            position: "absolute",
                                            right: "10px",
                                            top: "3px",
                                            fontSize: "12px",
                                            cursor: "pointer",
                                            color: "blue",
                                            display: "flex",
                                            flexDirection: "column",
                                            alignItems: "center",
                                        }}
                                        onClick={() => {
                                            document.getElementById(`table_${item?.lineId}`)?.scrollIntoView({
                                                behavior: "smooth",
                                                block: "center",
                                                inline: "center",
                                            });
                                            highligh(`table_${item?.lineId}`);
                                        }}>
                                        <AiOutlineArrowUp style={{ fontSize: "20px" }} />
                                        Go to the Table
                                    </span>
                                </div>
                            )}
                            {item?.remarks?.length > 0 &&
                                item.remarks?.map((remarksList) => {
                                    return (
                                        <>
                                            {remarksList?.data?.length > 0 && (
                                                <div
                                                    className="report_remarks_text"
                                                    style={{ textAlign: "left" }}
                                                    key={JSON.stringify(remarksList)}>
                                                    <b style={{ textAlign: "left", marginBottom: "10px" }}>{`${new Date(
                                                        remarksList.timestamp ?? item.timestamp
                                                    ).toLocaleString("en-US", { weekday: "long" })}, ${
                                                        new Date(remarksList.timestamp ?? item.timestamp)
                                                            .toLocaleString()
                                                            ?.split(",")[0]
                                                    }`}</b>

                                                    {remarksList?.data?.map((remark) => {
                                                        // eslint-disable-next-line
                                                        return (
                                                            <>
                                                                <p
                                                                    style={{
                                                                        padding: "0 5px",
                                                                        marginBottom: "0",
                                                                        marginTop: "5px",
                                                                    }}>
                                                                    {getRemarkTag(remark?.cause)}
                                                                    {remark?.sub && (
                                                                        <span
                                                                            className="subline_tag"
                                                                            style={{
                                                                                background: `${remark?.product?.color}`,
                                                                            }}>
                                                                            {remark?.product?.name}
                                                                        </span>
                                                                    )}
                                                                </p>

                                                                <p style={{ textAlign: "left", marginBottom: "2px" }}>
                                                                    <span style={{ fontWeight: "bolder" }}>
                                                                        {convertHours(remark?.from)} -{" "}
                                                                        {convertHours(remark?.to)}:
                                                                    </span>{" "}
                                                                    {remark?.text}
                                                                </p>
                                                            </>
                                                        );
                                                    })}
                                                </div>
                                            )}
                                        </>
                                    );
                                })}
                        </div>
                    );
                })}
        </div>
    );
}
export default Report;

/**
 * 
 *     // useEffect(() => {
    //     if (!linesData || !Array.isArray(linesData) || linesData?.length < 1) return
    //     const remarksArr = []
    //     // console.log(linesData)
    //     linesData.forEach((item) => {
    //         // console.log(item)
    //         let obj = {name: item?.name, items: []}

    //         if (item.remarks && !Array.isArray(item.remarks)){
    //             if (!item?.remarks) return
    //             obj.data.push({text: item?.remarks })
    //             return remarksArr.push(obj)
    //         } 

    //         if (!item?.remarks || !Array.isArray(item?.remarks) || item?.remarks?.length < 1) return
                
    //         item.remarks?.forEach((remarksList, i) => {
    //             let objData = {timestamp: remarksList?.timestamp, data: []}
    //             console.log("@@@@@@@@@@@@@@@")
    //             console.log(i)
    //             console.log(remarksList)
    //             console.log("@@@@@@@@@@@@@@@")
    //             //obj.timestamp = remarksList?.timestamp
    //             if (remarksList?.items || remarksList?.items?.length > 0){
    //                 remarksList?.items?.forEach((remark) => {
    //                     if (cause !== "false"){
    //                         if (!remark?.cause || remark?.cause !== cause || !remark?.text) return 
    //                         objData.data.push({text: remark?.text, from: remark?.from, to: remark?.to})
    //                          //remarksArr.push(obj)
    //                     }else{
    //                         if (!remark?.text) return 
    //                         objData.data.push({text: remark?.text, from: remark?.from, to: remark?.to})
    //                     }
    //                     obj.items.push(objData)
    //                     // return remarksArr.push(obj)
    //                 })
    //             }
    //             if (!remarksList?.text) return 
    //             objData.data.push({text: remarksList?.text, from: remarksList?.from, to: remarksList?.to})
    //             obj.items.push(objData)
    //         })

    //         return remarksArr.push(obj)
    //     })

    //     console.log(remarksArr)
    // }, [linesData, cause])


{Array.isArray(linesData) && linesData?.length > 0 &&
                linesData.map((item) => {
                    if (item.remarks && !Array.isArray(item.remarks)) return(
                        <div className='report_remarks_text'>
                            <b style={{color: "blue", marginBottom: "10px"}}>{`${new Date(item.timestamp).toLocaleString('en-US', {weekday: "long"})}, ${new Date(item.timestamp).toLocaleString()?.split(",")[0]}`}</b>
                            <p style={{textAlign: "left", marginBottom: "2px"}}>{item?.remarks}</p>
                        </div>
                    )

                    return (
                        <div>
                        {Array.isArray(item?.remarks) && item?.remarks.length > 0 && 
                            <h4 id={`remarks_${item?.lineId}`} className='mt-4 text-center' style={{cursor: "pointer"}}
                            onClick={() => {
                                document.getElementById(`table_${item?.lineId}`)?.scrollIntoView({ behavior: "smooth", block: "center", inline: "center" });
                            }}>{item?.name}</h4>
                        }
                        {item.remarks?.map((remarksList) => {                            
                            if (cause !== "false") return(
                                <div className='report_remarks_text' style={{textAlign: "left"}}>
                                    <b style={{textAlign: "left", marginBottom: "10px"}}>{`${new Date(remarksList.timestamp ?? item.timestamp).toLocaleString('en-US', {weekday: "long"})}, ${new Date(remarksList.timestamp ?? item.timestamp).toLocaleString()?.split(",")[0]}`}</b>
                                    {remarksList?.items?
                                    remarksList?.items?.map((remark) => {
                                        // eslint-disable-next-line
                                        if (!remark?.cause || remark?.cause !== cause) return 
                                        return(
                                            <p style={{textAlign: "left", marginBottom: "2px"}}>{remark?.text}</p>
                                        )
                                    })
                                    :
                                    <>
                                    {remarksList?.cause === cause &&
                                        <p style={{textAlign: "left", marginBottom: "2px"}}><span style={{fontWeight: "bolder"}}>{convertHours(remarksList?.from)} - {convertHours(remarksList?.to)}:</span> {remarksList?.text}</p>
                                    }
                                    </>
                                    }
                                </div>
                            )
                            return (
                                <div className='report_remarks_text'>
                                    <b style={{textAlign: "left", marginBottom: "10px"}}>{`${new Date(remarksList.timestamp ?? item.timestamp).toLocaleString('en-US', {weekday: "long"})}, ${new Date(remarksList.timestamp ?? item.timestamp).toLocaleString()?.split(",")[0]}`}</b>
                                    {remarksList?.items?
                                    remarksList?.items?.map((remark) => {
                                        if (typeof remark !== 'object') return (
                                            <p style={{textAlign: "left", marginBottom: "2px"}}>{remark?.text}</p>
                                        )
                                        return(
                                        <p style={{textAlign: "left", marginBottom: "2px"}}><span style={{fontWeight: "bolder"}}>{convertHours(remark?.from)} - {convertHours(remark?.to)}:</span> {remark?.text}</p>
                                        )
                                    })
                                    :
                                        <p style={{textAlign: "left", marginBottom: "2px"}}><span style={{fontWeight: "bolder"}}>{convertHours(remarksList?.from)} - {convertHours(remarksList?.to)}:</span> {remarksList?.text}</p>
                                    }
                                </div>
                            )
                        })
                        }
                    </div>
                    )
                })
            }

    if (remarksList.length < 1) return
        if (cause !== "false") return(
            <div style={{textAlign: "left"}}>
                <b style={{color: "blue"}}>{`${new Date(remarksList.timestamp).toLocaleString('en-US', {weekday: "long"})}, ${new Date(remarksList.timestamp).toLocaleString()?.split(",")[0]}`}</b>
                {remarksList?.items?.map((remark) => {
                    if (!remark?.cause || remark?.cause !== cause) return 
                    return(
                    <p style={{textAlign: "left"}}><span style={{fontWeight: "bolder"}}>{remark?.from} - {remark?.to}:</span> {remark?.text}</p>
                    )
                })
                }
            </div>
        )

    if (!timePeriod?.endDate) return(
        <div style={{textAlign: "left"}}>
            <b style={{textAlign: "left"}}>{`${new Date(item.timestamp).toLocaleString('en-US', {weekday: "long"})}, ${new Date(item.timestamp).toLocaleString()?.split(",")[0]}`}</b>
            {remarksList?.items?.map((remark) => {
                console.log(remark)
                if (typeof remarksList !== 'object') return (
                    <p style={{textAlign: "left"}}>{remarksList}</p>
                )
                return(
                <p style={{textAlign: "left"}}><span style={{fontWeight: "bolder"}}>{remarksList?.from} - {remarksList?.to}:</span> {remarksList?.text}</p>
                )
            })
            }
        </div>
    )
 */
