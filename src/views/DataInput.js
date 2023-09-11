import React, { useEffect, useRef, useState } from "react";
import { Button, Card } from "react-bootstrap";
import "./styles/dataInput.css";
import { API } from "../helpers";
import { useAuthContext, useConfirmationContext } from "../context";
import { AdminInput, PlanningInput, ProductionInput } from "./inputViews";
import linesInfo from "../components/linesInfo.json";

export default function DataInput() {
    const [activeOpt, setActiveOpt] = useState(0);
    const [disable, setDisable] = useState(false);
    const [values, setValues] = useState({});
    const [acctType, setAcctType] = useState();
    const [dataChanged, setDataChanged] = useState();
    const [timestamp, setTimestamp] = useState();
    const [sendEmail, setSendEmail] = useState(false);
    const [canAccess, setCanaccess] = useState(false);

    const navRefs = useRef([]);
    const { showConfirmationAlert } = useConfirmationContext();
    const { currentUser } = useAuthContext();
    //to be used for todays table

    // console.log(currentUser);
    useEffect(() => {
        if (currentUser?.claim?.admin) return setAcctType("admin");
        if (currentUser?.claim?.planner) return setAcctType("planner");
        if (currentUser?.claim?.production) {
            setAcctType("production");
            if (currentUser.user.email !== "production1@user.com") setCanaccess(false);
            else if (currentUser.user.email === "production1@user.com") setCanaccess(true);
        }
    }, [currentUser]);

    useEffect(() => {
        if (!canAccess) return;
        handleNavClick(5);
        // eslint-disable-next-line
    }, [canAccess]);

    function handleNavClick(i) {
        if (i === activeOpt) return;
        navRefs.current[activeOpt]?.classList.remove("active");
        navRefs.current[i]?.classList.add("active");
        setActiveOpt(i);
    }

    const handleSubmit = async () => {
        let time;
        if (!timestamp) {
            time = new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Riyadh" }));
            time.setHours(0, 0, 0, 0);
            setTimestamp(time);
        } else time = timestamp;
        console.log(values);
        setDisable(true);

        try {
            let obj = {
                name: linesInfo.lines[activeOpt].name,
                lineId: linesInfo.lines[activeOpt].id,
                ...values,
                timestamp: time.getTime(),
            };

            console.log(obj);
            /*const fields = ["shift1", "shift2", "target", "actual",  "total_shifts"]
            let data = {}
    
            valuesRef.current?.forEach((field, i) => {
                data[fields[i]] = field.value
            })

            obj = {...obj, ...data, timestamp: `${timestamp.getTime()}`, gap: gapValue, eff: efficiencyValue}*/

            try {
                await API.updateDBDoc("data", `${linesInfo.lines[activeOpt].id}/production/${time.getTime()}`, obj)
                .then(async () => {
                    // return;
                    if (!sendEmail) return;
                    console.log(obj)
                    await API.sendMail(
                        obj.remarks[obj.remarks.length - 1]?.emails,
                        obj.name,
                        obj.remarks[obj.remarks.length - 1].cause,
                        obj.remarks[obj.remarks.length - 1].text
                    );
                })
            } catch (err) {
                console.log(err)
            }
                // .catch((err) => console.log(err));

            console.log(obj);
            setDataChanged(false);
            setSendEmail(false);
        } catch (err) {
            console.log(err);
        }

        setDisable(false);
    };

    return (
        <main className="input-page">
            <Card className="input_main_card">
                <Card.Header className="d-flex justify-content-between">
                    {linesInfo.lines.map((item, i) => (
                        <nav
                            key={item.id}
                            className={`${i === 0 ? "active" : ""} ${
                                acctType === "production" && canAccess && i !== 5 && i !== 6
                                    ? "disabled-nav"
                                    : acctType === "production" && !canAccess && (i === 5 || i === 6)
                                    ? "disabled-nav"
                                    : ""
                            }`}
                            style={{ background: `${item.color}`, textAlign: "center" }}
                            ref={(el) => (navRefs.current[i] = el)}
                            onClick={async () => {
                                if (acctType === "production" && canAccess && i !== 5 && i !== 6) return;
                                if (acctType === "production" && !canAccess && (i === 5 || i === 6)) return;

                                if (dataChanged) {
                                    const result = await showConfirmationAlert({
                                        head: `Data Not Updated!`,
                                        body: `are you sure you want to navigate to diffrent line before updating the data, if you do the current input will be lost`,
                                    });
                                    if (result) {
                                        setDataChanged(false);
                                        handleNavClick(i);
                                    }
                                } else handleNavClick(i);
                            }}>
                            {item.name}
                        </nav>
                    ))}
                </Card.Header>
                <Card.Body style={{ display: "flex", flexDirection: "column", justifyContent: "center" }}>
                    <h3 style={{ color: `${linesInfo.lines[activeOpt].color}`, textAlign: "center" }}>
                        {linesInfo.lines[activeOpt].name}
                    </h3>
                    {acctType === "production" ? (
                        <ProductionInput
                            line={linesInfo.lines[activeOpt]}
                            setDataChanged={setDataChanged}
                            dataChanged={dataChanged}
                            objToUpdate={setValues}
                            sendEmail={setSendEmail}
                        />
                    ) : acctType === "admin" ? (
                        <AdminInput
                            line={linesInfo.lines[activeOpt]}
                            setDataChanged={setDataChanged}
                            dataChanged={dataChanged}
                            objToUpdate={setValues}
                            timestamp={setTimestamp}
                            sendEmail={setSendEmail}
                        />
                    ) : (
                        <PlanningInput
                            line={linesInfo.lines[activeOpt]}
                            setDataChanged={setDataChanged}
                            dataChanged={dataChanged}
                            objToUpdate={setValues}
                        />
                    )}
                    <Button
                        disabled={disable || !dataChanged}
                        style={{
                            fontWeight: "600",
                            backgroundColor: `${linesInfo.lines[activeOpt].color}`,
                            borderColor: `${linesInfo.lines[activeOpt].color}`,
                        }}
                        onClick={handleSubmit}>
                        Update
                    </Button>
                </Card.Body>
            </Card>
        </main>
    );
}

/*const calcTable = (i) => {
    // setGapValue(`${(valuesRef.current[3].value/valuesRef.current[2].value) * 100}%`)
    const newObj = values
    if (i === 0){
        newObj.target = valuesRef.current[2].value 
    }
    else if (i === 1){
        newObj.actual = valuesRef.current[3].value
    }
    setValues(newObj)

    setGapValue(`${(valuesRef.current[2].value - valuesRef.current[3].value) < 0 ? "--" : valuesRef.current[2].value - valuesRef.current[3].value}`)
    setEfficiencyValue(`${round((valuesRef.current[3].value/valuesRef.current[2].value) * 100, 1) }%`)
    
}*/

// const round = (value, precision) => {
//     var multiplier = Math.pow(10, precision || 0);
//     return `${Math.round(value * multiplier) / multiplier}`;
// }

// const calcTable = (target, actual) => {
//     const gap = `${(target - actual) < 0 ? "--" : target - actual}`
//     const efficiency = `${round((actual/target) * 100, 1)}%`

//     return [gap, efficiency]
// }
/**
<Table responsive striped bordered hover className='main-info-table'>
                        <thead>
                            <tr>    
                                <td></td>
                                <td className='theader'>Target</td>
                                <td className='theader'>Actual</td>
                                <td className='theader'>Gap</td>
                                <td className='theader'>Efficiency</td>
                                <td colSpan={2}></td>
                            </tr>
                        </thead>
                        <tbody>
                            
                            <tr>
                                <td className='theader'>Monthly</td>
                                {acctType === "admin" || acctType === "planner"?
                                    <td onChange={() => calcTable(0)}><input type="number" min="0" value={values.target} ref={el => valuesRef.current[2] = el}/></td>
                                    :
                                    <td>eww</td>
                                }
                                <td>1000</td>
                                <td>0</td>
                                <td>100%</td>
                                <td className='theader'>Daily Absentees</td>
                                {acctType === "admin" || acctType === "production"?
                                    <th><input type="number" min="0" defaultValue={values.shift1} ref={el => valuesRef.current[0] = el}/></th>
                                    :
                                    <td>eww</td>
                                }
                            </tr>
                            <tr>
                                <td className='theader'>Weekly</td>
                                {acctType === "admin" || acctType === "planner"?
                                    <td onChange={() => calcTable(0)}><input type="number" min="0" value={values.target} ref={el => valuesRef.current[2] = el}/></td>
                                    :
                                    <td>eww</td>
                                }
                                <td>1000</td>
                                <td>0</td>
                                <td>100%</td>
                                <td className='theader'>Total Shift Hours</td>
                                {acctType === "admin" || acctType === "production"?
                                    <th><input type="number" defaultValue={values.shift2}  min="0" ref={el => valuesRef.current[1] = el}/></th>
                                    :
                                    <td>eww</td>
                                }
                            </tr>
                            <tr>
                                <td className='theader'>Daily</td>
                                {acctType === "admin" || acctType === "planner"?
                                    <td onChange={() => calcTable(0)}><input type="number" min="0" value={values.target} ref={el => valuesRef.current[2] = el}/></td>
                                    :
                                    <td>eww</td>
                                }
                                {acctType === "admin" || acctType === "production"?
                                    <td onChange={() => calcTable(1)}><input type="number" min="0" value={values.actual} ref={el => valuesRef.current[3] = el}/></td>
                                    :
                                    <td>eww</td>
                                }
                                <td>{gapValue}</td>
                                <td>{efficiencyValue}</td>
                                <td className='theader'>Total Shifts Per Day</td>
                                {acctType === "admin" || acctType === "production"?
                                    <th><input type="number" min="0" defaultValue={values.total_shifts} ref={el => valuesRef.current[4] = el}/></th>
                                    :
                                    <td>eww</td>
                                }
                            </tr>
                            <tr>
                                <td className='theader'>Previous Week</td>
                                <td>1000</td>
                                <td>1000</td>
                                <td>0</td>
                                <td>100%</td>
                            </tr>
            
                        </tbody>
                    </Table>
 */
