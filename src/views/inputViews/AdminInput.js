import { useEffect, useRef, useState } from "react";
import { useConfirmationContext, useTableContext } from "../../context";
import { CALC } from "../../helpers";
import { Table, Form } from "react-bootstrap";
import DisplayInputRemarks from "./InputRemarks";
import HourlyInput from "./HourlyInput";
import clone from 'just-clone';
//FIX when switching between multi-prod lines it will ask if you're sure event though no data was changed

export default function AdminInput({ line, setDataChanged, dataChanged, objToUpdate, timestamp, sendEmail }) {
    const [totalHrs, setTotalHrs] = useState("9");
    const [totalShif, setTotalShif] = useState("1");
    const [hourInput, setHourInput] = useState([]);
    const [prevWeek, setPrevWeek] = useState();
    const [weekly, setWeekly] = useState();
    const [monthly, setMonthly] = useState();
    const [monthlyTarget, setMonthlyTarget] = useState(0);
    const [weeklyTarget, setWeeklyTarget] = useState(0);
    const [dailyTarget, setDailyTarget] = useState(0);
    const [daily, setDaily] = useState();
    const [remarks, setRemarks] = useState("");
    const [manpower, setManpower] = useState({
        plan: "0",
        abs: "0",
        actual: "0",
    });
    const [pastDate, setPastDate] = useState();
    const [activeSub, setActiveSub] = useState(0);
    const [subLine, setSubline] = useState();

    const { data } = useTableContext();
    const { showConfirmationAlert } = useConfirmationContext();

    const navRefs = useRef([]);

    useEffect(() => {
        if (!line.multiProduct) return setSubline(undefined);
        setSubline(line?.lines[0]); //return setSubline();
        handleNavClick(0);
        // eslint-disable-next-line
    }, [line]);

    useEffect(() => {
        // const sub = !line.multiProduct?  : null
        const setValues = (lineData) => {
            const daily = CALC.getTodaysValues(lineData, pastDate, subLine, true);
            console.log("🚀 ~ file: AdminInput.js:89 ~ setValues ~ daily:", daily);
            const lastWeek = CALC.getLastWeekValues(lineData, pastDate, subLine, true);
            const weekly = CALC.getWeekValues(lineData, pastDate, subLine, true);
            const monthly = CALC.getMonthValues(lineData, pastDate, subLine, true);

            const manpowerObj = daily?.manpower ? daily.manpower : { plan: "0", abs: "0", actual: "0" };
            const totalHours = daily?.totalHrs ? daily.totalHrs : "9";
            const shifts = daily?.totalShifts ? daily.totalShifts : "1";
            const hourlyData = subLine ? daily?.lines?.[subLine?.id]?.hourlyInput ?? [] : daily?.hourlyInput ?? [];
            const remarksTxt = daily?.remarks ? daily?.remarks : "";

            //For Mobile support
            if (
                navigator.userAgent.match(/Android/i) ||
                navigator.userAgent.match(/iPhone/i)
            ) setDaily(clone(daily));
            else setDaily(structuredClone(daily));

            console.log("🚀 ~ file: AdminInput.js:100 ~ setValues ~ daily:", daily);
            setPrevWeek(lastWeek);
            setWeekly(weekly);
            setMonthly(monthly);

            setManpower(manpowerObj);
            setTotalHrs(totalHours);
            setTotalShif(shifts);
            setHourInput(hourlyData);
            if (dataChanged && remarks.length === remarksTxt.length) {
                // if (remarks.length !== remarksTxt.length) setRemarks(remarksTxt)//{
                setRemarks(remarks)
            }
            else setRemarks(remarksTxt);
            //Target
            setMonthlyTarget(monthly?.target);
            setWeeklyTarget(weekly?.target);
            setDailyTarget(daily?.target);
        };

        if (!data) return setValues();

        const lineData = data.get(line.id);

        console.log(data);
        if (!lineData || lineData?.length < 1) return setValues();

        setValues(lineData);
        // eslint-disable-next-line
    }, [data, line, pastDate, subLine, dataChanged]);

    // const logData = () => {
    //     console.log(data);
    // };
    const updateValues = (
        manpowerObj = null,
        Hrs = null,
        Shifts = null,
        dailyTar = null,
        weeklyTar = null,
        monthlyTar = null,
    ) => {
        objToUpdate((prev) => {
            //For Mobile support
            let data
            if (
                navigator.userAgent.match(/Android/i) ||
                navigator.userAgent.match(/iPhone/i)
            ) data = clone(prev);
            else data = structuredClone(prev);
            
            // console.log("🚀 ~ file: AdminInput.js:95 ~ objToUpdate ~ data:", data);
            // logData();
            data.manpower = manpowerObj ? manpowerObj : manpower;
            data.totalHrs = Hrs ? Hrs : totalHrs;
            data.totalShifts = Shifts ? Shifts : totalShif;
            data.dailyTarget = dailyTar ? dailyTar : dailyTarget;
            data.weeklyTarget = weeklyTar ? weeklyTar : weeklyTarget;
            data.monthlyTarget = monthlyTar ? monthlyTar : monthlyTarget;
            if (subLine) {
                const lines = daily.lines; //? [...daily.lines] : [{}, {}, {}];
                lines[subLine?.id]["dailyTarget"] = dailyTar ?? dailyTarget;
                lines[subLine?.id]["weeklyTarget"] = weeklyTar ?? weeklyTarget;
                lines[subLine?.id]["monthlyTarget"] = monthlyTar ?? monthlyTarget;

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
            console.log("🚀 ~ file: AdminInput.js:129 ~ objToUpdate ~ data:", data);
            return data;
        });
        if (pastDate) {
            const newDate = new Date(
                new Date(pastDate).toLocaleString("en-US", {
                    timeZone: "Asia/Riyadh",
                })
            );
            newDate.setHours(0, 0, 0, 0);
            timestamp(newDate);
        }
        setTimeout(() => {
            setDataChanged(true);
        }, 500);
    };

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

    return (
        <>
            <div
                style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    columnGap: "10px",
                    marginBottom: "20px",
                }}>
                <b>Change Past Values</b>
                <Form.Control
                    type="date"
                    style={{ width: "240px" }}
                    max={new Date().toISOString().split("T")[0]}
                    onChange={(e) => {
                        const pickedDate = new Date(e.target.value).toLocaleString("en-US", {
                            timeZone: "Asia/Riyadh",
                        });
                        setPastDate(pickedDate);
                    }}
                />
            </div>

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
                        <td>
                            <input
                                type="number"
                                min="0"
                                max="999999"
                                value={monthlyTarget}
                                onWheel={(e) => e.target.blur()}
                                onChange={(e) => {
                                    setMonthlyTarget(e.target.value);
                                    setWeeklyTarget(Math.round(e.target.value / 4));
                                    setDailyTarget(Math.round(e.target.value / 30));
                                    updateValues(
                                        null,
                                        null,
                                        null,
                                        Math.round(e.target.value / 30),
                                        Math.round(e.target.value / 4),
                                        e.target.value
                                    );
                                }}
                            />
                        </td>
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
                        <td>
                            <input
                                type="number"
                                min="0"
                                max="999999"
                                value={weeklyTarget}
                                onWheel={(e) => e.target.blur()}
                                onChange={(e) => {
                                    setWeeklyTarget(e.target.value);
                                    updateValues(null, null, null, null, e.target.value, null);
                                }}
                            />
                        </td>
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
                        <td>
                            <input
                                type="number"
                                min="0"
                                max="999999"
                                value={dailyTarget}
                                onWheel={(e) => e.target.blur()}
                                onChange={(e) => {
                                    setDailyTarget(e.target.value);
                                    updateValues(null, null, null, e.target.value, null, null);
                                }}
                            />
                        </td>
                        <td>{daily?.actual}</td>
                        <td>{daily?.actualTarget}</td>
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
                        <td>
                            <input
                                type="number"
                                min="0"
                                max="99999"
                                value={totalShif}
                                onWheel={(e) => e.target.blur()}
                                onChange={(e) => {
                                    setTotalShif(e.target.value);
                                    updateValues(null, null, e.target.value);
                                }}
                            />
                        </td>
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
                pastDate={pastDate}
                daily={daily}
                isAdmin={true}
                objToUpdate={objToUpdate}
                updateValues={updateValues}
                sendEmail={sendEmail}
                subLine={subLine}
            />
        </>
    );
}

//        <h4 style={{textAlign: "center"}}>Hourly input</h4>
/**
      // const checkHourlyInput = (hoursArr) => {
        //     if (!hoursArr || hoursArr.length < 1) return
        //     const idx = hoursArr.findLastIndex((hour) => hour.value !== '' && hour.value !== undefined)

        //     if (idx < 0) return
        //     console.log(hoursInputRef.current)
        //     console.log(hoursArr)
        //     console.log(`idx Found: ${idx}`)
        //     hoursArr.slice(0, idx+1).forEach((item, i) => {
        //         hoursInputRef.current[i].value = item.value;
        //         hoursInputRef.current[i].disabled = true;
        //         hoursInputRef.current[i].readOnly = true
        //     })
            
        //     const deadline = new Date(hoursArr[idx]?.timestamp)
        //     deadline.setHours(deadline.getHours() + 1, 59, 0, 0)
            
        //     const currTime = new Date(new Date().toLocaleString('en-US', {timeZone: "Asia/Riyadh"}))
        //     currTime.setHours(currTime.getHours())

        //     // calculate time difference between last input and current time
        //     const timeDifference = (currTime - deadline) / 1000; // convert to seconds
            
        //     let i = idx+1 //> 0? idx - 1 : 0
        //     while(i <  hoursInputRef.current.length ){
        //         if (timeDifference >= (i+1)*3600){
        //             hoursInputRef.current[i].disabled = true;
        //             hoursInputRef.current[i].readOnly = true
        //         }else{
        //             hoursInputRef.current[i].disabled = false;
        //             hoursInputRef.current[i].readOnly = false
        //             break;
        //         }
        //         i++;
        //     }

        //     console.log(i+1)
        //     hoursInputRef.current.slice(i+1, hoursInputRef.current.length+1).forEach((item, x) => {
        //         console.log(item)
        //         // check if time difference is greater than or equal to one hour (3600 seconds)
                
        //         hoursInputRef.current[x].disabled = true;
        //         hoursInputRef.current[x].readOnly = true
                
        //     })
        // }
 */
