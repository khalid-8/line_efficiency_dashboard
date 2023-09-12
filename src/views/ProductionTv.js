import React, { useEffect, useState, useRef } from "react";
import { Table } from "react-bootstrap";
import { useNavigate, useParams } from "react-router-dom";
import { Clock, TargetGraph } from "../components";
import { useTableContext } from "../context";
import "./styles/productionTv.css";
import { CALC } from "../helpers";
import linesInfo from "../components/linesInfo.json";
import { AiOutlineArrowLeft } from "react-icons/ai";

export default function ProductionTv() {
    const [todayValues, setTodayValues] = useState();
    const [lastWeekValues, setLastWeekValues] = useState();
    const [weekValues, setWeekValues] = useState();
    const [monthValues, setMonthValues] = useState();
    const [expected, setExpected] = useState([]);
    const [currentHourActual, setCurrentHourActual] = useState(0);
    const [weekRange, setWeekRange] = useState();
    const [subLine, setSubLine] = useState();
    const [running, setRunning] = useState(true);
    const [currentLine, setCurrentLine] = useState()

    const { data, shiftStart, breaks } = useTableContext();
    const { line } = useParams();
    const navigate = useNavigate();

    const todaysDate = new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Riyadh" }));
    const datesDisplay = `${todaysDate.toLocaleString("en-GB", { timeZone: "Asia/Riyadh", weekday: "long" })}, ${
        todaysDate.toLocaleString("en-GB", { timeZone: "Asia/Riyadh" }).split(",")[0]
    }`;

    const header = document.getElementById("app_header");
    const footer = document.getElementById("app_footer");

    function getTarget(item, type){
        if (type !== "daily") return item?.target
        let target = item?.actualTarget ? (parseInt(item?.actualTarget) > item?.target ? parseInt(item?.actualTarget) : item?.target) : item?.target
        // (parseInt(item?.data?.[idxToNav(activeView)]?.actualTarget) > item?.data?.[idxToNav(activeView)]?.target ? item?.data?.[idxToNav(activeView)]?.actualTarget : item?.data?.[idxToNav(activeView)]?.target) : item?.data?.[idxToNav(activeView)]?.target
        return target
    }

    useEffect(() => {
        if (line === "line5") return setCurrentLine("line3")
        if (line === "line3") return setCurrentLine("line5")
        return setCurrentLine(line)
    }, [line])
    
    useEffect(() => {
        if (!header || !footer) return;
        header.style.display = "none";
        footer.style.display = "none";

        window.onpopstate = () => {
            header?.style?.removeProperty("display");
            footer?.style?.removeProperty("display");
            setRunning(false);
            navigate(`/`);
        };
        // eslint-disable-next-line
    }, [header, footer]);

    useEffect(() => {
        const baseDate = new Date(todaysDate.getTime());
        const firstDayOfWeek = CALC.getStartOfWeek(baseDate);
        const lastDayOfWeek = CALC.getTheEndOfTheWeek(firstDayOfWeek);
        lastDayOfWeek.setDate(lastDayOfWeek.getDate() - 1);

        setWeekRange(
            `<div>Week Start on <span class="dayGreen">${
                firstDayOfWeek.toLocaleString("en-GB", { timeZone: "Asia/Riyadh" })?.split("/")[0]
            }</span> & ends on <span class="dayRed">${
                lastDayOfWeek.toLocaleString("en-GB", { timeZone: "Asia/Riyadh" })?.split("/")[0]
            }</span></div>`
        );
        // eslint-disable-next-line
    }, []);

    // setTimeout(function checkCurrentHrInput() {
    //     const currHour = new Date(new Date().toLocaleString("en-GB", {timeZone: "Asia/Riyadh"}))
    //     currHour.setHours(0,0,0,0)
    //     console.log("running on top of the Hour")
    //     console.log(currHour)
    //     // if (currHour.getTime() === todayValues.hourlyInput?.[todayValues?.hourlyInput?.length - 1].timestamp)
    //     // schedule the next tick
    //     setTimeout(checkCurrentHrInput, delay);
    // }, start);
    const checkCurrentHourInput = (today) => {
        if (!today?.hourlyInput || today?.hourlyInput?.length < 1) return;

        const currHour = new Date();
        currHour.setHours(currHour.getHours(), 0, 0, 0);

        const lastidx = today?.hourlyInput?.length - 1;

        if (today.hourlyInput[lastidx]?.timestamp !== currHour.getTime()) return setCurrentHourActual(0);
        setCurrentHourActual(today.hourlyInput[lastidx].value);
    };

    //for multi-product lines auto switch between products every 15 secs
    useInterval(
        () => {
            if (!currentLine) return;
            if (!linesInfo.lines[parseInt(currentLine.slice(-1)) - 1].multiProduct) return setSubLine(undefined);

            let index = subLine?.id ? `${1 + parseInt(subLine.id)}` : "0";
            if (parseInt(index) > linesInfo.lines[parseInt(currentLine.slice(-1)) - 1].lines.length - 1) index = "0";

            setSubLine({ id: index });
        },
        running ? 15000 : null
    );

    useEffect(() => {
        if (!data || !line) return;
        const content = data.get(line);

        const today = CALC.getTodaysValues(content, null, subLine, true);
        setTodayValues(today);
        setLastWeekValues(CALC.getLastWeekValues(content, null, subLine, true));
        setWeekValues(CALC.getWeekValues(content, null, subLine, true));
        setMonthValues(CALC.getMonthValues(content, null, subLine, true));

        const totalWorkingHrs = today?.totalHrs * today?.totalShifts - (CALC.getCurrentHour() - shiftStart); //(today?.hourlyInput?.length > 1 ? today?.hourlyInput?.length : 0)
        const totalHrs = Number.isNaN(totalWorkingHrs) ? 9 - (CALC.getCurrentHour() - shiftStart) : totalWorkingHrs;
        const gapValue = today?.gap ? today?.gap : today?.target;
        //const numOfBreak = totalWorkingHrs > 8 ? (totalWorkingHrs > 16 ? 2 : 1) : 0
        const currHrExpexted = CALC.calcHourlyData(totalHrs, gapValue, breaks);
        setExpected(currHrExpexted.length > 0 ? currHrExpexted : ["End of Shift"]);

        console.log(today);
        if (today?.hourlyInput?.length < 0) return setCurrentHourActual(0);

        checkCurrentHourInput(today);
        console.log(data);
        // setCurrent(CALC.getTodaysValues(content))

        console.log(shiftStart);
        // eslint-disable-next-line
    }, [data, line, shiftStart, breaks, subLine]);

    useEffect(() => {
        /**
         * this function will run every 10 seconds to check and display the current hour's expected output
         * if the current hour is after the end of the shift it will display 'end of shift' message
         */
        //let delay = 10 * 1 * 1000; // 10 seconds in msec
        let interval = setInterval(() => {
            let time = new Date();

            if (time.getMinutes() === 0) {
                const totalWorkingHrs =
                    todayValues?.totalHrs * todayValues?.totalShifts - (CALC.getCurrentHour() - shiftStart); //(today?.hourlyInput?.length > 1 ? today?.hourlyInput?.length : 0\)
                const totalHrs = Number.isNaN(totalWorkingHrs)
                    ? 9 - (CALC.getCurrentHour() - shiftStart)
                    : totalWorkingHrs;
                // console.log("NAN: ", Number.isNaN(totalWorkingHrs))
                const gapValue = todayValues?.gap ? todayValues?.gap : todayValues?.target;
                //const numOfBreak = totalWorkingHrs > 8 ? (totalWorkingHrs > 16 ? 2 : 1) : 0
                const currHrExpexted = CALC.calcHourlyData(totalHrs, gapValue, breaks);
                setExpected(currHrExpexted.length > 0 ? currHrExpexted : ["End of Shift"]);

                setCurrentHourActual(0);
            }
        }, 10000);
        return () => clearInterval(interval); // This represents the unmount function, in which you need to clear your interval to prevent memory leaks.
    }, [breaks, shiftStart, todayValues]);

    return (
        <main className="info-display">
            <div className="display-header">
                <nav
                    className="nav-back"
                    onClick={() => {
                        header.style.removeProperty("display");
                        footer.style.removeProperty("display");
                        setRunning(false);
                        navigate(`/`);
                    }}>
                    <AiOutlineArrowLeft className="go_back_btn" />
                    Dashboard
                </nav>
                {todayValues && 
                    <h1>
                    {subLine
                        ? linesInfo.lines[parseInt(currentLine[currentLine.length - 1]) - 1].lines[subLine.id]?.name
                        : linesInfo.lines[parseInt(currentLine[currentLine.length - 1]) - 1].name
                    }
                    </h1>
                }
            </div>

            {todayValues && (
                <>
                    <div className="logos">
                        <div>
                            <img
                                src={`${process.env.REACT_APP_HOSTING_SUBFOLDER}/imgs/Juffali_Carrier.png`}
                                className="carrier-juff-logo"
                                alt="juffali carrier"
                            />
                        </div>
                        <div>
                            <img
                                src={`${process.env.REACT_APP_HOSTING_SUBFOLDER}/imgs/iso-9001.png`}
                                className="quality-logo"
                                alt="juffali carrier"
                            />
                            <img
                                src={`${process.env.REACT_APP_HOSTING_SUBFOLDER}/imgs/emirates-quality-mark.png`}
                                className="quality-logo"
                                alt="juffali carrier"
                            />
                        </div>
                    </div>
                    <div>
                        <Table responsive>
                            <thead>
                                <tr>
                                    <th style={{ width: "50%" }}>
                                        {datesDisplay} <Clock />
                                    </th>
                                    <th style={{ width: "50%" }} dangerouslySetInnerHTML={{ __html: weekRange }}>
                                    </th>
                                </tr>
                            </thead>
                        </Table>
                        <Table responsive striped bordered hover className="main-info-table">
                            <thead>
                                <tr>
                                    <th></th>
                                    <th className="theader">Line Target</th>
                                    <th className="theader">Actual Production</th>
                                    <th className="theader">Internal Target</th>
                                    <th className="theader">Gap</th>
                                    <th className="theader">Efficiency</th>
                                    <th className="theader" colSpan={3}>
                                        Manpower
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td className="theader">Previous Week</td>
                                    <td>{lastWeekValues?.target}</td>
                                    <td>{lastWeekValues?.actual}</td>
                                    <td style={{ color: "red" }}>N/A</td>
                                    <td>{lastWeekValues?.gap}</td>
                                    <td>{lastWeekValues?.eff}</td>
                                    <td className="theader">Plan</td>
                                    <td className="theader">Absentees</td>
                                    <td className="theader">Actual</td>
                                    {/* <td className='theader'>Daily Absentees</td>
                            <th>{todayValues?.dailyAbs}</th> */}
                                </tr>
                                <tr>
                                    <td className="theader">Daily</td>
                                    <td>{todayValues?.target}</td>
                                    <td>{todayValues?.actual}</td>
                                    <td>{todayValues?.actualTarget}</td>
                                    <td>{todayValues?.gap}</td>
                                    <td>{todayValues?.eff}</td>
                                    <td>{todayValues?.manpower?.plan}</td>
                                    <td>{todayValues?.manpower?.abs}</td>
                                    <td>{todayValues?.manpower?.actual}</td>
                                </tr>

                                <tr>
                                    <td className="theader">Weekly</td>
                                    <td>{weekValues?.target}</td>
                                    <td>{weekValues?.actual}</td>
                                    <td style={{ color: "red" }}>N/A</td>
                                    <td>{weekValues?.gap}</td>
                                    <td>{weekValues?.eff}</td>
                                    <td className="theader" colSpan={2}>
                                        Total Shift Hours
                                    </td>
                                    <th>{todayValues?.totalHrs}</th>
                                </tr>

                                <tr>
                                    <td className="theader">Monthly</td>
                                    <td>{monthValues?.target}</td>
                                    <td>{monthValues?.actual}</td>
                                    <td style={{ color: "red" }}>N/A</td>
                                    <td>{monthValues?.gap}</td>
                                    <td>{monthValues?.eff}</td>
                                    <td className="theader" colSpan={2}>
                                        Total Shifts Per Day
                                    </td>
                                    <th>{todayValues?.totalShifts}</th>
                                </tr>
                            </tbody>
                        </Table>
                    </div>
                    <div className="expected-prdouction-tv">
                        <span className="hourly-data">
                            <b>Previous Hours</b>
                            <p>{todayValues?.actual}</p>
                        </span>
                        <span className={`hourly-data ${expected?.[0] > currentHourActual ? "red" : "green"}`}>
                            <b>Current Hour Expected</b>
                            <p>
                                {expected?.[0] > 0 ||
                                expected?.[0] === "Break Time" ||
                                expected?.[0] === "End of Shift"
                                    ? expected?.[0]
                                    : 0}
                            </p>
                        </span>
                        <span className={`hourly-data ${expected?.[0] > currentHourActual ? "red" : "green"}`}>
                            <b>Current Hour Actual</b>
                            <p>{currentHourActual}</p>
                        </span>
                    </div>
                    <div className="charts animate-charts">
                        {subLine &&
                            <span className="current_product left" style={{
                                color: `${linesInfo.lines[parseInt(currentLine[currentLine.length - 1]) - 1].lines[subLine.id]?.color}`,
                                background: `${linesInfo.lines[parseInt(currentLine[currentLine.length - 1]) - 1].lines[subLine.id]?.color}`
                            }}>
                                {linesInfo.lines[parseInt(currentLine[currentLine.length - 1]) - 1].lines[subLine.id]?.name}
                            </span>
                        }
                        <div>
                            <TargetGraph
                                target={lastWeekValues?.target}
                                actual={lastWeekValues?.actual}
                                eff={lastWeekValues?.eff}
                                title={"Previous Week"}
                            />
                        </div>
                        <div>
                            <TargetGraph
                                target={getTarget(todayValues, "daily")}
                                actual={todayValues?.actual}
                                eff={todayValues?.eff}
                                title={"Daily"}
                            />
                        </div>
                        <div>
                            <TargetGraph
                                target={todayValues?.weeklyTarget}
                                actual={weekValues?.actual}
                                eff={weekValues?.eff}
                                title={"Weekly"}
                            />
                        </div>
                        <div>
                            <TargetGraph
                                target={monthValues?.target}
                                actual={monthValues?.actual}
                                eff={monthValues?.eff}
                                title={"Monthly"}
                            />
                        </div>
                        
                        {subLine &&
                            <span className="current_product right" style={{
                                color: `${linesInfo.lines[parseInt(currentLine[currentLine.length - 1]) - 1].lines[subLine.id]?.color}`,
                                background: `${linesInfo.lines[parseInt(currentLine[currentLine.length - 1]) - 1].lines[subLine.id]?.color}`
                            }}>
                                {linesInfo.lines[parseInt(currentLine[currentLine.length - 1]) - 1].lines[subLine.id]?.name}
                            </span>
                        }
                    </div>
                    <div></div>
                </>
            )}
        </main>
    );
}

function useInterval(callback, delay) {
    const savedCallback = useRef();

    // Remember the latest function.
    useEffect(() => {
        savedCallback.current = callback;
    }, [callback]);

    // Set up the interval.
    useEffect(() => {
        function tick() {
            savedCallback.current();
        }
        if (delay !== null) {
            let id = setInterval(tick, delay);
            return () => clearInterval(id);
        }
    }, [delay]);
}

//Efficiency
/* <Table responsive bordered>
                        <thead>
                            <tr>    
                                <td className='theader top'>Previous Hours Production Total</td>
                                <td className='theader top'>Expected Production for Current Hour</td>
                                <td className='theader top'>Actual Production for Current Hour</td>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td><b style={{color: "red"}}>12</b></td>
                                <td><b style={{color: "red"}}>12</b></td>
                                <td><b style={{color: "red"}}>12</b></td>
                            </tr>
                        </tbody>
                    </Table> */
