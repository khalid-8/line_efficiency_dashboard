import { useEffect, useRef, useState } from "react";
import { useTableContext, useConfirmationContext } from "../../context";
import { CALC } from "../../helpers";
import { Table } from "react-bootstrap";
import DisplayInputRemarks from "./InputRemarks";
import HourlyInput from "./HourlyInput";
import clone from 'just-clone';

export default function ProductionInput({ line, setDataChanged, dataChanged, objToUpdate, sendEmail }) {
    const [totalHrs, setTotalHrs] = useState(9);
    const [totalShif, setTotalShif] = useState(1);
    const [actual, setActual] = useState("");
    const [actualTarget, setActualTarget] = useState("");
    const [remarks, setRemarks] = useState("");
    const [daily, setDaily] = useState();
    const [hourInput, setHourInput] = useState([]);
    const [prevWeek, setPrevWeek] = useState();
    const [weekly, setWeekly] = useState();
    const [monthly, setMonthly] = useState();
    const [manpower, setManpower] = useState({ plan: "0", abs: "0", actual: "0" });
    const [activeSub, setActiveSub] = useState(0);
    const [subLine, setSubline] = useState();

    const { data } = useTableContext();
    const { showConfirmationAlert } = useConfirmationContext();

    const navRefs = useRef([]);

    useEffect(() => {
        if (!line.multiProduct) return setSubline(undefined);
        console.log("🚀 ~ file: ProductionInput.js:31 ~ useEffect ~ line:", line);
        setSubline(line?.lines[0]); //return setSubline();
        handleNavClick(0);
        // eslint-disable-next-line
    }, [line]);

    useEffect(() => {
        // const checkHourlyInput = async(hoursArr) => {
        //     if (!hoursArr || hoursArr.length < 1) return
        //     const idx = hoursArr.length//findLastIndex((hour) => hour.value !== '' && hour.value !== undefined)
        //     console.log(`LEEEENGTH: ${hoursArr.length}`)
        //     if (idx > expectedInput.length) return
        //     console.log(hoursInputRef.current)
        //     console.log(hoursArr)
        //     console.log(`idx Found: ${idx}`)
        //     hoursArr.forEach((item, i) => {
        //         hoursInputRef.current[i].value = item.value;
        //         hoursInputRef.current[i].disabled = true;
        //         hoursInputRef.current[i].readOnly = true
        //     })

        //     //one hour after the last input (if last input was on 8:00 this will get 9:59)
        //     const deadline = new Date(hoursArr[idx - 1]?.timestamp)
        //     deadline.setMinutes(deadline.getMinutes() + 59)

        //     const currTime = new Date(new Date().toLocaleString('en-US', {timeZone: "Asia/Riyadh"}))
        //     currTime.setHours(currTime.getHours())

        //     // calculate time difference between last input and current time
        //     const timeDifference = (currTime.getTime() - deadline.getTime()); // convert to seconds
        //     let me
        //     for (const [index, item] of hoursInputRef.current.slice(idx,hoursInputRef.current.length).entries()){
        //         if (timeDifference >= (index+1)*(60*60*1000)){
        //             console.log(item)
        //             item.value = "322";
        //             hoursInputRef.current[index].value = "1"
        //             item.disabled = true;
        //             item.readOnly = true
        //             console.log(item.value)
        //         }else{
        //             item.disabled = false;
        //             item.readOnly = false;
        //             me = index
        //         }

        //     }
        //     for (const item of hoursInputRef.current.slice(me,hoursInputRef.current.length).entries()){
        //         item.disabled = true;
        //         item.readOnly = true;
        //     }
        // }

        const setValues = (lineData) => {
            const daily = CALC.getTodaysValues(lineData, null, subLine, true);
            const lastWeek = CALC.getLastWeekValues(lineData, null, subLine, true);
            const weekly = CALC.getWeekValues(lineData, null, subLine, true);
            const monthly = CALC.getMonthValues(lineData, null, subLine, true);

            const manpowerObj = daily?.manpower ? daily.manpower : { plan: "0", abs: "0", actual: "0" };
            const totalHours = daily?.totalHrs ? daily.totalHrs : "9";
            const shifts = daily?.totalShifts ? daily.totalShifts : "1";
            const actual = daily?.actual ? daily?.actual : "0";
            const actualTarget = daily?.actualTarget ? daily?.actualTarget : "0";
            const hourlyData = daily?.hourlyInput ? daily?.hourlyInput : [];
            const remarksTxt = daily?.remarks ? daily?.remarks : "";

            setManpower(manpowerObj);
            setTotalHrs(totalHours);
            setTotalShif(shifts);
            setActual(actual);
            setActualTarget(actualTarget);
            setHourInput(hourlyData);
            // setRemarks(remarksTxt);
            if (dataChanged && remarks.length === remarksTxt.length) {
                // if (remarks.length !== remarksTxt.length) setRemarks(remarksTxt)//{
                setRemarks(remarks)
            }
            else setRemarks(remarksTxt);
            
            if (
                navigator.userAgent.match(/Android/i) ||
                navigator.userAgent.match(/iPhone/i)
            ) setDaily(clone(daily))
            else setDaily(structuredClone(daily));
            setPrevWeek(lastWeek);
            setWeekly(weekly);
            setMonthly(monthly);
        };
        if (!data) return setValues();

        const lineData = data.get(line.id);

        if (!lineData || lineData?.length < 1) {
            return setValues();
        }

        setValues(lineData);
        // checkHourlyInput(CALC.getTodaysValues(lineData)?.hourlyInput)
        // eslint-disable-next-line
    }, [data, line, subLine]);

    function isNAN(value) {
        if (`${value}` === "NaN") return true;
        return false;
    }

    function handleNavClick(i) {
        if (i === activeSub) return;
        navRefs.current[activeSub]?.classList.remove("active");
        navRefs.current[i]?.classList.add("active");
        setActiveSub(i);
        setSubline(line?.lines[i]);
    }

    const updateValues = (manpowerObj = null, Hrs = null, Shifts = null, internalTarget = null) => {
        objToUpdate((prev) => {
            let data
            if (
                navigator.userAgent.match(/Android/i) ||
                navigator.userAgent.match(/iPhone/i)
            ) data = clone(prev)
            else data = structuredClone(prev);

            // console.log("🚀 ~ file: AdminInput.js:95 ~ objToUpdate ~ data:", data);
            // logData();
            data.manpower = manpowerObj ? manpowerObj : manpower;
            data.totalHrs = Hrs ? Hrs : totalHrs;
            data.totalShifts = Shifts ? Shifts : totalShif;
            data.actualTarget = internalTarget ? internalTarget : actualTarget;
            data.dailyTarget = daily?.target ? daily?.target : "0";
            data.weeklyTarget = daily?.weeklyTarget ? daily?.weeklyTarget : "0";
            data.monthlyTarget = daily?.monthlyTarget ? daily?.monthlyTarget : "0";

            if (subLine) {
                const lines = daily.lines; //? [...daily.lines] : [{}, {}, {}];
                lines[subLine?.id]["dailyTarget"] = daily?.target ?? "0";
                lines[subLine?.id]["weeklyTarget"] = daily?.target ?? "0";
                lines[subLine?.id]["monthlyTarget"] = daily?.target ?? "0";
                lines[subLine?.id]["actualTarget"] = internalTarget ?? actualTarget;

                let targetOfDay = 0;
                let weekly = 0;
                let monthly = 0;

                data.lines = lines;
                lines?.forEach((item) => {
                    targetOfDay += parseInt(item.dailyTarget);
                    weekly += parseInt(item.weeklyTarget);
                    monthly += parseInt(item.monthlyTarget);
                });

                data.dailyTarget = targetOfDay;
                data.weeklyTarget = weekly;
                data.monthlyTarget = monthly;
            }
            return data;
        });

        setDataChanged(true);
    };

    return (
        <>
            {line?.multiProduct && (
                <div className="multi_prod_nav">
                    <div className="d-flex justify-content-between input_sub_lines">
                        {line.lines.map((item, i) => (
                            <nav
                                key={item.id}
                                ref={(el) => (navRefs.current[i] = el)}
                                className={`${i === 0 ? "active" : ""}`}
                                style={{
                                    background: `${item.color}`,
                                    textAlign: "center",
                                }}
                                onClick={async () => {
                                    if (dataChanged) {
                                        const result = await showConfirmationAlert({
                                            head: `Data Not Updated!`,
                                            body: `are you sure you want to navigate to different product before updating the data, if you do the current input will be lost`,
                                        });
                                        if (result) {
                                            setHourInput([]);
                                            handleNavClick(i);
                                            return setDataChanged(false);
                                        }
                                        return setDataChanged(true);
                                    }
                                    handleNavClick(i);
                                    return setDataChanged(false);
                                }}>
                                {item.name}
                            </nav>
                        ))}
                    </div>
                </div>
            )}
            <Table responsive striped bordered hover className="main-info-table">
                <thead>
                    <tr>
                        <td></td>
                        <td className="theader">Line Target</td>
                        <td className="theader">Actual Production</td>
                        <td className="theader">Internal Target</td>
                        <td className="theader">Gap</td>
                        <td className="theader">Efficiency</td>
                        <td className="theader" colSpan={3}>
                            Manpower
                        </td>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td className="theader">Monthly</td>
                        <td>{daily?.monthlyTarget}</td>
                        <td>{monthly?.actual}</td>
                        <td style={{ color: "red" }}>N/A</td>
                        <td>{monthly?.gap}</td>
                        <td>{monthly?.eff}</td>
                        <td className="theader">Plan</td>
                        <td className="theader">Absentees</td>
                        <td className="theader">Actual</td>
                    </tr>
                    <tr>
                        <td className="theader">Weekly</td>
                        <td>{daily?.weeklyTarget}</td>
                        <td>{weekly?.actual}</td>
                        <td style={{ color: "red" }}>N/A</td>
                        <td>{weekly?.gap}</td>
                        <td>{weekly?.eff}</td>
                        <td>
                            <input
                                type="number"
                                min="0"
                                max="99999"
                                value={manpower.plan}
                                onWheel={(e) => e.target.blur()}
                                onChange={(e) => {
                                    const newObj = { ...manpower };
                                    newObj.plan = e.target.value;
                                    newObj.actual =
                                        parseInt(e.target.value) -
                                        (parseInt(newObj.abs) && !isNAN(newObj.abs) ? parseInt(newObj.abs) : 0);
                                    setManpower(newObj);
                                    updateValues(newObj, null, null);
                                }}
                            />
                        </td>
                        <td>
                            <input
                                type="number"
                                min="0"
                                max="99999"
                                value={manpower.abs}
                                onWheel={(e) => e.target.blur()}
                                onChange={(e) => {
                                    const newObj = Object.assign({}, manpower);
                                    newObj.abs = e.target.value;
                                    newObj.actual = parseInt(newObj.plan) - parseInt(e.target.value);
                                    setManpower(newObj);
                                    updateValues(newObj, null, null);
                                }}
                            />
                        </td>
                        <td>
                            {!isNAN(manpower.actual) ? manpower.actual : "0"}
                            {/* <input
                                type="number"
                                min="0"
                                max="99999"
                                value={manpower.actual}
                                onWheel={(e) => e.target.blur()}
                                onChange={(e) => {
                                    const newObj = Object.assign({}, manpower);
                                    newObj.actual = e.target.value;
                                    setManpower(newObj);
                                    updateValues(newObj, null, null);
                                }}
                            /> */}
                        </td>
                    </tr>
                    <tr>
                        <td className="theader">Daily</td>
                        <td>{daily?.target}</td>
                        <td>{actual}</td>
                        <td>
                            <input
                                type="number"
                                min="0"
                                max="99999"
                                value={actualTarget}
                                onWheel={(e) => e.target.blur()}
                                onChange={(e) => {
                                    setActualTarget(e.target.value);
                                    // objToUpdate(prev => {
                                    //     let data = prev;
                                    //     data.actualTarget= e.target.value;
                                    //     return data ;
                                    // })
                                    updateValues(null, null, null, e.target.value);
                                }}
                            />
                        </td>
                        <td>{daily?.gap}</td>
                        <td>{daily?.eff}</td>
                        <td className="theader" colSpan={2}>
                            Total Shift Hours
                        </td>
                        <td>
                            <input
                                type="number"
                                min="0"
                                max="99999"
                                value={totalHrs}
                                onWheel={(e) => e.target.blur()}
                                onChange={(e) => {
                                    setTotalHrs(e.target.value);
                                    updateValues(null, e.target.value, null);
                                }}
                            />
                        </td>
                    </tr>
                    <tr>
                        <td className="theader">Previous Week</td>
                        <td>{prevWeek?.target}</td>
                        <td>{prevWeek?.actual}</td>
                        <td style={{ color: "red" }}>N/A</td>
                        <td>{prevWeek?.gap}</td>
                        <td>{prevWeek?.eff}</td>
                        <td className="theader" colSpan={2}>
                            Total Shifts Per Day
                        </td>
                        <th>
                            <input
                                type="number"
                                min="1"
                                max="99999"
                                value={totalShif}
                                onWheel={(e) => e.target.blur()}
                                onChange={(e) => {
                                    if (!e.target.value || (e.target.value === "") | (e.target.value < 1))
                                        return setTotalShif("1");
                                    setTotalShif(e.target.value);
                                    updateValues(null, null, e.target.value);
                                }}
                            />
                        </th>
                    </tr>
                </tbody>
            </Table>

            <HourlyInput
                totalShif={totalShif}
                totalHrs={totalHrs}
                daily={daily}
                hourInput={hourInput}
                subLine={subLine}
                objToUpdate={objToUpdate}
                dataChanged={setDataChanged}
                updateValues={updateValues}
            />

            <DisplayInputRemarks
                remarks={remarks}
                lineId={line.id}
                daily={daily}
                isAdmin={false}
                objToUpdate={objToUpdate}
                updateValues={updateValues}
                sendEmail={sendEmail}
                subLine={subLine}
            />
        </>
    );
}

//let i = 0 //> 0? idx - 1 : 0
// while(i <  hoursInputRef.current.length ){
//     // console.log(deadline)
//     // console.log(currTime)
//     // //(timeDifference >= (i+1)*3600)
//     // if (deadline.getTime() >= currTime.getTime()) {
//     //     hoursInputRef.current[i].disabled = false;
//     //     hoursInputRef.current[i].readOnly = false
//     //     break;
//     // }
//     // deadline.setHours(deadline.getHours() + 1)
//     console.log((i+1)*3600)
//     console.log(timeDifference)
//     console.log(`Test: ${timeDifference >= (i+1)*(60*60*1000)}`)
//     if (timeDifference >= (i+1)*3600){
//         hoursInputRef.current[i].disabled = true;
//         hoursInputRef.current[i].readOnly = true
//     }else{
//         hoursInputRef.current[i].disabled = false;
//         hoursInputRef.current[i].readOnly = false
//         break;
//     }
//     i++;
// }

// console.log(i+1)
// hoursInputRef.current.slice(i+1, hoursInputRef.current.length+1).forEach((item, x) => {
//     console.log(item)
//     // check if time difference is greater than or equal to one hour (3600 seconds)

//     hoursInputRef.current[x].disabled = true;
//     hoursInputRef.current[x].readOnly = true

// })

// if(lineData[0].timestamp === timestamp.getTime()){
//     // checkHourlyInput(lineData[0]?.hourlyInput)
//     setValues(lineData)
//     return
// }

//        <h4 style={{textAlign: "center"}}></h4>

//        <h4 style={{textAlign: "center"}}>Hourly input</h4>
