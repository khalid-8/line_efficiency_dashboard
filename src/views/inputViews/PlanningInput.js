import { useEffect, useRef, useState } from "react";
import { useConfirmationContext, useTableContext } from "../../context";
import { CALC } from "../../helpers";
import { Table } from "react-bootstrap";
import clone from 'just-clone';

export default function PlanningInput({ line, setDataChanged, dataChanged, objToUpdate }) {
    const [monthlyTarget, setMonthlyTarget] = useState(0);
    const [weeklyTarget, setWeeklyTarget] = useState(0);
    const [dailyTarget, setDailyTarget] = useState(0);
    const [daily, setDaily] = useState();
    const [prevWeek, setPrevWeek] = useState();
    const [weekly, setWeekly] = useState();
    const [monthly, setMonthly] = useState();
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
        const setValues = (lineData) => {
            // const monTarget = lineData?.weeklyTarget ? lineData.weeklyTarget : "0"
            // const weeTarget = lineData?.weeklyTarget ? lineData.weeklyTarget : "0"
            // const daiTarget = lineData?.dailyTarget ? lineData.dailyTarget : "0"

            // setMonthlyTarget(monTarget)
            // setWeeklyTarget(weeTarget)
            // setDailyTarget(daiTarget)

            const today = CALC.getTodaysValues(lineData, null, subLine, true);
            console.log("🚀 ~ file: PlanningInput.js:40 ~ setValues ~ today:", today);
            const lastWeek = CALC.getLastWeekValues(lineData, null, subLine, true);
            const week = CALC.getWeekValues(lineData, null, subLine, true);
            const month = CALC.getMonthValues(lineData, null, subLine, true);

            setDaily(today);
            setWeekly(week);
            setPrevWeek(lastWeek);
            setMonthly(month);

            setMonthlyTarget(month?.target);
            setWeeklyTarget(week?.target);
            setDailyTarget(today?.target);
        };

        if (!data) return setValues();

        const lineData = data.get(line.id);

        if (!lineData || lineData?.length < 1) return setValues();

        setValues(lineData);
    }, [data, line, subLine]);

    function handleNavClick(i) {
        if (i === activeSub) return;
        navRefs.current[activeSub]?.classList.remove("active");
        navRefs.current[i]?.classList.add("active");
        setActiveSub(i);
        setSubline(line?.lines[i]);
    }

    const updateValues = (dailyTar = null, weeklyTar = null, monthlyTar = null) => {
        objToUpdate((prev) => {
            let data
            if (
                navigator.userAgent.match(/Android/i) ||
                navigator.userAgent.match(/iPhone/i)
            ) data = clone(prev)
            else data = structuredClone(prev);
            
            data.dailyTarget = dailyTar ? dailyTar : dailyTarget;
            data.weeklyTarget = weeklyTar ? weeklyTar : weeklyTarget;
            data.monthlyTarget = monthlyTar ? monthlyTar : monthlyTarget;

            if (subLine) {
                const lines = daily.lines; //? [...daily.lines] : [{}, {}, {}];
                lines[subLine?.id]["dailyTarget"] = dailyTar ? dailyTar : dailyTarget;
                lines[subLine?.id]["weeklyTarget"] = weeklyTar ? weeklyTar : weeklyTarget;
                lines[subLine?.id]["monthlyTarget"] = monthlyTar ? monthlyTar : monthlyTarget;

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
                                value={monthlyTarget}
                                onWheel={(e) => e.target.blur()}
                                onChange={(e) => {
                                    setMonthlyTarget(e.target.value);
                                    setWeeklyTarget(Math.round(e.target.value / 4));
                                    setDailyTarget(Math.round(e.target.value / 30));
                                    // objToUpdate({
                                    //     monthlyTarget: e.target.value,
                                    //     weeklyTarget: Math.round(e.target.value/4),
                                    //     dailyTarget: Math.round(e.target.value/30)
                                    // })
                                    updateValues(
                                        Math.round(e.target.value / 30),
                                        Math.round(e.target.value / 4),
                                        e.target.value
                                    );
                                }}
                            />
                        </td>
                        <td>{daily?.actual}</td>
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
                                value={weeklyTarget}
                                onWheel={(e) => e.target.blur()}
                                onChange={(e) => {
                                    //calcTable(0)
                                    setWeeklyTarget(e.target.value);
                                    // objToUpdate(prev => {
                                    //     let data = prev;
                                    //     data.weeklyTarget = e.target.value;
                                    //     return data ;
                                    // })
                                    updateValues(null, e.target.value, null);
                                }}
                            />
                        </td>
                        <td>{daily?.actual}</td>
                        <td>{weekly?.gap}</td>
                        <td>{weekly?.eff}</td>
                        <td>{daily?.manpower?.plan}</td>
                        <td>{daily?.manpower?.abs}</td>
                        <td>{daily?.manpower?.actual}</td>
                    </tr>
                    <tr>
                        <td className="theader">Daily</td>
                        <td>
                            <input
                                type="number"
                                min="0"
                                value={dailyTarget}
                                onWheel={(e) => e.target.blur()}
                                onChange={(e) => {
                                    setDailyTarget(e.target.value);
                                    // objToUpdate(prev => {
                                    //     let data = prev;
                                    //     data.dailyTarget = e.target.value;
                                    //     return data ;
                                    // })
                                    updateValues(e.target.value, null, null);
                                }}
                            />
                        </td>
                        <td>{daily?.actual}</td>
                        <td>{daily?.gap}</td>
                        <td>{daily?.eff}</td>
                        <td className="theader" colSpan={2}>
                            Total Shift Hours
                        </td>
                        <td>{daily?.totalHrs}</td>
                    </tr>
                    <tr>
                        <td className="theader">Previous Week</td>
                        <td>{prevWeek?.target}</td>
                        <td>{prevWeek?.actual}</td>
                        <td>{prevWeek?.gap}</td>
                        <td>{prevWeek?.eff}</td>
                        <td className="theader" colSpan={2}>
                            Total Shifts Per Day
                        </td>
                        <td>{daily?.totalShifts}</td>
                    </tr>
                </tbody>
            </Table>
        </>
    );
}
